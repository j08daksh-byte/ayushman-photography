'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export interface PaperOption {
  label: string;
  extraPrice: number;
}

export interface QuantityOption {
  qty: number;
  multiplier: number;
}

export interface ProductModalItem {
  id: string;
  name: string;
  image: string;
  badge?: string;
  price?: string;
  unit?: string;
  category?: string;
  description?: string;
  features?: string[];
  paperOptions?: PaperOption[];
  quantityOptions?: QuantityOption[];
  cornerOptions?: string[];
}

interface ProductModalProps {
  product: ProductModalItem | null;
  onClose: () => void;
}

const DEFAULT_PAPER_OPTIONS: PaperOption[] = [
  { label: '350 GSM Premium Matte', extraPrice: 0 },
  { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
  { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
  { label: 'Spot UV Selective Coating', extraPrice: 150 },
  { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
];

const DEFAULT_QUANTITY_OPTIONS: QuantityOption[] = [
  { qty: 100, multiplier: 1 },
  { qty: 250, multiplier: 2.2 },
  { qty: 500, multiplier: 3.8 },
  { qty: 1000, multiplier: 6.5 },
];

const DEFAULT_CORNER_OPTIONS = ['Standard Cut', 'Rounded Corners'];

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  const activePaperOptions = (product?.paperOptions && product.paperOptions.length > 0)
    ? product.paperOptions
    : DEFAULT_PAPER_OPTIONS;

  const activeQuantityOptions = (product?.quantityOptions && product.quantityOptions.length > 0)
    ? product.quantityOptions
    : DEFAULT_QUANTITY_OPTIONS;

  const activeCornerOptions = (product?.cornerOptions && product.cornerOptions.length > 0)
    ? product.cornerOptions
    : DEFAULT_CORNER_OPTIONS;

  const [selectedQty, setSelectedQty] = useState(activeQuantityOptions[0]?.qty || 100);
  const [selectedPaper, setSelectedPaper] = useState(activePaperOptions[0]);
  const [cornerStyle, setCornerStyle] = useState(activeCornerOptions[0] || 'Standard Cut');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      const papers = (product.paperOptions && product.paperOptions.length > 0) ? product.paperOptions : DEFAULT_PAPER_OPTIONS;
      const qtys = (product.quantityOptions && product.quantityOptions.length > 0) ? product.quantityOptions : DEFAULT_QUANTITY_OPTIONS;
      const corners = (product.cornerOptions && product.cornerOptions.length > 0) ? product.cornerOptions : DEFAULT_CORNER_OPTIONS;
      setSelectedPaper(papers[0]);
      setSelectedQty(qtys[0]?.qty || 100);
      setCornerStyle(corners[0] || 'Standard Cut');
    }
  }, [product?.id]);

  if (!product) return null;

  // Base price extraction
  const rawPriceMatch = product.price?.replace(/[^0-9]/g, '');
  const basePrice = rawPriceMatch ? parseInt(rawPriceMatch, 10) : 200;

  const currentQtyObj = activeQuantityOptions.find((q) => q.qty === selectedQty) || activeQuantityOptions[0];
  const paperExtra = Number(selectedPaper?.extraPrice) || 0;
  const calculatedPrice = Math.round(basePrice * (currentQtyObj?.multiplier || 1) + paperExtra);

  const handleAddToCart = (e: React.MouseEvent, redirect: boolean = false) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      title: product.name,
      category: product.category || 'Visiting Cards',
      paperStock: selectedPaper.label,
      cornerStyle: cornerStyle,
      finishOption: selectedPaper.extraPrice > 0 ? selectedPaper.label : 'Standard Matte',
      quantity: selectedQty,
      unitPrice: Math.round(calculatedPrice / selectedQty),
      totalPrice: calculatedPrice,
      image: product.image,
    });

    if (redirect) {
      window.location.href = '/checkout';
    } else {
      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          border: '1px solid #E5E7EB',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#F3F4F6',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4B5563',
          }}
        >
          ✕
        </button>

        {/* Modal Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem',
            padding: 'clamp(1rem, 3vw, 1.75rem)',
          }}
        >
          {/* Left: Image */}
          <div>
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#F8F9FA',
                border: '1px solid #E5E7EB',
                marginBottom: '1rem',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6B7280', textAlign: 'center' }}>
              ✓ High resolution offset & digital print output
            </div>
          </div>

          {/* Right: Customization Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span
                style={{
                  background: '#B2E4F7',
                  color: '#0B2545',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {product.badge || 'PRINT BEST SELLER'}
              </span>
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#1E1E1E',
                  marginTop: '0.4rem',
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </h2>
            </div>

            {/* Quantity Selector */}
            {activeQuantityOptions.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.4rem' }}>
                  Select Print Quantity:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activeQuantityOptions.length, 4)}, 1fr)`, gap: '0.4rem' }}>
                  {activeQuantityOptions.map((q) => (
                    <button
                      key={q.qty}
                      type="button"
                      onClick={() => setSelectedQty(q.qty)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '6px',
                        border: selectedQty === q.qty ? '2px solid #0B2545' : '1px solid #E5E7EB',
                        background: selectedQty === q.qty ? 'rgba(11,37,69,0.06)' : '#FFFFFF',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8125rem',
                        fontWeight: selectedQty === q.qty ? 700 : 500,
                        color: selectedQty === q.qty ? '#0B2545' : '#4B5563',
                        cursor: 'pointer',
                      }}
                    >
                      {q.qty} Pcs
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paper Finish Selector */}
            {activePaperOptions.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.4rem' }}>
                  Paper Finish & Coating:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {activePaperOptions.map((p) => {
                    const isSelected = selectedPaper?.label === p.label;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSelectedPaper(p)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #0B2545' : '1px solid #E5E7EB',
                          background: isSelected ? 'rgba(11,37,69,0.06)' : '#FFFFFF',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.8125rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          color: '#1E1E1E',
                        }}
                      >
                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{p.label}</span>
                        {p.extraPrice > 0 ? (
                          <span style={{ color: '#0B2545', fontWeight: 700 }}>+₹{p.extraPrice}</span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Included</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Corner Cutting */}
            {activeCornerOptions.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.4rem' }}>
                  Corner Style:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activeCornerOptions.length, 3)}, 1fr)`, gap: '0.4rem' }}>
                  {activeCornerOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCornerStyle(c)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: '6px',
                        border: cornerStyle === c ? '2px solid #0B2545' : '1px solid #E5E7EB',
                        background: cornerStyle === c ? 'rgba(11,37,69,0.06)' : '#FFFFFF',
                        fontSize: '0.8125rem',
                        fontWeight: cornerStyle === c ? 700 : 500,
                        color: '#1E1E1E',
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Box */}
            <div
              style={{
                background: '#F8F9FA',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #E5E7EB',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total for {selectedQty} pcs:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0B2545', fontFamily: "'Inter', sans-serif" }}>
                  ₹{calculatedPrice.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                (₹{(calculatedPrice / selectedQty).toFixed(2)}/pc)
              </div>
            </div>

            {/* Toast Notification */}
            {addedToast && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✓ Added to cart! Continue browsing for more items.
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '999px',
                  background: '#0B2545',
                  color: '#FFFFFF',
                  border: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(11,37,69,0.2)',
                }}
              >
                🛒 Add to Cart & Continue Shopping
              </button>

              <button
                type="button"
                onClick={(e) => handleAddToCart(e, true)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  color: '#1E1E1E',
                  border: '1.5px solid #1E1E1E',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.84375rem',
                  cursor: 'pointer',
                }}
              >
                ⚡ Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
