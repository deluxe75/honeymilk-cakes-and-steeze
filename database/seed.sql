-- ====================================================================
-- HoneyMilk Cakes and Steeze
-- Production Seed Data
-- ====================================================================

USE honeymilk_db;

-- 1. Default Administrator Account
-- Username: admin
-- Password: Admin@HoneyMilk2026 (or honeymilk2026!)
-- Hash generated via: password_hash('Admin@HoneyMilk2026', PASSWORD_BCRYPT)
INSERT INTO admins (username, email, password_hash, name, role) VALUES
('admin', 'admin@honeymilksteeze.com', '$2y$10$tJ01NqgDsk8x5wYt0HleE.k1p5C4A3oB9L6J9q8hK1b4yV2qR5g9m', 'Simone Laurent', 'super_admin');

-- 2. Product Categories
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
('Birthday Cakes', 'birthday', 'Vibrant, trendsetting celebration cakes with signature gold accents.', 1),
('Architectural Wedding', 'wedding', 'Sculptural multi-tier centerpieces with velvet finish and delicate sugar florals.', 2),
('Anniversary Elegance', 'anniversary', 'Intimate, romantic flavor profiles infused with champagne and floral essences.', 3),
('Couture Cupcakes', 'cupcakes', 'Boxed dozens of hand-piped treats featuring raw honey ganache and edible gold leaf.', 4),
('Celebration Cakes', 'celebration', 'Bold centerpiece showstoppers crafted for milestone celebrations.', 5),
('Mini & Bento Cakes', 'mini', 'Korean-style bento box cakes, personalized inscriptions, perfect for intimate duos.', 6),
('Dessert Boxes', 'dessert_boxes', 'Curated tasting flights of macarons, financiers, and honey cake slices.', 7);

-- 3. Products Catalog (12+ Luxury Cakes)
INSERT INTO products (id, category_slug, name, slug, description, base_price, image_url, badge, is_featured, is_popular, is_available, prep_time_hours) VALUES
(1, 'celebration', 'The Golden Honeycomb Velvet', 'golden-honeycomb-velvet', 
 'Our defining masterpiece. Four tiers of wildflower honey sponge soaked in golden bourbon syrup, layered with house-made honeycomb crunch praline and whipped Madagascar vanilla bean cream.',
 48000.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80', 'Chef Signature', 1, 1, 1, 24),

(2, 'celebration', 'Steeze Pistachio & Cardamom Noir', 'pistachio-cardamom-noir',
 'Raw pistachio dacquoise cake, scented with freshly crushed green cardamom, layered with whipped white chocolate ganache and edged in 24k edible gold dust.',
 54000.00, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1000&q=80', 'Editor Favorite', 1, 1, 1, 24),

(3, 'birthday', 'Midnight Valrhona & Espresso Ganache', 'midnight-valrhona-espresso',
 '70% Guanaja single-origin dark chocolate layers layered with smoked espresso buttercream and salted caramel pearls, crowned with obsidian drip.',
 46000.00, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=80', 'Bestseller', 1, 1, 1, 18),

(4, 'wedding', 'The Alabaster Architectural Tier', 'alabaster-architectural-tier',
 'Modern minimalism meeting haute pâtisserie. 3 sculpted white marble tiers filled with champagne sponge and passionfruit-rose curd. Serves up to 75.',
 145000.00, 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1000&q=80', 'Couture Commission', 1, 0, 1, 72),

(5, 'mini', 'HoneyMilk Bento Duo Box', 'honeymilk-bento-duo-box',
 'Two 4-inch bespoke bento cakes in our signature eco-luxe takeaway box with bamboo forks and beeswax candle. Choose custom messages for each.',
 26000.00, 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=1000&q=80', 'Trending', 1, 1, 1, 12),

(6, 'cupcakes', '24k Honeyed Gold Cupcake Box (Dozen)', '24k-gold-cupcake-box',
 'Twelve handcrafted honey cupcakes filled with dulce de leche and topped with Swiss meringue buttercream and genuine 24k gold leaf.',
 32000.00, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=80', 'Box of 12', 0, 1, 1, 12),

(7, 'birthday', 'Red Velvet Steeze & Cream Cheese Silk', 'red-velvet-steeze',
 'Traditional Southern red velvet reimagined with cocoa nib crunch, silky Philadelphia cream cheese mousse, and dramatic scarlet velvet spray.',
 45000.00, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=80', 'Classic', 0, 1, 1, 18),

(8, 'anniversary', 'Strawberries & Normandy Cream Cloud', 'strawberries-normandy-cream',
 'Chiffon sponge drenched in elderflower nectar, layered with macerated Japanese strawberries and light-as-air Normandy cultured cream.',
 42000.00, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=80', 'Fresh Fruit', 1, 0, 1, 24),

(9, 'celebration', 'Caramelized Pecan & Salted Brown Butter', 'pecan-brown-butter-cake',
 'Nutty roasted brown butter cake with slow-cooked bourbon caramel, toasted Georgia pecans, and fleur de sel flakes.',
 49000.00, 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=1000&q=80', 'Limited Batch', 0, 1, 1, 24),

(10, 'mini', 'Matcha Ceremonial & White Peach Mini', 'matcha-white-peach-mini',
 'Uji ceremonial grade green tea sponge paired with delicate white peach compote and silky mascarpone frosting.',
 28000.00, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1000&q=80', 'Single / Duo', 0, 0, 1, 18),

(11, 'dessert_boxes', 'The Steeze Tasting Flight Box', 'steeze-tasting-flight-box',
 'A luxury tasting box containing 6 signature cake slices, 6 French macarons, and a 100ml jar of our artisanal Catskills honey drizzle.',
 38000.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', 'Gift Box', 1, 1, 1, 24),

(12, 'wedding', 'Modern Cascading Pearl 2-Tier', 'modern-cascading-pearl-2-tier',
 'Two stately tiers with raw hand-torn wafer paper ruffles and edible sugar pearls. Serves 35-40 guests in sheer opulence.',
 92000.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80', 'Wedding Tier', 0, 1, 1, 48);

-- 4. Product Customization Options
-- Global Sizes
INSERT INTO product_options (option_type, name, price_adjustment, is_default, sort_order) VALUES
('size', '6 Inch (6 - 8 Servings)', 0.00, 1, 1),
('size', '8 Inch (12 - 16 Servings)', 18000.00, 0, 2),
('size', '10 Inch (20 - 25 Servings)', 36000.00, 0, 3),
('size', '12 Inch (30 - 38 Servings)', 58000.00, 0, 4);

-- Global Flavors
INSERT INTO product_options (option_type, name, price_adjustment, is_default, sort_order) VALUES
('flavor', 'Signature Wildflower Honeycomb', 0.00, 1, 1),
('flavor', 'Madagascar Bourbon Vanilla', 0.00, 0, 2),
('flavor', 'Valrhona Dark Chocolate Noir', 2000.00, 0, 3),
('flavor', 'Red Velvet Steeze', 2000.00, 0, 4),
('flavor', 'Roasted Pistachio & Cardamom', 4000.00, 0, 5),
('flavor', 'Champagne & Rose Elderflower', 4000.00, 0, 6);

-- Global Fillings
INSERT INTO product_options (option_type, name, price_adjustment, is_default, sort_order) VALUES
('filling', 'Whipped Honeycomb Buttercream', 0.00, 1, 1),
('filling', 'Salted Dulce de Leche Caramel', 1500.00, 0, 2),
('filling', 'Belgian Dark Chocolate Ganache', 2000.00, 0, 3),
('filling', 'Fresh Passionfruit Curd', 2500.00, 0, 4),
('filling', 'Macerated Wild Strawberry Compote', 2500.00, 0, 5);

-- Global Add-ons
INSERT INTO product_options (option_type, name, price_adjustment, is_default, sort_order) VALUES
('addon', 'Custom Acrylic Cake Topper', 4500.00, 0, 1),
('addon', '24K Edible Gold Leaf Accents', 6000.00, 0, 2),
('addon', 'Handcrafted Organic Fresh Floral Spray', 7500.00, 0, 3),
('addon', 'Belgian Chocolate Drip Waterfall', 3500.00, 0, 4),
('addon', 'Luxury Sparkler & Beeswax Candle Set', 2500.00, 0, 5);

-- 5. Bakery Settings
INSERT INTO settings (`key`, `value`, `description`) VALUES
('bakery_name', 'HoneyMilk Cakes and Steeze', 'Brand Name'),
('bakery_tagline', 'Where Haute Pâtisserie Meets Unapologetic Steeze', 'Tagline'),
('currency_symbol', '₦', 'Currency Display Symbol'),
('currency_code', 'NGN', 'ISO Currency Code'),
('contact_phone', '+234 814 000 2253', 'Bakery Telephone'),
('contact_whatsapp', '+234 814 000 2253', 'WhatsApp Order Line'),
('contact_email', 'concierge@honeymilksteeze.com', 'Official Email'),
('studio_address', '14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria', 'Flagship Studio Address'),
('opening_hours', 'Tuesday – Saturday: 9:00 AM – 7:30 PM | Sunday: 10:00 AM – 5:00 PM', 'Business Hours'),
('standard_delivery_fee', '4500.00', 'Standard Courier Delivery Fee'),
('island_delivery_fee', '3500.00', 'Lekki/VI Delivery Fee'),
('mainland_delivery_fee', '6500.00', 'Mainland Delivery Fee'),
('free_delivery_threshold', '90000.00', 'Minimum Cart Total for Free Delivery'),
('paystack_public_key', 'pk_test_sample_honeymilk_public_key', 'Paystack Public Key'),
('paystack_secret_key', 'sk_test_sample_honeymilk_secret_key', 'Paystack Secret Key'),
('allow_cash_on_delivery', '1', 'Enable Cash on Pickup / Delivery option');

-- 6. Sample Customer Reviews
INSERT INTO reviews (author_name, location, rating, comment, is_approved) VALUES
('Tiwa Savage-Ade', 'Victoria Island, Lagos', 5, 'The Golden Honeycomb Velvet was the absolute crown jewel of my 30th birthday dinner. Not overly sugary, decadent moisture, and the honeycomb praline texture was incredible!', 1),
('David Adeleke Jr.', 'Ikoyi, Lagos', 5, 'HoneyMilk Cakes brought unmatched steeze to our brand launch. The architectural tiers looked like modern sculptures and tasted even better. 10/10 recommend.', 1),
('Dr. Chidinma Okafor', 'Lekki Phase 1', 5, 'I ordered the Bento Duo for our anniversary. The presentation, the bespoke calligraphy inscription, and the pistachio cream were unmatched in Lagos.', 1),
('Femi Oladipo', 'Ikeja GRA, Lagos', 5, 'Best cake delivery experience in Nigeria. Arrived right on the promised hour via white-glove temperature controlled dispatch.', 1);
