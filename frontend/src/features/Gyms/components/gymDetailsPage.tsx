import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import type { Gym } from "../type/gym";
import LoadingState from '../../../components/states/LoadingState';
import {Link }from "react-router-dom";
import {ArrowLeft} from "lucide-react";
import api from '../../auth/axiosInstance';
import { MapPin, Dumbbell, Compass, Navigation} from "lucide-react";



function GymDetailsPage() {
    const { id} = useParams();
    const [gym, setGym] = useState<Gym | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(false);
    // console [equipList, setEquipList] = useState();


    async function handleSelectgym(){
        try{
            await api.patch("/api/gyms/me/current", {gymId : id});
            setSelected(true);

        }catch(e){
            console.log(e);
        }
    }


    useEffect(function(){
        async function getGymDetails(){
            setLoading(true);
            if (!id)
                return;
            try {
                const req = await api.get(`/api/gyms/${id}`);
                setGym(req.data);
                setSelected(Boolean(req.data.isCurrentGym));

            } catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false);
            }
        }
        getGymDetails();
    }, [id]);

    if (loading)
        return <LoadingState message="Loading gym info..." />;
    if (!gym)
        return <div className="p-8 text-3xl font-bold">Gym not found!</div>;

    const openMapUrl = `https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`;
  const mapUrl = `https://maps.google.com/maps?q=${gym.latitude},${gym.longitude}&z=15&output=embed`;


    return (

        <div className='max-w-[780px] mx-auto px-4 py-4 sm:px-6  bg-[#1f1f1e] rounded-2xl border border-[#CCFF00]/30 space-y-6'>

            <Link to={"/gyms"} className='flex items-center gap-4'>
                <ArrowLeft className="w-4 h-4 text-[#CCFF00]"/>
                <span className='font-bold'>Back to Gyms</span>
            </Link>

            <div >
                <div className="w-full group relative flex flex-col sm:flex-row rounded-2xl  bg-[#181818] border border-white/[0.09] overflow-hidden transition-all duration-200  hover:bg-[#1C1C1C] cursor-pointer sm:h-56">


                    <div className=" relative w-full sm:w-74  h-52 sm:h-auto overflow-hidden  shrink-0 bg-[#101010]">
                        <img src={gym.imageUrl} alt={gym.name} 
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
                            <div className="flex items-center  justify-between gap-2.5">
                                <h3 className="text-xl font-bold text-white truncate">{gym.name}</h3>

                            </div>

                            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                                <MapPin className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0"/>
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
                            <div className="flex flex-row gap-2">
                                <button 
                                    type="button"
                                    disabled={selected}
                                    onClick={handleSelectgym}
                                    className="px-4 py-2.5 rounded-full text-xs font-extrabold bg-[#CCFF00] text-black   border border-[#2E2E2E] hover:scale-102 transition-colors">
                                        {selected ? "selected" : "Set as My Gym"}
                                </button>

                            </div>

                        </div>
                    </div>
                
                
                </div>
            </div>
            <div className='rounded-3xl bg-[#181818] border border-white/[0.09] p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2'>

                    <div>
                        <div className='flex items-center gap-2'>
                            <Compass  className='w-4 h-4 text-[#CCFF00]'/>
                            <h2 className='text-lg font-bold text-white'>
                                Gym Maps Location & Directions
                            </h2>
                        </div>
                            <p className='text-xs text-zinc-400 mt-0.5'>
                                Interactive map pin and GPS coordinates for {gym.name}
                            </p>
                    </div>
                    {gym.latitude && gym.latitude ? (
                        <a href={openMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#242424] hover:bg-[#2E2E2E] border border-white/10  px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                            <span>Open in Google Mpas</span>
                            <Navigation className='w-4 h-4 text-[#CCFF00]'/>
                        </a> 
     
                    ) : (
                        <span className="px-3 py-2 rounded-2xl bg-[#1C1C1C] border border-white/5 text-xs text-zinc-500 cursor-not-allowed"
                            >No GPS pin available
                        </span>
                    )}
                </div>


                <div>
                    <div className="w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900">
                        <iframe src={mapUrl}
                                className="w-full h-full min-h-[280px] sm:min-h-[320px] border-0"
                                loading="lazy">
                                
                        </iframe>

                    </div>
                </div>
            </div>
            <div className="rounded-2xl bg-[#181818] border border-white/[0.09] p-5">
                <div className="mb-4">
                    <div className="flex items-center gap-2.5">
                        <Dumbbell className="w-4 h-4 text-[#CCFF00] "/>
                        <h2 className="text-lg font-bold text-white">
                            Equipment in {gym.name}
                        </h2>
                        <span className="rounded-full bg-[#252525] border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-[#CCFF00]">
                            {gym.equipment ? gym.equipment.length : 0} items
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Complete list of racks, machines, free weights, and cardio units
                        available on the floor
                    </p>
                </div>

                {gym.equipment && gym.equipment.length > 0 ? 
                
                (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {gym.equipment.map(function(equip : any){
                        return <div
                            key={equip.equipment.id}
                            className="group flex flex-col justify-between rounded-2xl bg-[#121212] border border-white/[0.07] hover:border-[#CCFF00]/40 p-4 transition-all">
                                <div>
                                    <span className="inline-flex rounded-2xl bg-[#242424] px-2.5 py-1 text-xs font-bold text-zinc-300 ">
                                        {equip.equipment.category}
                                    </span>
                                    <h4 className="mt-3 text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                                        {equip.equipment.name}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 mt-4 border-t border-white/[0.06] py-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[#CCFF00]"></span>
                                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00]">
                                        Available
                                    </div>
                                </div>
                        </div>
                    })
                    }
                </div>)
                :(
                    <div className="py-10 text-center rounded-2xl bg-[#141414]  border border-white/5">
                        <p className="text-xs font-medium text-zinc-400">No equipment listed yet</p>
                        <p className="text-xs text-zinc-600 mt-1">This gym hasn't registered its machines and weights.</p>

                    </div>
                )}
            </div>
        </div>

    )
}

export default GymDetailsPage;