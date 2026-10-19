'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import ExploreCategories from '@/components/ExploreCategories';
import ProductCarousel, { ProductItem } from '@/components/ProductCarousel';
import PromoBanner from '@/components/PromoBanner';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import NewsletterBanner from '@/components/NewsletterBanner';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// Shop by Shapes — Visiting Card variants
const INITIAL_CARD_SHAPES: ProductItem[] = [
  {
    id: 'shape-1',
    title: 'Standard Visiting Cards',
    badge: 'BUY 100 @ Rs.200',
    price: '₹200.00',
    unit: '₹2.00 each / 100 units',
    category: 'Standard Cards',
    image: '/images/visiting_cards/colorful.jpg',
    rating: 4.8,
    reviews: 1658,
    bgGradient: '#FAF0E6',
  },
  {
    id: 'shape-2',
    title: 'Velvet Touch Visiting Cards',
    badge: 'BUY 100 @ Rs.250',
    price: '₹250.00',
    unit: '₹2.50 each / 100 units',
    category: 'Velvet Cards',
    image: '/images/visiting_cards/velvet_touch.jpg',
    rating: 4.9,
    reviews: 730,
    bgGradient: '#FDF2F2',
  },
  {
    id: 'shape-3',
    title: 'Rounded Corner Visiting Cards',
    badge: 'BUY 100 @ Rs.250',
    price: '₹250.00',
    unit: '₹2.50 each / 100 units',
    category: 'Rounded Cards',
    image: '/images/visiting_cards/spot_uv.jpg',
    rating: 4.7,
    reviews: 520,
    bgGradient: '#F5F2ED',
  },
  {
    id: 'shape-4',
    title: 'Frosted Transparent Plastic Cards',
    badge: 'BUY 100 @ Rs.580',
    price: '₹580.00',
    unit: '₹5.80 each / 100 units',
    category: 'PVC Cards',
    image: '/images/visiting_cards/transparent.jpg',
    rating: 4.9,
    reviews: 310,
    bgGradient: '#F0F7F2',
  },
  {
    id: 'shape-5',
    title: 'Embossed Spot UV Visiting Cards',
    badge: 'BUY 100 @ Rs.380',
    price: '₹380.00',
    unit: '₹3.80 each / 100 units',
    category: 'Spot UV Cards',
    image: '/images/visiting_cards/black_gold.jpg',
    rating: 4.8,
    reviews: 420,
    bgGradient: '#F4F0F9',
  },
  {
    id: 'shape-6',
    title: 'Metallic Gold Foil Visiting Cards',
    badge: 'BUY 100 @ Rs.450',
    price: '₹450.00',
    unit: '₹4.50 each / 100 units',
    category: 'Gold Foil Cards',
    image: '/images/visiting_cards/metal.jpg',
    rating: 5.0,
    reviews: 680,
    bgGradient: '#FFFDF0',
  },
];

// Shop by Paper & Texture
const INITIAL_CARD_TEXTURES: ProductItem[] = [
  {
    id: 'tex-1',
    title: '300 GSM Matte Finish Visiting Cards',
    badge: 'BUY 100 @ Rs.220',
    price: '₹220.00',
    unit: '₹2.20 each / 100 units',
    category: 'Matte Cards',
    image: '/images/keepsakes/visiting_cards.jpg',
    rating: 4.6,
    reviews: 420,
    bgGradient: '#FAF0E6',
  },
  {
    id: 'tex-2',
    title: 'Glossy Laminated Cards',
    badge: 'BUY 100 @ Rs.250',
    price: '₹250.00',
    unit: '₹2.50 each / 100 units',
    category: 'Glossy Cards',
    image: '/images/keepsakes/card1.png',
    rating: 4.5,
    reviews: 312,
    bgGradient: '#FDF2F2',
  },
  {
    id: 'tex-3',
    title: '350 GSM Velvet Touch Cards',
    badge: 'BUY 100 @ Rs.380',
    price: '₹380.00',
    unit: '₹3.80 each / 100 units',
    category: 'Velvet Cards',
    image: '/images/visiting_cards/velvet_touch.jpg',
    rating: 4.9,
    reviews: 585,
    bgGradient: '#F4F0F9',
  },
  {
    id: 'tex-4',
    title: 'Spot UV Raised Gloss Cards',
    badge: 'BUY 100 @ Rs.580',
    price: '₹580.00',
    unit: '₹5.80 each / 100 units',
    category: 'Spot UV Cards',
    image: '/images/visiting_cards/spot_uv.jpg',
    rating: 4.8,
    reviews: 289,
    bgGradient: '#2D3748',
  },
  {
    id: 'tex-5',
    title: 'Gold Foil Stamping Executive Cards',
    badge: 'BUY 100 @ Rs.750',
    price: '₹750.00',
    unit: '₹7.50 each / 100 units',
    category: 'Gold Foil Cards',
    image: '/images/visiting_cards/black_gold.jpg',
    rating: 5.0,
    reviews: 445,
    bgGradient: '#FFFDF0',
  },
  {
    id: 'tex-6',
    title: 'Clear Transparent Acrylic Invitation Plates',
    badge: 'BUY 100 @ Rs.2,200',
    price: '₹2,200.00',
    unit: '₹22.00 each / 100 units',
    category: 'Acrylic Cards',
    image: '/images/wedding/acrylic_navy_gold.png',
    rating: 4.9,
    reviews: 167,
    bgGradient: '#EBF5FA',
  },
];

// Wedding & Ceremony Invitations
const INITIAL_WEDDING_CARDS: ProductItem[] = [
  {
    id: 'wed-1',
    title: 'Royal Velvet Box & Gold Shahi Scroll Card',
    badge: '100 PCS @ ₹4,500',
    price: '₹4,500',
    unit: '₹45.00 each / 100 units',
    category: 'Wedding Box Cards',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    rating: 5.0,
    reviews: 920,
    bgGradient: '#0B2545',
  },
  {
    id: 'wed-2',
    title: 'Clear Acrylic Card with Navy Velvet & Wax Seal',
    badge: '100 PCS @ ₹6,500',
    price: '₹6,500',
    unit: '₹65.00 each / 100 units',
    category: 'Acrylic Invitations',
    image: '/images/wedding/acrylic_navy_gold.png',
    rating: 4.9,
    reviews: 640,
    bgGradient: '#EBF5FA',
  },
  {
    id: 'wed-3',
    title: 'White & Gold Royal Carriage Farman Scroll Card',
    badge: '100 PCS @ ₹3,800',
    price: '₹3,800',
    unit: '₹38.00 each / 100 units',
    category: 'Scroll Invitations',
    image: '/images/wedding/scroll_white_gold.png',
    rating: 4.8,
    reviews: 730,
    bgGradient: '#FFFDF0',
  },
  {
    id: 'wed-4',
    title: 'Pastel Sky Blue Silver Laser-Cut Pocket Envelope',
    badge: '100 PCS @ ₹2,950',
    price: '₹2,950',
    unit: '₹29.50 each / 100 units',
    category: 'Laser Cut Pocket',
    image: '/images/wedding/pastel_blue_laser_tassel.png',
    rating: 4.8,
    reviews: 480,
    bgGradient: '#F0F7F2',
  },
  {
    id: 'wed-5',
    title: 'Royal Blue Curved Pocket Card with Botanical Wax Seal',
    badge: '100 PCS @ ₹3,200',
    price: '₹3,200',
    unit: '₹32.00 each / 100 units',
    category: 'Wax Seal Cards',
    image: '/images/wedding/royal_blue_wax_seal.jpg',
    rating: 4.9,
    reviews: 510,
    bgGradient: '#FDF2F2',
  },
  {
    id: 'wed-6',
    title: '3D Pop-Up Lotus Flower Laser Cut Card',
    badge: '100 PCS @ ₹4,200',
    price: '₹4,200',
    unit: '₹42.00 each / 100 units',
    category: '3D Pop-Up Cards',
    image: '/images/wedding/lotus_popup_card.jpg',
    rating: 5.0,
    reviews: 670,
    bgGradient: '#F5F2ED',
  },
];

export default function Home() {
  const [cardShapes, setCardShapes] = useState<ProductItem[]>(INITIAL_CARD_SHAPES);
  const [cardTextures, setCardTextures] = useState<ProductItem[]>(INITIAL_CARD_TEXTURES);
  const [weddingCards, setWeddingCards] = useState<ProductItem[]>(INITIAL_WEDDING_CARDS);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.products) || data.products.length === 0) return;

      const liveProducts = data.products.filter((p: any) => p.isActive !== false);

      // 1. Update Wedding Cards carousel with live products from Wedding Cards category
      const liveWedding = liveProducts.filter((p: any) => p.category === 'Wedding Cards');
      if (liveWedding.length > 0) {
        const bgGradients = ['#0B2545', '#EBF5FA', '#FFFDF0', '#F0F7F2', '#FDF2F2', '#F5F2ED', '#F4F0F9', '#FAF0E6'];
        const mappedWedding: ProductItem[] = liveWedding.map((p: any, idx: number) => ({
          id: p.id,
          title: p.title,
          badge: p.badge || (p.price ? `Starts @ ${p.price}` : undefined),
          price: p.price,
          unit: p.unit || (p.price ? `${p.price} each` : undefined),
          category: p.category,
          image: p.image,
          rating: p.rating || 4.9,
          reviews: p.reviews || 500,
          bgGradient: bgGradients[idx % bgGradients.length],
        }));
        setWeddingCards(mappedWedding);
      }

      // 2. Update Card Shapes with matching live products
      setCardShapes((prev) =>
        prev.map((item) => {
          const match = liveProducts.find(
            (p: any) => p.id === item.id || p.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 15))
          );
          if (match) {
            return {
              ...item,
              title: match.title,
              badge: match.badge || item.badge,
              price: match.price || item.price,
              unit: match.unit || item.unit,
              image: match.image || item.image,
            };
          }
          return item;
        })
      );

      // 3. Update Card Textures with matching live products
      setCardTextures((prev) =>
        prev.map((item) => {
          const match = liveProducts.find(
            (p: any) => p.id === item.id || p.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 15))
          );
          if (match) {
            return {
              ...item,
              title: match.title,
              badge: match.badge || item.badge,
              price: match.price || item.price,
              unit: match.unit || item.unit,
              image: match.image || item.image,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.warn('Home live product load fallback:', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ayushman_catalog_updated_at') {
        loadProducts();
      }
    };

    window.addEventListener('catalogUpdated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', loadProducts);

    return () => {
      window.removeEventListener('catalogUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', loadProducts);
    };
  }, [loadProducts]);

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Dynamic Admin-Managed Full-Width Hero Banners */}
        <HeroBanner />

        {/* 2. Featured Split Deals */}
        <Hero />

        {/* 3. Trust Value Bar */}
        <TrustBar />

        {/* 3. Best Sellers & Trending */}
        <ExploreCategories />

        {/* 4. Shop by Shapes */}
        <ProductCarousel
          id="shapes"
          sectionTitle="Shop by shapes"
          sectionSubtitle="Select from various shapes & sizes."
          items={cardShapes}
        />

        {/* 5. Featured Promo Banner */}
        <PromoBanner />

        {/* 6. Shop by Papers & Textures */}
        <ProductCarousel
          sectionTitle="Shop by papers & textures"
          sectionSubtitle="Choose premium finishes for your cards."
          items={cardTextures}
        />

        {/* 7. Wedding Invitations Collection */}
        <ProductCarousel
          id="wedding"
          sectionTitle="Wedding & Ceremony Invitation Cards"
          sectionSubtitle="Handcrafted luxury invitations for your special day."
          items={weddingCards}
        />

        {/* 8. Why Choose Us */}
        <WhyChooseUs />

        {/* 9. Customer Reviews */}
        <Testimonials />

        {/* 10. Newsletter Signup */}
        <NewsletterBanner />

        {/* 11. Contact & Location */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
