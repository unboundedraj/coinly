"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

const decimal = (value: Prisma.Decimal | number) => Number(value);

const serializeGoal = (goal: { id: string; name: string; targetAmount: Prisma.Decimal; currentAmount: Prisma.Decimal; deadline: Date | null }) => ({
  ...goal,
  targetAmount: decimal(goal.targetAmount),
  currentAmount: decimal(goal.currentAmount),
});

export async function getGoals() {
  const user = await requireCurrentUser();
  const goals = await prisma.goal.findMany({ where: { userId: user.id }, orderBy: { deadline: "asc" } });
  return goals.map(serializeGoal);
}

export async function createGoal(data: { name: string; targetAmount: number; deadline?: string | Date | null }) {
  const user = await requireCurrentUser();
  const input = z.object({
    name: z.string().trim().min(1).max(80),
    targetAmount: z.coerce.number().positive(),
    deadline: z.coerce.date().optional().nullable(),
  }).parse(data);

  const goal = await prisma.goal.create({ data: { userId: user.id, name: input.name, targetAmount: input.targetAmount, deadline: input.deadline ?? null } });
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  return serializeGoal(goal);
}

export async function contributeToGoal(goalId: string, amount: number, accountId: string) {
  const user = await requireCurrentUser();
  const input = z.object({ goalId: z.string().uuid(), amount: z.coerce.number().positive(), accountId: z.string().uuid() }).parse({ goalId, amount, accountId });

  const goal = await prisma.$transaction(async (tx) => {
    const existingGoal = await tx.goal.findFirst({ where: { id: input.goalId, userId: user.id } });
    if (!existingGoal) throw new Error("Goal not found.");
    const account = await tx.account.findFirst({ where: { id: input.accountId, userId: user.id } });
    if (!account) throw new Error("Account not found.");

    const contribution = new Prisma.Decimal(input.amount);
    await tx.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        amount: contribution,
        type: "EXPENSE",
        category: "Goal Contribution",
        description: `Contribution to "${existingGoal.name}"`,
        date: new Date(),
        isRecurring: false,
      },
    });
    await tx.account.update({ where: { id: account.id }, data: { balance: { decrement: contribution } } });
    return tx.goal.update({ where: { id: existingGoal.id }, data: { currentAmount: { increment: contribution } } });
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/accounts");
  return serializeGoal(goal);
}

export async function deleteGoal(id: string) {
  const user = await requireCurrentUser();
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) throw new Error("Goal not found.");
  await prisma.goal.delete({ where: { id: goal.id } });
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}
