import { Link } from "react-router-dom";

function Navbar(){
    return (
        <>
            <nav className="bg-[#131416]">     
                <div className="flex justify-between items-center  h-[60px] max-w-[1000px] mx-auto px-5">
                    <a href="#" className="text-[18px] font-bold tracking-tight text-[#ffffff]">
                        REPA
                    </a>
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-[13px] font-medium text-gray-300 hover:text-[#ffffff] hover:scale-102">Home</a>
                        <a href="#" className="text-[13px] font-medium text-gray-300 hover:text-[#ffffff] hover:scale-102">Features</a>
                        <a href="#" className="text-[13px] font-medium text-gray-300 hover:text-[#ffffff] hover:scale-102">About</a>
                        <a href="#" className="text-[13px] font-medium text-gray-300 hover:text-[#ffffff] hover:scale-102">Testimonials</a>

                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="rounded bg-[#ffffff] text-[13px] text-black hover:bg-gray-800 px-5 py-1">login in</Link>
                    </div>

                </div>

            </nav>
        </>
    )
}
export default Navbar;