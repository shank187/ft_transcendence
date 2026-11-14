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
    let limit : number = 3;
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
        
        const gyms = await prisma.gym.findMany({
            where : searchCondiions,
            orderBy : [
                {name : "asc"},
                {id : "asc"}
            ],
            skip : gymskiped,
            take : limit + 1
        });
        const hasNextPage = gyms.length > limit;
        let data;
        if (hasNextPage){
            data = gyms.slice(0, limit);
        }else{
            data = gyms;
        }
        return {data ,hasNextPage};
    }
    
    
                
    export async function getGymById(id :string){
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
        return gym;
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

export async function rejectSubmission(
    submissionId: string,
    reviewerId: string,
    reason: string,
): Promise<"rejected" | "not-found" | "self-review" | "conflict"> {
    const result = await prisma.gymSubmission.updateMany({
        where: {
            id: submissionId,
            status: "PENDING",
            submitterId: { not: reviewerId },
        },
        data: {
            status: "REJECTED",
            reviewerId,
            reviewedAt: new Date(),
            rejectReason: "OTHER",
            rejectDetail: reason,
        },
    });

    if (result.count === 1) return "rejected";

    const submission = await prisma.gymSubmission.findUnique({
        where: { id: submissionId },
        select: { submitterId: true },
    });

    if (!submission) return "not-found";
    if (submission.submitterId === reviewerId) return "self-review";
    return "conflict";
}

//ff847c59-d6d8-43b1-8012-8299e8240859