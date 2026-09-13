"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, type AssetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

const assetTypeSchema = z.enum(["STOCK", "CRYPTO", "MUTUAL_FUND", "GOLD"]);
const decimal = (value: Prisma.Decimal | number) => Number(value);

const serializeInvestment = (investment: { id: string; symbol: string; assetType: AssetType; units: Prisma.Decimal; buyPrice: Prisma.Decimal; currentPrice: Prisma.Decimal | null }) => ({
  ...investment,
  units: decimal(investment.units),
  buyPrice: decimal(investment.buyPrice),
  currentPrice: investment.currentPrice === null ? null : decimal(investment.currentPrice),
});

export async function getInvestments() {
  const user = await requireCurrentUser();
  const investments = await prisma.investment.findMany({ where: { userId: user.id }, orderBy: { symbol: "asc" } });
  return investments.map(serializeInvestment);
}

export async function createInvestment(data: { symbol: string; assetType: AssetType; units: number; buyPrice: number; currentPrice?: number }) {
  const user = await requireCurrentUser();
  const input = z.object({
    symbol: z.string().trim().min(1).max(20).toUpperCase(),
    assetType: assetTypeSchema,
    units: z.coerce.number().positive(),
    buyPrice: z.coerce.number().positive(),
    currentPrice: z.coerce.number().positive().optional(),
  }).parse(data);

  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      symbol: input.symbol,
      assetType: input.assetType,
      units: input.units,
      buyPrice: input.buyPrice,
      currentPrice: input.currentPrice ?? input.buyPrice,
    },
  });
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard");
  return serializeInvestment(investment);
}

export async function deleteInvestment(id: string) {
  const user = await requireCurrentUser();
  const investment = await prisma.investment.findFirst({ where: { id, userId: user.id } });
  if (!investment) throw new Error("Investment not found.");
  await prisma.investment.delete({ where: { id: investment.id } });
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard");
}
