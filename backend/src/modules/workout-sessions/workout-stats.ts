import { prisma } from "../../lib/prisma";
import {sessionSelect, toSummaryDto } from "./workout-session.service";


export type WorkoutStats = {
    workouts: number,
    sets: number,
    volumeKg: number,
    prs: number
}
export async function getWorkoutStats(userId: string, from: Date, to: Date): Promise<WorkoutStats>
{
    const sessionsdb = await prisma.workoutSession.findMany({
        where:{userId: userId, status:"COMPLETED", completedAt:{gte: from, lt: to}},
        select: sessionSelect
    })
    const sessions = sessionsdb.map((session) => toSummaryDto(session))
    return{
        workouts: sessions.length,
        sets : sessions.reduce((total, set) =>
            set?.setsCompleted ?
            total + set?.setsCompleted
            : total,0),
        volumeKg: sessions.reduce((total, vol) => vol?.volumeKg ?
        total + vol.volumeKg: total, 0),
        prs: sessions.reduce((total, pr) => pr?.prSetIds ? 
        total + pr.prSetIds.length : total, 0)
    }

}