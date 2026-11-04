import { PrismaClient } from "@prisma/client"
import gyms from "./verified-gyms.json"



export async function seedVerifiedGyms(prisma : PrismaClient){
    try{
        const adminEMAIL = process.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
        const adminUser = await prisma.user.findUnique({
            where : {email: adminEMAIL!}
        });
        if (!adminUser){
            throw new Error("admin user not found");
        }
        for(let gym of gyms){
            const existingGym = await prisma.gym.findFirst({
                where:{
                    name : gym.name,
                    city: gym.city
                }
            });
            const equip = await prisma.equipment.findMany({
                where:{name : {in :gym.equipment}}
            });
            // [
            //   { "id": "uuid-111", "name": "Dumbbells" },
            //   { "id": "uuid-222", "name": "Barbell" },
            //   { "id": "uuid-333", "name": "Bench" }
            // ]   

            if (!existingGym){
                await prisma.gym.create({
                    data :{
                        name: gym.name,
                        imageUrl: gym.imageUrl,
                        city: gym.city,
                        address: gym.address,
                        latitude: gym.latitude,
                        longitude: gym.longitude,
                        phone: gym.phone,
                        website: gym.website,
                        description: gym.description,
                        source: "TEAM",
                        verified: true,
                        verifiedAt: new Date(),
                        createdById: adminUser.id,
                        equipment: {
                            create :equip.map(function(eq :any){
                                    return {
                                        equipmentId : eq.id,
                                        quantity : 1
                                    };
                            })
                        }
                    }
                });
            }
        }
    } catch (criticalError) {
        console.error("Critical Setup Error:", criticalError);
    }
}