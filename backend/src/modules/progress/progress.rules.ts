export const XP_PER_WORKOUT = 100;
export const XP_PER_PR = 50;
export const XP_PER_LEVEL = 500;

export function getLevel(totalXp: number): number {
    return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

