import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";


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


// {
//   "name": {
//     "contains": "Gold",
//     "mode": "insensitive"
//   },
//   "city": {
//     "equals": "Rabat",
//     "mode": "insensitive"
//   },
//   "verified": true
// }

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