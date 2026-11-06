import axios from "axios";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";
// const fs = require("fs");


interface GymJsonData {
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
		    console.log("google api error");
	}
	return [];
}

export async function seedGyms(prisma : PrismaClient){
    try {
        const adminEMAIL = process.env.ADMIN_EMAIL?.trim().toLocaleLowerCase();
        const adminUser = await prisma.user.findUnique({
            where : {email: adminEMAIL!}
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


export async function fetchAndSave(){
    const allGyms : GymJsonData[] = [];
    const availableCites = ["khouribga", "kenitra", "beni mellal", "Rabat"];

    for(let city  of availableCites){
        const places = await fetchGyms(city);
        for(let gym of places){
            allGyms.push({
                googleId: gym.id,
                name: gym.displayName?.text || "Unknown Gym",
                description: gym.editorialSummary?.text || null,
                address: gym.formattedAddress || null,
                city: city.toLowerCase(),
                latitude: gym.location?.latitude || null,
                longitude: gym.location?.longitude || null,
                phone: gym.nationalPhoneNumber || null,
                website: gym.websiteUri || null,
            });
        }
    }
    // i need to turn the js array into text, json string

    // JSON.stringify converts your live JavaScript array into plain text letters:
    // Input: JavaScript Array [ { name: "Gold Gym" } ]
    // Output: Plain text string '[ { "name": "Gold Gym" } ]'

    const jsonString = JSON.stringify(allGyms, null,3);
    //  now i need to write that teext into a fule
    const filePath = "./prisma/seed-data/unverifieGyms.json";
    fs.writeFileSync(filePath, jsonString, "utf-8");
    console.log(`✅ Saved ${allGyms.length} gyms into unverifieGyms.json!`);



// If the file does not exist 
// →
// → it creates a brand new unverifieGyms.json file.
// If the file already exists 
// →
// → it overwrites it with the latest data.
// The Sync part means Node will pause and wait until the file is 
// completely written to your disk before moving to the next line.

}
fetchAndSave();

// main().catch(function(e){
// 	console.log(e)
// }).finally(async function(){
// 	await prisma.$disconnect();
// });