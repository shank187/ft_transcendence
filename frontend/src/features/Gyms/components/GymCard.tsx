import { Link } from "react-router-dom";
import type { Gym } from "../data/FakeData";
import { useState } from "react";
import axios from "axios";

interface GymCardPara {
    gym : Gym;
    Selected : boolean;
    onSelect: (id:string) => void;
}

// React: The user clicks the button, and Axios fires the request sending { gymId: gym.id }
//  to your chosen URL (e.g., /api/users/current-gym).
// Express Router: The server listens for that exact URL and passes the incoming request
//  to your updateCurrentGym controller.
// Controller: Unpacks req.body.gymId and the user's ID, then hands them to the Service.
// Service: Runs your prisma.user.update() function to save the new pointer in the 
// database.

function GymCard({gym, Selected, onSelect} : GymCardPara){

    const [isLoading, setIsloadng] = useState(false);
    // const [Selected, setSelected] = useState(false);


    async function handleSelectGym(){
        setIsloadng(true);
        try{
            const res = await axios.post("/api/user/current-gym", {gymId : gym.id});
            res;
            onSelect(gym.id);
        }catch(e){
            console.log(e);
        }finally{
            setIsloadng(false);
        }
    }


    return (
        <div className="flex flex-row items-center justify-between w-1/2 bg-[#111928] p-6 rounded-lg shadow-md border border-gray-200 text-[#ffffff] mb-2 hover:bg-[#1f2937] transition duration-300">
            <div className="flex flex-col items-start w-full">
                <div className="flex flex-row items-center w-full justify-between mb-6 pr-4">
                    <h2 className="font-semibold text-white text-center ">
                        {gym.name}
                    </h2>
                    {gym.verified ?
                        (<p className="text-white  px-4 py-2 font-bold">Verified</p>)
                        :(<p className="text-white bg-red-400   px-4 py-2 rounded-full font-semiboldbold ">Not Verified</p>)
                    }
                </div>
                <p className="text-white">{gym.city}</p>
                <Link to={`/gyms/${gym.id}`} className="bg-[#414141] text-white px-4 py-2 rounded mt-2 hover:scale-103 transition duration-300 mb-2">
                    View Details
                </Link>
            <button 
                onClick={handleSelectGym} 
                disabled={isLoading || Selected} 
                className={`px-4 py-2 rounded text-white ${
                    Selected 
                        ? "bg-gray-600 cursor-default" 
                        : "bg-[#46d81d] hover:bg-[#3cb818]"
                }`}
            >
                {isLoading 
                    ? "Selecting..." 
                    : Selected 
                        ? "Selected ✓" 
                        : "Select this gym"}
            </button>
            </div>
            <img src={gym.image} alt={gym.name} className="w-32 h-32 object-cover  border"/>
        </div>
    )
}

export default GymCard;





