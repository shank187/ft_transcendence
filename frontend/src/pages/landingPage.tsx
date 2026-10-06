// import { Link } from "react-router-dom";
import NavBar from "./page_comp/Navbar"
import Hero from "./page_comp/Hero"
import MissonCard from "./page_comp/MissonCard"
import GymsLogos from "./page_comp/gymLogos"
import Feature from "./page_comp/feature"


function LandingPage(){
    return (
        <main>
            {/* <Link to="/login">Log In</Link> */}
            <NavBar/>
            <Hero/>
            <GymsLogos/>
            <MissonCard/>
            <Feature/>
        </main>
    )
}
export default LandingPage;