// TEMPORARY until S5's award() is merged: then delete this file and import award from ../progress/progress.service.
import type { Prisma } from "@prisma/client";
import type { AwardResult } from "./workout-session.types";

export type AwardEvent = { reason: "WORKOUT_COMPLETED" | "PR_SET"; sourceId: string };

export async function award(tx: Prisma.TransactionClient, userId: string, events: AwardEvent[]): Promise<AwardResult>
{
    return { xpGained: 0, levelUp: false, unlocked: [] }
}
