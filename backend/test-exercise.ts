import { getExercises } from "./src/modules/exercises/exercise.service";

async function main() {
    const exercises = await getExercises();
    console.dir(exercises, { depth: null });
}

main();