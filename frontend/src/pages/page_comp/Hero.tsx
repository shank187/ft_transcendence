import { Link } from "react-router-dom";

function hero(){
    return (
        <div className="max-w-[1000px] mx-auto px-4">
            <div className="flex flex-col  md:flex-row justify-between w-full bg-[#131416] h-auto md:h-[500px] shadow-2xl border border text-white">
                
                <div className="w-full md:w-[50%] p-8 flex flex-col justify-between">
                    <h1 className="font-['Oswald',sans-serif] text-6xl leading-[1.05] font-semibold font-meduim text-[#ffffff] mb-6">MEET REPA<br />AT THE STUDIO</h1>
                    <p className=" text-[14px] sm:text-[15px] font-medium mb-5 text-neutral-200 font-tight mb-2">
                        At Repa, your training is powered by live telemetry and personalized programming.  </p>
                    <p className="text-[12px] sm:text-[13px] text-neutral-400 pr-4">
                        Our studio hubs connect state-of-the-art calibrated iron with real-time RPE tracking, automated set telemetry, and 1-on-1 coach guidance. No guesswork, no compromises—just pure progression..</p>

                    <div className=" w-full pt-8 text-center pr-8">
                        <Link to="/register" className="text-[13px] font-semibold text-neutral-300 hover:text-white border-b border-neutral-600 hover:border-white hover: pb-1">
                            EXPLORE THE APP 
                        </Link>
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-center bg-stone-300/10 px-3 border-l border-r border-neutral-800 ">
                    <span className="font-['Oswald',sans-serif]  text-bold text-3xl text-stone-400/40 py-4 vertical-text-sideways [writing-mode:vertical-rl] rotate-180 ">
                        APEX ATHLETICS / PLATFORM
                    </span>
                </div>

                <div className="w-full md:w-[50%] bg-neutral-900 min-h-[300px]  md:min-h-full ">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtYnKpOWlPgWL8wpk99Ma8UFrctlxuj7jO2NJMmzTaN72q4cYNqETySEMW_Wr3f356wg7wOCJxGAZLbeKcjS9BwjT57JF_vYj-pneKdmMurkjNLCRwVwQKFqQMBS1XAej_JgIyKzVFsPjZTW98SL9CfguG97emTKkOiEqRMngQnEGIUtzSqW21zM9dCsgopOrptrxH2en1NWD_at0YCKSceOcdU1Zw0IO7VXyHNdi2au9t1unyf4wYLA" alt="" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
    )
}
export default hero;