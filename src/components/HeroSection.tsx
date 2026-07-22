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
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight [text-shadow:_0_2px_4px_rgb(0_0_0_/_20%)]">
            Engineered for <span className="text-emerald-400">Victory</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed [text-shadow:_0_1px_2px_rgb(0_0_0_/_30%)]">
            Discover an elite collection of pickleball paddles designed for power, control, and precision. Find the perfect match for your winning style.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-emerald-500 transition-all transform hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Shop Now
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
