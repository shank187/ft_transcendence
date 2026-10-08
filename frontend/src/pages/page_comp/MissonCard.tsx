function MissionCard(){
    return (
        <div className="max-w-[1000px]  mx-auto px-4">
            <div className="mt-6 flex flex-col  items-center text-center shadow-xl w-full  bg-[#f2efe9] text-neutral-900">
                <div className=" mx-auto mb-8">
                    <h2 className="font-['Oswald',sans-serif] font-semibold text-5xl text-neutral-900 mt-14">
                        TIME TO UNLOCK</h2>
                    <h3 className="font-['Oswald',sans-serif] font-semibold text-4xl  text-stone-500 mt-2">
                        YOUR TRUE POTENTIAL</h3>
                    <h2 className="font-['Oswald',sans-serif] font-semibold text-5xl text-neutral-900 mt-2">
                        WITH EVERY REP</h2>
                </div>

                <div className="flex items-center justify-center md:w-full lg:w-[1000px] h-[40%] overflow-hidden rounded-sm">
                    <img
                        alt="woman lifting kettlebell"
                        className=" h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm9MYR64mK1sUS_0jOMDF1xwEuQWQN8JqwEGBKD9TxDDSVmre3x_XYbJiO3-GhZRglBvjbnUZ-V1ifTaph09OJCtKRb-Q3RtCOGwoyXNdocF0-O-cQ0yr02kkhwhykKLRnT__seafvoSfV8g7p-gnpUiLk97dd5-LazjF42ixcayBRqUYfc4jiec5Dv_YKs2yZYB-f3jK2Qv1bRD8bOvq-W5pdzSp3_jifn1U1RafqpZiCQ5ccbIctMA"
                        />
                </div>

                <div>
                    <p className="max-w-md text-s text-neutral-600 font-light mb-8 mt-8 ">
                        High performance is personal. ApexGym pairs world-class physical training facilities with a precision workout execution engine. From instant gym equipment discovery to automated 1RM tracking and coach programming, everything is designed to elevate your personal bests.
                    </p>
                </div>
                    <a href="#" className="bg-[#5c584d] hover:bg-[#4d493f] text-[#ffffff] text-[12px] font-medium px-8 py-3 rounded-full  hover:shadow-lg mb-8">
                        GET STARTED WITH APEXGYM
                    </a>
                <div>

                </div>
            </div>
        </div>

    )
}
export default MissionCard;
