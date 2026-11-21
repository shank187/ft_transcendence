
export type Achievement = {
    id: number;
    code: string;
    title: string;
    description: string;
    unlocked: boolean;
};

export const achievements: Achievement[] = [
    {
        id: 1,
        code: "WORKOUTS_1",
        title: "First Workout",
        description: "Complete your first workout",
        unlocked: false,
    },
    {
        id: 4,
        code: "WORKOUTS_10",
        title: "10 Workouts",
        description: "Complete 10 workouts",
        unlocked: false,
    },
    {
        id: 5,
        code: "WORKOUTS_50",
        title: "50 Workouts",
        description: "Complete 50 workouts",
        unlocked: false,
    },
    {
        id: 6,
        code: "WORKOUTS_100",
        title: "+100 Workouts",
        description: "Complete 100 workouts",
        unlocked: false,
    },
    {
        id: 7,
        code: "EARLY_BIRD",
        title: "Early Bird",
        description: "Finish a workout between 05:00 and 09:00 UTC",
        unlocked: false,
    },
    {
        id: 8,
        code: "NIGHT_OWL",
        title: "Night Owl",
        description: "Finish a workout between 22:00 and 05:00 UTC",
        unlocked: false,
    },
];