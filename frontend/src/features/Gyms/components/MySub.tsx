import { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import GymNavbar from "./gymNavBar";
import type { Gym } from "../type/gym";
import { Link } from "react-router-dom";





interface submissionProps{
    onTabChange : (tab :"search" | "add" | "submission") =>void; 
    onSuccess : (msg : string)=> void;
}


export default function MySub({onTabChange, onSuccess} : submissionProps){
    const [currentGym, setCurrentGym] = useState<Gym | null>(null);
    const [isLoading, setIsLoadin] = useState(true);


    const [privateList, setPrivateList] = useState<Gym[]>([]);
    const [submittedList, setSubmittedList] = useState<Gym | null>(null);


    useEffect(function(){
        async function getCurrentGym(){
            try{
                const res = await api.get("/api/gyms/me/current");
                setCurrentGym(res.data);
                
            }catch(e){
                console.log(e);
            }
            finally{
                setIsLoadin(false);
            }
        }
        getCurrentGym();
    },[]);

    useEffect(function(){
        async function getPrivate(){
            try{
                const res = await api.get("/api/gyms/private");
                setPrivateList(res.data);
            }catch(e){
                console.log(e);
            }
        }
        getPrivate();
    },[]);

    async  function handleReset(){
        try{
            await api.patch("/api/gyms/me/current", {gymId :null});
            setCurrentGym(null);
            onTabChange("search");
            onSuccess("Current gym reset successfully");
        }catch(e){
            console.log(e);
        }
    }

    async function handleDelete(gym: Gym){

        // console.log("👉 CLICKED DELETE FOR:", gym); // 👈 Test log
        // if (!window.confirm("Are you sure you want to delete this gym?"))
        //     return;
        // if (!confirm("Are you sure you want to delete this gym?"))
            // return
        try{
            await api.delete(`/api/gyms/${gym.id}`);
            onSuccess(`${gym.name} gym deleed successfully`);
            setPrivateList(privateList.filter(function(item){
                return item.id !== gym.id;
            }));
            if (currentGym?.id === gym.id){
                setCurrentGym(null);
            }
        }catch(e){
            console.log("failed to delete gym",e);
        }
    }

    return (
        <>
            <GymNavbar currentTab="submission" onTabChange={onTabChange}/>
            <div className="max-w-[1280px] bg-[#1f1f1e] text-white mx-auto px-5 sm:px-8 py-8 rounded-2xl">
                <h1 className="text-3xl font-bold text-white mt-4">My gyms</h1>
                <p className="mt-1 text-xs text-[#9E9E9E] mb-8 mt-2">
                    Your selected gym, your private gyms, and what you've sent us to verify.
                </p>
                <div>
                    <h2 className="text-xs font-extrabold text-[#8E8E8E] mb-2">SELECTED GYM</h2>

                    <div className=" bg-[#181818] rounded-2xl border border-[#CCFF00]/30">
                        {currentGym && (
                            <div className="flex flex-col sm:flex-row justify-between px-4 py-6">
                                <div className="flex flex-col ">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-bold">{currentGym.name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full  text-xs font-medium bg-[#242424] text-[#BDBDBD] hover:text-white border border-[#2E2E2E]">
                                            {currentGym.visibility}
                                        </span>
                                    </div>
                                    <span className="mt-2 text-xs text-[#9E9E9E]">{currentGym.city}</span>
                                    <p className="text-xs  mt-1">Workouts and the exercise picker use this gym.</p>

                                </div>
                                <div className="flex flex-row w-full items-center justify-start sm:flex-row gap-2 mt-3 ">
                                    <button 
                                        type="button"
                                        onClick={handleReset}
                                        className="px-2.5 py-2 rounded-full text-xs font-extrabold bg-[#CCFF00] text-black   border border-[#2E2E2E] hover:scale-102 transition-colors">
                                        Change gym
                                    </button>
                                    <Link 
                                        to={`/gyms/${currentGym.id}`}
                                        className="px-2.5 py-2 text-xs font-semibold  border rounded-full text-white hover:text-[#CCFF00]  border-[#2E2E2E] transition-colors text-center">
                                        View
                                    </Link>

                                </div>
                            </div>
                        )}
                        { !currentGym && (
                            <div className=" border border-red-400 rounded-2xl">
                                <p className="px-4 py-2 text-xs ">No gym selected yet. Go to Search to pick your gym!</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-12 items-center font-bold p-4">
                        <h2 className="text-2xl font-extrabold text-white mb-2">Private gyms</h2>
                        <span className="text-xs text-[#9E9E9E]">{privateList.length} only you see these</span>

                    </div>
                    <div className="rounded-2xl space-y-5">
                    {privateList.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-center ext-[#9E9E9E]">
                            <p>You have no private gyms yet.</p>
                        </div>
                    ) : (
                        privateList.map(function(gym){
                            return <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl bg-[#181818] border border-[#CCFF00]/45 p-5 sm:p-6">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h3 className="text-xl font-bold text-white">
                                                    {gym.name}
                                                </h3>
                                                <span className="rounded-full bg-[#242424] border border-white/[0.06] px-2.5 py-0.5 text-xs font-semibold text-[#BDBDBD]">Private</span>

                                            </div>
                                            <p className="mt-1.5 text-xs text-[#9E9E9E]">
                                                {gym.city ?? "No data city set"} • {gym.equipment?.length ?? 0} equipment
                                            </p>
                                            <p className="mt-2 text-xs text-[#D4D4D4]"
                                            >Workouts and the exercise picker use this gym.</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <Link to={`/gyms/${gym.id}`}
                                                     className="rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                                                View
                                            </Link>
                                            <button type="button"
                                                    className="rounded-xl bg-[#141414] hover:bg-[#222222] border border-[#333333] px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                                                Edit
                                            </button>
                                           <button type="button"
                                                    onClick={function(){handleDelete(gym)}}
                                                    className="rounded-xl bg-red-500/5 hover:bg-red-500/25 border border-app-danger px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors">
                                                delete
                                            </button>
                                        </div>
                                    </div>
                            })
                    )}
                    </div>

                    <div className="flex gap-3 mt-12 items-center font-bold p-4">
                        <h2 className="text-2xl font-extrabold text-white mb-2">Contributions</h2>
                        <span className="text-xs text-[#9E9E9E]">New gyms, equipment and changes you sent us to verify</span>

                    </div>
                        
                </div>
            </div>
        </>
    )
}