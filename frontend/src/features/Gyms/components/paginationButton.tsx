interface paginationProps {
    currentPage: number;
    onPageChange: (page : number)=> void;
    hasNextPage : boolean;
};

export default function PaginationButton({currentPage, onPageChange, hasNextPage} : paginationProps){
    return (
        <div className="flex justify-center gap-4 mt-6">
            <button disabled={currentPage<= 1} 
                    onClick={function(){onPageChange(currentPage - 1)}}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">
                Previous
            </button>
            <span className="self-center">page {currentPage}</span>
            <button disabled={!hasNextPage} 
                    onClick={function(){onPageChange(currentPage + 1)}}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-700">
                Next
            </button>
        </div>
    )
}