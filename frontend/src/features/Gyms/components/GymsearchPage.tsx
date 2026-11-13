import { useState, useEffect } from "react";
import type {Gym} from "../type/gym"
import SearchBar from "./SearchBar";
import GymCard from "./GymCard";

import LoadingState from "../../../components/states/LoadingState";
import GymFilters from "./gymFilters";
import api from "../../auth/axiosInstance";
import PaginationButtons from "./paginationButton";
import AddGym from "./AddGym";

import GymNavbar from "./gymNavBar";



function GymsearchPage(){
    const [GymList  , setGymList] = useState<Gym[]>([]);//emptyy array of Gym type object 
    const [textSearched, setTextSearched] = useState("");
    const[loading, setLoading] = useState(true);
    const [city, setCity] = useState("");
    const [verified, setVerified]= useState<boolean | null>(true);
    const [page , setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [isAddGymOpen, setIsAddGymOpen] = useState(false);
    const [bannerMessage, setBannerMessage] = useState<string | null>(null);

    useEffect (function(){
        setPage(1);
    },[textSearched, city, verified]);


    useEffect(()=> {
        let ignore = false;
        async function fetchGyms(){
            setLoading(true);

            try
            {
                const res = await api.get("/api/gyms/search/", {
                    params : {
                        textSearched: textSearched || undefined,
                        city: city,
                        verified : verified ?? undefined,
                        page : page,
                    }
                });
                if (ignore === false){
                    setLoading(false);

                    setGymList(res.data.data);
                    setHasNextPage(res.data.hasNextPage);
                }

            }
            catch(err){
                console.log(err);
            }
            finally{
                setLoading(false);
            }
        }
        fetchGyms();
        return  function(){
            ignore = true;
        }
    }, [textSearched, city, verified, page]);
    useEffect(function(){
        if (!bannerMessage)
            return;
        const timer = setTimeout(function(){
            setBannerMessage(null);
        }, 3000);
        return function(){
            clearTimeout(timer);
        }
    },[bannerMessage]);

    if (isAddGymOpen){
        return <AddGym  onClose={setIsAddGymOpen} onSuccess={function(msg){setBannerMessage(msg); }}/>
    }


    return (
        
        <div className="min-h-screen text-[#ffffff]">
            <GymNavbar onSearchPage={function() { setIsAddGymOpen(false); }}
                        onAddPage={function() { setIsAddGymOpen(true); }}
                        currentPage="search"/>
            <div className="p-4">
            <h1 className="text-xl font-semibold mb-3">Find the perfect <span className="text-[#CCFF00]">gym</span></h1>


            {bannerMessage && (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-[#0e2716] border border-emerald-500/40 p-4 text-white text-xs transition-all">
                    <span>{bannerMessage}</span>
                    <button onClick={function(){setBannerMessage(null)}}
                            className="text-red-400 hover:text-white font-bold px-2 py-1"
                            >X</button>
                </div>
            )} 

            <div className="flex justify-between  items-center gap-4 mb-6">
                <SearchBar searchTerm={textSearched} onSearchChange={setTextSearched}/>

                {/* <button onClick={function(){setIsAddGymOpen(true)}} className=" flex gap-2 items-center bg-[#CCFF00] hover:bg-[#d8ff33] text-[#0F0F0F] font-extrabold px-4 py-2.5 rounded-xl transition-all">
                    <span className="text-xl font-bold">+</span>
                    <span>Add gym</span>
                    </button> */}
            </div>
            <GymFilters setCityProps={setCity} setverifiedProps={setVerified}></GymFilters>


        {loading ? 
            (<LoadingState message="Loading gyms..." />) 
            : GymList.length === 0 && textSearched!= "" ? (
                <div className="text-[#ffffff] text-center mt-4">
                    <p>No gyms found for "{textSearched}".</p>
                </div>)
            :(<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                {GymList.map((gym) =>(
                    <GymCard key={gym.id} gym={gym}/>
                ))}
            </div>)
        }
        <div>
            <PaginationButtons 
                currentPage={page} 
                onPageChange={setPage}
                hasNextPage={hasNextPage}/>
        </div>

        {/* <AddGym isOpen={isAddGymOpen}  onClose={setIsAddGymOpen}/> */}
            </div>
        </div>
    )
}

export default GymsearchPage; 