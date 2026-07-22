const benefits = [
  {
    name: "Quality Paddles",
    description: "We hand-select every paddle to ensure top-tier performance and durability, so you can play with confidence.",
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
  },
  {
    name: "Trusted Brands",
    description: "Our catalog features only the most reputable and innovative brands in the pickleball industry.",
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    name: "Competitive Prices",
    description: "We work hard to offer you the best prices on premium paddles, ensuring you get great value.",
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a6 6 0 0 0 6.634 1.206 6 6 0 0 0 6.634-1.206 6 6 0 0 0 6.634 1.206M2.25 12a6 6 0 0 0 6.634 1.206 6 6 0 0 0 6.634-1.206 6 6 0 0 0 6.634 1.206M2.25 6.25a6 6 0 0 0 6.634 1.206 6 6 0 0 0 6.634-1.206 6 6 0 0 0 6.634 1.206" />
      </svg>
    ),
  },
  {
    name: "Great Customer Support",
    description: "Our team is passionate about pickleball and is here to help you with any questions you may have.",
    icon: (
      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Why Choose Paddle Depot?</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            We're more than just a store; we're your partners on the court.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.name} className="text-center p-6 bg-gray-50/80 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mx-auto">
                {benefit.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-800">{benefit.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}