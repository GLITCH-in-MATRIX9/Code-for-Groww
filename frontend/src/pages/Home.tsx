import AIIntelligence from "../components/AIIntelligence";
import Architecture from "../components/Architecture";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Idea from "../components/Idea";
import SinceLastChecked from "../components/SinceLastChecked";
import Technology from "../components/Technology";

function Home() {
  return (
    <main className="bg-[#030B1B]">
      <Hero />
      <Idea />
      <Architecture />
      <Technology />
      <AIIntelligence />
      <SinceLastChecked />
      <Footer/>
    </main>
  );
}

export default Home;
