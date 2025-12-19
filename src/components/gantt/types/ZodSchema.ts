import { z } from 'zod';
 
// 定义 Zod Schema 
export const ConfirmDateDataSchema = z.object({ 
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // 格式如 YYYY-MM-DD 
  year: z.number().int(), 
  month: z.number().int().min(1).max(12), 
  week: z.number().int().min(1).max(7),  // 星期几：周一=1, 周日=7 
  monthStr: z.string(), 
  weekStr: z.string(), 
  day: z.number().int().min(1).max(31), 
});
 // 生成 TypeScript 类型 
export type ConfirmDateData = z.infer<typeof  ConfirmDateDataSchema>;