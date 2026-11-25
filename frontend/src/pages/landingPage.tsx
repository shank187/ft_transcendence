import Navbar from "./page_comp/Navbar";
import Hero from "./page_comp/Hero";
import Gyms from "./page_comp/Gyms";
import HowItWorks from "./page_comp/HowItWorks";
import Progress from "./page_comp/Progress";
import Motivation from "./page_comp/Motivation";
import Team from "./page_comp/Team";
import WhereWeTrain from "./page_comp/WhereWeTrain";
import ClosingCta from "./page_comp/ClosingCta";
import Footer from "./page_comp/Footer";

// The public home page (route "/"). One component per section, top to bottom.
// The section ids (#gyms, #how, #progress, #team) are what the navbar links scroll to.
function LandingPage() {
    return (
        <div className="overflow-x-clip">
            <Navbar />
            <main>
                <Hero />
                <Gyms />
                <HowItWorks />
                <Progress />
                <Motivation />
                <WhereWeTrain />
                <Team />
                <ClosingCta />
            </main>
            <Footer />
        </div>
    );
}

export default LandingPage;
