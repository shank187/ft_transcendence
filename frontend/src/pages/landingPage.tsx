// import { Link } from "react-router-dom";
import NavBar from "./page_comp/Navbar"
import Hero from "./page_comp/Hero"
import MissonCard from "./page_comp/MissonCard"
import GymsLogos from "./page_comp/gymLogos"
import Feature from "./page_comp/feature"
import Footer from "./page_comp/Footer"


function LandingPage(){
    return (
        <>
            {/* <Link to="/login">Log In</Link> */}
            <NavBar/>
            <main>
                <Hero/>
                <GymsLogos/>
                <MissonCard/>
                <Feature/>
            </main>
            <Footer/>
        </>
    )
}
export default LandingPage;
