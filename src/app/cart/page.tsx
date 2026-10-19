'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    couponCode,
    couponDiscountPercent,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    gstAmount,
    shippingFee,
    grandTotal,
    addToCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponStatus(res);
  };

  const handleAddCrossSell = (title: string, category: string, price: number, image: string) => {
    addToCart({
      productId: `addon-${Date.now()}`,
      title,
      category,
      paperStock: 'Accessory Standard',
      cornerStyle: 'Standard Cut',
      finishOption: 'Standard Finish',
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
      image,
    });
  };

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg-primary)', minHeight: '90vh', padding: '2.5rem 0 4rem' }}>
        <div className="container-wide">
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your Custom Print Shopping Cart
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Review your customized print orders, paper stock specifications, quantity tiers and promo discounts.
            </p>
          </div>

          {cart.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Your print cart is empty!
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                Explore our Vistaprint-style products and design your custom business cards, wedding invitations, photobooks & banners.
              </p>
              <Link
                href="/products"
                style={{
                  display: 'inline-block',
                  padding: '0.8rem 1.75rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #D40000 0%, #990000 100%)',
                  color: '#FFFFFF',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Explore Product Catalog
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: Cart Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      boxShadow: 'var(--shadow-subtle)',
                      alignItems: 'center',
                    }}
                  >
                    {/* Item Thumbnail */}
                    <div style={{ width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Item Details */}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#D40000', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {item.category}
                      </span>
                      <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                        {item.title}
                      </h3>

                      {/* Specs Badge Pill */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.4rem 0' }}>
                        <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                          📄 {item.paperStock}
                        </span>
                        <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                          ✨ {item.finishOption}
                        </span>
                        <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                          ✂️ {item.cornerStyle}
                        </span>
                      </div>

                      {item.customDesign?.companyName && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          Customized for: <strong>{item.customDesign.companyName}</strong> ({item.customDesign.fullName})
                        </div>
                      )}

                      {/* Quantity & Price Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 100)}
                            style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '60px', textAlign: 'center' }}>
                            {item.quantity} units
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 100)}
                            style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.05rem', fontWeight: 800, color: '#D40000' }}>
                            ₹{item.totalPrice.toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add-On Cross-Sell Accessories */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.25rem', marginTop: '0.5rem' }}>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    💡 Frequently Bought Print Accessories & Add-Ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Acrylic Card Holder</div>
                      <div style={{ fontSize: '0.75rem', color: '#D40000', fontWeight: 800 }}>₹250</div>
                      <button
                        onClick={() => handleAddCrossSell('Desktop Acrylic Card Holder', 'Accessory', 250, '/images/visiting_cards/transparent.jpg')}
                        style={{ marginTop: '0.4rem', width: '100%', padding: '0.35rem', borderRadius: '4px', background: '#D40000', color: '#FFF', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Holder
                      </button>
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>50 Matching Envelopes</div>
                      <div style={{ fontSize: '0.75rem', color: '#D40000', fontWeight: 800 }}>₹450</div>
                      <button
                        onClick={() => handleAddCrossSell('50 Gold Foil Printed Envelopes', 'Accessory', 450, '/images/stationery/corporate_envelopes.jpg')}
                        style={{ marginTop: '0.4rem', width: '100%', padding: '0.35rem', borderRadius: '4px', background: '#D40000', color: '#FFF', border: 'none', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Envelopes
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={clearCart}
                    style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Empty Shopping Cart
                  </button>
                  <Link
                    href="/products"
                    style={{ color: '#D40000', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none' }}
                  >
                    + Add More Print Products
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Summary & Checkout */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-subtle)', position: 'sticky', top: '140px' }}>
                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  Order Summary
                </h2>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Have a Promo Code? (Try: FESTIVE20)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.8125rem', textTransform: 'uppercase' }}
                    />
                    <button
                      type="submit"
                      style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#D40000', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponStatus && (
                    <div style={{ fontSize: '0.72rem', marginTop: '0.35rem', color: couponStatus.success ? '#2E7D32' : '#D32F2F', fontWeight: 600 }}>
                      {couponStatus.message}
                    </div>
                  )}
                  {couponCode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', background: 'rgba(46,125,50,0.08)', padding: '0.35rem 0.65rem', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>
                        🎟️ {couponCode} ({couponDiscountPercent}% OFF)
                      </span>
                      <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#D32F2F', fontSize: '0.7rem', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84375rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Print Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                      <span>Promo Discount ({couponDiscountPercent}%):</span>
                      <span style={{ fontWeight: 700 }}>- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>GST (18% Print Services):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{gstAmount.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Express Shipping:</span>
                    <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#2E7D32' : 'var(--text-primary)' }}>
                      {shippingFee === 0 ? 'FREE (Above ₹999)' : `₹${shippingFee}`}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total:</span>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#D40000' }}>
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #D40000 0%, #990000 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(212, 0, 0, 0.3)',
                  }}
                >
                  🚀 Proceed to Secure Checkout
                </button>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
