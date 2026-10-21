// import axios from "axios";
// import { PrismaClient } from "@prisma/client";
// import dotenv from "dotenv";
//
// // interface Gym{
// //   id          : String;
// //   name        : String;
// //   description : String;
// //   address     : String;
// //   city        : String;
// //   latitude    : number;
// //   longitude   : number;
// //   phone       : String;
// //   website     : String;
// //   verified    : Boolean;
// //   createdById : String;
// //   createdAt   : string;
// //   updatedAt   : string;
// // }
//
// // ? mark the start of the query para | & chaine multiple para together
//
// // res object hold :
// // res.data : the actual body the server send back (it contains everything google send , status "OK". seme google traking codes and te actual items you ordered)
//
// // res.status : the HTTP network status code(200 succ, 403 forbiden , 500 seerver crash)
// // res.headers newtwork metadata
//
//
// const defaultEquipment = [
//
//   "Treadmill",
//   "Elliptical",
//   "Stationary Bike",
//   "Stair Climber",
//   "Rowing Machine",
//
//   "Dumbbells",
//   "Barbells",
//   "Kettlebells",
//   "Flat/Incline Bench",
//   "Squat Rack",
//   "Power Rack",
//
//   "Smith Machine",
//   "Cable Crossover",
//   "Leg Press",
//   "Lat Pulldown",
//   "Leg Extension",
//   "Leg Curl",
//   "Chest Press Machine",
//
//   "Pull-up Bar",
//   "Medicine Balls",
//   "Resistance Bands"
// ];
//
// async function seedEquip(){
// 	for(let equip of defaultEquipment){
// 		await prisma.equipment.upsert({
// 			where : {name : equip},
// 			update : {},
// 			create : {name : equip}
// 		})
// 	}
// }
//
// dotenv.config();
// const prisma = new PrismaClient();
//
// async function fetchGyms(city : string){
// 	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
// 	const url = "https://places.googleapis.com/v1/places:searchText";
//
//
// 	try{
// 		const res  = await axios.post(url, {textQuery : `gyms in ${city}`},
// 			{
// 				headers :{
// 				"X-Goog-Api-Key" : apiKey,
// 				"X-Goog-FieldMask" : "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.regularOpeningHours"
// 				// "Content-Type" : "application/json"
//  				}
// 			});
// 		if (res.status !== 200 )
// 			throw new Error("network failed");
// 		let data = res.data;
// 		if (!data.places || data.places.length === 0){
// 			console.log(`No gyms found in ${city}`);
// 			return [];
// 		}
// 		console.log(JSON.stringify(data.places[0], null, 2));
//
// 		return data.places
// 	}
// 	catch(error){
// 		console.log("google error");
// 	}
// 	return [];
// }
//
// // fetchGyms("kenitra");
//
// async function main(){
// // Unique slightly faster than First
// 	let adminUser = await prisma.user.findUnique({
// 		where :{email : "zed@admin.com"}});
// 	if (!adminUser){
// 		adminUser = await prisma.user.create({
// 			data : {
// 				email : "zed@admin.com",
// 				username : "admin"
// 			}
// 		});
// 	}
// 	const availableCitys = ["khouribga", "kenitra", "beni mellal", "Rabat"];
// 	await seedEquip();
// 	const allEquipment = await prisma.equipment.findMany();
// 	for(let city of availableCitys){
// 		const places = await fetchGyms(city);
// 		for(let gym of places){
// 			const equipData = allEquipment.map(function(machine){
// 				return {
// 					equipmentId : machine.id,
// 					quantity : 1
// 				}
// 			})
// 			try{
//
// 				await prisma.gym.create({
// 					data : {
// 						createdById: adminUser.id,
// 						name: gym.displayName.text,
// 						description : gym.editorialSummary?.text || null,
// 						address : gym.formattedAddress || null,
// 						city: city.toLocaleLowerCase(),
// 						latitude : gym.location?.latitude || null,
// 						longitude : gym.location?.longitude || null,
// 						phone : gym.nationalPhoneNumber || null,
// 						website: gym.websiteUri || null,
// 						equipment : {
// 							create : equipData
// 						}
// 					}
// 				})
// 			}catch (error){
// 				console.log(error);
// 			}
// 		}
// 	}
// }
//
// main().catch(function(e){
// 	console.log(e)
// }).finally(async function(){
// 	await prisma.$disconnect();
// })

import axios from "axios";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const defaultEquipment = [
  "Treadmill", 
  "Elliptical", 
  "Stationary Bike", 
  "Stair Climber", 
  "Rowing Machine",
  "Dumbbells", 
  "Barbells", 
  "Kettlebells", 
  "Flat/Incline Bench", 
  "Squat Rack",
  "Power Rack",
  "Smith Machine", 
  "Cable Crossover", 
  "Leg Press", 
  "Lat Pulldown", 
  "Leg Extension",
  "Leg Curl",
  "Chest Press Machine",
  "Pull-up Bar",
  "Medicine Balls",
  "Resistance Bands"
];

dotenv.config();
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
				"X-Goog-FieldMask" : "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.regularOpeningHours"
 				}
			});
			
		if (res.status !== 200 )
			throw new Error("network failed");
			
		let data = res.data;
		
		if (!data.places || data.places.length === 0){
			console.log(`No gyms found in ${city}`);
			return [];
		}	
		
		console.log(`Found ${data.places.length} gyms in ${city}!`); 
		
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
                    await prisma.gym.create({
                        data : {
                            createdById: adminUser.id,
                            name: gym.displayName.text,
                            description : gym.editorialSummary?.text || null,
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