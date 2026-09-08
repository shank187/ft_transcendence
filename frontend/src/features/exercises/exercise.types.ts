export interface Exercise{
    id: string
    name: string
    type: string
    primaryMuscle: string
    secondaryMuscles: string[]
    equipment: string[]
    description: string| null
    imageUrl: string | null
}