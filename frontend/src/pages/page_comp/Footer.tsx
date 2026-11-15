import { Link } from "react-router-dom";

function Footer() {
    return (
        <div className="mt-10 bg-[#131416] text-white">
            <div className="mx-auto flex max-w-[1000px] flex-wrap justify-between gap-4 p-6">
                <div>REPA</div>

                <div className="flex flex-wrap gap-4">
                    <Link to="/privacy">
                        Privacy Policy
                    </Link>
                    <Link to="/terms">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Footer;
