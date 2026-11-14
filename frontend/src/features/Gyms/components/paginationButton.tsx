import {ChevronLeft, ChevronRight} from "lucide-react";

interface paginationProps {
    currentPage: number;
    onPageChange: (page : number)=> void;
    hasNextPage : boolean;
    totalPage : number;
};

export default function PaginationButton({currentPage, onPageChange, hasNextPage, totalPage } : paginationProps){

    const page = [currentPage - 1, currentPage, currentPage + 1].filter(function(e){
        return e >=  1 && e <= totalPage;
    });

    return (
        <div className="flex justify-center sm:justify-end gap-4 mt-6">
            <button disabled={currentPage<= 1} 
                    onClick={function(){onPageChange(currentPage - 1)}}
                    className="px-1 py-1 bg-[#1E1E1E] rounded hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">
                    <ChevronLeft/>
            </button>
            {/* <span className="self-center px-3 py-2 border rounded">{currentPage}</span> */}
            <div className="flex gap-1 ">
                {page.map(function(num){
                    return (
                        <button type="button"
                                key={num}
                                onClick={function(){onPageChange(num)}}
                                className={`rounded px-2.5 py-1.5 ${currentPage === num ? "bg-[#CCFF00]  text-black font-extrabold" : "bg-[#1E1E1E] text-white"}`}>
                                {num}
                        </button>
                    )
                })}
            </div>
            <button disabled={!hasNextPage} 
                    onClick={function(){onPageChange(currentPage + 1)}}
                    className="px-1 py-1 bg-[#1E1E1E] rounded hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">
                    <ChevronRight/>
            </button>
        </div>
    )
}
