'use client';

import { useState, useRef } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import ProductModal, { ProductModalItem } from './ProductModal';

export interface ProductItem {
  id: string;
  title: string;
  badge?: string;
  price: string;
  unit?: string;
  category?: string;
  image: string;
  rating?: number;
  reviews?: number;
  bgGradient?: string;
}

interface ProductCarouselProps {
  id?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: ProductItem[];
}

const defaultGradients = [
  '#FAF0E6',
  '#FDF2F2',
  '#F5F2ED',
  '#F0F7F2',
  '#F4F0F9',
  '#F9EBE6',
];

export default function ProductCarousel({ id, sectionTitle, sectionSubtitle, items }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<ProductModalItem | null>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  return (
    <section
      id={id}
      style={{
        background: '#FFFFFF',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)',
        borderTop: '1px solid #F3F4F6',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1E1E1E',
              marginBottom: '0.25rem',
            }}
          >
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: '#6B7280',
              }}
            >
              {sectionSubtitle}
            </p>
          )}
        </div>

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
            {items.map((item, idx) => {
              const cardBg = item.bgGradient || defaultGradients[idx % defaultGradients.length];
              const isFav = isInWishlist(item.id) || isInWishlist(item.title);
              return (
                <div
                  key={item.id}
                  style={{
                    flex: '0 0 210px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedProduct({
                    id: item.id,
                    name: item.title,
                    image: item.image,
                    badge: item.badge,
                    price: item.price,
                    unit: item.unit,
                    category: item.category,
                    paperOptions: (item as any).paperOptions,
                    quantityOptions: (item as any).quantityOptions,
                    cornerOptions: (item as any).cornerOptions,
                  })}
                >
                  <div
                    style={{
                      position: 'relative',
                      background: cardBg,
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
                    {/* Badge */}
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
                        toggleWishlist({ id: item.id, title: item.title, price: item.price, image: item.image });
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
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.title}
                    </div>
                    {item.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < Math.floor(item.rating!) ? '#F59E0B' : '#D1D5DB', fontSize: '0.75rem' }}>★</span>
                        ))}
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                          {item.rating} ({item.reviews?.toLocaleString()})
                        </span>
                      </div>
                    )}
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#1E1E1E' }}>
                        From {item.price}
                      </span>
                    </div>
                    {item.unit && (
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.725rem', color: '#6B7280' }}>
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

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
