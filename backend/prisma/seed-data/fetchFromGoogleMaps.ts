import axios from "axios";
// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";
import "dotenv/config";
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
    const jsonString = JSON.stringify(allGyms, null,3);
    const filePath = "./prisma/seed-data/unverifiedGyms.json";

    if (allGyms.length === 0){
        console.log("no gyms fetched (API error or key missing). Kept existing seed data.");
        return ;
    }
    fs.writeFileSync(filePath, jsonString, "utf-8");




}

fetchAndSave();
