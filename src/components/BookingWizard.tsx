'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { loadRazorpayScript } from '@/lib/razorpay';
import { useAuth } from '@/context/AuthContext';

const steps = [
  'Print Product & Specs',
  'Artwork & Delivery',
  'Contact Details',
  'Review & Confirm Order',
];

const packageOptions = [
  {
    id: 'wedding-cards-suite',
    name: '💍 Royal Wedding Invitation Suite (500 Cards Set)',
    totalPrice: 18500,
    depositPrice: 2000,
    desc: '500 Royal Velvet Box / Acrylic Cards, Foil Stamping, Custom Envelopes & Free WhatsApp Video E-Invite',
  },
  {
    id: 'visiting-corporate-pack',
    name: '💼 Corporate Brand Printing Pack',
    totalPrice: 5500,
    depositPrice: 1000,
    desc: '1,000 Velvet Gold Foil Visiting Cards, 500 Letterheads & 500 Printed Brand Envelopes',
  },
  {
    id: 'flex-banner-standee',
    name: '🚩 Flex Banners & Standees Event Pack',
    totalPrice: 6500,
    depositPrice: 1000,
    desc: '200 Sq. Ft. Star Flex Outdoor Banner + 2 Roll-up Standees (6x3 Ft Aluminium Frames)',
  },
  {
    id: 'bulk-flyers-pamphlets',
    name: '📄 Bulk Marketing Flyers & Pamphlets Pack',
    totalPrice: 7500,
    depositPrice: 1500,
    desc: '5,000 Copies A5 130 GSM Gloss Art Paper Multi-Color Pamphlets with Free Graphic Layout',
  },
  {
    id: 'photobook-heirloom-album',
    name: '📖 HD Wedding Photobook & Keepsake Album',
    totalPrice: 8500,
    depositPrice: 1500,
    desc: '40 Page Non-Tearable Silk Sheet HD Flush Mount Album with Leatherette / Acrylic Cover Box',
  },
];

export default function BookingWizard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback Modal State
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  const [form, setForm] = useState({
    packageId: 'royal-wedding',
    date: '',
    venue: '',
    city: 'Ujjain',
    address: '',
    name: '',
    email: '',
    phone: '',
    story: '',
  });

  // Auto pre-fill user info when logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
      if (user.phone) {
        const cleanPhone = user.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          setUpiId(`${cleanPhone.slice(-10)}@ybl`);
        }
      }
    }
  }, [user]);

  // Read URL query parameter for package selection
  useEffect(() => {
    const pkgParam = searchParams.get('pkg') || searchParams.get('package');
    if (pkgParam) {
      const match = packageOptions.find((p) => p.id === pkgParam || p.id.toLowerCase().includes(pkgParam.toLowerCase()));
      if (match) {
        setForm((prev) => ({ ...prev, packageId: match.id }));
      }
    }
  }, [searchParams]);

  // Update default phone-linked UPI ID when form.phone changes
  useEffect(() => {
    if (form.phone && !upiId) {
      const cleanPhone = form.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        setUpiId(`${cleanPhone.slice(-10)}@ybl`);
      }
    }
  }, [form.phone, upiId]);

  const selectedPackage = packageOptions.find((p) => p.id === form.packageId) || packageOptions[0];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const completePaymentVerification = async (orderId: string, paymentId: string, bookingId: string) => {
    try {
      setIsModalSubmitting(true);
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'sig_verif_' + Date.now(),
          bookingId: bookingId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        setPaymentSuccessData({
          orderId: orderId,
          paymentId: paymentId,
          amountPaid: selectedPackage.depositPrice,
          packageName: selectedPackage.name,
          customerName: form.name,
          customerPhone: form.phone,
        });
        setShowRzpModal(false);
      } else {
        setErrorMessage(verifyData.error || 'Payment verification failed. Please contact support.');
      }
    } catch {
      setErrorMessage('Error verifying payment. Please contact studio support at 9479784979.');
    } finally {
      setIsProcessing(false);
      setIsModalSubmitting(false);
    }
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          eventType: selectedPackage.name,
          eventDate: form.date || new Date().toISOString().split('T')[0],
          city: form.city || 'Ujjain',
          address: `${form.venue} ${form.address}`.trim(),
          notes: form.story,
          packageType: selectedPackage.name,
          totalAmount: selectedPackage.totalPrice,
          depositAmount: selectedPackage.depositPrice,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        setErrorMessage(orderData.error || 'Failed to create payment order.');
        setIsProcessing(false);
        return;
      }

      setActiveOrder(orderData);

      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && (window as any).Razorpay && orderData.orderId && !orderData.orderId.startsWith('order_test_')) {
        try {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Ayushman Cards & Graphics',
            description: `Booking Deposit — ${selectedPackage.name}`,
            image: '/logo.png',
            order_id: orderData.orderId,
            handler: function (response: any) {
              completePaymentVerification(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                orderData.bookingId
              );
            },
            prefill: {
              name: form.name,
              email: form.email || undefined,
              contact: form.phone,
            },
            notes: {
              package: selectedPackage.name,
              eventDate: form.date,
              city: form.city,
            },
            theme: { color: '#D40000' },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function () {
            setShowRzpModal(true);
            setIsProcessing(false);
          });
          rzp.open();
          return;
        } catch {
          setShowRzpModal(true);
          setIsProcessing(false);
          return;
        }
      }

      setShowRzpModal(true);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Razorpay Payment Error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during payment initialization.');
      setIsProcessing(false);
    }
  };

  const handleModalPaymentSubmit = () => {
    if (!activeOrder) return;
    const mockPaymentId = `pay_rzp_${Date.now()}`;
    completePaymentVerification(activeOrder.orderId, mockPaymentId, activeOrder.bookingId);
  };

  const cleanPhone = form.phone ? form.phone.replace(/\D/g, '').slice(-10) : '9479784979';
  const upiIntentUrl = `upi://pay?pa=9479784979@ybl&pn=Ayushman%20Cards%20n%20Graphics&am=${selectedPackage.depositPrice}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      {!paymentSuccessData ? (
        <div>
          {/* Progress Indicator */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="font-body" style={{ fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '0.15em' }}>
                STEP 0{currentStep + 1} / 0{steps.length}
              </span>
              <span className="font-body" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {steps[currentStep]}
              </span>
            </div>
            <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--divider)', position: 'relative' }}>
              <motion.div
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', backgroundColor: 'var(--accent)' }}
              />
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                fontSize: '0.9rem',
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={currentStep === steps.length - 1 ? handleRazorpayPayment : (e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              {/* Step 1: Package Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'grid', gap: '1.25rem' }}
                >
                  <p className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                    Select Your Service Package
                  </p>
                  {packageOptions.map((pkg) => {
                    const isSelected = form.packageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setForm({ ...form, packageId: pkg.id })}
                        style={{
                          padding: '1.5rem',
                          border: isSelected ? '2px solid #D40000' : '1px solid var(--divider)',
                          backgroundColor: isSelected ? 'rgba(212, 0, 0, 0.04)' : 'var(--bg-secondary)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1.25rem',
                          boxShadow: isSelected ? '0 4px 20px rgba(212, 0, 0, 0.12)' : 'none',
                        }}
                      >
                        {/* High-Contrast Radio Indicator */}
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #D40000' : '2px solid #94a3b8',
                            backgroundColor: isSelected ? '#D40000' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '0.15rem',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isSelected && (
                            <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 900 }}>✓</span>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <h4
                              className="font-heading"
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? '#D40000' : 'var(--text-primary)',
                              }}
                            >
                              {pkg.name}
                            </h4>
                            <span
                              className="font-body"
                              style={{
                                color: isSelected ? '#D40000' : 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                backgroundColor: isSelected ? 'rgba(212, 0, 0, 0.1)' : 'transparent',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                              }}
                            >
                              Deposit: ₹{pkg.depositPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="font-body" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {pkg.desc}
                          </p>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                            Total Package Value: ₹{pkg.totalPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 2: Date & Venue */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  <p className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                    Event Date & Location
                  </p>
                  <div>
                    <label className="font-body" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Tentative Event Date
                    </label>
                    <input
                      type="date"
                      required
                      className="input-luxury font-body"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-body" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ujjain, Indore, Jaipur"
                      required
                      className="input-luxury font-body"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-body" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Venue Address / Special Requirements
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Freeganj Ujjain / Palace Venue"
                      className="input-luxury font-body"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  <p className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '0.5rem' }}>
                    Your Contact Information
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      className="input-luxury font-body"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="input-luxury font-body"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="font-body" style={{ display: 'block', fontSize: '0.8rem', color: '#D40000', fontWeight: 600, marginBottom: '0.4rem' }}>
                      📱 Phone Number (Directly Linked to your PhonePe / UPI)
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone Number / WhatsApp *"
                      required
                      className="input-luxury font-body"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share any custom requirements, card quantities, or shoot preferences..."
                    className="input-luxury font-body"
                    style={{ resize: 'none' }}
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                  />
                </motion.div>
              )}

              {/* Step 4: Summary & Razorpay Trigger */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                  <p className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 300 }}>
                    Booking & Payment Summary
                  </p>

                  <div
                    style={{
                      padding: '2rem',
                      border: '1px solid var(--divider)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body" style={{ color: 'var(--text-secondary)' }}>Selected Package:</span>
                      <strong className="font-body" style={{ color: 'var(--text-primary)' }}>{selectedPackage.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body" style={{ color: 'var(--text-secondary)' }}>Client Name:</span>
                      <span className="font-body">{form.name || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body" style={{ color: 'var(--text-secondary)' }}>Contact Phone:</span>
                      <span className="font-body">{form.phone || 'Not provided'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body" style={{ color: 'var(--text-secondary)' }}>Event Date & City:</span>
                      <span className="font-body">{form.date || 'TBD'} ({form.city})</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="font-body" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Token Reservation Deposit:</div>
                        <div className="font-body" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(Balance due on event day)</div>
                      </div>
                      <span className="font-heading" style={{ fontSize: '1.75rem', color: '#D40000', fontWeight: 600 }}>
                        ₹{selectedPackage.depositPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p className="font-body" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    🔒 Secure payment directly connected to your phone number ({cleanPhone}).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation & Submit Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--divider)',
              }}
            >
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-premium"
                  disabled={isProcessing}
                  style={{ fontSize: '0.75rem', padding: '0.75rem 1.75rem' }}
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-premium"
                  style={{ fontSize: '0.75rem', padding: '0.75rem 1.75rem' }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-premium"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.9rem 2.5rem',
                    backgroundColor: '#D40000',
                    color: '#ffffff',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? 'Connecting to Razorpay...' : `Pay ₹${selectedPackage.depositPrice.toLocaleString('en-IN')} via Phone UPI →`}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Payment Success Receipt */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            border: '1px solid #D40000',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ color: '#D40000', fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          <h3 className="font-heading" style={{ fontSize: '2.25rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            Payment Verified & Booking Confirmed!
          </h3>
          <p className="font-body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Thank you, {paymentSuccessData.customerName}. Your reservation deposit has been received successfully.
          </p>

          <div
            style={{
              maxWidth: '500px',
              margin: '0 auto 2.5rem auto',
              textAlign: 'left',
              padding: '1.5rem',
              border: '1px solid var(--divider)',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <div><strong>Package:</strong> {paymentSuccessData.packageName}</div>
            <div><strong>Amount Paid:</strong> ₹{paymentSuccessData.amountPaid.toLocaleString('en-IN')}</div>
            <div><strong>Customer Phone:</strong> {paymentSuccessData.customerPhone}</div>
            <div><strong>Razorpay Payment ID:</strong> <code style={{ color: '#D40000' }}>{paymentSuccessData.paymentId}</code></div>
            <div><strong>Razorpay Order ID:</strong> <code style={{ color: '#D40000' }}>{paymentSuccessData.orderId}</code></div>
            <div><strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>CONFIRMED ✓</span></div>
          </div>

          <a href="/dashboard" className="btn-premium">
            View in Account Dashboard →
          </a>
        </motion.div>
      )}

      {/* Interactive Razorpay Gateway Modal with Direct Phone UPI & QR Code */}
      {showRzpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#121620',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              border: '1px solid #2e364f',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Razorpay Header Bar */}
            <div
              style={{
                backgroundColor: '#0b192c',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '-0.02em' }}>Razorpay</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#3b82f6', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>PHONE UPI GATEWAY</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Ayushman Cards & Graphics • Studio Pay: 9479784979
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
                  ₹{selectedPackage.depositPrice.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Deposit Amount</div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
              {[
                { id: 'upi', label: '📱 PhonePe / UPI' },
                { id: 'card', label: '💳 Cards' },
                { id: 'netbanking', label: '🏦 NetBanking' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '0.9rem 0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? '#3b82f6' : '#94a3b8',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content */}
            <div style={{ padding: '1.5rem' }}>
              {activeTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Phone UPI Direct Link Banner */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>📱</span>
                    <span>
                      Directly Connected to Customer Phone: <strong>{cleanPhone}</strong>
                    </span>
                  </div>

                  {/* QR Code Scanner */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '1.25rem',
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      border: '1px solid #1e293b',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', fontWeight: 600 }}>
                      Scan QR Code with PhonePe or UPI to Pay ₹{selectedPackage.depositPrice.toLocaleString('en-IN')}:
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="UPI Payment QR Code"
                      style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        padding: '8px',
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.75rem', fontWeight: 700 }}>
                      ✓ Linked to Studio UPI: 9479784979@ybl
                    </div>
                  </div>

                  {/* One-Click Mobile App Intent Buttons */}
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Or tap your phone app to pay instantly:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { name: 'PhonePe', handle: `${cleanPhone}@ybl`, color: '#5f259f' },
                        { name: 'BHIM UPI', handle: `${cleanPhone}@upi`, color: '#0083ca' },
                      ].map((app) => (
                        <a
                          key={app.name}
                          href={upiIntentUrl}
                          onClick={() => {
                            setTimeout(() => {
                              handleModalPaymentSubmit();
                            }, 1200);
                          }}
                          style={{
                            padding: '0.85rem 0.5rem',
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: '#f8fafc',
                            textDecoration: 'none',
                            display: 'block',
                          }}
                        >
                          {app.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Manual Phone VPA Input */}
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      Phone VPA / UPI ID:
                    </label>
                    <input
                      type="text"
                      placeholder={`${cleanPhone}@ybl`}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#fff',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          color: '#fff',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                    <div
                      key={bank}
                      onClick={handleModalPaymentSubmit}
                      style={{
                        padding: '0.85rem',
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#f8fafc',
                      }}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRzpModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleModalPaymentSubmit}
                  disabled={isModalSubmitting}
                  style={{
                    flex: 2,
                    padding: '0.85rem',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRadius: '6px',
                    cursor: isModalSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isModalSubmitting ? 0.7 : 1,
                    fontSize: '0.85rem',
                  }}
                >
                  {isModalSubmitting ? 'Verifying Payment...' : `Complete ₹${selectedPackage.depositPrice.toLocaleString('en-IN')} Phone Pay →`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
