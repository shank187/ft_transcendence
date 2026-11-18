import { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import GymNavbar from "./gymNavBar";
import type { Gym , GymSubmission} from "../type/gym";
import { Link } from "react-router-dom";

import EditGym from "./editGym"

interface submissionProps{
    onTabChange : (tab :"search" | "add" | "submission") =>void; 
    onSuccess : (msg : string)=> void;
}


export default function MySub({onTabChange, onSuccess} : submissionProps){
    const [currentGym, setCurrentGym] = useState<Gym | null>(null);
    const [isLoading, setIsLoadin] = useState(true);

    const [privateList, setPrivateList] = useState<Gym[]>([]);
    const [submittedList, setSubmittedList] = useState<GymSubmission[]>([]);

    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

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
        async function getSubmitted(){
            try{
                const res = await api.get("/api/gyms/me/submissions");
                setSubmittedList(res.data);
            }
            catch(e){
                console.log(e);
            }
        }
        getSubmitted();
    }, []);

    async function getPrivate(){
        try{
            const res = await api.get("/api/gyms/private");
            setPrivateList(res.data);
        }catch(e){
            console.log(e);
        }
    }
    useEffect(function(){
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
        if (!confirm("Are you sure you want to delete this gym?"))
            return;
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

                    {/* //////////////////////////////////////// */}

                    <div className=" bg-[#181818] rounded-2xl border border-[#CCFF00]/30">
                        {currentGym && (
                            <div className="flex flex-col sm:flex-row  justify-between sm:items-center gap-4 items-start px-4 py-6">
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
                                <div className="flex flex-row gap-2">
                                    <Link 
                                        to={`/gyms/${currentGym.id}`}
                                        className="px-4 py-2.5 text-xs font-semibold  border rounded-full text-white hover:text-[#CCFF00]  border-[#2E2E2E] transition-colors text-center">
                                        View
                                    </Link>
                                    <button 
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2.5 rounded-full text-xs font-extrabold bg-[#CCFF00] text-black   border border-[#2E2E2E] hover:scale-102 transition-colors">
                                        Change gym
                                    </button>

                                </div>
                            </div>
                        )}
                        { !currentGym && (
                            <div className=" border border-red-400 rounded-2xl">
                                <p className="px-4 py-2 text-xs ">No gym selected yet. Go to Search to pick your gym!</p>
                            </div>
                        )}
                    </div>

                    {/* //////////////////////////////////////// */}

                    <div className="flex gap-3 mt-12 items-center font-bold p-4">
                        <h2 className="text-2xl font-extrabold text-white mb-2">Private gyms</h2>
                        <span className="text-xs text-[#9E9E9E]">{privateList.length} only you see these</span>
                    </div>

                    <div className="rounded-2xl space-y-5">
                    {privateList.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-center text-[#9E9E9E]">
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
                                        <div className="flex justify-between sm:items-center gap-2.5 shrink-0">
                                            <div className=" flex items-center gap-2">
                                                <Link to={`/gyms/${gym.id}`}
                                                        className="rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                                                    View
                                                </Link>
                                                <button type="button"
                                                        onClick={function(){setSelectedGym(gym)}}
                                                        className="rounded-xl bg-[#141414] hover:bg-[#222222] border border-[#333333] px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                                                    Edit
                                                </button>
                                            </div>
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
                    <div className="mb-2">
                        <h2 className="text-2xl font-extrabold text-white mt-8 ">Contributions</h2>
                        <span className="text-xs text-[#9E9E9E]">New gyms, equipment and changes you sent us to verify</span>
                    </div>

                    <div className="">
                        {submittedList.length === 0 ? (
                            <div>
                                <p className="px-4 py-6 text-xs text-center text-[#9E9E9E] mt-2">
                                    You have no submitted gyms yet.
                                </p>
                            </div>
                        ) : (
                            submittedList.map(function(gym){
                                return <div key={gym.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181818] rounded-2xl border border-[#CCFF00]/30 p-5  transition-colors mb-2.5">
                                          <div className="flex flex-col items-start  ">
                                                <h3 className={`rounded-full px-2.5 py-0.5 text-xs transition-all cursor-pointer ${
                                                    gym.status === "APPROVED" ? " bg-[#182200] text-[#CCFF00] border border-[#CCFF00]/50 font-extrabold" 
                                                                    : gym.status === "PENDING" ? "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E] font-extrabold" 
                                                                    : "bg-[#ff4f0f] text-black font-extrabold"
                                                }`}>
                                                    {gym.status === "APPROVED" ? "APPROVED"
                                                        : gym.status === "PENDING" ? "In review"
                                                        : "REJECTED" }
                                                </h3>
                                                <div className="flex gap-1.5">
                                                    <span className=" mt-2 font-bold text-white">
                                                        {gym.name}
                                                       </span>
                                                    <span className="ml-2 mr-2 text-zinc-600 text-2xl">•</span>
                                                    <span className=" mt-2 font-bold text-white">
                                                        {gym.city}
                                                   </span>
                                                </div>

                                                <div className="mt-2 text-xs">
                                                    {gym.status === "REJECTED" ? (
                                                        <p className="text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                                                            <span className="font-semibold">Reason : </span>
                                                            {gym.rejectReason}
                                                            <span className="text-xs text-white">{gym.rejectDetail}</span>
                                                        </p>
                                                    ) : gym.status === "APPROVED" ? (
                                                        <p className="text-[#CCFF00] bg-[#CCFF00]/5 border border-[#CCFF00]/20 px-3 py-1.5 rounded-lg">
                                                            <span>Live in public catalog • Added to explore</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-zinc-400">
                                                            Submitted on {gym.createdAt ? new Date(gym.createdAt).toLocaleDateString() : ""} • Our team is reviewing the equipment and location.
                                                        </p>
                                                    )
                                                    }
                                                </div>
                                          </div>

                                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                                            <div className="text-zinc-500 text-xs font-bold">
                                                    {gym.status === "REJECTED" ? (
                                                        <p>Reviewed {gym.reviewedAt ? new Date(gym.reviewedAt).toLocaleDateString() : ""}</p>
                                                    ) : gym.status === "APPROVED" ? (
                                                        <p>Approved  {gym.reviewedAt ? new Date(gym.reviewedAt).toLocaleDateString() : ""}</p>
                                                    ) : (
                                                        <p>Sent {gym.createdAt ? new Date(gym.createdAt).toLocaleDateString() : ""}</p>
                                                    )}
                                            </div>
                                            {gym.status === "APPROVED" && gym.gymId ? (

                                                <Link to={`/gyms/${gym.gymId}`}
                                                className="text-[#CCFF00] font-bold hover:scale-105">
                                                View gym
                                                </Link>
                                            ) : 
                                            gym.status === "PENDING" ? (
                                                <button type="button"
                                                disabled
                                                className="rounded-xl bg-[#141414] border border-[#2E2E2E] text-zinc-500 cursor-not-allowed px-4 py-2 text-xs font-semibold">
                                                            Under review
                                                </button>
                                            ) : (
                                                <button type="button"
                                                onClick={function(){onTabChange("add")}}
                                                className="rounded-xl bg-[#181818] hover:bg-[#222222] border border-red-500/30 text-red-400 px-4 py-2 text-xs font-semibold transition-colors">
                                                            Resubmit
                                                </button>
                                            )}
                                          </div>
                                </div>
                            })
                        )}
                    </div>
                        
                </div>
            </div>
            {selectedGym && (
                <div>
                    <EditGym
                        gym={selectedGym}
                        onClose={function(){setSelectedGym(null)}}
                        onSuccess={onSuccess}
                        refrech={function(){
                            setSelectedGym(null);
                            getPrivate();

                        }}/>
                </div>
            )
            }
        </>
    )
}

