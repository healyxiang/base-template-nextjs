import { z } from 'zod';

export const exampleSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  age: z.number().int().min(18, '年龄必须大于等于18'),
});

export type ExampleFormData = z.infer<typeof exampleSchema>;
