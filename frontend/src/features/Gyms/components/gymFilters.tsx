interface filtersProps {
    setCityProps : (text : string) => void;
    // setRatingProps : (num : number)=> void;
    setverifiedProps : (bool : boolean | null) => void;
};



function GymFilters({setCityProps, setverifiedProps } : filtersProps){
    return (
        <div className="my-4 space-x-4">
            <div className="flex flex-wrap items-center gap-3">

                <div className="flex 0 gap-1.5">
                    <button>
                        city
                    </button>
                    <select onChange={function(e){setCityProps(e.target.value)}} className="rounded-full  px-4 py-1 text-sm hover:border-white transform bg-black " name="" id="">
                        <option value="khouribga" >khouribga</option>
                        <option value="kenitra">kenitra</option>
                        <option value="casa">casa</option>
                        <option value="beni mellal">beni mellal</option>
                    </select>
                </div>
                

                {/* <div className="flex 0 gap-1.5">
                    <button>
                        rating
                    </button>
                    <select onChange={function(e){setRatingProps(Number(e.target.value))}} className="rounded-full  px-4 py-1 text-sm hover:border-white transform bg-black" name="" id="">
                        <option value="5" >5</option>
                        <option value="4.5">4.5</option>
                        <option value="3">3</option>
                    </select>
                </div> */}

                <div className="flex 0 gap-1.5">
                    <button>
                        verified
                    </button>
                    <select onChange={function(e){
                        const value = e.target.value;

                        if (value === "all"){
                            setverifiedProps(null);

                        }else if(value === "true") {
                            setverifiedProps(true);
                        }else {
                           setverifiedProps(false); 
                        }
                        }} className="rounded-full  px-4 py-1 text-sm hover:border-white transform bg-black">
                        
                        <option value="all" >all</option>
                        <option value="true" >yes</option>
                        <option value="false">no</option>
                    </select>
                </div>
            </div> 

        </div>
    )
}
export default GymFilters;