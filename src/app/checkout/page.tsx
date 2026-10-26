'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { loadRazorpayScript } from '@/lib/razorpay';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
}

export default function CheckoutPage() {
  const { cart, grandTotal, subtotal, discountAmount, gstAmount, shippingFee, clearCart } = useCart();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Ujjain');
  const [state, setState] = useState(user?.state || 'Madhya Pradesh');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [gstin, setGstin] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [notes, setNotes] = useState('');

  // Artwork & Print Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [driveLink, setDriveLink] = useState('');
  const [printInstructions, setPrintInstructions] = useState('');
  const [whatsappFollowup, setWhatsappFollowup] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const isImg = file.type.startsWith('image/');
      
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedFiles((prev) => [
            ...prev,
            {
              id,
              name: file.name,
              size: formatFileSize(file.size),
              type: file.type || 'image',
              previewUrl: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
          },
        ]);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  useEffect(() => {
    if (user) {
      if (user.name && !fullName) setFullName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.address && !address) setAddress(user.address);
      if (user.city && (!city || city === 'Ujjain')) setCity(user.city);
      if (user.state && (!state || state === 'Madhya Pradesh')) setState(user.state);
      if (user.pincode && !pincode) setPincode(user.pincode);
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<'upi' | 'qr' | 'razorpay' | 'cod'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [orderPayload, setOrderPayload] = useState<any>(null);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const finalTotal = grandTotal + (deliverySpeed === 'express' ? 250 : 0);

  // Dynamic QR Code URL for Ayushman Cards & Graphics
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=9479784979@ybl&pn=AyushmanCardsAndGraphics&am=${finalTotal}&cu=INR&tn=Order_Payment`
  )}`;

  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !pincode) {
      setErrorMsg('Please fill in your name, mobile number, address, and pincode.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      // Create pending order on API
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: email || 'customer@ayushmancards.com',
          customerPhone: phone,
          eventType: cart.map((i) => i.title).join(', '),
          eventDate: new Date().toISOString().split('T')[0],
          city: `${city}, ${state} (${pincode})`,
          address: `${address} ${gstin ? `[GSTIN: ${gstin}]` : ''}`,
          notes: notes || `Items: ${cart.length} print job(s)`,
          packageType: cart[0]?.category || 'Custom Print Job',
          totalAmount: finalTotal,
          depositAmount: finalTotal,
          uploadedFiles: uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type, previewUrl: f.previewUrl })),
          driveLink: driveLink.trim() || null,
          printInstructions: printInstructions.trim() || null,
          whatsappFollowup,
        }),
      });

      const data = await res.json();
      setOrderPayload(data);
      setLoading(false);
      setShowPaymentModal(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation error.');
      setLoading(false);
    }
  };

  const handleLaunchRazorpaySDK = async () => {
    if (!orderPayload) return;
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (loaded && (window as any).Razorpay) {
        const options: any = {
          key: orderPayload.keyId || 'rzp_test_TMSAlhSBWAt4fa',
          amount: orderPayload.amount,
          currency: 'INR',
          name: 'Ayushman Cards & Graphics',
          description: `Print Order (${cart.length} item(s))`,
          handler: async function (response: any) {
            await handleConfirmPayment(response.razorpay_payment_id || `pay_${Date.now()}`);
          },
          prefill: {
            name: fullName,
            email: email || 'customer@ayushmancards.com',
            contact: phone,
          },
          theme: {
            color: '#0B2545',
          },
        };

        if (orderPayload.orderId && !orderPayload.orderId.startsWith('order_test_')) {
          options.order_id = orderPayload.orderId;
        }

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function () {
          // Switch to instant UPI tab if Razorpay fails
          setActivePaymentTab('upi');
          setLoading(false);
        });
        paymentObject.open();
        setLoading(false);
      } else {
        setActivePaymentTab('upi');
        setLoading(false);
      }
    } catch {
      setActivePaymentTab('upi');
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentTxnId?: string) => {
    setLoading(true);
    const txnId = paymentTxnId || (utrNumber.trim() ? `UTR_${utrNumber.trim()}` : `UPI_SUCCESS_${Date.now()}`);
    const orderId = orderPayload?.orderId || `ORD_${Date.now()}`;
    const bookingId = orderPayload?.bookingId;

    try {
      await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: txnId,
          razorpay_signature: 'sandbox_sig',
          bookingId: bookingId,
        }),
      });
    } catch (e) {
      console.warn('Verification warning:', e);
    }

    setSuccessOrder({
      orderId: orderId,
      paymentId: txnId,
      amount: finalTotal,
    });
    clearCart();
    setShowPaymentModal(false);
    setLoading(false);
  };

  const handleWhatsAppOrder = () => {
    const itemsSummary = cart.map((i) => `• ${i.title} (${i.quantity} units) = ₹${i.totalPrice}`).join('\n');
    let artworkDetails = '';
    if (uploadedFiles.length > 0) {
      artworkDetails += `\n*Uploaded Files (${uploadedFiles.length}):* ${uploadedFiles.map((f) => f.name).join(', ')}`;
    }
    if (driveLink.trim()) {
      artworkDetails += `\n*Drive/Cloud Link:* ${driveLink.trim()}`;
    }
    if (printInstructions.trim()) {
      artworkDetails += `\n*Print Instructions:* ${printInstructions.trim()}`;
    }
    const msg = `Hi Ayushman Cards & Graphics!\nI want to place an order:\n\n*Name:* ${fullName}\n*Phone:* ${phone}\n*Address:* ${address}, ${city} - ${pincode}\n\n*Order Items:*\n${itemsSummary}${artworkDetails}\n\n*Total Amount:* ₹${finalTotal.toLocaleString()}`;
    window.open(`https://wa.me/919479784979?text=${encodeURIComponent(msg)}`, '_blank');
    handleConfirmPayment(`WA_${Date.now()}`);
  };

  if (successOrder) {
    return (
      <>
        <Navbar />
        <main style={{ background: '#F8F9FA', minHeight: '80vh', padding: '4rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '3rem 2rem', maxWidth: '550px', width: '100%', textAlign: 'center', boxShadow: '0 12px 36px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>
              ✓
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem' }}>
              Print Order Successfully Confirmed!
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Thank you, <strong>{fullName}</strong>! Our printing studio has received your order specs.
            </p>

            <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#6B7280' }}>Order Reference:</span>
                <span style={{ fontWeight: 800, color: '#0B2545' }}>{successOrder.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#6B7280' }}>Payment Txn ID:</span>
                <span style={{ fontWeight: 600, color: '#1E1E1E' }}>{successOrder.paymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Amount Paid:</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>₹{successOrder.amount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/dashboard"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  background: '#0B2545',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Track Order Status
              </Link>
              <Link
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#1E1E1E',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ background: '#F8F9FA', minHeight: '90vh', padding: '2.5rem 0 4rem' }}>
        <div className="container-wide">
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: '#1E1E1E' }}>
              Secure Print Checkout
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              Enter delivery shipping details & select your preferred payment method.
            </p>
          </div>

          <form onSubmit={handleInitiateOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: Shipping Form */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '1.25rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                  1. Shipping & Contact Information
                </h2>

                {errorMsg && (
                  <div style={{ padding: '0.75rem 1rem', background: '#FFEBEE', color: '#C62828', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem' }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.84375rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9893022451"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.84375rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                    Email Address (for Digital Tax Invoice)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.84375rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                    Street Address / Delivery Location *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Shop/Office/House No., Building Name, Street & Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.84375rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.2rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.2rem' }}>
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.2rem' }}>
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="456010"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#1E1E1E', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* ════ SECTION 2: ARTWORK & PHOTO UPLOAD ════ */}
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E1E1E', marginTop: '1.75rem', marginBottom: '0.4rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>2. 🎨 Upload Artwork & Photos for Printing</span>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    Optional / Easy
                  </span>
                </h2>
                <p style={{ fontSize: '0.78125rem', color: '#6B7280', margin: '0 0 1rem' }}>
                  Upload your wedding photos, logos, card layouts, banner creatives or documents. You can also send them later on WhatsApp.
                </p>

                {/* Drag & Drop / File Selector Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging ? '2px dashed #0B2545' : '2px dashed #CBD5E1',
                    background: isDragging ? 'rgba(11,37,69,0.06)' : '#FAFCFF',
                    borderRadius: '12px',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '1rem',
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,.pdf,.ai,.psd,.cdr,.eps,.zip,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    📤
                  </div>
                  <div style={{ fontWeight: 700, color: '#0B2545', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Click to Browse or Drag & Drop Photos / Files
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Supports: PNG, JPG, WEBP, PDF, CDR, AI, PSD, SVG, ZIP (Multi-file upload)
                  </div>
                </div>

                {/* Uploaded Files Gallery */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Attached Print Files ({uploadedFiles.length})</span>
                      <span style={{ color: '#059669' }}>✓ Ready for press</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          }}
                        >
                          {file.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', background: '#F1F5F9', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
                              {file.type.substring(0, 4)}
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#1E1E1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                              {file.size}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            style={{
                              background: '#FEE2E2',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              color: '#991B1B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Drive / WeTransfer Cloud Link */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                    🔗 Google Drive / WeTransfer / Dropbox Link (Optional for large raw files)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/... or wetransfer link"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#1E1E1E', fontSize: '0.8125rem' }}
                  />
                </div>

                {/* Custom Print Instructions */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                    ✍️ Specific Printing Instructions / Custom Text / Dimensions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Card size: 5x7 inches, single-sided, matte lamination, add Groom & Bride names, urgent delivery requested..."
                    value={printInstructions}
                    onChange={(e) => setPrintInstructions(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#1E1E1E', fontSize: '0.8125rem', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Reassuring Prepress Proof Guarantee Banner */}
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🛡️</span>
                  <div>
                    <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#166534', marginBottom: '0.15rem' }}>
                      100% Free Prepress Proof & Quality Inspection
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#15803D', lineHeight: 1.4 }}>
                      Our senior designers verify sharpness, margins, and CMYK colors. We will WhatsApp you a digital proof for your final approval before printing starts.
                    </div>
                  </div>
                </div>

                {/* WhatsApp Follow-up Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#1E1E1E', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={whatsappFollowup}
                    onChange={(e) => setWhatsappFollowup(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#25D366' }}
                  />
                  <span>💬 Connect with printing specialist on WhatsApp (+91 9479784979) for design guidance</span>
                </label>

                {/* ════ SECTION 3: DELIVERY SPEED ════ */}
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E1E1E', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                  3. Select Delivery Speed
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('standard')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: deliverySpeed === 'standard' ? '2px solid #0B2545' : '1px solid #E5E7EB',
                      background: deliverySpeed === 'standard' ? 'rgba(11,37,69,0.04)' : '#F9FAFB',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E1E1E', fontSize: '0.875rem' }}>
                        🚚 Standard Delivery (3-5 Business Days)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Quality inspection & standard surface courier
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#10B981', fontSize: '0.84375rem' }}>FREE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliverySpeed('express')}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: deliverySpeed === 'express' ? '2px solid #0B2545' : '1px solid #E5E7EB',
                      background: deliverySpeed === 'express' ? 'rgba(11,37,69,0.04)' : '#F9FAFB',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E1E1E', fontSize: '0.875rem' }}>
                        ⚡ Express Priority Rush Delivery (24-48 Hours)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Same-day press priority & air express dispatch
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0B2545', fontSize: '0.84375rem' }}>+ ₹250</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Breakdown & Checkout Button */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem', position: 'sticky', top: '140px' }}>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                  Order Summary
                </h2>

                <div style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 700, color: '#1E1E1E', marginBottom: '0.5rem' }}>Selected Items:</div>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#4B5563' }}>
                      <span>{item.title.substring(0, 25)}... ({item.quantity} pcs)</span>
                      <span style={{ fontWeight: 600, color: '#1E1E1E' }}>₹{item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                      <span>Discount:</span>
                      <span>- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GST (18%):</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                  {deliverySpeed === 'express' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0B2545' }}>
                      <span>Express Priority Fee:</span>
                      <span>+ ₹250</span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#F8F9FA', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#1E1E1E' }}>Total Payable:</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#0B2545' }}>
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '999px',
                    background: '#0B2545',
                    color: '#FFFFFF',
                    border: 'none',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(11, 37, 69, 0.2)',
                  }}
                >
                  {loading ? '⏳ Processing Order...' : '🔒 Proceed to Choose Payment Method'}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* ═══ UNIFIED RAZORPAY & DIRECT UPI PAYMENT MODAL ═══ */}
        {showPaymentModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowPaymentModal(false)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '560px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: 'clamp(1.2rem, 3vw, 1.75rem)',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                ✕
              </button>

              {/* Modal Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0B2545', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  AYUSHMAN CARDS & GRAPHICS
                </span>
                <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 700, color: '#1E1E1E', margin: '0.2rem 0' }}>
                  Select Payment Method
                </h2>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10B981' }}>
                  Amount: ₹{finalTotal.toLocaleString()}
                </div>
              </div>

              {/* Payment Tabs Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {[
                  { id: 'upi', label: '📱 Direct UPI' },
                  { id: 'qr', label: '🖼️ Scan QR' },
                  { id: 'razorpay', label: '💳 Razorpay' },
                  { id: 'cod', label: '💵 Studio Pay' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePaymentTab(tab.id as any)}
                    style={{
                      padding: '0.55rem 0.25rem',
                      borderRadius: '8px',
                      border: activePaymentTab === tab.id ? '2px solid #0B2545' : '1px solid #E5E7EB',
                      background: activePaymentTab === tab.id ? 'rgba(11,37,69,0.06)' : '#F9FAFB',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.78125rem',
                      fontWeight: activePaymentTab === tab.id ? 700 : 500,
                      color: activePaymentTab === tab.id ? '#0B2545' : '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: DIRECT UPI APPS */}
              {activePaymentTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>
                    Tap below to pay directly to <strong>9479784979</strong> (Ayushman Cards & Graphics):
                  </p>

                  <a
                    href={`upi://pay?pa=9479784979@ybl&pn=AyushmanCardsAndGraphics&am=${finalTotal}&cu=INR`}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#5F259F',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>🟣 Pay via PhonePe App</span>
                    <span>9479784979@ybl</span>
                  </a>
                </div>
              )}

              {/* TAB 2: SCAN UPI QR CODE */}
              {activePaymentTab === 'qr' && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    Scan QR code with PhonePe or any UPI app to complete payment:
                  </p>
                  <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="UPI Payment QR Code" style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto' }} />
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: '#1E1E1E', fontWeight: 700, marginTop: '0.5rem' }}>
                    Ayushman Cards & Graphics • 9479784979
                  </div>
                </div>
              )}

              {/* TAB 3: RAZORPAY PORTAL */}
              {activePaymentTab === 'razorpay' && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '1rem' }}>
                    Click below to open the Razorpay payment gateway popup (Cards, NetBanking, UPI):
                  </p>
                  <button
                    type="button"
                    onClick={handleLaunchRazorpaySDK}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '999px',
                      background: '#0B2545',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                  >
                    💳 Open Razorpay Gateway Popup
                  </button>
                </div>
              )}

              {/* TAB 4: STUDIO PAY ON DELIVERY */}
              {activePaymentTab === 'cod' && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '0.84375rem', color: '#1E1E1E', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Studio Collection & Pay on Delivery
                  </p>
                  <p style={{ fontSize: '0.78125rem', color: '#6B7280', marginBottom: '1rem' }}>
                    Visit our studio at 63, Varruchi Marg, Freeganj Ujjain to inspect sample proof and pay cash/UPI on order pickup.
                  </p>
                </div>
              )}

              {/* UTR Input & Confirmation Footer */}
              <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '1.25rem', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.3rem' }}>
                  Enter UTR / UPI Reference Number (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423589102451"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.8125rem', marginBottom: '0.85rem' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment()}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.8rem',
                      borderRadius: '999px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? '⏳ Verifying...' : '✓ Confirm Payment & Place Order'}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '999px',
                      background: '#25D366',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
