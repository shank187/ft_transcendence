import { Search, Plus } from "lucide-react";


interface gymProps {
    onSearchPage : ()=>void;
    onAddPage : ()=>void;
    currentPage : ( "search"| "add" | "submission");
}


function GymNavbar({onSearchPage, onAddPage, currentPage} : gymProps){
    return (
        <div className="flex items-center justify-between  gap-3 stciky top-0 z-20   border-b rounded-b-2xl border-[#262626] px-4 sm:px-8 py-3 mb-4">
            <p className="text-xs font-bold">Community Gyms</p>
            <div className="flex items-center gap-2">
                <button type="button" className={`flex items-center gap-2 rounded-full  px-4 py-2 text-xs  transition-all cursor-pointer ${
                        currentPage === "search" ? "bg-[#CCFF00] text-black font-extrabold" : "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E]"
                }`}
                        onClick={onSearchPage}>
                    <Search className={`w-3.5 h-3.5 text-[#CCFF00] ${currentPage === "search" ? "text-black" : "text-[#CCFF00]"}`} />
                    Search gyms
                </button>

                <button  type="button" onClick={onAddPage}
                            className={`flex items-center gap-2 rounded-full  px-4 py-2 text-xs transition-all cursor-pointer ${currentPage === "add" ? "bg-[#CCFF00] text-black font-extrabold" : "bg-[#1E1E1E] text-[#A3A3A3] hover:text-white border border-[#2E2E2E font-extrabold"}`}>
                    <Plus className={`w-3.5 h-3.5 `}/>
                    Add a gym
                </button>
            </div>
        </div>
    )
} 

export default GymNavbar;