// Now you build the Service layer to actually update that database pointer.
// Create a function in your service files (e.g., userService.ts or gymService.ts) 
// that takes two arguments: a userId and a gymId.

import { prisma } from "../../lib/prisma";

// Your goal is to write a Prisma query that modifies the user's row and sets their 
// new currentGymId to the provided gym ID.
// Two hints for your query:
// Use the prisma.user.update() method.
// It requires a where object (to find the right user by their ID) and a data object 
// (to set the new gym ID).
// Write just this service function and paste it here. Let's make sure the core database
//  write is perfectly structured before we 
// hook it up to a web route.




export async function setUserCUrrentGym(userID: string, gymId : string){

    const updatedUser = await prisma.user.update({
        where : {id : userID},
        data : {currentGymId : gymId}
    });
    return updatedUser;
}

