import { Link } from "react-router-dom";
import type { Gym } from "../data/FakeData";

interface GymCardPara {
    gym : Gym;
}

function GymCard({gym} : GymCardPara){
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
                <Link to={`/gyms/${gym.id}`} className="bg-[#414141] text-white px-4 py-2 rounded mt-2 hover:scale-103 transition duration-300">
                    View Details
                </Link>
            </div>
            <img src={gym.image} alt={gym.name} className="w-32 h-32 object-cover  border"/>
        </div>
    )
}

export default GymCard;





