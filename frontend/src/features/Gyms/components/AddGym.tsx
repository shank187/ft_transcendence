import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import type { Equipment } from "../type/gym";
import { Check, ChevronLeft, X, Camera} from "lucide-react";
import GymNavbar from "./gymNavBar";



interface gymProps{
    onClose : (bool : boolean)=>void;
    onSuccess : (msg : string)=>void;
}

function AddGym({onClose, onSuccess} : gymProps){
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");

    const [equiList, setEquiList] = useState<Equipment[]>([]);
    const [selectedEquip, setSelectedEquip] = useState<string[]>([]);
    const [isPrivate, setIsPrivate] = useState(false);
    const [webSite, setWebSite] = useState("");
    const [description, setDescription] = useState("");
    const [phoneNumber, SetPhoneNumber] = useState("");
    const [imageUrl, setImageUrl] = useState("");


    useEffect(function(){
        async function fetchEquip(){
            try{
                const res = await api.get("/api/gyms/equip");
                setEquiList(res.data);
            }catch(e){
                console.error("Failed to fetch equipment", e);
            }
        }
        fetchEquip();
    }, []);

    function handleClose(){
        onClose(false);
    }
    async function handleSubmit(e : React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if (!name.trim()){
            alert("please enter a gym name");
            return;
        }
        const formattedEquip = selectedEquip.map(function(id){
            return {
                equipmentId:id,
                quantity : 1
            };
        })
        try{
            const res = await api.post("/api/gyms", {
                name : name.trim(),
                city : city,
                address : address,
                isPrivate:isPrivate,
                equipment: formattedEquip,
                description : description,
                phone  : phoneNumber,
                website : webSite,
                imageUrl : imageUrl || undefined
            });
            // console.log(res.data);§
            onSuccess(res.data.msg);
            handleClose();
        }
        catch(e){
            console.error("Failed to create gym:",e);
            alert("Failed to submit gym. Please try again.");
        }
    }

    async function handleImageUpload(e : React.ChangeEvent<HTMLInputElement>){
        if(!e.target.files || !e.target.files[0])
                return;

        const file = e.target.files[0];
        const fileToSend = new FormData();

        fileToSend.append("image", file);

        try{
            const res = await api.post("/api/gyms/upload-image", fileToSend);
            setImageUrl(res.data.imageUrl);
        }catch(e){
            console.log(e);
        }
    }

    function removeEquip(id:string){
        setSelectedEquip(selectedEquip.filter(function(equip){
            return equip !== id;
        }));
    }
    function addEquip(id : string){
        setSelectedEquip([...selectedEquip, id]);
    }
    function handleClearAll(){
        setSelectedEquip([]);
    }

    

    return(
        <>
            <GymNavbar onSearchPage={function(){onClose(false)}}
                       onAddPage={function() {}} 
                       currentPage="add"/>
        <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-8 text-white bg-[#1f1f1e] rounded-2xl border border-[#CCFF00]/30">
            <button 
                onClick={handleClose} 
                className="inline-flex items-center gap-1 text-xs font-medium text-[#A3A3A3] hover:text-white mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4"/>
                <span>Gyms</span>
            </button>


            <h1 className="text-3xl font-extrabold text-white ">
                Add a gym
            </h1>
            <p className="mt-1 text-sm text-[#9E9E9E] mb-4">
                 Missing gym? Save it for yourself, or share it so everyone can find
            </p>


            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl bg-[#161616] border border-[#262626] p-5 sm:p-7 space-y-6">
                <div>
                    <label htmlFor="gym-name" className="block text-xs font-bold text-white mb-2">
                        Gym name
                    </label>
                    <input id="gym-name" type="text"
                    value={name} onChange={function(e){setName(e.target.value)}}
                    placeholder="gym name" required 
                    className="w-full border rounded-xl bg-[#0A0A0A]  border-[#242424] px-4 py-3 text-sm text-white placeholder-zinc-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-white mb-2">
                        Description
                        <span className="font-normal text-zinc-500 ml-1" > (optional)</span>
                    </label>
                    <input type="text"
                            value={description}
                            placeholder="home gym ..." 
                            onChange={function(e){setDescription(e.target.value)}}
                            className="w-full border rounded-xl bg-[#0A0A0A]  border-[#242424] px-4 py-3 text-sm text-white placeholder-zinc-600"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-white mb-2">
                            City
                        </label>
                        <select value={city}
                                onChange={function(e){setCity(e.target.value)}}
                                className="appearance-none w-full rounded-xl bg-[#0A0A0A] border border-[#242424] px-4 py-3 text-sm text-white">
                                <option value="">Select a city (optional)</option>
                                <option value="khouribga">Khouribga</option>
                                <option value="kenitra">kenitra</option>
                                <option value="Rabat">Rabat</option>
                                <option value="beni mellal">Beni Mellal</option>


                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white mb-2">
                             Address 
                            <span className="font-normal text-zinc-500 ml-1" > (optional)</span>
                        </label>
                        <input type="text"
                        placeholder="addres of gym" 
                        value={address}
                        onChange={function(e){setAddress(e.target.value)}}
                        className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-zinc-600 "/>
                    </div>



                    <div>
                        <label className="block text-xs font-bold text-white mb-2">
                            WebSite 
                        <span className="font-normal text-zinc-500 ml-1">(optional)</span>
                        </label>
                        <input type="text"
                                    placeholder="e.g www.1337.ma" 
                                    value={webSite}
                                    onChange={function(e){setWebSite(e.target.value)}}
                                    className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-zinc-600"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-white mb-2">
                            Phone Number  
                            <span className="font-normal text-zinc-500 ml-1">(optional)</span>
                        </label>
                        <input type="text"
                                placeholder="e.g +212 0616719491" 
                                value={phoneNumber}
                                onChange={function(e){SetPhoneNumber(e.target.value)}}
                                className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-zinc-600"/>
                    </div>
                </div>

                <div>
                    {/* /////// */}
                </div>

                <div>
                    <label className="block text-xs font-bold text-white mb-2">
                        Equipment at this gym
                    </label>
                    <p className="text-xs text-[#8E8E8E] mt-0.5">Pick from our list of <span className="text-white font-bold">{equiList.length}</span>, so exercises can match it. browse by type.</p>
                </div>

                <div>
                    <div className="mt-3 rounded-xl bg-[#1D1D1D] border border-[#2A2A2A] p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span>
                                Selected {selectedEquip.length}
                            </span>
                            {selectedEquip.length > 0 && (
                                <button type="button" onClick={handleClearAll}
                                className="text-xs text-[#9E9E9E] hover:text-white transition-colors">
                                    Clear all
                                </button>
                            )}
                        </div>
                        {selectedEquip.length === 0 && (
                            <p className="text-xs text-zinc-500">No equipment selected yet. Pick items from the list below.</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {selectedEquip.map(function(id){

                                const equip = equiList.find(function(e){
                                    return e.id === id;
                                });
                                
                                if (!equip)
                                    return null;
                                return (
                                    <button key={id} type="button"
                                    onClick={function(){removeEquip(id)}}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#CCFF00] px-3 py-1 text-xs font-bold text-[#0F0F0F] hover:bg-[#d8ff33]">
                                            {equip.name}
                                            <X className="w-4 h-4"/>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    

                    <div className="mt-3 rounded-xl bg-[#0A0A0A] border border-[#242424] max-h-60 p-1.5 overflow-y-auto divide-y divide-[#181818]">
                        <p className="text-xs text-zinc-500 py-2">Machines</p>
                        {equiList.map(function(item){
                            const isSelected = selectedEquip.includes(item.id);
                            return (
                                <button key={item.id} 
                                type="button"
                                        onClick={function(){
                                            if(isSelected){
                                                removeEquip(item.id);
                                            }else{
                                                addEquip(item.id);
                                            }

                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs transition-colors ${isSelected ? "bg-[#1E1E1E] text-white font-semibold" : "text-[#D4D4D4] hover:bg-[#141414]"}`}>
                                        <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-[#CCFF00] border-[#CCFF00] text-[#0F0F0F]" :"border-zinc-700 bg-transparent"}`}>
                                            {isSelected && <Check className="w-3 h-3"/>}
                                        </span>
                                        <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>


                    <div className="mt-5">
                        <label className="block text-xs font-bold text-white mb-2" >
                            Photos
                            <span className="font-normal text-zinc-500 ml-1">
                                (one image max, for the review)
                            </span>
                        </label>


                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {!imageUrl && (
                                <label className=" flex flex-col items-center justify-center gap-1.5 text-xs  h-28 w-28 rounded-xl border border-dashed border-[#CCFF00]/60 bg-[#121212] hover:bg-[#1A1A1A] text-[#D4D4D4] transition-colors cursor-pointer">
                                    <Camera className="w-5 h-5 text-[#CCFF00]"/>
                                    <span>Add photo</span>
                                    <input type="file" 
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                            onChange={handleImageUpload}/>
                                </label>
                            )}
                        </div>
                        <div>
                            {imageUrl && (
                                <div className="relative h-48 w-48 rounded-xl overflow-hidden border border-[#2E2E2E]">
                                    <img src={imageUrl} alt="gym preview" 
                                            className="h-full w-full"/>
                                    <button type="button" onClick={function(){setImageUrl("");}}
                                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 transition-colors cursor-pointer">
                                                <X className="w-3.5 h-3.5"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="space-y-3">
                            <label className="block text-xs font-bold text-white mt-10">Who can see it?</label>
                            <button type="button" onClick={function(){setIsPrivate(true)}}
                                    className={`w-full text-left rounded-xl p-4 border transition-all flex items-start gap-3 ${isPrivate ? "bg-[#151C08] border-[#CCFF00]" : "bg-[#1A1A1A] border-[#2A2A2A]"}`}>
                                    <div>
                                        <div className="text-xs font-bold text-white">only me</div>
                                        <div className="text-xs mt-0.5 text-[#9E9E9E]">
                                            A private gym, ready right away just for your workouts.
                                        </div>
                                    </div>
                            </button>

                            <button type="button" onClick={function(){setIsPrivate(false)}}
                             className={`w-full text-left rounded-xl p-4 border transition-all flex items-start gap-3 ${!isPrivate ? "bg-[#151C08] border-[#CCFF00]" : "bg-[#1A1A1A] border-[#2A2A2A]"}`}>
                                
                                <div>
                                    <div className="text-xs font-bold text-white">
                                        Everyone, once it's verified
                                    </div>
                                    <div className="text-xs mt-0.5 text-[#9E9E9E]">
                                        Everyone else sees it once an admin reviews and verifies it.
                                    </div>
                                </div>
                            </button>

                    </div>
                    <div className="flex justify-between mt-5 items-center pt-4 border-t border-[#242424]">
                        <div>
                            <p className="text-xs text-zinc-500">Add at least one photo so an admin can verify it.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleClose}
                                    className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                                <div>cancel</div>
                            </button>
                            <button type="submit"
                                    className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#d8ff33] text-xs font-extrabold text-[#0F0F0F] transition-all">
                                <div>{isPrivate ? "Create Private Gym" : "Send for verification"}</div>
                            </button>
                        </div>

                    </div>
                </div>
            </form>
        </div>
        </>
    )
}
export default AddGym;