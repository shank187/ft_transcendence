import api from '../auth/axiosInstance'
import type { Exercise, ExerciseFilters, ExerciseQuery, PaginatedExercises } from './exercise.types'

// FAKE-DATA: switch the gym id in getExerciseFilter to test the states:
//   FAKE_GYM_ID        -> gym with exercises
//   FAKE_EMPTY_GYM_ID  -> gym with no exercises (empty list)
export const FAKE_GYM_ID = "fake-gym-1337"
export const FAKE_EMPTY_GYM_ID = "fake-gym-empty"

const FAKE_LIST_DELAY_MS = 400

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// FAKE-DATA: stands in for the exercises available at the fake gym.
const gymExercises: Exercise[] = [
    { id: "fake-ex-1", name: "Barbell bench press", type: "WEIGHT_REPS", primaryMuscle: "Chest", secondaryMuscles: ["Triceps", "Shoulders"], equipment: ["Barbell", "Bench"], description: null, imageUrl: null },
    { id: "fake-ex-2", name: "Push-up", type: "BODYWEIGHT_REPS", primaryMuscle: "Chest", secondaryMuscles: ["Triceps"], equipment: [], description: null, imageUrl: null },
    { id: "fake-ex-3", name: "Plank", type: "DURATION", primaryMuscle: "Core", secondaryMuscles: [], equipment: [], description: null, imageUrl: null },
    { id: "fake-ex-4", name: "Back squat", type: "WEIGHT_REPS", primaryMuscle: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings"], equipment: ["Barbell", "Squat rack"], description: null, imageUrl: null },
    { id: "fake-ex-5", name: "Pull-up", type: "BODYWEIGHT_REPS", primaryMuscle: "Back", secondaryMuscles: ["Biceps"], equipment: ["Pull-up bar"], description: null, imageUrl: null },
    { id: "fake-ex-6", name: "Weighted dip", type: "WEIGHTED_BODYWEIGHT", primaryMuscle: "Triceps", secondaryMuscles: ["Chest"], equipment: ["Dip station"], description: null, imageUrl: null },
    { id: "fake-ex-7", name: "Assisted pull-up", type: "ASSISTED_BODYWEIGHT", primaryMuscle: "Back", secondaryMuscles: ["Biceps"], equipment: ["Assisted pull-up machine"], description: null, imageUrl: null },
    { id: "fake-ex-8", name: "Dumbbell shoulder press", type: "WEIGHT_REPS", primaryMuscle: "Shoulders", secondaryMuscles: ["Triceps"], equipment: ["Dumbbell"], description: null, imageUrl: null },
    { id: "fake-ex-9", name: "Lunge", type: "BODYWEIGHT_REPS", primaryMuscle: "Quadriceps", secondaryMuscles: ["Glutes"], equipment: [], description: null, imageUrl: null },
    { id: "fake-ex-10", name: "Farmer's carry", type: "WEIGHT_DURATION", primaryMuscle: "Forearms", secondaryMuscles: ["Core"], equipment: ["Dumbbell"], description: null, imageUrl: null },
    { id: "fake-ex-11", name: "Rowing machine", type: "DISTANCE_DURATION", primaryMuscle: "Back", secondaryMuscles: ["Legs"], equipment: ["Rowing machine"], description: null, imageUrl: null },
    { id: "fake-ex-12", name: "Lat pulldown", type: "WEIGHT_REPS", primaryMuscle: "Back", secondaryMuscles: ["Biceps"], equipment: ["Cable machine"], description: null, imageUrl: null },
    { id: "fake-ex-13", name: "Wall sit", type: "DURATION", primaryMuscle: "Quadriceps", secondaryMuscles: [], equipment: [], description: null, imageUrl: null },
]

// FAKE-DATA: replace with the real gymId filter (board g-01, Phase 2).
// Muscle and equipment are ignored here; only search and paging apply.
async function getFakeGymExercises(query: ExerciseQuery): Promise<PaginatedExercises> {
    await wait(FAKE_LIST_DELAY_MS)
    const search = query.search?.trim().toLowerCase() ?? ""
    const matches = query.gymId === FAKE_EMPTY_GYM_ID
        ? []
        : gymExercises.filter(e => e.name.toLowerCase().includes(search))
    const start = (query.page - 1) * query.limit
    return {
        items: matches.slice(start, start + query.limit),
        page: query.page,
        limit: query.limit,
        total: matches.length,
        totalPages: Math.ceil(matches.length / query.limit),
    }
}

export async function getExercises(query: ExerciseQuery): Promise<PaginatedExercises> {
    // The real endpoint never receives gymId.
    if (query.gymId)
        return getFakeGymExercises(query)

    const response = await api.get<PaginatedExercises>(
        '/api/exercises',
        {
            params: query
        }
    )
    return response.data
}

export async function getExerciseFilter():
Promise<ExerciseFilters>
{
    const resp = await api.get<ExerciseFilters>('/api/exercises/filters')
    return {
        ...resp.data,
        // FAKE-DATA: gym comes from the user's current gym once S1 adds gymId on User.
        // For the no-gym state: gym: null
        gym: { id: FAKE_GYM_ID, name: "1337 Gym" },
    }
}
