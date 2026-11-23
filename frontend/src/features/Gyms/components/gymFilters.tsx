// import type { Verified } from "lucide-react";

interface filtersProps {
    setCityProps : (text : string) => void;
    setSortProps : (text : string) => void;
    setverifiedProps : (bool : boolean | null) => void;
};



function GymFilters({setCityProps, setverifiedProps , setSortProps} : filtersProps){
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
                    }} className="appearance-none rounded-full bg-[#181818] border border-[#2a2a2a] hover:border-zinc-500 text-white text-sm font-medium pl-4 pr-9 py-2 cursor-pointer transition-colors">                        
                        <option value="true" >Verified</option>
                        <option value="false">Unverified</option>
                        <option value="">All</option>
                </select>

                <select className="appearance-none rounded-full bg-[#181818] border border-[#2a2a2a] hover:border-zinc-500 text-white text-sm font-medium pl-4 pr-9 py-2 cursor-pointer transition-colors"
                        onChange={function(e){setSortProps(e.target.value)}}>
                        <option value="verified">Sort : Verified first</option>
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                        <option value="newest">Newest</option>

                </select>
            </div> 

        </div>
    )
}





export default GymFilters;