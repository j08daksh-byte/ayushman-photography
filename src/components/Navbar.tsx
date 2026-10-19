'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';

export interface NavCategory {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  count?: number;
}

export interface NavProduct {
  id: string;
  customizerId: string;
  title: string;
  category: string;
  badge: string;
  price: string;
  numericPrice: number;
  unit?: string;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  isActive?: boolean;
}

interface MegaColumn {
  heading: string;
  items: { label: string; href: string; isNew?: boolean }[];
}

// Fallback initial categories for instantaneous zero-latency SSR
const INITIAL_FALLBACK_CATEGORIES: NavCategory[] = [
  { id: 'Business Cards', label: 'Visiting Cards', icon: '💳', description: '350 GSM Velvet Touch, Gold Foil, Spot UV' },
  { id: 'Wedding Cards', label: 'Wedding Invitations', icon: '💍', description: 'Royal velvet box, clear acrylic, Farman scrolls' },
  { id: 'Office Stationery', label: 'Stationery, Letterheads & Notebooks', icon: '🏢', description: 'Bond letterheads, bill books, stamps' },
  { id: 'Flex Banners', label: 'Signs, Posters & Marketing Materials', icon: '🪧', description: 'Star Flex, roll-up standees, LED signboards' },
  { id: 'Stickers & Labels', label: 'Labels, Stickers & Packaging', icon: '🏷️', description: 'Die-cut waterproof vinyl, roll packaging' },
  { id: 'Photobooks', label: 'Mugs, Albums & Gifts', icon: '📖', description: 'HD lay-flat albums, magic photo mugs' },
  { id: 'Custom Gifts', label: 'Custom Polo T-shirts', icon: '🎁', description: 'Corporate polo t-shirts, caps & merchandise' },
  { id: 'Birthday & Event Cards', label: 'Deals & Offers', icon: '🎉', description: 'Special volume discounts & combo packs' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [categories, setCategories] = useState<NavCategory[]>(INITIAL_FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<NavProduct[]>([]);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null); // 'VIEW_ALL' or category ID
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile 3-line Category Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [mobileCatSearch, setMobileCatSearch] = useState('');

  // Fetch live products and categories from Admin Portal / public API
  const loadLiveCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            const cleanCats = data.categories.filter((c: any) => c.id !== 'All Products');
            setCategories(cleanCats);
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products.filter((p: any) => p.isActive !== false));
          }
        }
      }
    } catch (err) {
      console.warn('Navbar live catalog load fallback:', err);
    }
  }, []);

  useEffect(() => {
    loadLiveCatalog();

    const handleCatalogUpdate = () => {
      loadLiveCatalog();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ayushman_catalog_updated_at') {
        loadLiveCatalog();
      }
    };

    window.addEventListener('catalogUpdated', handleCatalogUpdate);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', loadLiveCatalog);

    return () => {
      window.removeEventListener('catalogUpdated', handleCatalogUpdate);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', loadLiveCatalog);
    };
  }, [loadLiveCatalog]);

  // Clean label helper: strip leading emojis and numbers
  const formatCatLabel = (label: string) => {
    return (
      label
        .replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '')
        .replace(/\s*\(\d+\)$/, '')
        .trim() || label
    );
  };

  // Products grouped by category
  const productsByCategory = useMemo(() => {
    const map: Record<string, NavProduct[]> = {};
    categories.forEach((cat) => {
      map[cat.id] = products.filter((p) => p.category.toLowerCase() === cat.id.toLowerCase());
    });
    return map;
  }, [categories, products]);

  // Build clean text columns for the active hovered category
  const activeMegaColumns = useMemo((): MegaColumn[] => {
    if (!hoveredTab) return [];

    if (hoveredTab === 'VIEW_ALL') {
      // 'View All' Mega Menu: Group by top print categories
      const cols: MegaColumn[] = [];
      const catsWithProds = categories.slice(0, 4);

      catsWithProds.forEach((cat) => {
        const catProds = productsByCategory[cat.id] || [];
        const items = catProds.slice(0, 7).map((p) => ({
          label: p.title,
          href: `/products?category=${encodeURIComponent(cat.id)}&search=${encodeURIComponent(p.title)}`,
          isNew: p.badge?.toLowerCase().includes('new') || p.badge?.toLowerCase().includes('festive'),
        }));

        cols.push({
          heading: formatCatLabel(cat.label),
          items: items.length > 0
            ? items
            : [{ label: `Shop all ${formatCatLabel(cat.label)}`, href: `/products?category=${encodeURIComponent(cat.id)}` }],
        });
      });

      return cols;
    }

    // Specific Category Mega Menu: Organize products into clean columns of text
    const catProds = productsByCategory[hoveredTab] || [];
    const catObj = categories.find((c) => c.id === hoveredTab);
    const catName = catObj ? formatCatLabel(catObj.label) : hoveredTab;

    if (catProds.length === 0) {
      return [
        {
          heading: `All ${catName}`,
          items: [
            { label: `Shop all ${catName}`, href: `/products?category=${encodeURIComponent(hoveredTab)}` },
            { label: 'Custom Bulk Printing', href: `/products?category=${encodeURIComponent(hoveredTab)}` },
          ],
        },
      ];
    }

    // Split products into 2 to 4 clean columns
    const numCols = catProds.length <= 4 ? 2 : catProds.length <= 8 ? 3 : 4;
    const itemsPerCol = Math.ceil(catProds.length / numCols);
    const cols: MegaColumn[] = [];

    const columnHeadings = [
      `Popular ${catName}`,
      'Finishes & Specialty Formats',
      'Custom Formats & Sizes',
      'Value Packs & Accessories',
    ];

    for (let i = 0; i < numCols; i++) {
      const chunk = catProds.slice(i * itemsPerCol, (i + 1) * itemsPerCol);
      if (chunk.length > 0) {
        cols.push({
          heading: columnHeadings[i] || `Collection ${i + 1}`,
          items: chunk.map((p) => ({
            label: p.title,
            href: `/products?category=${encodeURIComponent(hoveredTab)}&search=${encodeURIComponent(p.title)}`,
            isNew: p.badge?.toLowerCase().includes('new') || p.badge?.toLowerCase().includes('500') || p.badge?.toLowerCase().includes('velvet'),
          })),
        });
      }
    }

    return cols;
  }, [hoveredTab, categories, productsByCategory]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setHoveredTab(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      onMouseLeave={() => setHoveredTab(null)}
    >

      {/* ═══ 2. Main Header Bar (Logo, Search, Actions) ═══ */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '0.65rem clamp(1rem, 2vw, 2.5rem)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          {/* Mobile 3-Lines Button in Header */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="vp-mobile-only"
            aria-label="Open Categories Menu"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.5rem 0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0B2545',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Ayushman Cards & Graphics"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Search Bar */}
          <div style={{ flex: '1 1 480px', maxWidth: '560px' }} className="vp-desktop-only">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #CBD5E1',
                borderRadius: '6px',
                overflow: 'hidden',
                background: '#FFFFFF',
                width: '100%',
              }}
            >
              <input
                type="text"
                placeholder="Search business cards, wedding cards, letterheads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.9rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  color: '#1E1E1E',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  padding: '0.55rem 0.8rem',
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Header Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.2vw, 1.25rem)', flexShrink: 0, marginLeft: 'auto' }}>
            <a
              href="tel:9479784979"
              className="vp-desktop-only"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}
            >
              <span style={{ fontSize: '0.6875rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>Help is here</span>
              <span style={{ fontSize: '0.8125rem', color: '#1E1E1E', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>9479784979</span>
            </a>

            {/* Admin Portal Shortcut for Admins */}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '999px',
                  background: '#0B2545',
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(11,37,69,0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🛡️</span>
                <span className="vp-desktop-only">Admin Portal</span>
                <span className="vp-mobile-only" style={{ fontSize: '0.7rem' }}>Admin</span>
              </Link>
            )}

            {/* My Favourites with live counter */}
            <Link
              href="/dashboard"
              className="vp-desktop-only"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlistCount > 0 ? '#D40000' : 'none'} stroke={wishlistCount > 0 ? '#D40000' : '#1E1E1E'} strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span style={{ fontSize: '0.6875rem', color: '#1E1E1E', fontFamily: "'Inter', sans-serif" }}>
                My Favourites {wishlistCount > 0 ? `(${wishlistCount})` : ''}
              </span>
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  href="/profile"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}
                  title="View & Edit Profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="vp-desktop-only" style={{ fontSize: '0.6875rem', color: '#1E1E1E', fontFamily: "'Inter', sans-serif" }}>
                    {user.name?.split(' ')[0]} (Profile)
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="vp-desktop-only"
                  style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.65rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.45rem 1.25rem',
                  border: '1.5px solid #1E1E1E',
                  borderRadius: '999px',
                  background: 'transparent',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: '#1E1E1E',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            )}

            {/* Cart with distinct items count */}
            <Link
              href="/cart"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', position: 'relative' }}
              aria-label="Cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="vp-desktop-only" style={{ fontSize: '0.6875rem', color: '#1E1E1E', fontFamily: "'Inter', sans-serif" }}>Cart</span>
              {totalItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#D40000',
                    color: '#FFFFFF',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        <div className="vp-mobile-only" style={{ marginTop: '0.65rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#F8FAFC',
              width: '100%',
            }}
          >
            <input
              type="text"
              placeholder="Search business cards, wedding cards, letterheads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8125rem',
                color: '#1E1E1E',
                border: 'none',
                outline: 'none',
                background: 'transparent',
              }}
            />
            <button
              type="submit"
              aria-label="Search"
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: 'none',
                color: '#0B2545',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* ═══ 3. DESKTOP CATEGORY NAVIGATION RIBBON (Clean, Elegant Text Links like Original) ═══ */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          position: 'relative',
        }}
        className="vp-desktop-only"
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 clamp(0.75rem, 1.5vw, 1.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* 'View All' Tab */}
          <div
            onMouseEnter={() => setHoveredTab('VIEW_ALL')}
            style={{ position: 'relative' }}
          >
            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 0.4rem',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.78125rem',
                fontWeight: hoveredTab === 'VIEW_ALL' ? 600 : 400,
                color: hoveredTab === 'VIEW_ALL' ? '#0B2545' : '#374151',
                textDecoration: 'none',
                borderBottom: hoveredTab === 'VIEW_ALL' ? '2px solid #0B2545' : '2px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              View All
            </Link>
          </div>

          {/* Dynamic Category Tabs from Admin Portal (Clean Text Format) */}
          {categories.map((cat, idx) => {
            const isHovered = hoveredTab === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredTab(cat.id)}
                style={{ position: 'relative' }}
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 0.4rem',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78125rem',
                    fontWeight: isHovered ? 600 : 400,
                    color: isHovered ? '#0B2545' : '#374151',
                    textDecoration: 'none',
                    borderBottom: isHovered ? '2px solid #0B2545' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCatLabel(cat.label)}
                </Link>
              </div>
            );
          })}
        </div>

        {/* ═══ 4. MEGA MENU DROPDOWN OVERLAY (Clean Text Columns like Original) ═══ */}
        {hoveredTab && activeMegaColumns.length > 0 && (
          <div
            onMouseEnter={() => setHoveredTab(hoveredTab)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              borderBottom: '2px solid #CBD5E1',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              zIndex: 9999,
              padding: '2rem clamp(1rem, 3vw, 2.5rem)',
              animation: 'fadeInDown 0.15s ease-out',
            }}
          >
            <div
              style={{
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(activeMegaColumns.length, 6)}, 1fr)`,
                gap: '1.75rem',
                alignItems: 'start',
              }}
            >
              {activeMegaColumns.map((col) => (
                <div key={col.heading}>
                  <h4
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#1E1E1E',
                      marginBottom: '0.75rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {col.heading}
                  </h4>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setHoveredTab(null)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8125rem',
                            color: '#4B5563',
                            textDecoration: 'none',
                            transition: 'color 0.15s ease',
                            lineHeight: 1.4,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0B2545';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#4B5563';
                            e.currentTarget.style.textDecoration = 'none';
                          }}
                        >
                          <span>{item.label}</span>
                          {item.isNew && (
                            <span
                              style={{
                                background: '#60B5FF',
                                color: '#002B52',
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                padding: '0.05rem 0.35rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ 5. MOBILE 3-LINE CATEGORY DRAWER / MODAL ═══ */}
      {isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(3px)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          />

          {/* Drawer Panel */}
          <div
            style={{
              position: 'relative',
              width: '88%',
              maxWidth: '360px',
              height: '100%',
              background: '#FFFFFF',
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100000,
              animation: 'slideInLeft 0.22s ease-out',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#0B2545',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '18px' }}>
                  <span style={{ height: '2.5px', background: '#60B5FF', borderRadius: '2px' }}></span>
                  <span style={{ height: '2.5px', background: '#60B5FF', borderRadius: '2px' }}></span>
                  <span style={{ height: '2.5px', background: '#60B5FF', borderRadius: '2px' }}></span>
                </div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Print Categories
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Quick Link to View All */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E2E8F0' }}>
              <Link
                href="/products"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  color: '#0B2545',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>View All Products</span>
                <span>→</span>
              </Link>
            </div>

            {/* Expandable Category Accordion with Clean Product Names */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem 0',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {categories.map((cat) => {
                const isExpanded = mobileExpandedCat === cat.id;
                const prodsInCat = productsByCategory[cat.id] || [];

                return (
                  <div key={cat.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: isExpanded ? '#F8FAFC' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                    >
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                        {formatCatLabel(cat.label)}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>

                    {isExpanded && (
                      <div style={{ background: '#F8FAFC', padding: '0.5rem 1rem 0.75rem 1.25rem' }}>
                        {prodsInCat.length === 0 ? (
                          <Link
                            href={`/products?category=${encodeURIComponent(cat.id)}`}
                            onClick={() => setIsMobileDrawerOpen(false)}
                            style={{ fontSize: '0.8125rem', color: '#4B5563', textDecoration: 'none' }}
                          >
                            Explore {formatCatLabel(cat.label)} →
                          </Link>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {prodsInCat.map((p) => (
                              <li key={p.id}>
                                <Link
                                  href={`/products?category=${encodeURIComponent(cat.id)}&search=${encodeURIComponent(p.title)}`}
                                  onClick={() => setIsMobileDrawerOpen(false)}
                                  style={{
                                    fontSize: '0.8125rem',
                                    color: '#4B5563',
                                    textDecoration: 'none',
                                    display: 'block',
                                  }}
                                >
                                  • {p.title}
                                </Link>
                              </li>
                            ))}
                            <li style={{ marginTop: '0.25rem' }}>
                              <Link
                                href={`/products?category=${encodeURIComponent(cat.id)}`}
                                onClick={() => setIsMobileDrawerOpen(false)}
                                style={{
                                  fontSize: '0.78125rem',
                                  fontWeight: 700,
                                  color: '#0B2545',
                                  textDecoration: 'underline',
                                }}
                              >
                                View all in {formatCatLabel(cat.label)} →
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem',
                    background: '#0B2545',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>🛡️</span> Admin Portal
                </Link>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href="tel:9479784979"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#0B2545',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>📞</span> 9479784979
                </a>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#D40000',
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>🛒</span> Cart ({totalItemCount})
                </Link>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileDrawerOpen(false);
                  }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #FCA5A5',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  🚪 Sign Out ({user.name?.split(' ')[0]})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS Styles for responsive & animations */}
      <style jsx global>{`
        .vp-desktop-only { display: flex !important; }
        .vp-mobile-only { display: none !important; }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 900px) {
          .vp-desktop-only { display: none !important; }
          .vp-mobile-only { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
