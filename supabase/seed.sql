-- Seed data: All 24 Paddle Depot products
-- Run this after creating the products table via the migration

INSERT INTO products (id, name, brand, price, image, description, stock_status, featured, is_new, has_options, created_at, updated_at) VALUES
(1, 'RPM Q2', 'RPM', 13000, '/paddles/Q2.png', 'A premium paddle designed for balanced power and control, suitable for competitive players.', 'In Stock', true, false, false, NOW(), NOW()),
(2, 'RPM Friction Pro V2', 'RPM', 13000, '/paddles/RPMFPRO2.png', 'A Gen. 2 paddle with an advanced carbon fiber face for maximum friction and spin, with a responsive core.', 'In Stock', true, false, false, NOW(), NOW()),
(3, 'RPM Friction Pro', 'RPM', 13000, '/paddles/RPMFP.png', 'The Gen. 1 paddle featuring a high-friction carbon weave face with a 16mm core for maximum spin generation.', 'In Stock', false, false, false, NOW(), NOW()),
(4, 'CRBN TruFoam Barrage', 'CRBN', 12000, '/paddles/CRBNBARRAGE.png', 'A modern hybrid shape with AeroCurve for faster swings and a TruFoam core for an expanded sweet spot.', 'In Stock', true, false, false, NOW(), NOW()),
(5, 'Honolulu J6CR', 'Honolulu', 13000, '/paddles/J6CR.png', 'Carbon resin infused paddle built for aggressive players who demand power and precision.', 'In Stock', false, false, false, NOW(), NOW()),
(6, 'Honolulu J2CR Crystal Blue', 'Honolulu', 14000, '/paddles/J2CR.png', 'Features a Crystal Blue Endurance Surface for enhanced durability and consistent spin.', 'In Stock', true, false, false, NOW(), NOW()),
(7, 'Honolulu J6CR Crystal Blue', 'Honolulu', 14000, '/paddle-depot-logo.png', 'Combines the J6CR power with the Crystal Blue Endurance Surface for maximum performance.', 'In Stock', true, false, false, NOW(), NOW()),
(8, 'Franklin C45 (Anna Leigh Waters)', 'Franklin', 14000, '/paddles/C45ANNA.png', 'Anna Leigh Waters signature paddle, engineered with a C45 carbon fiber face for elite power and touch.', 'In Stock', true, false, false, NOW(), NOW()),
(9, 'Kamito Alpha X (Her Power)', 'Kamito', 10000, '/paddles/HERPOWER.png', 'A special edition paddle celebrating female players, offering a blend of control and pop.', 'In Stock', true, false, false, NOW(), NOW()),
(10, 'Kamito Alpha X', 'Kamito', 10000, '/paddles/ALPHA.png', 'The standard Alpha X, designed for all-court players seeking a reliable and responsive paddle.', 'In Stock', false, false, false, NOW(), NOW()),
(11, 'Kamito Genesis', 'Kamito', 10000, '/paddles/GENESIS.png', 'A great entry-point into the Kamito line, offering a forgiving face and comfortable grip.', 'In Stock', false, false, false, NOW(), NOW()),
(12, 'Selkirk Boomstik 1766 Capsule', 'Selkirk', 20000, '/paddles/SK1766.png', 'A limited edition capsule release of the high-performance Boomstik paddle.', 'In Stock', true, false, false, NOW(), NOW()),
(13, 'Selkirk Labs Project Boomstik', 'Selkirk', 17000, '/paddles/SKBS.png', 'Raw carbon fiber surface from the Selkirk LABS series, designed for maximum spin and a crisp feel.', 'In Stock', false, false, false, NOW(), NOW()),
(14, 'Selkirk Boomstik Jack Sock', 'Selkirk', 18000, '/paddles/SKJS.png', 'The signature paddle of tennis pro Jack Sock, optimized for power and aggressive play.', 'In Stock', true, false, false, NOW(), NOW()),
(15, 'Selkirk Labs Project Boomstik ASIA', 'Selkirk', 14000, '/paddles/SKASIAN.png', 'A special edition of the Boomstik designed for the Asian market with unique aesthetics.', 'In Stock', false, false, false, NOW(), NOW()),
(16, 'Selkirk SLK Dauntless', 'Selkirk', 9000, '/paddles/DAUNTLESS.png', 'A reliable paddle from the SLK line, offering a large sweet spot and consistent performance.', 'In Stock', false, false, false, NOW(), NOW()),
(17, 'Selkirk SLK Era Power', 'Selkirk', 9000, '/paddles/ERA.png', 'Engineered for power players, this SLK paddle features a harder face for increased pop.', 'In Stock', false, false, false, NOW(), NOW()),
(18, 'Bread and Butter Loco', 'Bread and Butter', 13500, '/paddles/BNDLOCO.png', 'The flagship paddle known for its unique design and all-around playability.', 'In Stock', true, false, false, NOW(), NOW()),
(19, 'Bread and Butter Loco Azul', 'Bread and Butter', 14500, '/paddles/LOCOAZUL.png', 'An elongated hybrid shape version of the Loco, providing extra reach and power.', 'In Stock', true, false, false, NOW(), NOW()),
(20, 'Sypik Avatar Ultimate Pro QD', 'Sypik', 12500, '/paddles/AVATAR.png', 'The ultimate pro version of the Avatar, co-designed with Quang Duong for peak performance.', 'In Stock', true, false, false, NOW(), NOW()),
(21, 'Sypik Triton 5 Ultimate Pro', 'Sypik', 10000, '/paddles/TRITON.png', 'A versatile all-court paddle with a hybrid carbon/fiberglass face for balanced performance.', 'In Stock', false, false, false, NOW(), NOW()),
(22, 'Luzz Inferno', 'Luzz', 13000, '/paddles/LUZZINFERNO.png', 'A high-performance paddle designed for aggressive players who favor power and spin.', 'In Stock', true, false, false, NOW(), NOW()),
(23, 'Friday Aura Pro (Elongated)', 'Friday', 10000, '/paddles/FRIDAY.png', 'An elongated shape paddle with a gritty surface for enhanced spin and reach at the net.', 'In Stock', true, false, false, NOW(), NOW()),
(24, 'JOOLA Ben Johns Hyperion 3S 16mm', 'JOOLA', 13000, '/paddle-depot-logo.png', 'Co-designed with Ben Johns, this Gen. 3 paddle offers a unique shape for enhanced swing speed and power.', 'In Stock', true, false, false, NOW(), NOW()),
(25, 'JOOLA Hyperion 3S Dual', 'JOOLA', 12000, '/paddle-depot-logo.png', 'Features a dual-sided face with different textures, allowing players to switch between spin and control.', 'In Stock', false, false, false, NOW(), NOW()),
(26, 'JOOLA Perseus Pro V', 'JOOLA', 17700, '/paddle-depot-logo.png', 'The next evolution of the Perseus line, this Gen. 5 paddle features Pro-V technology.', 'In Stock', true, false, false, NOW(), NOW()),
(27, 'JOOLA Kosmos Pro V', 'JOOLA', 17700, '/paddle-depot-logo.png', 'A wide-body Gen. 5 paddle with Pro-V technology, offering a massive sweet spot and unmatched forgiveness.', 'In Stock', false, false, false, NOW(), NOW()),
(28, 'JOOLA Scorpeus Pro V', 'JOOLA', 17700, '/paddle-depot-logo.png', 'A Gen. 5 paddle designed for quick hands at the net, providing exceptional maneuverability.', 'In Stock', false, false, false, NOW(), NOW()),
(29, 'JOOLA Hyperion Pro V', 'JOOLA', 17700, '/paddle-depot-logo.png', 'An all-court Gen. 5 paddle featuring Pro-V Technology for a perfect blend of power, control, and spin.', 'In Stock', false, false, false, NOW(), NOW()),
(30, 'JOOLA Andre Agassi Pro V', 'JOOLA', 18500, '/paddle-depot-logo.png', 'The signature Gen. 5 paddle of tennis legend Andre Agassi, designed for players who dictate the point.', 'In Stock', true, false, false, NOW(), NOW());

-- Reset the sequence to the max id
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

