import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";
import ContactUs from "./components/ContactUs";
import InstagramFeed from "./components/InstagramFeed";
import WhyChooseUs from "./components/WhyChooseUs";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <WhyChooseUs />
        <ProductGrid/>
        <InstagramFeed />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}

export default App;
