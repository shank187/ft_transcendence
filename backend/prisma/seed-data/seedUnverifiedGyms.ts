import axios from "axios";
import { Prisma, PrismaClient } from "@prisma/client";
import "dotenv/config";
import gyms from "./unverifiedGyms.json"

interface importedGyms{
    googleId: string;
    name: string;
    description: string | null;
    address: string | null;
    city: string;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    website: string | null;
}

export async function seedUnverifiedGyms(prisma : PrismaClient){
    try{
        // @ts-ignore
        const adminEMAIL = process.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
        const adminUser = await prisma.user.findUnique({
            where : {email: adminEMAIL}
        });
        if (!adminUser){
            throw new Error("admin user not found");
        }

        for(let gym of(gyms as importedGyms[])){
            await prisma.gym.upsert({
                    where : {googleId : gym.googleId},
                    update : {},
                    create : {
                        googleId : gym.googleId,
                        createdById: adminUser.id,
                        name: gym.name,
                        description : gym.description,
                        address : gym.address,
                        city: gym.city,
                        latitude : gym.latitude,                            
                        longitude : gym.longitude,
                        phone : gym.phone,
                        website: gym.website,
                        source : "IMPORTED",
                        verified : false,
                    }
            });
        }
    }catch (criticalError) {
        console.error("Critical Setup Error:", criticalError);
        throw criticalError;
    }
}


// export async function seedGyms(prisma : PrismaClient){
//     try {
//         const adminEMAIL = process.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
//         const adminUser = await prisma.user.findUnique({
//             where : {email: adminEMAIL!}
//         });
//         if (!adminUser){
//             throw new Error("admin user not found");
//         }

//         const availableCites = ["khouribga", "kenitra", "beni mellal", "Rabat"];
        
//         for(let city of availableCites){
//             const places = await fetchGyms(city);
            
//             for(let gym of places){

//                 try {
//                     await prisma.gym.upsert({
//                         where : {googleId : gym.id},
//                         update : {},
//                         create : {
//                             googleId : gym.id,
//                             createdById: adminUser.id,
//                             name: gym.displayName?.text || "unknow gym name",
//                             description : gym.editorialSummary?.text || null,
//                             address : gym.formattedAddress || null,
//                             city: city.toLocaleLowerCase(),
//                             latitude : gym.location?.latitude || null,
//                             longitude : gym.location?.longitude || null,
//                             phone : gym.nationalPhoneNumber || null,
//                             website: gym.websiteUri || null,
//                             source : "IMPORTED",
//                             verified : false,
//                         }
//                     });
//                 } catch (error) {
//                     console.error("Gym import failed", error);
//                 }
//             }
//         }
//     } catch (criticalError) {
//         console.error("Critical Setup Error:", criticalError);
//     }
// }



// main().catch(function(e){
// 	console.log(e)
// }).finally(async function(){
// 	await prisma.$disconnect();
// });
