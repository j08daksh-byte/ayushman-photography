'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductModal, { ProductModalItem } from '@/components/ProductModal';
import Link from 'next/link';

export interface ProductCatalogItem {
  id: string;
  customizerId: string;
  title: string;
  category: string;
  badge: string;
  price: string;
  numericPrice: number;
  unit: string;
  image: string;
  description: string;
  rating?: number;
  reviews?: number;
  features?: string[];
  paperOptions?: { label: string; extraPrice: number }[];
  quantityOptions?: { qty: number; multiplier: number }[];
  cornerOptions?: string[];
}

const CATALOG_ITEMS: ProductCatalogItem[] = [
  // ════════════════════════════════════════════════════════════════════
  // 1. WEDDING INVITATION CARDS (9 Unique Real Designs)
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'wed-1',
    customizerId: 'wedding-card',
    title: 'Royal Velvet Box & Gold Shahi Scroll Wedding Invitation',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹4,500',
    price: '₹4,500',
    numericPrice: 4500,
    unit: '100 Box Cards (₹45/card)',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    description: 'Padded royal blue velvet box casing with gold filigree and matching silk royal scroll with gold finials.',
    rating: 5.0,
    reviews: 920,
    features: ['Padded Velvet Box Casing', 'Gold Embroidered Silk Scroll', 'Handmade Metallic Finials'],
  },
  {
    id: 'wed-2',
    customizerId: 'wedding-card',
    title: 'Clear Acrylic Wedding Card with Navy Velvet Lining & Gold Wax Seal',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹6,500',
    price: '₹6,500',
    numericPrice: 6500,
    unit: '100 Acrylic Cards (₹65/card)',
    image: '/images/wedding/acrylic_navy_gold.png',
    description: '3mm thick crystal clear acrylic glass invitation card screen-printed with metallic gold foil UV ink & wax seal.',
    rating: 4.9,
    reviews: 640,
    features: ['3mm Shatterproof Acrylic', 'Real Metallic Gold Screen Print', 'Hand-poured Botanical Wax Seal'],
  },
  {
    id: 'wed-3',
    customizerId: 'wedding-card',
    title: 'Imperial White & Gold Carriage Farman Scroll Card with Box',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹3,800',
    price: '₹3,800',
    numericPrice: 3800,
    unit: '100 Scroll Cards (₹38/card)',
    image: '/images/wedding/scroll_white_gold.png',
    description: 'Maharaja style white & gold royal carriage scroll invitation in a matching gold embossed box with tassels.',
    rating: 4.8,
    reviews: 730,
    features: ['Metallic White Silk Scroll', 'Gold Carriage Emblem Print', 'Matching Gold Embossed Outer Box'],
  },
  {
    id: 'wed-4',
    customizerId: 'wedding-card',
    title: 'Pastel Sky Blue Silver Laser-Cut Pocket Envelope Card with Tassels',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹2,950',
    price: '₹2,950',
    numericPrice: 2950,
    unit: '100 Sets (₹29.50/card)',
    image: '/images/wedding/pastel_blue_laser_tassel.png',
    description: 'Delicate pastel sky blue pocket sleeve with silver foil monogram crest and luxury silk cord tassel.',
    rating: 4.8,
    reviews: 480,
    features: ['Pastel Matte Pocket Sleeve', 'Silver Foil Monogram Seal', 'Silken Thread Hanging Tassel'],
  },
  {
    id: 'wed-5',
    customizerId: 'wedding-card',
    title: 'Royal Blue Curved Pocket Wedding Card with Botanical Wax Seal',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹3,200',
    price: '₹3,200',
    numericPrice: 3200,
    unit: '100 Cards (₹32/card)',
    image: '/images/wedding/royal_blue_wax_seal.jpg',
    description: 'Unique asymmetrical curved royal blue jacket with dried floral sprig and stamped gold metallic wax seal.',
    rating: 4.9,
    reviews: 510,
    features: ['Asymmetrical Curved Sleeve', 'Real Dried Baby’s Breath Flowers', 'Antique Gold Wax Seal'],
  },
  {
    id: 'wed-6',
    customizerId: 'wedding-card',
    title: '3D Pop-Up Lotus Flower Laser-Cut Traditional Luxury Card',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹4,200',
    price: '₹4,200',
    numericPrice: 4200,
    unit: '100 Pop-Up Cards (₹42/card)',
    image: '/images/wedding/lotus_popup_card.jpg',
    description: 'Intricate mechanical 3D pop-up lotus flower that blooms automatically when card is opened.',
    rating: 5.0,
    reviews: 670,
    features: ['Automatic 3D Pop-Up Bloom', 'Multi-Layered Shimmer Cardstock', 'Gold Glitter Floral Inlays'],
  },
  {
    id: 'wed-7',
    customizerId: 'wedding-card',
    title: 'Navy Blue & Gold Gatefold Invitation with Details & RSVP QR Code',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹2,800',
    price: '₹2,800',
    numericPrice: 2800,
    unit: '100 Gatefold Cards (₹28/card)',
    image: '/images/wedding/navy_gold_rounded_gatefold.jpg',
    description: 'Modern rounded 3-flap gatefold invitation with gold foil typography and digital wedding website QR code.',
    rating: 4.9,
    reviews: 840,
    features: ['Rounded 3-Flap Gatefold', 'Gold Foil Calligraphy Typography', 'Custom Digital RSVP QR Code'],
  },
  {
    id: 'wed-8',
    customizerId: 'wedding-card',
    title: 'Vintage Royal Arch Gate Laser-Cut Wedding Card',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹3,500',
    price: '₹3,500',
    numericPrice: 3500,
    unit: '100 Gate Cards (₹35/card)',
    image: '/images/wedding/royal_arch_laser_cut.png',
    description: 'Intricate palace iron-gate laser-cut 2-door opening wedding invitation on deep navy shimmer cardstock.',
    rating: 4.8,
    reviews: 390,
    features: ['Palace Arch 2-Door Opening', 'Micro Laser Lattice Cutout', 'Deep Shimmer Navy Cardstock'],
  },
  {
    id: 'wed-9',
    customizerId: 'wedding-card',
    title: 'Royal Red Velvet & Gold Foil Laser Cut Box Card',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹4,800',
    price: '₹4,800',
    numericPrice: 4800,
    unit: '100 Box Cards (₹48/card)',
    image: '/images/keepsakes/wedding_cards.jpg',
    description: 'Traditional Indian wedding box card with embossed gold foil mandala, Ganesh seal, and velvet cover.',
    rating: 5.0,
    reviews: 950,
    features: ['Burgundy Royal Velvet Cover', 'Embossed Ganesh Mandala Seal', 'Gold Foil Laser Cut Borders'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 2. BUSINESS & VISITING CARDS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'vc-1',
    customizerId: 'visiting-card',
    title: '350 GSM Velvet Touch Visiting Cards with Gold Foil Stamping',
    category: 'Business Cards',
    badge: '500 PCS @ ₹1,250',
    price: '₹1,250',
    numericPrice: 1250,
    unit: '500 Cards (₹2.50/card)',
    image: '/images/visiting_cards/velvet_touch.jpg',
    description: 'Ultra luxury velvet matte finish cards with metallic gold foil embossing for executives.',
    rating: 4.9,
    reviews: 1420,
    features: ['350 GSM Heavy Board', 'Real Metallic Gold Foil', 'Velvet Soft Touch Lamination'],
  },
  {
    id: 'vc-2',
    customizerId: 'visiting-card',
    title: '300 GSM Matte Laminated Premium Business Cards',
    category: 'Business Cards',
    badge: '500 PCS @ ₹950',
    price: '₹950',
    numericPrice: 950,
    unit: '500 Cards (₹1.90/card)',
    image: '/images/visiting_cards/colorful.jpg',
    description: 'Smooth matte finish cards ideal for corporate branding, doctors, and professionals.',
    rating: 4.7,
    reviews: 980,
    features: ['300 GSM Art Card', 'Both Side Matte Lamination', 'Crisp HD Offset Printing'],
  },
  {
    id: 'vc-3',
    customizerId: 'visiting-card',
    title: 'Spot UV Gloss High-Embossed Visiting Cards',
    category: 'Business Cards',
    badge: '500 PCS @ ₹1,550',
    price: '₹1,550',
    numericPrice: 1550,
    unit: '500 Cards (₹3.10/card)',
    image: '/images/visiting_cards/spot_uv.jpg',
    description: 'Raised high-gloss spot UV coating on matte base that makes your logo shine and pop.',
    rating: 4.8,
    reviews: 650,
    features: ['Raised Gloss Spot UV', 'Matte Contrast Finish', 'Premium Visual Contrast'],
  },
  {
    id: 'vc-4',
    customizerId: 'visiting-card',
    title: 'Transparent Waterproof Synthetic Plastic PVC Cards',
    category: 'Business Cards',
    badge: '250 PCS @ ₹1,450',
    price: '₹1,450',
    numericPrice: 1450,
    unit: '250 Plastic Cards (₹5.80/card)',
    image: '/images/visiting_cards/transparent.jpg',
    description: '100% waterproof tear-proof frosted transparent plastic PVC visiting cards.',
    rating: 4.9,
    reviews: 430,
    features: ['Waterproof & Non-Tearable', 'Frosted Crystal Clear PVC', 'Long-lasting Durability'],
  },
  {
    id: 'vc-5',
    customizerId: 'visiting-card',
    title: 'Rounded Corner Executive Visiting Cards',
    category: 'Business Cards',
    badge: '500 PCS @ ₹1,050',
    price: '₹1,050',
    numericPrice: 1050,
    unit: '500 Cards (₹2.10/card)',
    image: '/images/visiting_cards/black_gold.jpg',
    description: 'Precision die-cut rounded corner business cards for modern creative agencies.',
    rating: 4.6,
    reviews: 512,
    features: ['Die-cut Smooth Corners', 'Anti-fray Edge Protection', 'Modern Sleek Aesthetics'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 3. BIRTHDAY, PARTY & EVENT INVITATIONS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'bday-1',
    customizerId: 'bday-card',
    title: 'Kids 1st Birthday Theme Photo Invitation Cards',
    category: 'Birthday & Event Cards',
    badge: '100 PCS @ ₹1,250',
    price: '₹1,250',
    numericPrice: 1250,
    unit: '100 Cards (₹12.50/card)',
    image: '/images/birthday/kids_birthday_card.jpg',
    description: 'Colorful custom photo invitation cards with cartoon, jungle, prince/princess themes for kids birthdays.',
    rating: 4.9,
    reviews: 320,
    features: ['Custom Baby Photo Print', 'Gloss Laminated 300 GSM Card', 'Free Matching Envelopes'],
  },
  {
    id: 'bday-2',
    customizerId: 'bday-card',
    title: 'Golden Jubilee & 25th Wedding Anniversary Invitation Cards',
    category: 'Birthday & Event Cards',
    badge: '100 PCS @ ₹1,850',
    price: '₹1,850',
    numericPrice: 1850,
    unit: '100 Cards (₹18.50/card)',
    image: '/images/birthday/anniversary_gold_card.jpg',
    description: 'Gold foil bordered luxury invitation cards for 25th / 50th Marriage Anniversary celebrations.',
    rating: 4.8,
    reviews: 190,
    features: ['Metallic Gold Border Foil', 'Premium Textured Ivory Sheet', 'Formal RSVP Section'],
  },
  {
    id: 'bday-3',
    customizerId: 'bday-card',
    title: 'Griha Pravesh & Housewarming Puja Invitation Cards',
    category: 'Birthday & Event Cards',
    badge: '100 PCS @ ₹1,450',
    price: '₹1,450',
    numericPrice: 1450,
    unit: '100 Cards (₹14.50/card)',
    image: '/images/birthday/housewarming_card.jpg',
    description: 'Traditional Kalash & Rangoli themed auspicious Griha Pravesh and Vastu Puja invitation cards.',
    rating: 4.7,
    reviews: 280,
    features: ['Traditional Auspicious Motifs', 'Hindi / English Typography', 'High Quality Color Offset'],
  },
  {
    id: 'bday-4',
    customizerId: 'bday-card',
    title: 'Retirement Celebration & Milestone Party Invitations',
    category: 'Birthday & Event Cards',
    badge: '100 PCS @ ₹1,350',
    price: '₹1,350',
    numericPrice: 1350,
    unit: '100 Cards (₹13.50/card)',
    image: '/images/birthday/retirement_party_card.jpg',
    description: 'Dignified custom invitation cards celebrating career milestones, farewells, and retirement dinners.',
    rating: 4.6,
    reviews: 140,
    features: ['Elegant Ribbon Finish', 'Matte Heavy Stock', 'Custom Photo & Career Timeline'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 4. OFFICE STATIONERY & LETTERHEADS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'st-1',
    customizerId: 'stationery',
    title: 'Executive Bond Paper Letterheads (A4 100 GSM Alabaster)',
    category: 'Office Stationery',
    badge: '500 PCS @ ₹1,450',
    price: '₹1,450',
    numericPrice: 1450,
    unit: '500 Letterheads (₹2.90/sheet)',
    image: '/images/stationery/letterhead_bond.jpg',
    description: 'Premium watermarked bond paper letterheads compatible with laser & inkjet office printers.',
    rating: 4.8,
    reviews: 520,
    features: ['100 GSM Super White Bond', 'Printer Friendly Smooth Finish', 'Sharp Official Header Print'],
  },
  {
    id: 'st-2',
    customizerId: 'stationery',
    title: 'Carbonless Triplicate Invoice & Bill Books (Numbered)',
    category: 'Office Stationery',
    badge: '10 BOOKS @ ₹1,850',
    price: '₹1,850',
    numericPrice: 1850,
    unit: '10 Books (100 Sets each)',
    image: '/images/stationery/bill_book_carbonless.jpg',
    description: 'Pre-numbered 1+2 NCR carbonless copy bill books with hardboard binding and perforation.',
    rating: 4.9,
    reviews: 410,
    features: ['Automatic Carbonless Transfer', 'Sequential Serial Numbering', 'Firm Perforated Tear Lines'],
  },
  {
    id: 'st-3',
    customizerId: 'stationery',
    title: 'Custom Self-Inking Rubber Stamps & Official Seal',
    category: 'Office Stationery',
    badge: '1 STAMP @ ₹450',
    price: '₹450',
    numericPrice: 450,
    unit: 'Per Self-Inking Unit',
    image: '/images/stationery/rubber_stamp_seal.jpg',
    description: 'Durable automatic self-inking rubber stamps with crisp laser-engraved rubber text pad.',
    rating: 4.7,
    reviews: 350,
    features: ['Pre-inked for 10,000+ impressions', 'Laser Engraved Precision', 'Clean No-Mess Housing'],
  },
  {
    id: 'st-4',
    customizerId: 'stationery',
    title: 'Custom Printed Corporate Envelopes (8.5 x 4.5 Inch)',
    category: 'Office Stationery',
    badge: '500 PCS @ ₹1,200',
    price: '₹1,200',
    numericPrice: 1200,
    unit: '500 Envelopes (₹2.40/unit)',
    image: '/images/stationery/corporate_envelopes.jpg',
    description: 'Branded executive envelopes with self-adhesive peel & seal closure and company logo.',
    rating: 4.8,
    reviews: 290,
    features: ['Peel & Seal Adhesive Strip', 'Full Color Logo Printing', 'Window / Non-Window Options'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 5. FLEX BANNERS & STANDEES
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'flex-1',
    customizerId: 'flex-banner',
    title: 'Outdoor Heavy Duty Star Flex Banner Printing',
    category: 'Flex Banners',
    badge: 'START @ ₹18 / sq ft',
    price: '₹1,800',
    numericPrice: 1800,
    unit: '100 Sq. Ft. Print',
    image: '/images/banners/outdoor_flex_banner.jpg',
    description: 'High-density 340 GSM heavy Star Flex banner with eyelets, weatherproof for outdoor hoardings.',
    rating: 4.8,
    reviews: 730,
    features: ['340 GSM Star Flex Material', 'Weather & Rain Resistant', 'Reinforced Metal Eyelets'],
  },
  {
    id: 'flex-2',
    customizerId: 'flex-banner',
    title: 'Roll-up Promotional Display Standee (6x3 Feet Frame Included)',
    category: 'Flex Banners',
    badge: '1 SET @ ₹1,450',
    price: '₹1,450',
    numericPrice: 1450,
    unit: 'Complete Standee Set + Bag',
    image: '/images/banners/rollup_standee.jpg',
    description: 'Portable aluminum roll-up standee base with high resolution non-tearable Star Flex print & carry bag.',
    rating: 4.9,
    reviews: 580,
    features: ['Heavy Aluminum Base Mechanism', 'HD Non-Curling Banner Sheet', 'Padded Carry Bag Included'],
  },
  {
    id: 'flex-3',
    customizerId: 'flex-banner',
    title: 'Acrylic 3D LED Glow Sign Board & Lettering',
    category: 'Flex Banners',
    badge: 'START @ ₹120 / sq inch',
    price: '₹4,500',
    numericPrice: 4500,
    unit: 'Custom Shop Board',
    image: '/images/banners/led_sign_board.jpg',
    description: 'Modern 3D raised acrylic letters with Samsung LED modules for storefront illumination.',
    rating: 4.9,
    reviews: 210,
    features: ['3D Acrylic Laser Cut Letters', 'Energy Efficient Waterproof LED', '5-Year Fade Warranty'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 6. STICKERS & LABELS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'stk-1',
    customizerId: 'sticker',
    title: 'Custom Die-Cut Vinyl Stickers (Any Shape & Size)',
    category: 'Stickers & Labels',
    badge: '500 PCS @ ₹950',
    price: '₹950',
    numericPrice: 950,
    unit: '500 Die-Cut Stickers',
    image: '/images/stickers/vinyl_stickers.jpg',
    description: 'Scratch-proof waterproof vinyl stickers contour cut around your logo or illustration.',
    rating: 4.9,
    reviews: 470,
    features: ['Precision Contour Die-Cut', 'Waterproof Vinyl + UV Coat', 'Easy Peel Backing'],
  },
  {
    id: 'stk-2',
    customizerId: 'sticker',
    title: 'Product Packaging Roll Labels (Jar, Bottle & Box)',
    category: 'Stickers & Labels',
    badge: '1000 PCS @ ₹1,650',
    price: '₹1,650',
    numericPrice: 1650,
    unit: '1000 Roll Labels (₹1.65/unit)',
    image: '/images/keepsakes/card4.png',
    description: 'High-speed dispenser roll labels for food products, cosmetics, oils, and shipping boxes.',
    rating: 4.8,
    reviews: 310,
    features: ['Machine Applicator Roll Form', 'Oil & Moisture Resistant', 'Strong Permanent Adhesive'],
  },
  {
    id: 'stk-3',
    customizerId: 'sticker',
    title: 'Holographic Anti-Counterfeit Security Warranty Seals',
    category: 'Stickers & Labels',
    badge: '1000 PCS @ ₹2,200',
    price: '₹2,200',
    numericPrice: 2200,
    unit: '1000 Hologram Stickers',
    image: '/images/visiting_cards/metal.jpg',
    description: 'Rainbow metallic hologram tamper-evident void stickers for electronic warranty & authentication.',
    rating: 4.9,
    reviews: 180,
    features: ['Tamper Evident VOID Residue', 'Rainbow Prism Holography', 'Serial Number Tracking'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 7. PHOTOBOOKS & ALBUMS
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'pb-1',
    customizerId: 'photobook',
    title: 'HD Flush Mount Wedding Photobook Album (30 Pages Silk Sheet)',
    category: 'Photobooks',
    badge: '30 PAGES @ ₹4,500',
    price: '₹4,500',
    numericPrice: 4500,
    unit: '30 Page HD Album + Briefcase',
    image: '/images/keepsakes/film1.jpg',
    description: 'Seamless lay-flat photobook album with non-tearable Fuji silk sheets and leatherette briefcase box.',
    rating: 5.0,
    reviews: 390,
    features: ['180° Lay-Flat Seamless Binding', 'Non-Tearable Silk Velvet Sheets', 'Padded Leatherette Carry Case'],
  },
  {
    id: 'pb-2',
    customizerId: 'photobook',
    title: 'Baby Memory & Family Milestone Hardcover Photobook',
    category: 'Photobooks',
    badge: '20 PAGES @ ₹1,850',
    price: '₹1,850',
    numericPrice: 1850,
    unit: '20 Page Hardcover Book',
    image: '/images/keepsakes/card1.png',
    description: 'Gloss laminated hardcover memory book preserving childhood photos and family vacations.',
    rating: 4.8,
    reviews: 270,
    features: ['Gloss Laminated Hardcover', 'Archival Photographic Paper', 'Personalized Cover Window'],
  },

  // ════════════════════════════════════════════════════════════════════
  // 8. CUSTOM GIFTS, MUGS & MERCHANDISE
  // ════════════════════════════════════════════════════════════════════
  {
    id: 'gift-1',
    customizerId: 'custom-mug',
    title: 'Custom Printed Ceramic Magic Photo Mug (Heat Sensitive)',
    category: 'Custom Gifts',
    badge: 'BUY 10 @ ₹1,800',
    price: '₹1,800',
    numericPrice: 1800,
    unit: '10 Magic Mugs (₹180/mug)',
    image: '/images/keepsakes/card2.png',
    description: 'Black ceramic mug that magically reveals your high resolution printed photo when hot liquid is poured.',
    rating: 4.9,
    reviews: 620,
    features: ['Thermochromic Heat Reveal', 'Microwave Safe Ceramic', 'Glossy Scratch-Proof Coat'],
  },
  {
    id: 'gift-2',
    customizerId: 'custom-tshirt',
    title: 'Custom Embroidered Corporate Polo T-Shirts (220 GSM Cotton)',
    category: 'Custom Gifts',
    badge: 'BUY 5 @ ₹1,750',
    price: '₹1,750',
    numericPrice: 1750,
    unit: '5 Polo T-Shirts (₹350/shirt)',
    image: '/images/fashion/fashion1.png',
    description: '220 GSM 100% combed cotton pique polo with high precision Japanese machine embroidery of company logo.',
    rating: 4.8,
    reviews: 480,
    features: ['220 GSM Pique Combed Cotton', 'Japanese Machine Logo Embroidery', 'Colorfast Anti-Shrink Fabric'],
  },
  {
    id: 'gift-3',
    customizerId: 'custom-mug',
    title: 'Laser Engraved Wooden Photo Plaque & Desktop Clock',
    category: 'Custom Gifts',
    badge: '1 UNIT @ ₹850',
    price: '₹850',
    numericPrice: 850,
    unit: 'Custom Wooden Trophy',
    image: '/images/keepsakes/card3.png',
    description: 'Solid teak wood desktop photo stand with quartz clock mechanism and engraved felicitation text.',
    rating: 4.8,
    reviews: 190,
    features: ['Solid Teak Wood Base', 'Precision CO2 Laser Etch', 'Built-in Quartz Analog Clock'],
  },
];

const CATEGORY_DEFINITIONS = [
  { id: 'All Products', label: '🌟 All Products', icon: '🌟', count: CATALOG_ITEMS.length },
  { id: 'Wedding Cards', label: '💍 Wedding Invitation Cards', icon: '💍', count: 9 },
  { id: 'Business Cards', label: '💳 Visiting & Business Cards', icon: '💳', count: 5 },
  { id: 'Birthday & Event Cards', label: '🎉 Birthday & Party Invitations', icon: '🎉', count: 4 },
  { id: 'Office Stationery', label: '🏢 Office Stationery & Letterheads', icon: '🏢', count: 4 },
  { id: 'Flex Banners', label: '🪧 Flex Banners & Standees', icon: '🪧', count: 3 },
  { id: 'Stickers & Labels', label: '🏷️ Stickers, Labels & Packaging', icon: '🏷️', count: 3 },
  { id: 'Photobooks', label: '📖 Photobooks & Wedding Albums', icon: '📖', count: 2 },
  { id: 'Custom Gifts', label: '🎁 Custom Gifts, Mugs & T-Shirts', icon: '🎁', count: 3 },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [catalogItems, setCatalogItems] = useState<ProductCatalogItem[]>(CATALOG_ITEMS);
  const [categories, setCategories] = useState(CATEGORY_DEFINITIONS);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductModalItem | null>(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Fetch live products and categories from API
  useEffect(() => {
    async function loadLiveProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            setCatalogItems(data.products);
          }
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.warn('Using local fallback catalog data:', err);
      }
    }
    loadLiveProducts();

    const handleUpdate = () => {
      loadLiveProducts();
    };

    window.addEventListener('catalogUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('catalogUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Normalize incoming URL category queries
  useEffect(() => {
    if (catParam) {
      const paramLower = catParam.toLowerCase().trim();
      const match = categories.find(
        (c) =>
          c.id.toLowerCase() === paramLower ||
          c.label.toLowerCase().includes(paramLower) ||
          paramLower.includes(c.id.toLowerCase())
      );
      if (match) {
        setSelectedCategory(match.id);
      }
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [catParam, searchParam, categories]);

  // Group products by category when in 'All Products' mode
  const distinctCategories = useMemo(() => {
    return categories.filter((c) => c.id !== 'All Products');
  }, [categories]);

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const itemCat = (item.category || '').toLowerCase().trim();
      const selCat = (selectedCategory || '').toLowerCase().trim();
      const matchesCat =
        selectedCategory === 'All Products' ||
        itemCat === selCat ||
        item.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [catalogItems, selectedCategory, searchQuery]);

  const handleQuickAdd = (item: ProductCatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: item.customizerId,
      title: item.title,
      category: item.category,
      paperStock: 'Standard Premium Stock',
      cornerStyle: 'Standard Square Cut',
      finishOption: 'Matte Lamination',
      quantity: 100,
      unitPrice: Math.round(item.numericPrice / 100),
      totalPrice: item.numericPrice,
      image: item.image,
    });

    setToastMessage(`✓ Added "${item.title.substring(0, 28)}..." to Cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main style={{ background: '#F8F9FA', minHeight: '90vh', padding: '2rem 0 4rem' }}>
      <div className="container-wide">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 9999,
              background: '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Link href="/" style={{ color: '#6B7280', fontSize: '0.8125rem', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: '#9CA3AF' }}>/</span>
              <span style={{ color: '#0B2545', fontSize: '0.8125rem', fontWeight: 600 }}>Explore Products & Print Services</span>
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#1E1E1E' }}>
              Ayushman Cards & Printing Catalog
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.2rem' }}>
              Browse real customized wedding cards, visiting cards, stationery and gifts. Choose quantity, finishes, and order online with studio delivery.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search wedding cards, visiting cards, flex..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '999px',
                  border: '1.5px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#1E1E1E',
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.9rem' }}>
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ CATEGORY FILTER TABS ═══ */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '999px',
                  border: isSelected ? '2px solid #0B2545' : '1px solid #D1D5DB',
                  background: isSelected ? '#0B2545' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#1E1E1E',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(11,37,69,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                    color: isSelected ? '#FFFFFF' : '#6B7280',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══ DISPLAY SECTION ═══ */}
        {filteredItems.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '4rem 2rem', textAlign: 'center', margin: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem' }}>
              No products found matching &ldquo;{searchQuery}&rdquo;
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Try clearing your search query or select another category from the bar above.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Products');
                setSearchQuery('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                background: '#0B2545',
                color: '#FFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              View All Products
            </button>
          </div>
        ) : selectedCategory !== 'All Products' || searchQuery !== '' ? (
          /* Single Category View or Search Results View */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: '#1E1E1E' }}>
                {selectedCategory} ({filteredItems.length} Products)
              </h2>
              {selectedCategory !== 'All Products' && (
                <button
                  onClick={() => setSelectedCategory('All Products')}
                  style={{ background: 'transparent', border: 'none', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ← Back to All Categories
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  isInWishlist={isInWishlist(item.id)}
                  onToggleWishlist={() => toggleWishlist({ id: item.id, title: item.title, price: item.price, image: item.image })}
                  onSelectProduct={() =>
                    setSelectedProduct({
                      id: item.id,
                      name: item.title,
                      image: item.image,
                      badge: item.badge,
                      price: item.price,
                      unit: item.unit,
                      category: item.category,
                      description: item.description,
                      features: item.features,
                      paperOptions: item.paperOptions,
                      quantityOptions: item.quantityOptions,
                      cornerOptions: item.cornerOptions,
                    })
                  }
                  onQuickAdd={(e) => handleQuickAdd(item, e)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Grouped by Distinct Categories View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {distinctCategories.map((catDef) => {
              const categoryItems = catalogItems.filter((i) => i.category === catDef.id);
              if (categoryItems.length === 0) return null;

              return (
                <section key={catDef.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '1.75rem' }}>
                  
                  {/* Category Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{catDef.icon}</span>
                        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#1E1E1E' }}>
                          {catDef.label.replace(/^[^\s]+ /, '')}
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.2rem' }}>
                        High quality custom printed {catDef.id.toLowerCase()} manufactured in our studio.
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCategory(catDef.id)}
                      style={{
                        padding: '0.5rem 1.15rem',
                        borderRadius: '999px',
                        border: '1.5px solid #0B2545',
                        background: 'transparent',
                        color: '#0B2545',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      View All {catDef.id} ({categoryItems.length}) →
                    </button>
                  </div>

                  {/* Category Products Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {categoryItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        isInWishlist={isInWishlist(item.id)}
                        onToggleWishlist={() => toggleWishlist({ id: item.id, title: item.title, price: item.price, image: item.image })}
                        onSelectProduct={() =>
                          setSelectedProduct({
                            id: item.id,
                            name: item.title,
                            image: item.image,
                            badge: item.badge,
                            price: item.price,
                            unit: item.unit,
                            category: item.category,
                            description: item.description,
                            features: item.features,
                            paperOptions: item.paperOptions,
                            quantityOptions: item.quantityOptions,
                            cornerOptions: item.cornerOptions,
                          })
                        }
                        onQuickAdd={(e) => handleQuickAdd(item, e)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </div>

      {/* Product Customizer & Order Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}

function ProductCard({
  item,
  isInWishlist,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
}: {
  item: ProductCatalogItem;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  onSelectProduct: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelectProduct}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: '220px', width: '100%', background: '#F3F4F6', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Category Pill */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(11, 37, 69, 0.9)',
            color: '#FFFFFF',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {item.category}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isInWishlist ? '❤️' : '🤍'}
        </button>

        {/* Offer Badge */}
        {item.badge && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: '#D40000',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              letterSpacing: '0.02em',
            }}
          >
            {item.badge}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#1E1E1E',
            marginBottom: '0.4rem',
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </h3>

        <p style={{ fontSize: '0.78125rem', color: '#6B7280', marginBottom: '0.75rem', lineHeight: 1.5, flex: 1 }}>
          {item.description}
        </p>

        {/* Features Chips */}
        {item.features && item.features.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            {item.features.slice(0, 2).map((feat, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.6875rem',
                  background: '#F3F4F6',
                  color: '#4B5563',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        )}

        {/* Price & Actions Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #F3F4F6',
            paddingTop: '0.75rem',
            marginTop: 'auto',
          }}
        >
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B2545' }}>{item.price}</div>
            <div style={{ fontSize: '0.6875rem', color: '#6B7280' }}>{item.unit}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={onQuickAdd}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '999px',
                border: '1.5px solid #0B2545',
                background: 'transparent',
                color: '#0B2545',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Add to Cart immediately"
            >
              🛒 +Cart
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct();
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                background: '#0B2545',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Options →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading products catalog...</div>}>
        <CatalogContent />
      </Suspense>
      <Footer />
    </>
  );
}
