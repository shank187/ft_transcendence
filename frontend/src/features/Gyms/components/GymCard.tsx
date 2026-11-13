import { MapPin, Check, Dumbbell } from "lucide-react";
import type { Gym } from "../type/gym";


interface GymCardPara {
    gym : Gym;
}

function GymCard({gym} : GymCardPara){
    let imageUrl =  gym.imageUrl || "/gym-images/default-gym.png";

    return (
        // <div className=" w-full flex flex-row items-center justify-between bg-[#111928] p-6 rounded-lg shadow-md border border-gray-200 text-[#ffffff] mb-2 hover:bg-[#1f2937] transition duration-300">
        //     <div className="flex flex-col items-start w-full">
        //         <div className="flex flex-row items-center w-full justify-between mb-6 pr-4">
        //             <h2 className="font-semibold text-white text-center ">
        //                 {gym.name}
        //             </h2>
        //             {gym.verified ?
        //                 (<p className="text-white  px-4 py-2 font-bold">Verified</p>)
        //                 :(<p className="text-white bg-red-400   px-4 py-2 rounded-full font-semiboldbold ">Not Verified</p>)
        //             }
        //         </div>
        //         <p className="text-white">{gym.city}</p>
        //         <Link to={`/gyms/${gym.id}`} className="bg-[#414141] text-white px-4 py-2 rounded mt-2 hover:scale-103 transition duration-300">
        //             View Details
        //         </Link>
        //     </div>
        //     <img src={imageUrl} alt={gym.name} className="w-32 h-32 object-cover  border"/>
        // </div>


        <div onClick={console.log}
            className="group relative flex flex-col sm:flex-row rounded-2xl bg-[#181818] border border-[#2A2A2A] overflow-hidden transition-all duration-200 hover:border-[#3D3D3D] hover:bg-[#1C1C1C] cursor-pointer sm:h-56">
                
                
            <div className=" relative w-full sm:w-54 lg:w-72 h-52 sm:h-auto overflow-hidden  shrink-0 bg-[#101010]">
                <img src={imageUrl} alt={gym.name} 
                    className="h-full w-full object-cover group-hover:scale-105 "/>
                
                <div className="absolute top-3.5 left-3.5">
                    {gym.verified ? (
                        <p className="rounded-md bg-black/85 border border-[#CCFF00]/25 px-2 py-1 text-xs font-extrabold uppercase text-[#CCFF00]" >Veridied</p>
                    ) : (
                        <p className="rounded-md bg-black/85 border border-white-100/10 px-2 py-1 text-xs font-extrabold uppercase text-[#A0A0A0] "> Not Veridied</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-between p-5 min-w-0 ">
                <div >
                    <h3 className="text-xl font-bold text-white truncate">{gym.name}</h3>
                    <div className="flex items-center gap-2.5">

                    </div>
                    {/* {gym.description && (
                        <p className="text-xs text-[#8E8E8E] mt-3">
                            {gym.description}
                        </p>
                    )} */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                        <MapPin className="w-3.5 h-3.5 text-[#A3A3A3]"/>
                        <span>{gym.city}</span>
                        {gym.address && (
                            <div className="flex items-center">
                                <span className="ml-4 text-zinc-600 text-2xl">•</span>
                                <span className="truncate ml-4">{gym.address}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        {gym.description && (
                            <p className="text-xs text-[#8E8E8E] mt-3 line-clamp-2">
                                {gym.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className=" flex items-center justify-between mt-4 pt-3 border-t border-[#262626] ">
                    <div>
                        {gym.equipment && gym.equipment.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#9E9E9E]">
                                <Dumbbell className="w-3.5 h-3.5 text-[#CCFF00]"/>
                                <span className="text-white font-bold">{gym.equipment.length}</span>
                                {" "}equipment
                            </div>
                        ) : (
                            <span className="text-xs text-zinc-400">Gym</span>
                        )}
                    </div>
                    <button type="button"
                            className="px-3 py-1.5 rounded-lg bg-[#242424] text-xs font-semibold text-white group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">View Details</button>

                </div>

            </div>


        </div>
    )
}


export default GymCard;