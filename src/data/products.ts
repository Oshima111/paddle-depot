const USD_TO_PHP = parseFloat(import.meta.env.VITE_USD_TO_PHP) || 58.0;

function toPHP(usd: number): number {
  return Math.round(usd * USD_TO_PHP);
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
  description: string;
  featured?: boolean;
}

export const products: Product[] = [
  // ---- SELKIRK ----
  {
    id: 1,
    name: "Selkirk Power Air Invikta",
    brand: "Selkirk",
    price: toPHP(249.99),
    stockStatus: "In Stock",
    image: "https://cdn.shopify.com/s/files/1/0532/3854/8876/files/power-air-invikta-red-front_800x.png?v=1690221363",
    description: "Pro-level carbon fiber paddle with QuadFlex 4-layer face for explosive power and precision control.",
    featured: true,
  },
  {
    id: 3,
    name: "Selkirk Luxx Control Air",
    brand: "Selkirk",
    price: toPHP(219.99),
    stockStatus: "Low Stock",
    image: "https://cdn.shopify.com/s/files/1/0532/3854/8876/files/luxx-control-air-invikta-blue-front_800x.png?v=1690221303",
    description: "Elongated shape with vibration-dampening technology for ultimate control and feel at the net.",
  },
  {
    id: 4,
    name: "Selkirk LABS Boomstik Raw Carbon",
    brand: "Selkirk",
    price: toPHP(269.99),
    stockStatus: "In Stock",
    image: "https://cdn.shopify.com/s/files/1/0532/3854/8876/files/labs-project-006-pdp-1_800x.png?v=1699571348",
    description: "Raw carbon fiber surface from the Selkirk LABS series, designed for maximum spin and a crisp feel at impact.",
    featured: true,
  },

  // ---- JOOLA ----
  {
    id: 6,
    name: "JOOLA Hyperion 2 CFS 16mm",
    brand: "JOOLA",
    price: toPHP(239.99),
    stockStatus: "In Stock",
    image: "https://joolausa.com/cdn/shop/files/JOOLA_Hyperion2_16mm_Front_1200x.png?v=1700773391",
    description: "Carbon Faced Swing (CFS) technology with a 16mm core for exceptional spin and dwell time.",
    featured: true,
  },
  {
    id: 7,
    name: "JOOLA Vision CGS 16mm",
    brand: "JOOLA",
    price: toPHP(129.99),
    stockStatus: "In Stock",
    image: "https://joolausa.com/cdn/shop/products/17523_JOOLA_Vision_CGS_16_Front_1200x.png?v=1661286224",
    description: "Entry-level premium paddle with Carbon Grip Surface for great spin at an accessible price.",
  },
  {
    id: 8,
    name: "JOOLA Ben Johns Perseus Pro IV",
    brand: "JOOLA",
    price: toPHP(279.99),
    stockStatus: "In Stock",
    image: "https://joolausa.com/cdn/shop/files/PerseusPro4-1_1200x.png?v=1718826543",
    description: "The latest Ben Johns signature paddle with an advanced carbon weave and optimized swing weight.",
    featured: true,
  },

  // ---- HONOLULU ----
  {
    id: 9,
    name: "Honolulu J2K Warrior",
    brand: "Honolulu",
    price: toPHP(199.99),
    stockStatus: "In Stock",
    image: "https://honolulupickleballcompany.com/cdn/shop/files/J2K-Warrior-Angle-Left.jpg?v=1715031980&width=800",
    description: "Kevlar-infused paddle face with a responsive polymer core for tournament-level performance.",
    featured: true,
  },
  {
    id: 12,
    name: "Honolulu J2NFK",
    brand: "Honolulu",
    price: toPHP(219.99),
    stockStatus: "In Stock",
    image: "https://honolulupickleballcompany.com/cdn/shop/files/J2NFK-Angle-Left.jpg?v=1715032008&width=800",
    description: "Next-gen Kevlar composite paddle with enhanced sweet spot and premium edge protection.",
  },
  {
    id: 13,
    name: "Honolulu J6CR",
    brand: "Honolulu",
    price: toPHP(189.99),
    stockStatus: "In Stock",
    image: "https://honolulupickleballcompany.com/cdn/shop/files/J6CR-Angle-Left.jpg?v=1715032036&width=800",
    description: "Carbon resin infused paddle built for aggressive players who demand power and precision.",
  },

  // ---- WIKA ----
  {
    id: 14,
    name: "WIKA Pro X1",
    brand: "WIKA",
    price: toPHP(189.99),
    stockStatus: "In Stock",
    image: "https://wikapickleball.com/cdn/shop/files/ProX1-Angle-Left.jpg?v=1710365773&width=800",
    description: "3K woven carbon fiber face with a torque-resistant core for maximum power transfer.",
    featured: true,
  },
  {
    id: 17,
    name: "WIKA Quang Duong Air 16mm",
    brand: "WIKA",
    price: toPHP(209.99),
    stockStatus: "In Stock",
    image: "https://wikapickleball.com/cdn/shop/files/Quang-Duong-Air-16mm-Angle-Left.jpg?v=1710365798&width=800",
    description: "Signature paddle co-designed with Quang Duong featuring an air-channel core for reduced weight.",
    featured: true,
  },
  {
    id: 18,
    name: "WIKA BaoFire 2",
    brand: "WIKA",
    price: toPHP(229.99),
    stockStatus: "In Stock",
    image: "https://wikapickleball.com/cdn/shop/files/BaoFire2-Angle-Left.jpg?v=1710365747&width=800",
    description: "Second-gen BaoFire with thermoformed carbon face and enhanced edge foam technology.",
  },

  // ---- SYPIK ----
  {
    id: 19,
    name: "Sypik Stealth Pro",
    brand: "Sypik",
    price: toPHP(209.99),
    stockStatus: "In Stock",
    image: "https://sypik.com/cdn/shop/files/1_e633e76f-367f-442d-9477-0c7d41334c4f_1024x1024.jpg?v=1706163354",
    description: "Stealth carbon weave surface with an unidirectional carbon layup for pinpoint accuracy.",
    featured: true,
  },
  {
    id: 21,
    name: "Sypik Apex Force",
    brand: "Sypik",
    price: toPHP(229.99),
    stockStatus: "Out of Stock",
    image: "https://sypik.com/cdn/shop/files/1_b694852c-3549-4458-9418-f0270058e50a_1024x1024.jpg?v=1706163255",
    description: "Thermoformed carbon paddle with an elongated handle for maximum lever advantage.",
  },
  {
    id: 23,
    name: "Sypik Avatar",
    brand: "Sypik",
    price: toPHP(199.99),
    stockStatus: "In Stock",
    image: "https://sypik.com/cdn/shop/files/1_38171a3d-c121-4340-a359-335349457635_1024x1024.jpg?v=1706163456",
    description: "Next-gen paddle featuring a unique honeycomb core shape for improved ball response.",
    featured: true,
  },

  // ---- FRIDAY ----
  {
    id: 24,
    name: "Friday Pro-Spin Paddle",
    brand: "Friday",
    price: toPHP(139.99),
    stockStatus: "In Stock",
    image: "https://fridaypickle.com/cdn/shop/files/Untitled-1-Recovered-Recovered-Recovered_12.png?v=1715978438&width=800",
    description: "Gritty textured surface engineered for heavy spin with a comfortable cushioned grip.",
    featured: true,
  },
  {
    id: 25,
    name: "Friday Edge Control",
    brand: "Friday",
    price: toPHP(119.99),
    stockStatus: "In Stock",
    image: "https://fridaypickle.com/cdn/shop/files/GameChanger-RedandBlack.png?v=1715978396&width=800",
    description: "Control-oriented paddle with a wider face and enhanced edge protection for lasting durability.",
  },
  {
    id: 27,
    name: "Friday Originals Ghostly Haze",
    brand: "Friday",
    price: toPHP(159.99),
    stockStatus: "In Stock",
    image: "https://fridaypickle.com/cdn/shop/files/Originals-GhostlyHaze.png?v=1715978420&width=800",
    description: "Limited edition Friday Originals series with a unique matte finish and ghost-like haze aesthetic.",
    featured: true,
  },

  // ---- RPM ----
  {
    id: 28,
    name: "RPM Ignite Pro",
    brand: "RPM",
    price: toPHP(169.99),
    stockStatus: "In Stock",
    image: "https://rpmpickleball.com/cdn/shop/files/IgnitePro-Angle-Left.jpg?v=1710280486&width=800",
    description: "Raw carbon fiber surface with a precision-molded polymer core for explosive power.",
    featured: true,
  },
  {
    id: 30,
    name: "RPM Fusion X",
    brand: "RPM",
    price: toPHP(199.99),
    stockStatus: "Low Stock",
    image: "https://rpmpickleball.com/cdn/shop/files/FusionX-Angle-Left.jpg?v=1710280459&width=800",
    description: "Fusion weave technology combining Kevlar and carbon fiber for unmatched durability and feel.",
  },
  {
    id: 31,
    name: "RPM Friction Pro 16mm",
    brand: "RPM",
    price: toPHP(179.99),
    stockStatus: "In Stock",
    image: "https://rpmpickleball.com/cdn/shop/files/FrictionPro16mm-Angle-Left.jpg?v=1710280430&width=800",
    description: "High-friction carbon weave face with a 16mm core for maximum spin generation and control.",
    featured: true,
  },
];
