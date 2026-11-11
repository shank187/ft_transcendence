import { useState, useEffect } from "react";
import type {Gym} from "../type/gym"
import SearchBar from "./SearchBar";
import GymCard from "./GymCard";

import LoadingState from "../../../components/states/LoadingState";
import GymFilters from "./gymFilters";
import api from "../../auth/axiosInstance";
import PaginationButtons from "./paginationButton";
import AddGym from "./AddGym";





function GymsearchPage(){
    const [GymList  , setGymList] = useState<Gym[]>([]);//emptyy array of Gym type object 
    const [textSearched, setTextSearched] = useState("");
    const[loading, setLoading] = useState(true);
    const [city, setCity] = useState("");
    const [verified, setVerified]= useState<boolean | null>(null);
    const [page , setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [isAddGymOpen, setIsAddGymOpen] = useState(false);

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
    if (isAddGymOpen){
        return <AddGym  onClose={setIsAddGymOpen}/>
    }
    return (
        <div className="min-h-screen text-[#ffffff] p-4">
            <h1 className="text-xl font-semibold mb-2">find a Gym</h1>







            <div className="flex justify-between  items-center gap-4 mb-6">
                <SearchBar searchTerm={textSearched} onSearchChange={setTextSearched}/>

                <button onClick={function(){setIsAddGymOpen(true)}} className=" flex gap-2 items-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3.5 rounded-3xl transition duration-200 shadow-md">
                    <span className="text-xl font-bold">+</span>
                    <span>Add gym</span>
                </button>
            </div>
            <GymFilters setCityProps={setCity} setverifiedProps={setVerified}></GymFilters>


        {loading ? 
            (<LoadingState message="Loading gyms..." />) 
            : GymList.length === 0 && textSearched!= "" ? (
                <div className="text-[#ffffff] text-center mt-4">
                    <p>No gyms found for "{textSearched}".</p>
                </div>)
            :(<div>
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
    )
}

export default GymsearchPage; 