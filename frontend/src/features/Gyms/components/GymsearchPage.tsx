import { useState, useEffect } from "react";
import type { Gym } from "../data/FakeData";
import SearchBar from "./SearchBar";
import GymCard from "./GymCard";
// import axios from "axios";
import {getFakeData} from "../data/FakeData";
import LoadingState from "../../../components/states/LoadingState";
import GymFilters from "./gymFilters";


function GymsearchPage(){
    const [GymList  , setGymList] = useState<Gym[]>([]);//emptyy array of Gym type object 
    const [textSearched, setTextSearched] = useState("");
    const[loading, setLoading] = useState(true);
    const [city, setCity] = useState("");
    const [verified, setVerified]= useState<boolean | null>(null);
    // const [rating, setRating] = useState<Number | null>(null);



    useEffect(()=> {
        let ignore = false;
        async function fetchGyms(){
            // if (textSearched === "") {
            //     setGymList([]);
            //     setLoading(false);
            //     return ;
            // }
            setLoading(true);
            try
            {
                const fakeData = await getFakeData(textSearched, city, verified);
                if (ignore === false){
                    setLoading(false);
                    setGymList(fakeData);
                }
                // const res = await axios.get("api/gym?search=" + textSearched);
                // setGymList(res.data);
            }
            catch(err){
                console.log(err);
            }
            finally{
                if (!ignore)
                setLoading(false);
            }
            // A’s finally calls setLoading(false) even if B is still loading, so the loading indicator can disappear too soon
        }
        fetchGyms();
        return  function(){
            ignore = true;
        }
    }, [textSearched, city, verified]);
    // }, [textSearched, city, verified, rating]);

    // if (loading) {
    //     return <LoadingState message="Loading gyms..." />;
    // }
    return (
        <div className="min-h-screen text-[#ffffff] p-4">
            <h1 className="text-xl font-semibold mb-2">find a Gym</h1>
            <SearchBar searchTerm={textSearched} onSearchChange={setTextSearched}/>

        <GymFilters setCityProps={setCity} setverifiedProps={setVerified} curentCity={city}></GymFilters>
        {/* <GymFilters setCityProps={setCity} setRatingProps={setRating} setverifiedProps={setVerified}></GymFilters> */}


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
        </div>
    )
}

export default GymsearchPage; 