import { Search, Plus } from "lucide-react";


interface gymProps {
    currentTab : ( "search"| "add" | "submission");
    onTabChange : (tab : "search" | "add" | "submission")=>void;
}


function GymNavbar({currentTab, onTabChange} : gymProps){
    return (
        <div className="flex items-center justify-between  gap-3 sticky  bg-black/60 top-0 z-20   border-b rounded-b-2xl border-[#262626] px-4 sm:px-8 py-3 mb-4">
            <p className="text-xs font-bold">Community Gyms</p>
            <div className="flex items-center gap-2">



                <button 
                    type="button"
                    onClick={function(){onTabChange("search")}}
                    className={`flex items-center gap-2 rounded-full  px-4 py-2 text-xs  transition-all cursor-pointer ${
                        currentTab === "search" ? "bg-[#CCFF00] text-black font-extrabold" : "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E]"
                }`}>
                    <Search className={`w-3.5 h-3.5 text-[#CCFF00] ${currentTab === "search" ? "text-black" : "text-[#CCFF00]"}`} />
                    Search gyms
                </button>

                <button  
                    type="button" 
                    onClick={function(){onTabChange("add")}}
                    className={`flex items-center gap-2 rounded-full  px-4 py-2 text-xs transition-all cursor-pointer ${currentTab === "add" ? "bg-[#CCFF00] text-black font-extrabold" : "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E] font-extrabold"}`}>
                    <Plus className={`w-3.5 h-3.5 `}/>
                    Add a gym
                </button>

                <button
                    type="button" 
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-all cursor-pointer ${currentTab === "submission" ? "bg-[#CCFF00] text-black font-extrabold" : "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E font-extrabold"}`}
                    onClick={function(){onTabChange("submission")}}>
                    My Submission
                </button>
            </div>
        </div>
    )
} 

export default GymNavbar;
