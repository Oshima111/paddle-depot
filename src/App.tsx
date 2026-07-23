import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";
import ContactUs from "./components/ContactUs";
import WhyChooseUs from "./components/WhyChooseUs";

function App() {
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ProductGrid selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
        <WhyChooseUs />
        <ContactUs />
      </main>
      <Footer setSelectedBrand={setSelectedBrand} />
    </div>
  );
}

export default App;
