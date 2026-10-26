'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import ProductModal, { ProductModalItem } from './ProductModal';

interface CategoryProduct {
  id: string;
  name: string;
  image: string;
  badge?: string;
  price?: string;
  unit?: string;
  rating?: number;
  reviews?: number;
  bgGradient: string;
}

const INITIAL_BEST_SELLERS: CategoryProduct[] = [
  {
    id: 'bs-1',
    name: 'Standard Visiting Cards',
    image: '/images/visiting_cards/colorful.jpg',
    badge: 'BUY 100 @ Rs.200',
    price: '₹200.00',
    unit: '₹2.00 each / 100 units',
    rating: 4.8,
    reviews: 1658,
    bgGradient: '#FAF0E6',
  },
  {
    id: 'bs-2',
    name: 'Velvet Touch Visiting Cards',
    image: '/images/visiting_cards/velvet_touch.jpg',
    badge: 'BUY 100 @ Rs.250',
    price: '₹250.00',
    unit: '₹2.50 each / 100 units',
    rating: 4.9,
    reviews: 520,
    bgGradient: '#F5F2ED',
  },
  {
    id: 'bs-3',
    name: 'Clear Acrylic Wedding Cards',
    image: '/images/wedding/acrylic_navy_gold.png',
    badge: '100 PCS @ Rs.6,500',
    price: '₹6,500.00',
    unit: '₹65.00 each / 100 units',
    rating: 4.9,
    reviews: 284,
    bgGradient: '#F0F7F2',
  },
  {
    id: 'bs-4',
    name: 'Royal Shahi Scroll Cards',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    badge: '100 PCS @ Rs.4,500',
    price: '₹4,500.00',
    unit: '₹45.00 each / 100 units',
    rating: 5.0,
    reviews: 412,
    bgGradient: '#F4F0F9',
  },
  {
    id: 'bs-5',
    name: 'Botanical Wax Seal Cards',
    image: '/images/wedding/royal_blue_wax_seal.jpg',
    badge: '100 PCS @ Rs.3,200',
    price: '₹3,200.00',
    unit: '₹32.00 each / 100 units',
    rating: 4.8,
    reviews: 340,
    bgGradient: '#EBF5FA',
  },
  {
    id: 'bs-6',
    name: '3D Lotus Pop-Up Cards',
    image: '/images/wedding/lotus_popup_card.jpg',
    badge: '100 PCS @ Rs.4,200',
    price: '₹4,200.00',
    unit: '₹42.00 each / 100 units',
    rating: 5.0,
    reviews: 890,
    bgGradient: '#FDF2F2',
  },
];

const INITIAL_TRENDING: CategoryProduct[] = [
  {
    id: 'tr-1',
    name: 'Executive Gold Foil Cards',
    image: '/images/visiting_cards/black_gold.jpg',
    badge: 'BUY 100 @ Rs.450',
    price: '₹450.00',
    unit: '₹4.50 each / 100 units',
    bgGradient: '#FDF2F2',
  },
  {
    id: 'tr-2',
    name: 'Raised Spot UV Visiting Cards',
    image: '/images/visiting_cards/spot_uv.jpg',
    badge: 'BUY 100 @ Rs.580',
    price: '₹580.00',
    unit: '₹5.80 each / 100 units',
    bgGradient: '#2D3748',
  },
  {
    id: 'tr-3',
    name: 'White & Gold Carriage Scroll',
    image: '/images/wedding/scroll_white_gold.png',
    badge: '100 PCS @ Rs.3,800',
    price: '₹3,800.00',
    unit: '₹38.00 each / 100 units',
    bgGradient: '#FFFDF0',
  },
  {
    id: 'tr-4',
    name: 'Pastel Blue Laser Cut Pocket',
    image: '/images/wedding/pastel_blue_laser_tassel.png',
    badge: '100 PCS @ Rs.2,950',
    price: '₹2,950.00',
    unit: '₹29.50 each / 100 units',
    bgGradient: '#F9EBE6',
  },
  {
    id: 'tr-5',
    name: 'Vintage Royal Arch Gate Card',
    image: '/images/wedding/royal_arch_laser_cut.png',
    badge: '100 PCS @ Rs.3,500',
    price: '₹3,500.00',
    unit: '₹35.00 each / 100 units',
    bgGradient: '#F0F7F2',
  },
  {
    id: 'tr-6',
    name: 'Navy Gold Gatefold with QR RSVP',
    image: '/images/wedding/navy_gold_rounded_gatefold.jpg',
    badge: '100 PCS @ Rs.2,800',
    price: '₹2,800.00',
    unit: '₹28.00 each / 100 units',
    bgGradient: '#FFFDF0',
  },
];

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < fullStars ? '#F59E0B' : (i === fullStars && hasHalf ? '#F59E0B' : '#D1D5DB'),
              fontSize: '0.8rem',
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
        {rating} ({reviews.toLocaleString()})
      </span>
    </div>
  );
}

function ProductRow({
  title,
  items,
  onSelectProduct,
}: {
  title: string;
  items: CategoryProduct[];
  onSelectProduct: (product: ProductModalItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1E1E1E',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h2>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: '-8px',
            top: '40%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: '#1E1E1E',
          }}
          aria-label="Scroll right"
        >
          ›
        </button>

        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '0.5rem',
          }}
        >
          {items.map((item) => {
            const isFav = isInWishlist(item.id) || isInWishlist(item.name);
            return (
              <div
                key={item.name}
                style={{
                  flex: '0 0 210px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectProduct(item)}
              >
                <div
                  style={{
                    position: 'relative',
                    background: item.bgGradient,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Price Badge */}
                  {item.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 5,
                        background: '#B2E4F7',
                        color: '#0B2545',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }}
                    >
                      {item.badge}
                    </div>
                  )}

                  {/* Interactive Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({ id: item.id, title: item.name, price: item.price || '', image: item.image });
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 10,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                    title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? '#D40000' : 'none'} stroke={isFav ? '#D40000' : '#1E1E1E'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>

                  <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: '0.6rem 0.25rem' }}>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1E1E1E',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </div>
                  {item.rating && <StarRating rating={item.rating} reviews={item.reviews || 0} />}
                  {item.price && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: '#1E1E1E',
                        }}
                      >
                        From {item.price}
                      </span>
                    </div>
                  )}
                  {item.unit && (
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.75rem',
                        color: '#6B7280',
                      }}
                    >
                      {item.unit}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ExploreCategories() {
  const [selectedProduct, setSelectedProduct] = useState<ProductModalItem | null>(null);
  const [bestSellers, setBestSellers] = useState<CategoryProduct[]>(INITIAL_BEST_SELLERS);
  const [trending, setTrending] = useState<CategoryProduct[]>(INITIAL_TRENDING);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.products)) return;

      const liveProducts = data.products.filter((p: any) => p.isActive !== false);
      const bgGradients = ['#FAF0E6', '#F5F2ED', '#F0F7F2', '#F4F0F9', '#EBF5FA', '#FDF2F2', '#FFFDF0', '#F9EBE6'];

      if (liveProducts.length > 0) {
        // Derive Best Sellers directly from live active products
        const mappedBestSellers: CategoryProduct[] = liveProducts.slice(0, 8).map((p: any, idx: number) => ({
          id: p.id,
          name: p.title,
          image: p.image,
          badge: p.badge || (p.price ? `Starts @ ${p.price}` : 'POPULAR'),
          price: p.price,
          unit: p.unit || `${p.price} each`,
          rating: p.rating || 4.9,
          reviews: p.reviews || 500,
          bgGradient: bgGradients[idx % bgGradients.length],
        }));
        setBestSellers(mappedBestSellers);

        // Derive Trending directly from live active products
        const trendingSlice = liveProducts.length > 8 ? liveProducts.slice(8, 16) : liveProducts.slice().reverse();
        const mappedTrending: CategoryProduct[] = trendingSlice.map((p: any, idx: number) => ({
          id: p.id,
          name: p.title,
          image: p.image,
          badge: p.badge || (p.price ? `Starts @ ${p.price}` : 'TRENDING'),
          price: p.price,
          unit: p.unit || `${p.price} each`,
          rating: p.rating || 4.8,
          reviews: p.reviews || 420,
          bgGradient: bgGradients[(idx + 2) % bgGradients.length],
        }));
        setTrending(mappedTrending);
      } else {
        setBestSellers([]);
        setTrending([]);
      }
    } catch (err) {
      console.warn('ExploreCategories live products load fallback:', err);
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
    <section
      id="products"
      style={{
        background: '#FFFFFF',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <ProductRow title="Best Sellers" items={bestSellers} onSelectProduct={(p) => setSelectedProduct(p)} />
        <ProductRow title="Trending" items={trending} onSelectProduct={(p) => setSelectedProduct(p)} />
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
