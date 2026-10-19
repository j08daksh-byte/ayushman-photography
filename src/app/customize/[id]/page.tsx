'use client';

import { useState, useRef, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductSpec {
  id: string;
  name: string;
  category: string;
  defaultImage: string;
  description: string;
  basePrice100: number; // base price for 100 qty
  paperOptions: string[];
  finishOptions: string[];
}

const PRODUCTS_DB: Record<string, ProductSpec> = {
  'visiting-card': {
    id: 'visiting-card',
    name: 'Luxury Visiting & Business Cards',
    category: 'Business Cards',
    defaultImage: '/images/visiting_cards/card_500gsm_velvet.jpg',
    description: 'High-end business cards on 500 GSM Velvet, 800 Micron Sandwich Core, 180 Micron NT Synthetic, or Engraved Metal.',
    basePrice100: 480,
    paperOptions: [
      '500 GSM Velvet Touch (Heavyweight)',
      '800 Micron Triple-Layer Fused Core (Ultra-Thick)',
      '180 Micron Non-Tearable (NT) Waterproof Synthetic',
      'Solid Metal Plate (Stainless / Brass)',
      '300 GSM Smooth Matte Finish',
      'Textured Linen Executive Cardstock',
    ],
    finishOptions: [
      'Hot Gold Foil Stamping',
      'Raised Gloss Spot UV Coating',
      'Silver / Red / Blue / Green Foil',
      'Drip-Off Texturized UV',
      '36+ Precision Die-Cut Shapes',
      'Velvet Soft-Touch Lamination',
    ],
  },
  'wedding-card': {
    id: 'wedding-card',
    name: 'Royal Laser Cut Wedding Invitation Card Box',
    category: 'Wedding Cards',
    defaultImage: '/images/wedding/scroll_royal_blue_velvet.png',
    description: 'Luxury velvet box card with gold foil accents, acrylic inserts & traditional wax seal.',
    basePrice100: 4500,
    paperOptions: ['Velvet Rigid Board with Metallic Foil', 'Clear Acrylic 3mm Plate', 'Handmade Scroll Sheet', 'Textured Metallic Cardstock'],
    finishOptions: ['Real Gold Foil Embossing', 'Silver Foil Stamping', 'Laser Cut Border', 'Wax Seal Finish'],
  },
  'flex-banner': {
    id: 'flex-banner',
    name: 'Outdoor Heavy Duty Star Flex Banner',
    category: 'Flex Banners',
    defaultImage: '/images/banners/outdoor_flex_banner.jpg',
    description: 'Weatherproof heavy-duty Star Flex banner printing for shops, events & outdoor campaigns.',
    basePrice100: 1800,
    paperOptions: ['280 GSM Standard Flex', '340 GSM Star Flex (Heavy Duty)', '440 GSM Backlit Flex Board', 'Mesh Vinyl Banner'],
    finishOptions: ['Eyelets / Grommets Every 2ft', 'Hemming & Rope Stitching', 'Wooden Framing Ready', 'Pole Pocket Top & Bottom'],
  },
  'photobook': {
    id: 'photobook',
    name: 'HD Flush Mount Wedding Photobook Album',
    category: 'Photobooks',
    defaultImage: '/images/keepsakes/film1.jpg',
    description: 'Non-tearable silk sheet photobook album with lay-flat binding and leatherette briefcase box.',
    basePrice100: 4500,
    paperOptions: ['Luster Non-Tearable Silk Sheet', 'Velvet Matte HD Photo Paper', 'Glossy Premium Metallic Paper', 'Canvas Texture Sheet'],
    finishOptions: ['Acrylic Photo Cover', 'Leatherette Box Frame', 'Gold Gilded Edge Pages', 'Crystal Glass Cover'],
  },
  'custom-mug': {
    id: 'custom-mug',
    name: 'Custom Printed Ceramic Magic Photo Mug',
    category: 'Custom Gifts',
    defaultImage: '/images/keepsakes/card4.png',
    description: '11 oz ceramic magic mug revealing personalized photos & logo when hot liquid is poured.',
    basePrice100: 1800,
    paperOptions: ['11 oz Magic Heat Color Changing Mug', '11 oz Premium White Ceramic Mug', '11 oz Inner Color Mug (Red/Black)', 'Stainless Steel Travel Tumbler'],
    finishOptions: ['HD Sublimation Gloss Finish', 'Matte Ceramic Finish', 'Dual Sided Printing', 'Full Wrap Panoramic Print'],
  },
};

const QUANTITY_TIERS = [
  { qty: 100, multiplier: 1, savings: '0%' },
  { qty: 250, multiplier: 2.1, savings: '16% OFF' },
  { qty: 500, multiplier: 3.2, savings: '36% OFF' },
  { qty: 1000, multiplier: 5.3, savings: '47% OFF' },
  { qty: 2500, multiplier: 11.5, savings: '54% OFF' },
];

export default function CustomizerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id || 'visiting-card';
  const product = PRODUCTS_DB[productId] || PRODUCTS_DB['visiting-card'];

  const { addToCart } = useCart();
  const router = useRouter();

  // Customization Options State
  const [paperStock, setPaperStock] = useState(product.paperOptions[0]);
  const [cornerStyle, setCornerStyle] = useState('Standard Square Cut');
  const [finishOption, setFinishOption] = useState(product.finishOptions[0]);
  const [selectedQtyIndex, setSelectedQtyIndex] = useState(2); // default 500 qty
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

  // Custom Design Inputs State
  const [companyName, setCompanyName] = useState('AYUSHMAN CARDS & GRAPHICS');
  const [tagline, setTagline] = useState('Premium Offset & Digital Printing Press');
  const [fullName, setFullName] = useState('Ayushman Sharma');
  const [designation, setDesignation] = useState('Founder & Managing Director');
  const [phone, setPhone] = useState('+91 94797 84979');
  const [email, setEmail] = useState('info@ayushmancards.com');
  const [website, setWebsite] = useState('www.ayushmancards.com');
  const [address, setAddress] = useState('63, Varruchi Marg, Freeganj Ujjain');
  const [themeColor, setThemeColor] = useState('#D40000');
  const [fontStyle, setFontStyle] = useState("'Manrope', sans-serif");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isAddedNotice, setIsAddedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Price Calculation
  const selectedTier = QUANTITY_TIERS[selectedQtyIndex];
  const totalPrice = Math.round(product.basePrice100 * selectedTier.multiplier);
  const unitPrice = (totalPrice / selectedTier.qty).toFixed(2);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.name,
      category: product.category,
      paperStock,
      cornerStyle,
      finishOption,
      quantity: selectedTier.qty,
      unitPrice: Number(unitPrice),
      totalPrice,
      image: logoUrl || product.defaultImage,
      customDesign: {
        companyName,
        tagline,
        fullName,
        designation,
        phone,
        email,
        website,
        address,
        logoUrl,
        themeColor,
      },
    });

    setIsAddedNotice(true);
    setTimeout(() => {
      router.push('/cart');
    }, 800);
  };

  const handleWhatsAppQuote = () => {
    const message = `Hello Ayushman Cards & Graphics! I want to order:\n- Product: ${product.name}\n- Quantity: ${selectedTier.qty}\n- Paper Stock: ${paperStock}\n- Finish: ${finishOption}\n- Corner: ${cornerStyle}\n- Total Estimated Price: ₹${totalPrice.toLocaleString()}\n- Custom Text: ${companyName} (${fullName})`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919479784979?text=${encoded}`, '_blank');
  };

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg-primary)', minHeight: '90vh', padding: '2rem 0 4rem' }}>
        <div className="container-wide">
          {/* Breadcrumb Header */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            <Link href="/" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/products" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Design Studio</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Spec Selector & Controls */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D40000', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Vistaprint Studio Customizer
                </span>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {product.name}
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  {product.description}
                </p>
              </div>

              {/* 1. Paper Stock */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  1. Choose Paper Thickness / Stock (GSM)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {product.paperOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPaperStock(opt)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: paperStock === opt ? '2px solid #D40000' : '1px solid var(--border-medium)',
                        background: paperStock === opt ? 'rgba(212, 0, 0, 0.05)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                        fontWeight: paperStock === opt ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{opt}</span>
                      {paperStock === opt && <span style={{ color: '#D40000', fontWeight: 800 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Corner Style */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  2. Choose Corner Cut
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['Standard Square Cut', 'Rounded Cut (3mm)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setCornerStyle(opt)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: cornerStyle === opt ? '2px solid #D40000' : '1px solid var(--border-medium)',
                        background: cornerStyle === opt ? 'rgba(212, 0, 0, 0.05)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78125rem',
                        fontWeight: cornerStyle === opt ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Special Finish */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  3. Select Special Lamination & Foil Coating
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {product.finishOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFinishOption(opt)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: finishOption === opt ? '2px solid #D40000' : '1px solid var(--border-medium)',
                        background: finishOption === opt ? 'rgba(212, 0, 0, 0.05)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                        fontWeight: finishOption === opt ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>✨ {opt}</span>
                      {finishOption === opt && <span style={{ color: '#D40000', fontWeight: 800 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Quantity Tiers */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  4. Quantity Discount Tiers
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))', gap: '0.35rem' }}>
                  {QUANTITY_TIERS.map((tier, idx) => (
                    <button
                      key={tier.qty}
                      onClick={() => setSelectedQtyIndex(idx)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '6px',
                        border: selectedQtyIndex === idx ? '2px solid #D40000' : '1px solid var(--border-medium)',
                        background: selectedQtyIndex === idx ? '#D40000' : 'var(--bg-secondary)',
                        color: selectedQtyIndex === idx ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div>{tier.qty}</div>
                      <div style={{ fontSize: '0.55rem', opacity: 0.85 }}>{tier.savings}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MIDDLE COLUMN: Interactive Live Canvas Studio */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Interactive 2D Live Canvas Preview
                </h2>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => setActiveSide('front')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)',
                      background: activeSide === 'front' ? '#D40000' : 'transparent',
                      color: activeSide === 'front' ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Front Side
                  </button>
                  <button
                    onClick={() => setActiveSide('back')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-medium)',
                      background: activeSide === 'back' ? '#D40000' : 'transparent',
                      color: activeSide === 'back' ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Back Side
                  </button>
                </div>
              </div>

              {/* Real-time Rendered Card Box */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1.75 / 1',
                  borderRadius: cornerStyle.includes('Rounded') ? '16px' : '4px',
                  background: activeSide === 'front' ? 'linear-gradient(135deg, #111111 0%, #262626 100%)' : themeColor,
                  color: '#FFFFFF',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  fontFamily: fontStyle,
                }}
              >
                {/* Gold Foil Accent Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)' }} />

                {activeSide === 'front' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoUrl} alt="Logo" style={{ height: '38px', maxWidth: '120px', objectFit: 'contain', marginBottom: '0.4rem' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: '12px', height: '12px', background: '#FFD700', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FFD700', letterSpacing: '0.1em' }}>CUSTOM LOGO</span>
                          </div>
                        )}
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {companyName || 'YOUR COMPANY NAME'}
                        </h3>
                        <p style={{ fontSize: '0.65rem', color: '#CCCCCC', opacity: 0.9 }}>
                          {tagline || 'Your Slogan / Tagline Here'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.55rem', padding: '0.15rem 0.4rem', background: '#FFD700', color: '#000000', fontWeight: 800, borderRadius: '2px' }}>
                          {finishOption}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.6rem' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFD700' }}>
                          {fullName || 'Your Full Name'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#DDDDDD' }}>
                          {designation || 'Your Title / Role'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.6rem', color: '#EEEEEE', lineHeight: 1.3 }}>
                        <div>📱 {phone}</div>
                        <div>✉️ {email}</div>
                        <div>🌐 {website}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                      {companyName}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#F0F0F0', maxWidth: '80%' }}>
                      📍 {address}
                    </p>
                    <div style={{ marginTop: '0.8rem', fontSize: '0.65rem', color: '#FFD700', fontWeight: 700 }}>
                      Quality Printed by Ayushman Offset Press
                    </div>
                  </div>
                )}
              </div>

              {/* Design Text Inputs */}
              <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Email & Website
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Logo Upload & Custom Styling */}
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px dashed #D40000',
                      background: 'rgba(212, 0, 0, 0.04)',
                      color: '#D40000',
                      fontSize: '0.78125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    📁 Upload Custom Logo / Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accent Color:</span>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{ width: '32px', height: '32px', border: 'none', borderRadius: '50%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Checkout Action */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-subtle)', position: 'sticky', top: '140px' }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Order Print Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Product:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Selected Quantity:</span>
                  <span style={{ fontWeight: 700, color: '#D40000' }}>{selectedTier.qty} Units ({selectedTier.savings})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Paper Stock:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '160px' }}>{paperStock}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Special Finish:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '160px' }}>{finishOption}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Corner Cut:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cornerStyle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Unit Price:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{unitPrice} / piece</span>
                </div>
              </div>

              {/* Total Price Display */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total Estimated Price:</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#D40000' }}>
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '0.2rem' }}>
                  Includes free digital design proof & high-speed offset printing
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #D40000 0%, #990000 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(212, 0, 0, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isAddedNotice ? '✓ Added to Cart!' : '🛒 Add to Cart & Checkout'}
                </button>

                <button
                  onClick={handleWhatsAppQuote}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '999px',
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.84375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>💬 Direct WhatsApp Instant Proof</span>
                </button>
              </div>

              {/* Satisfaction Guarantee Badge */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,0,0,0.1)', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    100% Print Perfection Guarantee
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    Free re-print if colors or specs don't match your design proof.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
