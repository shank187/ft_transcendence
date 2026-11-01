import { prisma } from "../../lib/prisma";

export async function setUserCUrrentGym(userID: string, gymId : string){

    const updatedUser = await prisma.user.update({
        where : {id : userID},
        data : {currentGymId : gymId}
    });
    return updatedUser;
}


export async function getUserCUrrentGym(userId : string){
    const user = await prisma.user.findUnique({
        where : {id:userId},
        select : {currentGymId : true}
    });
    return user;
}