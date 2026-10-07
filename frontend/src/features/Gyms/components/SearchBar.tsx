interface searchBarProps{
    searchTerm : string;
    onSearchChange: (text: string)=>void;
};

function SearchBar({ searchTerm, onSearchChange } : searchBarProps){
    return (
        <div className="w-full max-w-md mb-6 flex ">
            <input type="text" placeholder="search gyms/users by name" value={searchTerm} onChange={(e)=> onSearchChange(e.target.value)}
            className="w-full px-4 rounded-3xl bg-[#111928] text-[#ffffff] border border-gray-700 py-4"/>
        </div>
    )
}
export default SearchBar;
