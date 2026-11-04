import axios from "axios";
import { PrismaClient } from "@prisma/client";

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

// dotenv is handled by prisma.config.ts — no manual load needed
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

async function fetchGyms(city : string) : Promise<any[]>{
	const apiKey = process.env.GOOGLE_PLACES_API_KEY;
	if (!apiKey) {
		throw new Error("GOOGLE_PLACES_API_KEY is not set in your env. add it to your .env file");
	}
	const url = "https://places.googleapis.com/v1/places:searchText";

	try{
		const res  = await axios.post(url, {textQuery : `gyms in ${city}`}, 
			{
                timeout : 10000,
				headers :{
				"X-Goog-Api-Key" : apiKey,
				"X-Goog-FieldMask" : "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.regularOpeningHours"
 				}
			});
			
			
		let data = res.data;
		
		if (!data.places || data.places.length === 0){
			console.log(`No gyms found in ${city}`);
			return [];
		}	
		return data.places
	}
	catch(error){
        if (axios.isAxiosError(error) && error.code === "ECONNABORTED")// is axiosError katkhali ts now know bli hoa an axios error 
            console.log(`Timeout fetching gyms in ${city}`);
        else 
		    console.log("google error", error);
	}
	return [];
}

export async function seedGyms(prisma : PrismaClient){
    try {
        const adminUser = await prisma.user.findUnique({
            where : {email: process.env.ADMIN_EMAIL!}
        });
        if (!adminUser){
            throw new Error("admin user not found");
        }

        const availableCites = ["khouribga", "kenitra", "beni mellal", "Rabat"];
        
        for(let city of availableCites){
            const places = await fetchGyms(city);
            
            for(let gym of places){

                try {
                    await prisma.gym.upsert({
                        where : {googleId : gym.id},
                        update : {},
                        create : {
                            googleId : gym.id,
                            createdById: adminUser.id,
                            name: gym.displayName?.text || "unknow gym name",
                            description : gym.editorialSummary?.text || null,
                            address : gym.formattedAddress || null,
                            city: city.toLocaleLowerCase(),
                            latitude : gym.location?.latitude || null,
                            longitude : gym.location?.longitude || null,
                            phone : gym.nationalPhoneNumber || null,
                            website: gym.websiteUri || null,
                            source : "IMPORTED",
                            verified : false,
                        }
                    });
                } catch (error) {
                    console.error("Gym import failed", error);
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