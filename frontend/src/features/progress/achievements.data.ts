
export type Achievement = {
    id: number;
    title: string;
    description: string;
    unlocked: boolean;
};

export const achievements: Achievement[] = [
    {
        id: 1,
        title: "First Workout",
        description: "Complete your first workout",
        unlocked: false,
    },
    {
        id: 4,
        title: "10 Workouts",
        description: "Complete 10 workouts",
        unlocked: false,
    },
    {
        id: 5,
        title: "50 Workouts",
        description: "Complete 50 workouts",
        unlocked: false,
    },
    {
        id: 6,
        title: "100 Workouts",
        description: "Complete 100 workouts",
        unlocked: false,
    },
];
