import { useState, useEffect } from "react";
import type { Gym } from "../data/FakeData";
import SearchBar from "./SearchBar";
import GymCard from "./GymCard";
// import axios from "axios";
import {getFakeData} from "../data/FakeData";
import LoadingState from "../../../components/states/LoadingState";



function GymsearchPage(){
    const [GymList  , setGymList] = useState<Gym[]>([]);//emptyy array of Gym type object 
    const [textSearched, setTextSearched] = useState("");
    const[loading, setLoading] = useState(true);


    useEffect(()=> {
        let ignore = false;
        async function fetchGyms(){
            if (textSearched === "") {
                setGymList([]);
                setLoading(false);
                return ;
            }
            setLoading(true);

            try
            {
                const fakeData = await getFakeData(textSearched);
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
                setLoading(false);
            }
        }
        fetchGyms();
        return  function cleanup(){
            ignore = true;
        }
    }, [textSearched]);
    // if (loading) {
    //     return <LoadingState message="Loading gyms..." />;
    // }
    return (
        <div className="min-h-screen text-[#ffffff] p-4">
            <h1 className="text-xl font-semibold mb-2">find a Gym</h1>
            <SearchBar searchTerm={textSearched} onSearchChange={setTextSearched}/>
            {loading ? 
                (<LoadingState message="Loading gyms..." />) 
                : (
                <div>
                    {GymList.map((gym) =>(
                        <GymCard key={gym.id} gym={gym}/>
                    ))}
                </div>
            )}
        </div>
    )
}
export default GymsearchPage; 