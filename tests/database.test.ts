import { test } from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import pg from "pg"
// An EMPTY disposable PostgreSQL instance only. Never point at a Supabase database.
const url = process.env.TEST_DATABASE_URL
test(
  "PostgreSQL credit transactions, isolation, payment retries and refunds",
  { skip: !url },
  async (t) => {
    const pool = new pg.Pool({ connectionString: url, max: 20 })
    t.after(() => pool.end())
    const existing = await pool.query("select to_regclass('public.profiles') as existing")
    assert.equal(existing.rows[0].existing, null, "Test database must be empty")
    await pool.query(
      "create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as 'select null::uuid';"
    )
    await pool.query(await readFile("supabase/migrations/001_template.sql", "utf8"))
    const user = randomUUID(),
      other = randomUUID()
    await pool.query("insert into auth.users values($1),($2)", [user, other])
    await t.test("registration gift is issued once under concurrent requests", async () => {
      const calls = await Promise.all(
        Array.from({ length: 8 }, () =>
          pool.query("select ensure_profile($1,$2,10) as created", [user, "user@example.test"])
        )
      )
      assert.equal(calls.filter((r) => r.rows[0].created).length, 1)
      const { rows } = await pool.query("select balance from profiles where id=$1", [user])
      assert.equal(Number(rows[0].balance), 10)
    })
    await pool.query("select ensure_profile($1,$2,10)", [other, "other@example.test"])
    const task = randomUUID()
    await t.test("task replay and failure compensation do not change credits twice", async () => {
      await pool.query("select run_demo($1,$2,1,true)", [user, task])
      await pool.query("select run_demo($1,$2,1,true)", [user, task])
      assert.equal(
        Number(
          (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
        ),
        10
      )
      assert.equal(
        Number(
          (
            await pool.query("select count(*) from credit_ledger where reference in ($1,$2)", [
              "task:" + task,
              "task-refund:" + task,
            ])
          ).rows[0].count
        ),
        2
      )
      await assert.rejects(
        pool.query("select run_demo($1,$2,1,false)", [user, task]),
        /Idempotency conflict/
      )
      await assert.rejects(
        pool.query("select run_demo($1,$2,1,true)", [other, task]),
        /Idempotency conflict/
      )
    })
    await t.test("parallel requests cannot overdraw a ten-credit account", async () => {
      const results = await Promise.allSettled(
        Array.from({ length: 12 }, () =>
          pool.query("select run_demo($1,$2,1,false)", [user, randomUUID()])
        )
      )
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 10)
      assert.equal(
        Number(
          (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
        ),
        0
      )
    })
    const intent = randomUUID()
    await pool.query(
      "insert into purchase_intents(id,user_id,buyer_email,plan_id,product_id,credits,cents,environment) values($1,$2,'user@example.test','starter','product-1',100,900,'test')",
      [intent, user]
    )
    const event = {
      id: randomUUID(),
      eventId: "payment-1",
      eventType: "order.completed",
      mode: "test",
      data: {
        orderId: "order-1",
        orderMerchantExternalId: intent,
        currency: "USD",
        buyerEmail: "user@example.test",
        chargedAmount: "9.00",
        orderMetadata: { productId: "product-1", purchaseIntentId: intent },
      },
    }
    const apply = (payload: unknown) =>
      pool.query("select apply_payment($1)", [JSON.stringify(payload)])
    await t.test("mismatched payment snapshot cannot grant credits", async () => {
      for (const change of [
        { chargedAmount: "8.00" },
        { currency: "CNY" },
        { buyerEmail: "wrong@example.test" },
        { orderMetadata: { productId: "wrong", purchaseIntentId: intent } },
        { chargedAmount: null },
      ])
        await assert.rejects(apply({ ...event, data: { ...event.data, ...change } }))
      await assert.rejects(apply({ ...event, mode: "prod" }))
      assert.equal(
        Number(
          (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
        ),
        0
      )
    })
    await t.test("delivery and business-event retries grant only one pack", async () => {
      await Promise.all(Array.from({ length: 4 }, () => apply(event)))
      await apply({ ...event, id: randomUUID() })
      await apply({ ...event, id: randomUUID(), eventId: "payment-new-delivery" })
      assert.equal(
        Number(
          (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
        ),
        100
      )
    })
    await pool.query("select run_demo($1,$2,100,false)", [user, randomUUID()])
    const refund = {
      ...event,
      eventType: "refund.succeeded",
      eventId: "refund-1",
      id: randomUUID(),
      data: { ...event.data, refundedAmount: "3.00" },
    }
    await t.test(
      "partial refunds accumulate, replay is ignored, full refund may go negative",
      async () => {
        await apply(refund)
        await apply({ ...refund, id: randomUUID() })
        assert.equal(
          Number(
            (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
          ),
          -33
        )
        await apply({ ...refund, id: randomUUID(), eventId: "refund-2" })
        assert.equal(
          Number(
            (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
          ),
          -66
        )
        await apply({ ...refund, id: randomUUID(), eventId: "refund-3" })
        assert.equal(
          Number(
            (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
          ),
          -100
        )
        await assert.rejects(
          apply({ ...refund, id: randomUUID(), eventId: "refund-too-much" }),
          /Invalid refund/
        )
        await assert.rejects(
          pool.query("select run_demo($1,$2,1,false)", [user, randomUUID()]),
          /INSUFFICIENT_CREDITS/
        )
        await apply({ ...event, id: randomUUID(), eventId: "late-order-retry" })
        assert.equal(
          Number(
            (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
          ),
          -100
        )
      }
    )
    await t.test("administrative adjustments are audited and idempotent", async () => {
      const id = randomUUID()
      await pool.query("select adjust_credits($1,$2,$3,110,'customer support')", [id, other, user])
      await pool.query("select adjust_credits($1,$2,$3,110,'customer support')", [id, other, user])
      assert.equal(
        Number(
          (await pool.query("select balance from profiles where id=$1", [user])).rows[0].balance
        ),
        10
      )
      await assert.rejects(
        pool.query("select adjust_credits($1,$2,$3,111,'customer support')", [id, other, user]),
        /Idempotency conflict/
      )
    })
    await t.test(
      "untrusted database roles cannot mutate balances or execute credit RPCs",
      async () => {
        const client = await pool.connect()
        try {
          await client.query("set role authenticated")
          await assert.rejects(
            client.query("update public.profiles set balance=999"),
            /permission denied/
          )
          await assert.rejects(
            client.query("select public.run_demo($1,$2,1,false)", [user, randomUUID()]),
            /permission denied/
          )
          const rows = await client.query("select * from public.profiles")
          assert.equal(rows.rowCount, 0)
          await client.query("reset role")
          await client.query("set role anon")
          await assert.rejects(client.query("select * from public.profiles"), /permission denied/)
        } finally {
          await client.query("reset role")
          client.release()
        }
      }
    )
  }
)
