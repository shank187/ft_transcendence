import type { Gym } from "../type/gym";
import { X, Check } from "lucide-react";
import  type { Equipment } from "../type/gym";
import api from "../../auth/axiosInstance";
import React, { useState, useEffect } from "react";



interface editProps {
    gym : Gym;
    onClose : ()=> void;
    onSuccess : (msg : string)=>void;
    refrech : ()=>void;
}

export default function EditGym({gym, onClose, onSuccess, refrech} : editProps){
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, SetPhoneNumber] = useState("");
    const [allEquip, setAllEquip] = useState<Equipment[] | []>([]);
    const [selectedEquip, setSelectedEquip] = useState<string[]>(
        gym.equipment ? gym.equipment.map(function(item){
            return item.equipmentId;
        }) : []
    );


    async function fetchEquip(){
        try{
            const res = await api.get("/api/gyms/equip");
            setAllEquip(res.data);

        }catch(e){
            console.log("Failed to fetch equipment");
        }
    }
    useEffect(function(){
        fetchEquip();
    }, []);


    function removeEquip(id:string){
        setSelectedEquip(selectedEquip.filter(function(equip){
            return equip !== id;
        }));
    }
    function addEquip(id : string){
        setSelectedEquip([...selectedEquip, id]);
    }

    const formattedEquip = selectedEquip.map(function(id){
        return {
            equipmentId : id,
            quantity : 1
        }
    })
    async function handleSubmit(){

    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6">
            <div className="w-[780px] rounded-3xl bg-[#181818] border border-[#2C2C2C] p-6 text-white">
                {/* header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Edit Gym</h2>
                        <p className="text-xs text-[#8E8E8E] mt-0.5">
                            Changes apply to your workouts and exercise picker.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className=" rounded-lg p-1.5 text-red-500  hover:bg-[#242424] transition-colors">
                            <X className="w-6 h-6"/>

                    </button>

                </div>

                {/* edit from */}
                <form onSubmit={handleSubmit}
                        className="mt-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-white mb-2 ">Gym name</label>
                        <input type="text"
                                required
                                value={name}
                                placeholder={gym.name}
                                onChange={function(e){setName(e.target.value)}}
                                className="w-full rounded-xl bg-[#0E0E0E] border border-[#242424]  px-4 py-2.5 text-xs text-white focus:border-[#CCFF00]"/>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2 space-y-1">
                        <div>    
                            <label className="block text-xs font-bold text-white mb-2 ">City</label>
                                <select value={city}
                                    onChange={function(e){setCity(e.target.value)}}
                                    className="appearance-none w-full rounded-xl bg-[#0E0E0E]  border border-[#242424] px-4 py-2.5 text-sm text-white">
                                    <option value="">Select a city </option>
                                    <option value="khouribga">Khouribga</option>
                                    <option value="kenitra">kenitra</option>
                                    <option value="Rabat">Rabat</option>
                                    <option value="beni mellal">Beni Mellal</option>
                                </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white mb-2 ">Address</label>
                            <input type="text"
                                    value={address}
                                    placeholder={gym.address}
                                    onChange={function(e){setAddress(e.target.value)}}
                                    className="w-full rounded-xl bg-[#0E0E0E]  border-[#242424] px-4 py-2.5 text-xs focus:border-[#CCFF00]"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white mb-2 ">Phone Number</label>
                        <input type="text"
                                placeholder={gym.phone}
                                value={phoneNumber}
                                onChange={function(e){SetPhoneNumber(e.target.value)}}
                                className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-zinc-600"/>
                    </div>


                    <div>
                        <div>
                            <label htmlFor="">Equipment {selectedEquip.length} selected </label>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto sapce-y-3 bg-[#0A0A0A] p-2 rounded-xl border border-[#242424] p-3 mt-2">
                            {allEquip.map(function(item){
                                const isSelected = selectedEquip.includes(item.id);
                                return(
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={function(){
                                            if (isSelected)
                                                removeEquip(item.id)
                                            else
                                                addEquip(item.id);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${isSelected ?
                                                "bg-[#CCFF00] text-black font-bold" : "bg-[#181818] text-zinc-300 hover:bg-[#222222]"
                                        }`}
                                        >
                                            <span>{item.name}</span>

                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#262626] flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl  px-4 py-2 text-xs font-bold text-[#BDBDBD] hover:text-white transition-colors ">
                                Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#CCFF00] hover:bg-[#d8ff33]  px-5 py-2.5 text-xs font-extrabold text-[#0F0F0F] transition-colors cursor-pointer">
                                Save changes
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}
