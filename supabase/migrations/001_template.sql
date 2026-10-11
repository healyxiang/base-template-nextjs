-- Apply once to a NEW Supabase project. All credit writes are service-role-only.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, balance bigint not null default 0, created_at timestamptz not null default now()
);
create table public.credit_ledger (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 delta bigint not null, kind text not null, reference text not null unique,
 created_at timestamptz not null default now()
);
create table public.tasks (
 id uuid primary key, user_id uuid not null references public.profiles(id),
 cost integer not null check(cost > 0), simulate_failure boolean not null,
 status text not null check(status in ('succeeded','failed')), created_at timestamptz not null default now()
);
create table public.purchase_intents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 buyer_email text not null, plan_id text not null, product_id text not null, credits integer not null check(credits > 0),
 cents integer not null check(cents > 0), currency text not null default 'USD', environment text not null check(environment in ('test','prod')),
 status text not null default 'pending' check(status in ('pending','completed','partially_refunded','refunded')),
 checkout_session_id text, order_id text unique, refunded_cents integer not null default 0,
 revoked_credits integer not null default 0, created_at timestamptz not null default now()
);
create table public.webhook_events (
 id text primary key, business_id text not null unique, event_type text not null,
 payload jsonb not null, created_at timestamptz not null default now()
);
create table public.admin_audit_logs (
 id uuid primary key, actor_id uuid not null references auth.users(id), user_id uuid not null references public.profiles(id),
 delta integer not null, reason text not null, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.tasks enable row level security;
alter table public.purchase_intents enable row level security;
alter table public.webhook_events enable row level security;
alter table public.admin_audit_logs enable row level security;
create policy profiles_read on public.profiles for select to authenticated using(auth.uid() = id);
create policy ledger_read on public.credit_ledger for select to authenticated using(auth.uid() = user_id);
create policy tasks_read on public.tasks for select to authenticated using(auth.uid() = user_id);
create policy purchases_read on public.purchase_intents for select to authenticated using(auth.uid() = user_id);
revoke all on public.profiles, public.credit_ledger, public.tasks, public.purchase_intents, public.webhook_events, public.admin_audit_logs from anon, authenticated;
grant select on public.profiles, public.credit_ledger, public.tasks, public.purchase_intents to authenticated;
grant all on public.profiles, public.credit_ledger, public.tasks, public.purchase_intents, public.webhook_events, public.admin_audit_logs to service_role;

create function public.ensure_profile(p_user uuid, p_email text, p_signup integer) returns boolean
language plpgsql security definer set search_path = public as $$
begin
 if p_signup < 0 then raise exception 'Invalid signup credits'; end if;
 insert into profiles(id,email,balance) values(p_user,lower(p_email),p_signup) on conflict(id) do nothing;
 if found then
  insert into credit_ledger(user_id,delta,kind,reference) values(p_user,p_signup,'signup','signup:'||p_user);
  return true;
 else
  update profiles set email=lower(p_email) where id=p_user;
  return false;
 end if;
end $$;

-- The demo work is deliberately performed inside one transaction: no stranded reservations.
-- Real external jobs must add durable reservations + a worker/reconciliation before replacing this RPC.
create function public.run_demo(p_user uuid, p_task uuid, p_cost integer, p_fail boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t tasks; b bigint;
begin
 if p_cost <= 0 then raise exception 'Invalid cost'; end if;
 select balance into b from profiles where id=p_user for update;
 if not found then raise exception 'Profile missing'; end if;
 select * into t from tasks where id=p_task;
 if found then
  if t.user_id <> p_user or t.simulate_failure <> p_fail then raise exception 'Idempotency conflict'; end if;
  return jsonb_build_object('id',t.id,'status',t.status,'balance',b,'replayed',true);
 end if;
 if b < p_cost then raise exception 'INSUFFICIENT_CREDITS'; end if;
 update profiles set balance=balance-p_cost where id=p_user returning balance into b;
 insert into credit_ledger(user_id,delta,kind,reference) values(p_user,-p_cost,'task','task:'||p_task);
 if p_fail then
  update profiles set balance=balance+p_cost where id=p_user returning balance into b;
  insert into credit_ledger(user_id,delta,kind,reference) values(p_user,p_cost,'task_refund','task-refund:'||p_task);
 end if;
 insert into tasks(id,user_id,cost,simulate_failure,status) values(p_task,p_user,p_cost,p_fail,case when p_fail then 'failed' else 'succeeded' end) returning * into t;
 return jsonb_build_object('id',t.id,'status',t.status,'balance',b,'replayed',false);
end $$;

create function public.apply_payment(p_event jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare i purchase_intents; d jsonb := p_event->'data'; typ text := p_event->>'eventType';
 business text := typ||':'||(p_event->>'eventId'); refund integer; revoked integer; added integer;
begin
 if typ not in ('order.completed','refund.succeeded') then
  insert into webhook_events(id,business_id,event_type,payload) values(p_event->>'id',business,typ,p_event) on conflict do nothing;
  return;
 end if;
 if typ = 'order.completed' then
  select * into i from purchase_intents where id=(d->>'orderMerchantExternalId')::uuid for update;
 else
  select * into i from purchase_intents where order_id=d->>'orderId' for update;
 end if;
 if not found then raise exception 'Purchase not found; retry after order confirmation'; end if;
 if exists(select 1 from webhook_events where id=p_event->>'id' or business_id=business) then return; end if;
 if i.environment is distinct from p_event->>'mode' or i.currency is distinct from d->>'currency' or i.buyer_email is distinct from lower(trim(d->>'buyerEmail')) then raise exception 'Purchase mismatch'; end if;
 if typ = 'order.completed' then
  if i.status <> 'pending' then
   if i.order_id <> d->>'orderId' then raise exception 'Order conflict'; end if;
  else
   if round((coalesce(d->>'chargedAmount',d->>'amount'))::numeric*100) is distinct from i.cents
    or d->'orderMetadata'->>'productId' is distinct from i.product_id
    or d->'orderMetadata'->>'purchaseIntentId' is distinct from i.id::text then raise exception 'Payment mismatch'; end if;
   update profiles set balance=balance+i.credits where id=i.user_id;
   insert into credit_ledger(user_id,delta,kind,reference) values(i.user_id,i.credits,'purchase','purchase:'||i.id);
   update purchase_intents set status='completed',order_id=d->>'orderId' where id=i.id;
  end if;
 else
  refund := round((coalesce(d->>'refundedAmount',d->>'amount'))::numeric*100);
  if refund is null or refund <= 0 or i.refunded_cents+refund > i.cents then raise exception 'Invalid refund'; end if;
  -- Round cumulative totals, never each refund separately; a full refund always revokes all credits.
  revoked := floor(i.credits::numeric*(i.refunded_cents+refund)/i.cents);
  added := revoked-i.revoked_credits;
  update profiles set balance=balance-added where id=i.user_id;
  insert into credit_ledger(user_id,delta,kind,reference) values(i.user_id,-added,'payment_refund','refund:'||(p_event->>'eventId'));
  update purchase_intents set refunded_cents=refunded_cents+refund,revoked_credits=revoked,
   status=case when refunded_cents+refund=cents then 'refunded' else 'partially_refunded' end where id=i.id;
 end if;
 insert into webhook_events(id,business_id,event_type,payload) values(p_event->>'id',business,typ,p_event);
end $$;

create function public.adjust_credits(p_id uuid,p_actor uuid,p_user uuid,p_delta integer,p_reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
 if p_delta=0 or length(trim(p_reason)) < 3 then raise exception 'Invalid adjustment'; end if;
 perform 1 from profiles where id=p_user for update;
 if not found then raise exception 'Profile not found'; end if;
 if exists(select 1 from admin_audit_logs where id=p_id) then
  if not exists(select 1 from admin_audit_logs where id=p_id and actor_id=p_actor and user_id=p_user and delta=p_delta and reason=p_reason) then raise exception 'Idempotency conflict'; end if;
  return;
 end if;
 update profiles set balance=balance+p_delta where id=p_user;
 insert into credit_ledger(user_id,delta,kind,reference) values(p_user,p_delta,'admin','admin:'||p_id);
 insert into admin_audit_logs(id,actor_id,user_id,delta,reason) values(p_id,p_actor,p_user,p_delta,p_reason);
end $$;
revoke execute on function public.ensure_profile(uuid,text,integer),public.run_demo(uuid,uuid,integer,boolean),public.apply_payment(jsonb),public.adjust_credits(uuid,uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.ensure_profile(uuid,text,integer),public.run_demo(uuid,uuid,integer,boolean),public.apply_payment(jsonb),public.adjust_credits(uuid,uuid,uuid,integer,text) to service_role;
