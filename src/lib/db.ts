import fs from 'fs';
import path from 'path';
import os from 'os';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  role: string; // 'ADMIN' | 'CLIENT'
  createdAt: string;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  eventDate: string;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  packageType: string;
  totalAmount: number;
  depositAmount: number;
  paymentStatus: string; // 'PAID' | 'PENDING' | 'FAILED'
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  status: string; // 'NEW' | 'PROCESSING' | 'PRINTING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  uploadedFiles?: { name: string; size: string; previewUrl?: string; type?: string }[] | null;
  driveLink?: string | null;
  printInstructions?: string | null;
  whatsappFollowup?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryRecord {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date?: string | null;
  message: string;
  createdAt: string;
}

export interface CategoryRecord {
  id: string;
  label: string;
  icon: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperOption {
  label: string;
  extraPrice: number;
}

export interface QuantityOption {
  qty: number;
  multiplier: number;
}

export const DEFAULT_PAPER_OPTIONS: PaperOption[] = [
  { label: '350 GSM Premium Matte', extraPrice: 0 },
  { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
  { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
  { label: 'Spot UV Selective Coating', extraPrice: 150 },
  { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
];

export const DEFAULT_QUANTITY_OPTIONS: QuantityOption[] = [
  { qty: 100, multiplier: 1 },
  { qty: 250, multiplier: 2.2 },
  { qty: 500, multiplier: 3.8 },
  { qty: 1000, multiplier: 6.5 },
];

export const DEFAULT_CORNER_OPTIONS: string[] = ['Standard Cut', 'Rounded Corners'];

export interface ProductRecord {
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
  paperOptions?: PaperOption[];
  quantityOptions?: QuantityOption[];
  cornerOptions?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsRecord {
  id: string;
  shopName: string;
  proprietor: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramUrl: string;
  instagramHandle: string;
  facebookUrl: string;
  youtubeUrl: string;
  email: string;
  updatedAt: string;
}

export interface BannerRecord {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  link?: string;
  buttonText?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DBStore {
  users: UserRecord[];
  bookings: BookingRecord[];
  inquiries: InquiryRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  banners: BannerRecord[];
  settings?: SettingsRecord;
}

export const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'site-settings',
  shopName: 'Ayushman Cards & Graphics',
  proprietor: 'Rajesh Saatoliya',
  address: '63, Varruchi Marg, Freeganj Ujjain',
  city: 'Ujjain',
  state: 'Madhya Pradesh',
  pincode: '456001',
  phonePrimary: '9479784979',
  phoneSecondary: '9893022451',
  whatsappNumber: '+919479784979',
  whatsappMessage: 'Hello Ayushman Cards & Graphics Press, I would like to inquire about wedding cards, visiting cards, flex banners & printing services.',
  instagramUrl: 'https://instagram.com/ayushmancards_ujjain',
  instagramHandle: '@ayushmancards_ujjain',
  facebookUrl: 'https://facebook.com/ayushmancards',
  youtubeUrl: 'https://youtube.com/@ayushmancards',
  email: 'ayushmancardspress@gmail.com',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const PRIMARY_DB_PATH = path.resolve(process.cwd(), 'data_store.json');
const BACKUP_DB_PATH = path.join(os.tmpdir(), 'ayushman_print_db.json');

declare global {
  // eslint-disable-next-line no-var
  var __ayushmanInMemoryDB: DBStore | undefined;
  // eslint-disable-next-line no-var
  var __ayushmanDBMtime: number | undefined;
}

export const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: 'Wedding Cards', label: '💍 Wedding Invitation Cards', icon: '💍', description: 'Royal velvet box, clear acrylic, Farman scrolls', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Business Cards', label: '💳 Visiting & Business Cards', icon: '💳', description: '350 GSM Velvet Touch, Gold Foil, Spot UV', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Birthday & Event Cards', label: '🎉 Birthday & Party Invitations', icon: '🎉', description: 'Theme photo cards, golden jubilee, housewarming', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Office Stationery', label: '🏢 Office Stationery & Letterheads', icon: '🏢', description: 'Bond letterheads, carbonless bill books, stamps', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Flex Banners', label: '🪧 Flex Banners & Standees', icon: '🪧', description: 'Heavy duty Star Flex, roll-up standees, LED signboards', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Stickers & Labels', label: '🏷️ Stickers, Labels & Packaging', icon: '🏷️', description: 'Die-cut waterproof vinyl, roll labels, holograms', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Photobooks', label: '📖 Photobooks & Wedding Albums', icon: '📖', description: 'HD flush mount albums, silk sheets, lay-flat books', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'Custom Gifts', label: '🎁 Custom Gifts, Mugs & T-Shirts', icon: '🎁', description: 'Magic mugs, polo t-shirts, engraved wooden plaques', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
];

export const INITIAL_PRODUCTS: ProductRecord[] = [
  // 1. WEDDING CARDS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 2. BUSINESS CARDS (OFFICIAL RATE LIST)
  {
    id: 'vc-metal',
    customizerId: 'visiting-card',
    title: 'Custom Laser Engraved Metal Luxury Business Cards',
    category: 'Business Cards',
    badge: '10 PCS @ ₹4,500',
    price: '₹4,500',
    numericPrice: 4500,
    unit: '10 Metal Cards (₹450/card)',
    image: '/images/visiting_cards/metal.jpg',
    description: 'Precision laser-engraved luxury metal business cards in stainless steel, matte black or gold finish with custom spot color logo printing (1 to 6 colors).',
    rating: 5.0,
    reviews: 640,
    features: ['High-Grade Solid Stainless Steel / Brass', 'Laser Cut & 1 to 6 Color Screen Print', 'Anti-Corrosion Matte & Mirror Finish'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-500-velvet',
    customizerId: 'visiting-card',
    title: '500 GSM Velvet Touch Cards with UV, Gold Foil & Die-Cut Shapes',
    category: 'Business Cards',
    badge: '500 PCS @ ₹2,400',
    price: '₹2,400',
    numericPrice: 2400,
    unit: '500 Cards (₹4.80/card)',
    image: '/images/visiting_cards/card_500gsm_velvet.jpg',
    description: 'Heavyweight 500 GSM board with peach-skin soft velvet lamination, metallic hot gold foil stamping, raised spot UV, and 36+ custom geometric die-cut shape options.',
    rating: 4.9,
    reviews: 1420,
    features: ['500 GSM Heavyweight Rigid Board', 'Velvet Soft-Touch Lamination', 'Hot Gold Foil + Raised Spot UV + 36 Die Shapes'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-500-matt',
    customizerId: 'visiting-card',
    title: '500 GSM Matt Laminated Cards with Die-Cut, Foil & Spot UV',
    category: 'Business Cards',
    badge: '500 PCS @ ₹2,500',
    price: '₹2,500',
    numericPrice: 2500,
    unit: '500 Cards (₹5.00/card)',
    image: '/images/visiting_cards/card_500gsm_velvet.jpg',
    description: 'Ultra-sturdy 500 GSM smooth matte laminated corporate cards featuring 36 precision die-cut shapes, metallic foil, and spot UV contrast.',
    rating: 4.8,
    reviews: 980,
    features: ['500 GSM Super-Thick Art Board', 'Smooth Satin Matte Lamination', 'Precision CNC Die-Cut & Metallic Foil'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-800-velvet',
    customizerId: 'visiting-card',
    title: '800 Micron Velvet Fusing Cards with Painted Edge, Foil & Spot UV',
    category: 'Business Cards',
    badge: '100 PCS @ ₹2,000',
    price: '₹2,000',
    numericPrice: 2000,
    unit: '100 Cards (₹20.00/card)',
    image: '/images/visiting_cards/card_800_micron.jpg',
    description: 'Ultra-thick 800 micron triple-layer fused sandwich cards with velvet soft-touch finish, color core edge, raised Spot UV, and gold/silver/red/blue/green foil.',
    rating: 5.0,
    reviews: 820,
    features: ['800 Micron Triple-Layer Fused Core', 'Velvet Surface with Color-Core Edge', 'Gold / Silver / Red / Blue Metallic Foil & Spot UV'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-800-matt',
    customizerId: 'visiting-card',
    title: '800 Micron Matt Fusing Cards with Spot UV & Multi-Color Foil',
    category: 'Business Cards',
    badge: '100 PCS @ ₹2,000',
    price: '₹2,000',
    numericPrice: 2000,
    unit: '100 Cards (₹20.00/card)',
    image: '/images/visiting_cards/card_800_micron.jpg',
    description: '800 Micron heavy fused matte finish business cards with vibrant color foil stamping (Gold, Silver, Red, Blue, Green) and gloss spot UV.',
    rating: 4.9,
    reviews: 570,
    features: ['800 Micron Heavyweight Sandwich Stock', 'Satin Matte Anti-Scratch Lamination', 'Custom Spot UV & 2-Sided Foil Options'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-800-gold-silver',
    customizerId: 'visiting-card',
    title: '800 Micron Gold & Silver Gloss Metallic Fusing Cards',
    category: 'Business Cards',
    badge: '100 PCS @ ₹2,400',
    price: '₹2,400',
    numericPrice: 2400,
    unit: '100 Cards (₹24.00/card)',
    image: '/images/visiting_cards/card_800_gold_silver.jpg',
    description: 'High-end reflective metallic gold and silver gloss fusing cards with heavy 800 micron caliper, foil stamping, and spot UV coating.',
    rating: 4.9,
    reviews: 490,
    features: ['Reflective Mirror Gold / Silver Finish', 'Ultra-Heavy 800 Micron Caliper', 'Hot Stamped Foil & Gloss UV Accent'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-180-nt',
    customizerId: 'visiting-card',
    title: '180 Micron Non-Tearable (NT) Synthetic Cards with Drip-Off UV',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹750',
    price: '₹750',
    numericPrice: 750,
    unit: '1000 Cards (₹0.75/card)',
    image: '/images/visiting_cards/card_180_nt_dripoff.jpg',
    description: '100% waterproof and tearproof synthetic polymer cards with premium Drip-Off texture UV coating for maximum durability.',
    rating: 4.8,
    reviews: 1120,
    features: ['100% Tearproof Synthetic Polymer', 'Waterproof & Washable Surface', 'Drip-Off Texturized Gloss UV Effects'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-matt-spotuv',
    customizerId: 'visiting-card',
    title: 'Matt Laminated Business Cards with Raised Spot UV Coating',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹1,600',
    price: '₹1,600',
    numericPrice: 1600,
    unit: '1000 Cards (₹1.60/card)',
    image: '/images/visiting_cards/card_matt_spot_uv.jpg',
    description: 'Classic matte laminated cards with selective high-gloss raised Spot UV on logos and headlines for striking visual contrast.',
    rating: 4.8,
    reviews: 780,
    features: ['Premium Matte Finish Base', 'Selective Raised Spot UV Polish', 'Single & Both Side Printing Options'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-matt-texture',
    customizerId: 'visiting-card',
    title: 'Textured Linen & Matte Finish Executive Business Cards',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹1,000',
    price: '₹1,000',
    numericPrice: 1000,
    unit: '1000 Cards (₹1.00/card)',
    image: '/images/visiting_cards/card_matt_texture.jpg',
    description: 'Tactile cross-hatch linen texture and smooth matte lamination options for understated corporate elegance.',
    rating: 4.7,
    reviews: 620,
    features: ['Tactile Embossed Linen Texture', 'High Bulk Cardstock', 'Rich Color Fidelity Printing'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-gloss-lamination',
    customizerId: 'visiting-card',
    title: 'High Gloss Lamination & UV Coated Commercial Visiting Cards',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹650',
    price: '₹650',
    numericPrice: 650,
    unit: '1000 Cards (₹0.65/card)',
    image: '/images/visiting_cards/colorful.jpg',
    description: 'High-shine gloss lamination and UV coated calling cards with vibrant color reproduction for high-volume marketing.',
    rating: 4.8,
    reviews: 890,
    features: ['High Gloss Protective Film / UV Coat', 'Vibrant CMYK Color Offset Print', 'Black Back & Full 2-Side Print Options'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-uncoated',
    customizerId: 'visiting-card',
    title: 'Economy Uncoated Natural Art Board Business Cards',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹550',
    price: '₹550',
    numericPrice: 550,
    unit: '1000 Cards (₹0.55/card)',
    image: '/images/visiting_cards/black_gold.jpg',
    description: 'Eco-friendly natural uncoated art cardstock ideal for stamping, writing notes, appointment cards, and budget distribution.',
    rating: 4.6,
    reviews: 430,
    features: ['Natural Writable Surface', 'Crisp HD Offset Typography', 'Lowest Unit Cost for Bulk Distribution'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'vc-mini-cards',
    customizerId: 'visiting-card',
    title: 'Mini Pocket Calling Cards (Gloss UV & Uncoated Options)',
    category: 'Business Cards',
    badge: '1000 PCS @ ₹500',
    price: '₹500',
    numericPrice: 500,
    unit: '1000 Mini Cards (₹0.50/card)',
    image: '/images/visiting_cards/card_mini_calling.jpg',
    description: 'Compact pocket-sized mini calling cards with gloss UV coating or uncoated natural finish, perfect for tags and inserts.',
    rating: 4.7,
    reviews: 310,
    features: ['Compact Pocket Dimensions', 'Gloss UV or Natural Uncoated Stock', '1-Side & Black Back Printing Options'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 3. BIRTHDAY & EVENT CARDS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 4. OFFICE STATIONERY
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 5. FLEX BANNERS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 6. STICKERS & LABELS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 7. PHOTOBOOKS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },

  // 8. CUSTOM GIFTS
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
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
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

export const INITIAL_BANNERS: BannerRecord[] = [
  {
    id: 'bnr-1',
    title: 'Royal Velvet Box Wedding Invitations & Farman Scrolls',
    subtitle: 'Handcrafted Padded Velvet Boxes, 3mm Acrylic Plates & Botanical Gold Wax Seals',
    badge: 'ROYAL COLLECTION 2026',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    link: '/products?category=Wedding Cards',
    buttonText: 'Explore Wedding Cards',
    displayOrder: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'bnr-2',
    title: '500 GSM Velvet Business Cards & Hot Gold Foil Finish',
    subtitle: 'Ultra Heavyweight Rigid Board, Laser Engraved Metal & Precision Spot UV Raised Texture',
    badge: 'STARTING @ ₹200',
    image: '/images/visiting_cards/black_gold.jpg',
    link: '/products?category=Business Cards',
    buttonText: 'Order Visiting Cards',
    displayOrder: 2,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'bnr-3',
    title: 'Outdoor Heavy Duty Star Flex Banners & Roll-Up Standees',
    subtitle: 'Weatherproof 340 GSM Star Flex Material with Eyelets & Free Carry Bags',
    badge: 'COMMERCIAL PROMOTIONS',
    image: '/images/banners/outdoor_flex_banner.jpg',
    link: '/products?category=Flex Banners',
    buttonText: 'View Banners & Signs',
    displayOrder: 3,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

const DEFAULT_STORE: DBStore = {
  users: [
    {
      id: 'usr_admin_default',
      name: 'Studio Admin',
      email: 'admin@ayushmancards.com',
      password: 'admin123',
      phone: '9479784979',
      address: '63, Varruchi Marg, Freeganj Ujjain',
      city: 'Ujjain',
      state: 'Madhya Pradesh',
      pincode: '456001',
      role: 'ADMIN',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  bookings: [],
  inquiries: [],
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  banners: INITIAL_BANNERS,
  settings: DEFAULT_SETTINGS,
};

export function getBundledDbPath(): string {
  // 1. Direct path from cwd
  const cwdPath = path.resolve(process.cwd(), 'data_store.json');
  if (fs.existsSync(cwdPath)) return cwdPath;

  // 2. Search upwards in case process.cwd() is inside a subdirectory
  let currentDir = process.cwd();
  for (let i = 0; i < 4; i++) {
    const candidate = path.resolve(currentDir, 'data_store.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }

  // 3. Known project directory
  const knownPath = 'd:\\Webs\\Ayushman-Photography-Website\\data_store.json';
  if (fs.existsSync(knownPath)) return knownPath;

  return cwdPath;
}

let isEnvironmentServerless: boolean | null = null;

export function isServerlessReadOnly(): boolean {
  if (isEnvironmentServerless !== null) return isEnvironmentServerless;
  if (process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    isEnvironmentServerless = true;
    return true;
  }
  const bundled = getBundledDbPath();
  try {
    if (fs.existsSync(bundled)) {
      fs.accessSync(bundled, fs.constants.W_OK);
      isEnvironmentServerless = false;
      return false;
    }
  } catch {
    isEnvironmentServerless = true;
    return true;
  }
  isEnvironmentServerless = false;
  return false;
}

export function resolveDbPath(): string {
  const isServerless = isServerlessReadOnly();
  const bundledPath = getBundledDbPath();

  if (isServerless) {
    // In serverless / Vercel: /tmp is the only writable directory.
    // Ensure /tmp copy exists by initializing from bundled file if missing.
    if (!fs.existsSync(BACKUP_DB_PATH)) {
      try {
        if (fs.existsSync(bundledPath)) {
          const content = fs.readFileSync(bundledPath, 'utf-8');
          fs.writeFileSync(BACKUP_DB_PATH, content, 'utf-8');
        }
      } catch (err) {
        console.warn('Error copying bundled DB to /tmp in serverless:', err);
      }
    }
    return BACKUP_DB_PATH;
  }

  // Local development or writable server:
  if (fs.existsSync(bundledPath)) return bundledPath;
  if (fs.existsSync(BACKUP_DB_PATH)) return BACKUP_DB_PATH;
  return bundledPath;
}

function readStore(): DBStore {
  const filePath = resolveDbPath();

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed) {
        const store: DBStore = {
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : [...DEFAULT_STORE.users],
          bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
          categories: Array.isArray(parsed.categories) ? parsed.categories : [...DEFAULT_STORE.categories],
          products: Array.isArray(parsed.products) ? parsed.products : [...DEFAULT_STORE.products],
          banners: Array.isArray(parsed.banners) ? parsed.banners : [...DEFAULT_STORE.banners],
          settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : { ...DEFAULT_SETTINGS },
        };

        // Ensure default admin exists if store has no admin
        if (!store.users.some((u) => u.email.toLowerCase().trim() === 'admin@ayushmancards.com')) {
          store.users.push(DEFAULT_STORE.users[0]);
        }

        globalThis.__ayushmanInMemoryDB = store;
        return store;
      }
    } catch (err) {
      console.warn('Warning reading persistent DB store:', err);
    }
  }

  // Fallback to in-memory store if file not yet written or read fails
  if (globalThis.__ayushmanInMemoryDB) {
    return globalThis.__ayushmanInMemoryDB;
  }

  const initialStore: DBStore = {
    users: [...DEFAULT_STORE.users],
    bookings: [],
    inquiries: [],
    categories: [...DEFAULT_STORE.categories],
    products: [...DEFAULT_STORE.products],
    banners: [...DEFAULT_STORE.banners],
    settings: { ...DEFAULT_SETTINGS },
  };

  globalThis.__ayushmanInMemoryDB = initialStore;
  writeStore(initialStore);
  return initialStore;
}

function writeStore(store: DBStore) {
  globalThis.__ayushmanInMemoryDB = store;
  const jsonContent = JSON.stringify(store, null, 2);
  const targetPath = resolveDbPath();

  // 1. Primary write to target path (data_store.json locally or /tmp in serverless)
  try {
    fs.writeFileSync(targetPath, jsonContent, 'utf-8');
  } catch (err) {
    console.warn(`Primary DB file write warning on ${targetPath}:`, err);
  }

  // 2. Also keep backup/mirror in sync if different
  const bundledPath = getBundledDbPath();
  if (targetPath !== bundledPath && !isServerlessReadOnly()) {
    try {
      fs.writeFileSync(bundledPath, jsonContent, 'utf-8');
    } catch {
      // Ignore
    }
  }
  if (targetPath !== BACKUP_DB_PATH) {
    try {
      fs.writeFileSync(BACKUP_DB_PATH, jsonContent, 'utf-8');
    } catch {
      // Ignore
    }
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class UserClient {
  async findUnique(args: { where: { email?: string; id?: string }; select?: any }): Promise<UserRecord | null> {
    const store = readStore();
    const { email, id } = args.where;
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const user = store.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
      return user || null;
    }
    if (id) {
      const user = store.users.find((u) => u.id === id);
      return user || null;
    }
    return null;
  }

  async create(args: { data: { name: string; email: string; password: string; phone?: string; role?: string; address?: string; city?: string; state?: string; pincode?: string }; select?: any }): Promise<UserRecord> {
    const store = readStore();
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: generateId('usr'),
      name: args.data.name,
      email: args.data.email.toLowerCase().trim(),
      password: args.data.password,
      phone: args.data.phone || null,
      address: args.data.address || null,
      city: args.data.city || null,
      state: args.data.state || null,
      pincode: args.data.pincode || null,
      role: args.data.role || 'CLIENT',
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(newUser);
    writeStore(store);
    return newUser;
  }

  async update(args: { where: { id: string }; data: Partial<UserRecord> }): Promise<UserRecord> {
    const store = readStore();
    const idx = store.users.findIndex((u) => u.id === args.where.id);
    if (idx === -1) {
      throw new Error('User not found');
    }
    const updated: UserRecord = {
      ...store.users[idx],
      ...args.data,
      updatedAt: new Date().toISOString(),
    };
    store.users[idx] = updated;
    writeStore(store);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    const initialLen = store.users.length;
    store.users = store.users.filter((u) => u.id !== args.where.id);
    writeStore(store);
    return store.users.length < initialLen;
  }

  async findMany(): Promise<UserRecord[]> {
    const store = readStore();
    return store.users;
  }
}

class BookingClient {
  async create(args: { data: Omit<BookingRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<BookingRecord> {
    const store = readStore();
    const now = new Date().toISOString();
    const newBooking: BookingRecord = {
      ...args.data,
      id: generateId('bk'),
      createdAt: now,
      updatedAt: now,
    };
    store.bookings.push(newBooking);
    writeStore(store);
    return newBooking;
  }

  async update(args: { where: { razorpayOrderId?: string; id?: string }; data: Partial<BookingRecord> }): Promise<BookingRecord> {
    const store = readStore();
    const { razorpayOrderId, id } = args.where;
    const idx = store.bookings.findIndex((b) => (razorpayOrderId && b.razorpayOrderId === razorpayOrderId) || (id && b.id === id));
    if (idx === -1) {
      const syntheticBooking: BookingRecord = {
        id: id || generateId('bk'),
        customerName: 'Customer',
        customerEmail: 'customer@ayushmancards.com',
        customerPhone: '9479784979',
        eventType: 'Print Order',
        eventDate: new Date().toISOString().split('T')[0],
        packageType: 'Custom Order',
        totalAmount: 1000,
        depositAmount: 1000,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
      };
      store.bookings.push(syntheticBooking);
      writeStore(store);
      return syntheticBooking;
    }
    const updated: BookingRecord = {
      ...store.bookings[idx],
      ...args.data,
      updatedAt: new Date().toISOString(),
    };
    store.bookings[idx] = updated;
    writeStore(store);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    const initialLen = store.bookings.length;
    store.bookings = store.bookings.filter((b) => b.id !== args.where.id);
    writeStore(store);
    return store.bookings.length < initialLen;
  }

  async findMany(args?: { where?: { customerEmail?: string; userId?: string }; orderBy?: any; take?: number }): Promise<BookingRecord[]> {
    const store = readStore();
    let result = store.bookings;
    if (args?.where?.customerEmail) {
      const cleanEmail = args.where.customerEmail.toLowerCase().trim();
      result = result.filter((b) => b.customerEmail.toLowerCase().trim() === cleanEmail);
    }
    if (args?.where?.userId) {
      result = result.filter((b) => b.userId === args.where?.userId);
    }
    return result;
  }

  async findFirst(args?: { where?: { razorpayOrderId?: string } }): Promise<BookingRecord | null> {
    const store = readStore();
    if (args?.where?.razorpayOrderId) {
      return store.bookings.find((b) => b.razorpayOrderId === args.where?.razorpayOrderId) || null;
    }
    return store.bookings[0] || null;
  }

  async findUnique(args: { where: { id: string } }): Promise<BookingRecord | null> {
    const store = readStore();
    return store.bookings.find((b) => b.id === args.where.id) || null;
  }

  async updateMany(args: { where: { razorpayOrderId?: string; status?: string; paymentStatus?: string }; data: Partial<BookingRecord> }): Promise<number> {
    const store = readStore();
    let count = 0;
    store.bookings = store.bookings.map((b) => {
      let matches = true;
      if (args.where.razorpayOrderId && b.razorpayOrderId !== args.where.razorpayOrderId) matches = false;
      if (args.where.status && b.status !== args.where.status) matches = false;
      if (args.where.paymentStatus && b.paymentStatus !== args.where.paymentStatus) matches = false;
      if (matches) {
        count++;
        return { ...b, ...args.data, updatedAt: new Date().toISOString() };
      }
      return b;
    });
    writeStore(store);
    return count;
  }
}

class InquiryClient {
  async create(args: { data: Omit<InquiryRecord, 'id' | 'createdAt'> }): Promise<InquiryRecord> {
    const store = readStore();
    const newInquiry: InquiryRecord = {
      ...args.data,
      id: generateId('inq'),
      createdAt: new Date().toISOString(),
    };
    store.inquiries.push(newInquiry);
    writeStore(store);
    return newInquiry;
  }

  async findMany(args?: { where?: { email?: string; userId?: string }; orderBy?: any; take?: number }): Promise<InquiryRecord[]> {
    const store = readStore();
    let result = store.inquiries;
    if (args?.where?.email) {
      const cleanEmail = args.where.email.toLowerCase().trim();
      result = result.filter((i) => i.email.toLowerCase().trim() === cleanEmail);
    }
    return result;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    const initialLen = store.inquiries.length;
    store.inquiries = store.inquiries.filter((i) => i.id !== args.where.id);
    writeStore(store);
    return store.inquiries.length < initialLen;
  }
}

class CategoryClient {
  async findMany(): Promise<CategoryRecord[]> {
    const store = readStore();
    return store.categories || [];
  }

  async findUnique(args: { where: { id: string } }): Promise<CategoryRecord | null> {
    const store = readStore();
    const cleanId = args.where.id.trim().toLowerCase();
    return (store.categories || []).find((c) => c.id.trim().toLowerCase() === cleanId || c.label.trim().toLowerCase() === cleanId) || null;
  }

  async create(args: { data: { id: string; label: string; icon?: string; description?: string } }): Promise<CategoryRecord> {
    const store = readStore();
    const now = new Date().toISOString();
    const catId = args.data.id.trim();
    const cleanId = catId.toLowerCase();

    // If category with same id already exists, update it cleanly
    const existingIdx = store.categories.findIndex((c) => c.id.trim().toLowerCase() === cleanId);
    if (existingIdx !== -1) {
      store.categories[existingIdx] = {
        ...store.categories[existingIdx],
        label: args.data.label.trim(),
        icon: args.data.icon || store.categories[existingIdx].icon || '📦',
        description: args.data.description !== undefined ? args.data.description : store.categories[existingIdx].description,
        updatedAt: now,
      };
      writeStore(store);
      return store.categories[existingIdx];
    }

    const newCat: CategoryRecord = {
      id: catId,
      label: args.data.label.trim(),
      icon: args.data.icon || '📦',
      description: args.data.description || '',
      createdAt: now,
      updatedAt: now,
    };
    store.categories.push(newCat);
    writeStore(store);
    return newCat;
  }

  async update(args: { where: { id: string }; data: Partial<CategoryRecord> }): Promise<CategoryRecord> {
    const store = readStore();
    const cleanId = args.where.id.trim().toLowerCase();
    const idx = store.categories.findIndex((c) => c.id.trim().toLowerCase() === cleanId);
    if (idx === -1) throw new Error('Category not found');
    const updated: CategoryRecord = {
      ...store.categories[idx],
      ...args.data,
      updatedAt: new Date().toISOString(),
    };
    store.categories[idx] = updated;
    writeStore(store);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    const cleanId = args.where.id.trim().toLowerCase();
    const initialLen = store.categories.length;
    store.categories = store.categories.filter((c) => c.id.trim().toLowerCase() !== cleanId && c.label.trim().toLowerCase() !== cleanId);
    writeStore(store);
    return store.categories.length < initialLen;
  }
}

class ProductClient {
  async findMany(args?: { where?: { category?: string; isActive?: boolean } }): Promise<ProductRecord[]> {
    const store = readStore();
    let result = store.products || [];
    if (args?.where?.category && args.where.category !== 'All Products') {
      const catLower = args.where.category.trim().toLowerCase();
      result = result.filter((p) => p.category.trim().toLowerCase() === catLower);
    }
    if (args?.where?.isActive !== undefined) {
      result = result.filter((p) => (p.isActive !== false) === args.where?.isActive);
    }
    return result.map((p) => ({
      ...p,
      paperOptions: Array.isArray(p.paperOptions) && p.paperOptions.length > 0 ? p.paperOptions : DEFAULT_PAPER_OPTIONS,
      quantityOptions: Array.isArray(p.quantityOptions) && p.quantityOptions.length > 0 ? p.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
      cornerOptions: Array.isArray(p.cornerOptions) && p.cornerOptions.length > 0 ? p.cornerOptions : DEFAULT_CORNER_OPTIONS,
    }));
  }

  async findUnique(args: { where: { id: string } }): Promise<ProductRecord | null> {
    const store = readStore();
    const cleanId = args.where.id.trim();
    const prod = (store.products || []).find((p) => p.id.trim() === cleanId) || null;
    if (!prod) return null;
    return {
      ...prod,
      paperOptions: Array.isArray(prod.paperOptions) && prod.paperOptions.length > 0 ? prod.paperOptions : DEFAULT_PAPER_OPTIONS,
      quantityOptions: Array.isArray(prod.quantityOptions) && prod.quantityOptions.length > 0 ? prod.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
      cornerOptions: Array.isArray(prod.cornerOptions) && prod.cornerOptions.length > 0 ? prod.cornerOptions : DEFAULT_CORNER_OPTIONS,
    };
  }

  async create(args: { data: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<ProductRecord> {
    const store = readStore();
    const now = new Date().toISOString();
    const newProduct: ProductRecord = {
      ...args.data,
      id: generateId('prd'),
      paperOptions: Array.isArray(args.data.paperOptions) && args.data.paperOptions.length > 0 ? args.data.paperOptions : DEFAULT_PAPER_OPTIONS,
      quantityOptions: Array.isArray(args.data.quantityOptions) && args.data.quantityOptions.length > 0 ? args.data.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
      cornerOptions: Array.isArray(args.data.cornerOptions) && args.data.cornerOptions.length > 0 ? args.data.cornerOptions : DEFAULT_CORNER_OPTIONS,
      isActive: args.data.isActive !== undefined ? args.data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    store.products.unshift(newProduct);
    writeStore(store);
    return newProduct;
  }

  async update(args: { where: { id: string }; data: Partial<ProductRecord> }): Promise<ProductRecord> {
    const store = readStore();
    const cleanId = args.where.id.trim();
    const idx = store.products.findIndex((p) => p.id.trim() === cleanId);
    if (idx === -1) throw new Error('Product not found');
    const updated: ProductRecord = {
      ...store.products[idx],
      ...args.data,
      updatedAt: new Date().toISOString(),
    };
    store.products[idx] = updated;
    writeStore(store);
    return {
      ...updated,
      paperOptions: Array.isArray(updated.paperOptions) && updated.paperOptions.length > 0 ? updated.paperOptions : DEFAULT_PAPER_OPTIONS,
      quantityOptions: Array.isArray(updated.quantityOptions) && updated.quantityOptions.length > 0 ? updated.quantityOptions : DEFAULT_QUANTITY_OPTIONS,
      cornerOptions: Array.isArray(updated.cornerOptions) && updated.cornerOptions.length > 0 ? updated.cornerOptions : DEFAULT_CORNER_OPTIONS,
    };
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    const cleanId = args.where.id.trim();
    const initialLen = store.products.length;
    store.products = store.products.filter((p) => p.id.trim() !== cleanId);
    writeStore(store);
    return store.products.length < initialLen;
  }
}

class BannerClient {
  async findMany(args?: { where?: { isActive?: boolean } }): Promise<BannerRecord[]> {
    const store = readStore();
    let result = store.banners || [];
    if (args?.where?.isActive !== undefined) {
      result = result.filter((b) => (b.isActive !== false) === args.where?.isActive);
    }
    return result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async findUnique(args: { where: { id: string } }): Promise<BannerRecord | null> {
    const store = readStore();
    return (store.banners || []).find((b) => b.id === args.where.id) || null;
  }

  async create(args: { data: Omit<BannerRecord, 'id' | 'createdAt' | 'updatedAt'> }): Promise<BannerRecord> {
    const store = readStore();
    const now = new Date().toISOString();
    const newBanner: BannerRecord = {
      ...args.data,
      id: generateId('bnr'),
      isActive: args.data.isActive !== undefined ? args.data.isActive : true,
      displayOrder: args.data.displayOrder || (store.banners?.length || 0) + 1,
      createdAt: now,
      updatedAt: now,
    };
    if (!store.banners) store.banners = [];
    store.banners.push(newBanner);
    writeStore(store);
    return newBanner;
  }

  async update(args: { where: { id: string }; data: Partial<BannerRecord> }): Promise<BannerRecord> {
    const store = readStore();
    if (!store.banners) store.banners = [];
    const idx = store.banners.findIndex((b) => b.id === args.where.id);
    if (idx === -1) throw new Error('Banner not found');
    const updated: BannerRecord = {
      ...store.banners[idx],
      ...args.data,
      updatedAt: new Date().toISOString(),
    };
    store.banners[idx] = updated;
    writeStore(store);
    return updated;
  }

  async delete(args: { where: { id: string } }): Promise<boolean> {
    const store = readStore();
    if (!store.banners) return false;
    const initialLen = store.banners.length;
    store.banners = store.banners.filter((b) => b.id !== args.where.id);
    writeStore(store);
    return store.banners.length < initialLen;
  }
}

class SettingsClient {
  async get(): Promise<SettingsRecord> {
    const store = readStore();
    return store.settings || DEFAULT_SETTINGS;
  }

  async update(data: Partial<SettingsRecord>): Promise<SettingsRecord> {
    const store = readStore();
    const current = store.settings || DEFAULT_SETTINGS;
    const updated: SettingsRecord = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    store.settings = updated;
    writeStore(store);
    return updated;
  }
}

export const db: any = {
  user: new UserClient(),
  booking: new BookingClient(),
  inquiry: new InquiryClient(),
  category: new CategoryClient(),
  product: new ProductClient(),
  banner: new BannerClient(),
  settings: new SettingsClient(),
};

