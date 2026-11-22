import { Search } from "lucide-react";

interface searchBarProps {
    searchTerm: string;
    onSearchChange: (text: string) => void;
    style?: string;
    placeholder?: string;
}

function SearchBar({
    searchTerm,
    onSearchChange,
    style = "",
    placeholder,
}: searchBarProps) {
    return (
        <div
            className={`flex items-center gap-1 w-full px-4 py-3 rounded-3xl ${style}`}
        >
            <Search className="w-5 h-5 text-zinc-500 shrink-0" />
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={function (e) {
                    onSearchChange(e.target.value);
                }}
                className="w-full text-white placeholder-zinc-500 border-none outline-none focus:outline-none! focus:ring-0"
            />
        </div>
    );
}

export default SearchBar;
