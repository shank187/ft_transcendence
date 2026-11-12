import { ChevronDown } from "lucide-react";

interface filtersProps {
    setCityProps : (text : string) => void;
    // setRatingProps : (num : number)=> void;
    setverifiedProps : (bool : boolean | null) => void;
};



function GymFilters({setCityProps, setverifiedProps } : filtersProps){
    return (
        <div className="my-4 space-x-4">
            <div className="flex flex-wrap items-center gap-3">

                    <select onChange={function(e){setCityProps(e.target.value)}}
                    className="appearance-none rounded-full bg-[#181818] border border-[#2a2a2a] hover:border-zinc-500 text-white text-sm font-medium pl-4 pr-9 py-2 cursor-pointer transition-colors">
                        <option value="" >City: All</option>
                        <option value="khouribga" >khouribga</option>
                        <option value="kenitra">kenitra</option>
                        <option value="Rabat">Rabat</option>
                        <option value="beni mellal">beni mellal</option>
                    </select>
                
                <div className="flex 0 gap-1.5">
                    <select onChange={function(e){
                        const value = e.target.value;
                        if (value === ""){
                            setverifiedProps(null);
                        }
                        else if(value === "true") {
                            setverifiedProps(true);
                        }else {
                           setverifiedProps(false); 
                        }
                        }} className="appearance-none rounded-full bg-[#181818] border-[#2a2a2a] hover:border-zinc-500 text-white text-sm font-medium pl-4 pr-9 py-2 cursor-pointer">
                        
                        <option value="true" >Verified</option>
                        <option value="false">Unverified</option>
                        <option value="">All</option>

                    </select>
                </div>
            </div> 

        </div>
    )
}





export default GymFilters;