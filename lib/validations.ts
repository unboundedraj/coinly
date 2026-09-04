import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string().uuid(),
  destinationAccountId: z.string().uuid().optional(),
  amount: z.coerce.number().positive(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional(),
  date: z.coerce.date(),
  isRecurring: z.boolean().default(false),
}).superRefine((data, context) => {
  if (data.type === "TRANSFER" && (!data.destinationAccountId || data.destinationAccountId === data.accountId)) {
    context.addIssue({ code: "custom", path: ["destinationAccountId"], message: "Choose a different destination account." });
  }
});

export type TransactionInput = z.input<typeof transactionSchema>;