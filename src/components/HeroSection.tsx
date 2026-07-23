export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gray-900 text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/pickleball-hero-bg.jpg"
          alt="Pickleball paddle hitting a ball"
          className="w-full h-full object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[65vh] sm:min-h-[70vh] text-center py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white [text-shadow:_0_2px_10px_rgb(0_0_0_/_30%)]">
            Your Next Paddle Starts Here.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-3xl leading-relaxed [text-shadow:_0_1px_4px_rgb(0_0_0_/_50%)]">
            Explore premium pickleball paddles from leading brands, carefully curated for every style of play.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#products"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-all transform hover:shadow-lg hover:-translate-y-0.5"
            >
              EXPLORE PADDLES
            </a>
            <a
              href="#brands"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-transparent text-white font-semibold rounded-lg border-2 border-white/80 hover:bg-white/10 transition-all"
            >
              SHOP BY BRAND
            </a>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" className="fill-white" />
        </svg>
      </div>
    </section>
  );
}
