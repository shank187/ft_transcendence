import axios from "axios";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// const defaultEquipment = [
//   "Treadmill", 
//   "Elliptical", 
//   "Stationary Bike", 
//   "Stair Climber", 
//   "Rowing Machine",
//   "Dumbbells", 
//   "Barbells", 
//   "Kettlebells", 
//   "Flat/Incline Bench", 
//   "Squat Rack",
//   "Power Rack",
//   "Smith Machine", 
//   "Cable Crossover", 
//   "Leg Press", 
//   "Lat Pulldown", 
//   "Leg Extension",
//   "Leg Curl",
//   "Chest Press Machine",
//   "Pull-up Bar",
//   "Medicine Balls",
//   "Resistance Bands"
// ];

// dotenv.config();
dotenv.config({ path: "../.env" });
// const prisma = new PrismaClient();

// async function seedEquip(){
// 	for(let equip of defaultEquipment){
// 		await prisma.equipment.upsert({
// 			where : {name : equip},
// 			update : {},
// 			create : {name : equip}
// 		})
// 	}
// }

async function fetchGyms(city : string){
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	const url = "https://places.googleapis.com/v1/places:searchText";

	try{
		const res  = await axios.post(url, {textQuery : `gyms in ${city}`}, 
			{
				headers :{
				"X-Goog-Api-Key" : apiKey,
				"X-Goog-FieldMask" : "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.regularOpeningHours"
 				}
			});
			
		if (res.status !== 200 )
			throw new Error("network failed");
			
		let data = res.data;
		
		if (!data.places || data.places.length === 0){
			console.log(`No gyms found in ${city}`);
			return [];
		}	
		return data.places
	}
	catch(error){
		console.log("google error", error);
	}
	return [];
}

export async function seedGyms(prisma : PrismaClient){
    try {
        let adminUser = await prisma.user.findUnique({
            where :{email : "zed@admin.com"}
        });
        if (!adminUser){
            adminUser = await prisma.user.create({
                data : {
                    email : "zed@admin.com",
                    username : "admin"
                }
            });
        }
        // await seedEquip();
        const allEquipment = await prisma.equipment.findMany();
        const availableCitys = ["khouribga", "kenitra", "beni mellal", "Rabat"];
        
        for(let city of availableCitys){
            const places = await fetchGyms(city);
            
            for(let gym of places){
                const equipData = allEquipment.map(function(machine: any){
                    return {
                        equipmentId : machine.id,
                        quantity : 1
                    }
                })
                try {
                    await prisma.gym.upsert({
                        where : {googleId : gym.id},
                        update : {},
                        create : {
                            googleId : gym.id,
                            createdById: adminUser.id,
                            name: gym.displayName?.text || "unknow gym name",
                            description : gym.editorialSummary?.text || "no description",
                            address : gym.formattedAddress || null,
                            city: city.toLocaleLowerCase(),
                            latitude : gym.location?.latitude || null,
                            longitude : gym.location?.longitude || null,
                            phone : gym.nationalPhoneNumber || null,
                            website: gym.websiteUri || null,
                            equipment : {
                                create : equipData
                            }
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
    } catch (criticalError) {
        console.error("Critical Setup Error:", criticalError);
    }
}

// main().catch(function(e){
// 	console.log(e)
// }).finally(async function(){
// 	await prisma.$disconnect();
// });