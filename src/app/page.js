import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Principles from "./components/Principles";
import HowItWorks from "./components/HowItWorks";
import Audience from "./components/Audience";
import Pricing from "./components/Pricing";
import NoRefunds from "./components/NoRefunds";
import Guarantees from "./components/Guarantees";
import Faq from "./components/Faq";
import Cta from "./components/Cta";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Principles />
        <HowItWorks />
        <Audience />
        <Pricing />
        <NoRefunds />
        <Guarantees />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
