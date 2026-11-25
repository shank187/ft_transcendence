import { Check, Lock, MessageCircle, Search, Timer, Trophy } from "lucide-react";

// HTML versions of the app screens shown on the landing page.
// Names and numbers are sample data. Each card only shows features the app really has.
// role="img" + aria-label: a screen reader reads each card as one picture with that description,
// instead of reading every number in it.

/* ---------- Workout session (hero) ---------- */

const sets = [
    { type: "Warm-up", color: "text-app-set-warmup", kg: "60", reps: 10, done: true, pr: false },
    { type: "Heavy", color: "text-app-set-heavy", kg: "90", reps: 5, done: true, pr: false },
    { type: "Heavy", color: "text-app-set-heavy", kg: "100", reps: 3, done: true, pr: true },
    { type: "Drop", color: "text-app-set-drop", kg: "70", reps: 8, done: false, pr: false },
];

// The first set that is not ticked yet is the one being lifted now.
const currentSet = sets.findIndex((set) => !set.done);

export function WorkoutCard() {
    return (
        <div
            role="img"
            aria-label="Workout in progress: bench press sets with weight and reps, a new personal record and a live timer"
            className="flex flex-col gap-5 rounded-lg border border-app-border bg-app-surface p-4 sm:p-6"
        >
            <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-semibold uppercase">Push A</span>
                <span className="flex items-center gap-1.5 tabular-nums text-app-text-secondary">
                    <Timer className="size-4" aria-hidden="true" />
                    38:12
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="font-semibold">Barbell bench press</span>
                <span className="text-sm text-app-text-secondary">4 sets</span>
            </div>

            <ol className="flex flex-col gap-1">
                {sets.map((set, i) => (
                    <li
                        key={i}
                        // 4 fixed columns: set number, type, weight (takes the rest), tick box.
                        // The tick box column never moves, whatever the weight text needs.
                        className={`grid grid-cols-[1rem_4rem_minmax(0,1fr)_1.75rem] items-center gap-2 rounded-sm border px-2 py-2 sm:gap-4 sm:px-3 ${
                            i === currentSet ? "border-app-primary" : "border-transparent"
                        }`}
                    >
                        <span className="text-sm text-app-text-muted">{i + 1}</span>
                        <span className={`whitespace-nowrap text-sm ${set.color}`}>{set.type}</span>

                        {/* weight big like the number on a plate, reps smaller.
                            flex-wrap: on a narrow screen the PR badge goes under instead of overflowing */}
                        <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                            <span className="font-display text-3xl font-semibold leading-none sm:text-4xl">{set.kg}</span>
                            <span className="whitespace-nowrap text-sm text-app-text-secondary">kg × {set.reps}</span>
                            {set.pr && (
                                <span className="rounded-sm bg-app-primary px-1.5 text-xs font-bold text-app-canvas">PR</span>
                            )}
                        </span>

                        <span
                            className={`flex size-7 items-center justify-center rounded-sm border-2 ${
                                set.done ? "border-app-text bg-app-text text-app-canvas" : "border-app-border"
                            }`}
                        >
                            {set.done && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/* ---------- Selected gym + exercise picker ---------- */

const gymName = "Dorm gym";

const exercises = [
    { name: "Barbell bench press", muscle: "Chest", atGym: true },
    { name: "Lat pulldown", muscle: "Back", atGym: true },
    { name: "Cable fly", muscle: "Chest", atGym: true },
    { name: "Leg press", muscle: "Legs", atGym: false },
    { name: "Hack squat", muscle: "Legs", atGym: false },
];

export function GymCard() {
    return (
        <div
            role="img"
            aria-label="Exercise picker for the selected gym: exercises its equipment supports, and others tagged Not at Dorm gym"
            className="flex flex-col gap-5 rounded-lg border border-app-border bg-app-surface p-5 sm:p-6"
        >
            <div className="flex flex-col gap-0.5">
                <span className="text-sm text-app-text-secondary">Your gym</span>
                <span className="font-display text-2xl font-semibold uppercase">{gymName}</span>
            </div>

            <div className="flex items-center gap-2 rounded-sm border border-app-border bg-app-canvas px-3 py-2.5 text-app-text-muted">
                <Search className="size-4" aria-hidden="true" />
                Search exercises
            </div>

            <ul className="flex flex-col">
                {exercises.map((exercise) => (
                    <li key={exercise.name} className="flex items-center justify-between gap-3 py-2.5">
                        <span className={`flex flex-col ${exercise.atGym ? "" : "text-app-text-muted"}`}>
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-sm text-app-text-muted">{exercise.muscle}</span>
                        </span>
                        {!exercise.atGym && (
                            <span className="rounded-sm bg-app-surface-hover px-2 py-0.5 text-xs font-semibold text-app-text-secondary">
                                Not at {gymName}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ---------- Level, XP and achievements ---------- */

const achievements = [
    { title: "First Workout", unlocked: true },
    { title: "10 Workouts", unlocked: true },
    { title: "Early Bird", unlocked: true },
    { title: "Night Owl", unlocked: false },
    { title: "50 Workouts", unlocked: false },
];

// No border or background: the Progress section puts this panel inside its own card.
export function LevelPanel() {
    return (
        <div
            role="img"
            aria-label="Progress example: level 5, 350 of 500 XP and the achievements unlocked so far"
            className="flex flex-col gap-6"
        >
            <span className="font-display text-7xl font-semibold uppercase leading-none sm:text-8xl">Level 5</span>

            <div className="flex flex-col gap-2">
                <div className="h-4 rounded-sm bg-app-surface-hover">
                    <div className="h-full w-[70%] rounded-sm bg-app-primary" />
                </div>
                <span className="tabular-nums text-app-text-secondary">350 / 500 XP</span>
            </div>

            <ul className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                    <li
                        key={a.title}
                        className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-sm ${
                            a.unlocked ? "border-app-border text-app-text" : "border-dashed border-app-border text-app-text-muted"
                        }`}
                    >
                        {a.unlocked ? <Trophy className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                        {a.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ---------- Friends + friends-only leaderboard ---------- */

const friends = ["Sara", "Youssef", "Imane"];

// Level 5 with 350 XP = 2350 XP in total, the same "You" as LevelPanel.
const leaderboard = [
    { name: "Sara", xp: "2,800" },
    { name: "You", xp: "2,350" },
    { name: "Youssef", xp: "1,900" },
];

export function CrewPanel() {
    return (
        <div
            role="img"
            aria-label="Friends example: three friends online and a leaderboard of friends only"
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-2">
                <span className="text-sm text-app-text-secondary">Friends online</span>
                <ul className="flex flex-col gap-2">
                    {friends.map((name) => (
                        <li key={name} className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-sm bg-app-surface-hover font-semibold">
                                {name[0]}
                            </span>
                            <span className="flex-1">{name}</span>
                            <MessageCircle className="size-5 text-app-text-secondary" aria-hidden="true" />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm text-app-text-secondary">Leaderboard, friends only</span>
                <ol className="flex flex-col">
                    {leaderboard.map((row, i) => (
                        <li
                            key={row.name}
                            className={`flex items-center gap-3 rounded-sm px-2 py-2 ${row.name === "You" ? "bg-app-surface-hover" : ""}`}
                        >
                            <span className="w-4 font-display text-lg font-semibold">{i + 1}</span>
                            <span className="flex-1">{row.name}</span>
                            <span className="tabular-nums text-app-text-secondary">{row.xp} XP</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
