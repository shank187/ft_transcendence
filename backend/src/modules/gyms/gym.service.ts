import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";



interface CreateGymData {
    userID: string;
    dataName: string;
    dataCity?: string;
    dataAddress?: string;
    dataPhone?: string;
    dataWebsite?: string;
    dataDescription?: string;
    dataImageUrl?: string;
    dataIsPrivate: boolean;
    dataEquip?: { equipmentId: string; quantity?: number }[];
}



export async function searchForGyms(textSearched? : string , city? : string , verified? : boolean, page? : number){
    let limit : number = 6;
    if (!page)
            page = 1;
        const gymskiped = (page - 1) * limit;
        
        const searchCondiions : Prisma.GymWhereInput = {visibility : "PUBLIC"};
        
        if (textSearched)
            searchCondiions.name = {contains: textSearched, mode: "insensitive"};
        if (city)
            searchCondiions.city = city.toLocaleLowerCase();
        if (typeof verified == "boolean")
            searchCondiions.verified = verified;
        
        const totalGym = await prisma.gym.count({where : searchCondiions});
        const totalPage =  Math.ceil(totalGym/limit);
    
        const gyms = await prisma.gym.findMany({
            where : searchCondiions,
            orderBy : [
                {name : "asc"},
                {id : "asc"}
            ],
            skip : gymskiped,
            take : limit + 1,
            include : {
                equipment : true,
            }
        });
        const hasNextPage = gyms.length > limit;
        let data;
        if (hasNextPage){
            data = gyms.slice(0, limit);
        }else{
            data = gyms;
        }
        return {data ,hasNextPage, totalPage};
    }
    
                
    export async function getGymById(id :string, userId : string){
        const gym = await prisma.gym.findUnique({
            where : {id : id},
            include :{
                equipment : {
                    include :{equipment : true}
                }
            }
        });
        if (!gym)
            return null;
        let isCurrentGym = false;
        if (userId){
            const user = await prisma.user.findUnique({
                where : {id : userId},
                select : {currentGymId : true}
            });
            isCurrentGym = user?.currentGymId === gym.id;
        }
        return {...gym, isCurrentGym};
    }


export async function getALLEquip(){
    const allEquipment = await prisma.equipment.findMany({
        select :{
            id : true,
            name : true,
            imageUrl : true,
            category : true,
        },
        orderBy : {
            name : "asc",
        },
    });
    return allEquipment;
}

export async function createGym(data : CreateGymData){
    if (data.dataIsPrivate){
        // add the gym data directly to gym table 
        return await prisma.gym.create({
            data : {
                createdById :data.userID,
                name : data.dataName,
                city : data.dataCity,
                address : data.dataAddress,
                phone :data.dataPhone,
                website : data.dataWebsite,
                description : data.dataDescription,
                imageUrl : data.dataImageUrl,
                source : "MEMBER",
                verified : false,
                visibility : "PRIVATE",
                equipment : {
                    create : data.dataEquip?.map(function(item){
                        return {
                            equipmentId : item.equipmentId,
                            quantity : item.quantity,
                        }
                    })
                }
                

            }
        });
    }
    else{
        //add gym data to submussion table 
        return  await prisma.gymSubmission.create({
            data : {
                kind : "NEW_GYM",
                submitterId : data.userID,
                name : data.dataName,
                city : data.dataCity,
                address :data.dataAddress,
                note : data.dataDescription,
                photos : data.dataImageUrl ?{
                    create : {
                        position : 0,
                        media : {
                            create :{
                                url : data.dataImageUrl,
                                uploadedById :data.userID,
                                type : "IMAGE"
                            }
                        }
                    }
                } : undefined,
                equipment :{
                    create : data.dataEquip?.map(function(item){
                        return {
                            equipmentId :item.equipmentId,
                        };
                    })
                }
            }
        });
        
    }
}


export async function getSubmissions(){
    return await prisma.gymSubmission.findMany({
        where : {status : "PENDING"},
        orderBy : {createdAt : "desc"},
        include : {
            submitter : {
                select : {
                    id : true,
                    email :true,
                },
            },
            equipment : {
                select : {
                    equipment : true,
                }
            },
            photos : {
                include :{
                    media: true,
                }
            }
        }
    });
}

export async function getUserSubmissions(userId : string){
    const submissions = await prisma.gymSubmission.findMany({
        where : {submitterId : userId},
        orderBy : {createdAt : "desc"},
        include : {
            submitter : {
                select : {
                    email : true,
                    username : true,
                }
            }
        }
    });
    return submissions;
}


export async function selectCurrentGym(gymId : string, userId : string){
    const gym = await prisma.gym.findUnique({
        where : {id : gymId},
    });
    if (!gym)
        throw new Error("Gym not found");

    if (gym.visibility === "PRIVATE" && gym.createdById !== userId)
        throw new Error("Access denied");
    
    if (!gym.verified && gym.visibility !== "PRIVATE")
        throw new Error("Gym is unverified");
    await prisma.user.update({
        where : {id : userId},
        data :{currentGymId:gymId}
    });
}


export async function getCurrentGym(userId : string){
    const user  = await prisma.user.findUnique({
        where : {id : userId},
        select : {currentGym : true}
    });
    if (!user?.currentGym)
        return null;
    return user.currentGym;
}


export async function resetCurrent(userId : string){
    await prisma.user.update({
        where : {id :userId},
        data : {currentGymId : null}
    });
}


export async function getPrivate(userId : string){
    const list =  prisma.gym.findMany({
        where : {visibility : "PRIVATE", createdById : userId},
        include : {
            equipment  : true
        },
        orderBy : {createdAt : "desc"}
    });

    return list;
}

export async function RMPrivateGym(gymId : string, userId : string){
    const gym = await prisma.gym.findUnique({
        where : {id : gymId}
    });
    if (!gym)
        throw new Error("gym not found");

    if (gym.visibility !== "PRIVATE" || gym.createdById !== userId)
        throw new Error("access denied");

    await prisma.gym.delete({
        where : {id : gymId}
    });
}

export async function EditGym(useId : string, gymId : string, data : any){

    const gym=  await prisma.gym.findUnique({
        where : {id : gymId}
    });

    if (!gym)
        throw new Error("gym not found");
    if (gym.visibility !== "PRIVATE" || gym.createdById !== useId){
        throw new Error("Acees denied");
    }
    await prisma.gymEquipment.deleteMany({
        where : {gymId : gymId}
    });

    await prisma.gym.update({
        where : {id : gymId},
        data : {
            name : data.name,
            city : data.city,
            address : data.address,
            phone: data.phone,
            equipment : {
                create : data.equipment?.map(function(equip : any){
                    return {
                        equipmentId:equip.equipmentId,
                        quantity: 1
                    }
                })
            }
        }
    });
}


// export async function getGymEquip(useId : string, gymId : string){
//     const euipList = await prisma.gym.findUnique({
//         where : {id : gymId},
//         select :
//     });
// }