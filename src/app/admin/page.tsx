'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  expiryDate?: string;
  usageCount: number;
}

const DEFAULT_COUPONS: CouponItem[] = [
  { id: 'c-1', code: 'SAVE5', discountType: 'PERCENT', discountValue: 5, minOrderAmount: 10000, isActive: true, usageCount: 42 },
  { id: 'c-2', code: 'FESTIVE10', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 15000, isActive: true, usageCount: 19 },
  { id: 'c-3', code: 'ROYAL500', discountType: 'FLAT', discountValue: 500, minOrderAmount: 5000, isActive: true, usageCount: 28 },
];

export default function AdminPortalPage() {
  const { user, login, logout, refreshUser } = useAuth();

  // Admin Login State (if not logged in as admin)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [bannersList, setBannersList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<CouponItem[]>(DEFAULT_COUPONS);
  const [stats, setStats] = useState<any>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, paidOrders: 0 });
  const [loadingData, setLoadingData] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'customers' | 'discounts' | 'inquiries' | 'staff' | 'settings'
  >('dashboard');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productCatFilter, setProductCatFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CLIENT', phone: '' });
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<{
    title: string;
    category: string;
    badge: string;
    price: string;
    numericPrice: number;
    unit: string;
    image: string;
    description: string;
    features: string;
    customizerId: string;
    isActive: boolean;
    paperOptions: { label: string; extraPrice: number }[];
    quantityOptions: { qty: number; multiplier: number }[];
    cornerOptions: string;
  }>({
    title: '',
    category: 'Wedding Cards',
    badge: '100 PCS @ ₹3,500',
    price: '₹3,500',
    numericPrice: 3500,
    unit: '100 Cards',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    description: '',
    features: 'High Quality Offset Print\nFast Dispatch in 3 Days\nPremium Cardstock',
    customizerId: 'wedding-card',
    isActive: true,
    paperOptions: [
      { label: '350 GSM Premium Matte', extraPrice: 0 },
      { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
      { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
      { label: 'Spot UV Selective Coating', extraPrice: 150 },
      { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
    ],
    quantityOptions: [
      { qty: 100, multiplier: 1 },
      { qty: 250, multiplier: 2.2 },
      { qty: 500, multiplier: 3.8 },
      { qty: 1000, multiplier: 6.5 },
    ],
    cornerOptions: 'Standard Cut, Rounded Corners',
  });

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    label: '',
    icon: '🏷️',
    description: '',
  });

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [isUploadingBannerImg, setIsUploadingBannerImg] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: 'ROYAL COLLECTION 2026',
    image: '/images/wedding/scroll_royal_blue_velvet.png',
    link: '/products?category=Wedding Cards',
    buttonText: 'Explore Collection',
    displayOrder: 1,
    isActive: true,
  });

  // Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<CouponItem>>({
    code: '',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderAmount: 2000,
    isActive: true,
  });

  // Admin & Store Settings State
  const [settingProprietor, setSettingProprietor] = useState('Rajesh Saatoliya');
  const [settingShopName, setSettingShopName] = useState('Ayushman Cards & Graphics');
  const [settingName, setSettingName] = useState('');
  const [settingEmail, setSettingEmail] = useState('');
  const [settingPhone, setSettingPhone] = useState('9479784979');
  const [settingPhoneSecondary, setSettingPhoneSecondary] = useState('9893022451');
  const [settingAddress, setSettingAddress] = useState('63, Varruchi Marg, Freeganj Ujjain');
  const [settingCity, setSettingCity] = useState('Ujjain');
  const [settingState, setSettingState] = useState('Madhya Pradesh');
  const [settingPincode, setSettingPincode] = useState('456001');
  const [settingWhatsAppNumber, setSettingWhatsAppNumber] = useState('+919479784979');
  const [settingWhatsAppMsg, setSettingWhatsAppMsg] = useState('Hello Ayushman Cards & Graphics Press, I would like to inquire about wedding cards, visiting cards, flex banners & printing services.');
  const [settingInstagramUrl, setSettingInstagramUrl] = useState('https://instagram.com/ayushmancards_ujjain');
  const [settingInstagramHandle, setSettingInstagramHandle] = useState('@ayushmancards_ujjain');
  const [settingFacebookUrl, setSettingFacebookUrl] = useState('https://facebook.com/ayushmancards');
  const [settingYouTubeUrl, setSettingYouTubeUrl] = useState('https://youtube.com/@ayushmancards');
  const [settingNewPassword, setSettingNewPassword] = useState('');
  const [settingConfirmPassword, setSettingConfirmPassword] = useState('');
  const [settingSaving, setSettingSaving] = useState(false);
  const [settingMessage, setSettingMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const [ordersRes, usersRes, inquiriesRes, productsRes, categoriesRes, bannersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/users'),
        fetch('/api/admin/inquiries').catch(() => fetch('/api/inquiries')),
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/banners'),
        fetch('/api/admin/settings'),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders || []);
          setStats(ordersData.stats || {});
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsersList(usersData.users || []);
        }
      }

      if (inquiriesRes && inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        if (inquiriesData.success) {
          setInquiries(inquiriesData.inquiries || []);
        }
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (productsData.success) {
          setProductsList(productsData.products || []);
        }
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          setCategoriesList(categoriesData.categories || []);
        }
      }

      if (bannersRes && bannersRes.ok) {
        const bannersData = await bannersRes.json();
        if (bannersData.success) {
          setBannersList(bannersData.banners || []);
        }
      }

      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          const s = settingsData.settings;
          setSettingProprietor(s.proprietor || 'Rajesh Saatoliya');
          setSettingShopName(s.shopName || 'Ayushman Cards & Graphics');
          setSettingAddress(s.address || '63, Varruchi Marg, Freeganj Ujjain');
          setSettingCity(s.city || 'Ujjain');
          setSettingState(s.state || 'Madhya Pradesh');
          setSettingPincode(s.pincode || '456001');
          setSettingPhone(s.phonePrimary || '9479784979');
          setSettingPhoneSecondary(s.phoneSecondary || '9893022451');
          setSettingWhatsAppNumber(s.whatsappNumber || '+919479784979');
          setSettingWhatsAppMsg(s.whatsappMessage || '');
          setSettingInstagramUrl(s.instagramUrl || 'https://instagram.com/ayushmancards_ujjain');
          setSettingInstagramHandle(s.instagramHandle || '@ayushmancards_ujjain');
          setSettingFacebookUrl(s.facebookUrl || 'https://facebook.com/ayushmancards');
          setSettingYouTubeUrl(s.youtubeUrl || 'https://youtube.com/@ayushmancards');
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchAdminData();
      setSettingName(user.name || '');
      setSettingEmail(user.email || '');
    }
  }, [user]);

  // Order Lifecycle Counters
  const lifecycleCounts = useMemo(() => {
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      const st = (o.status || 'PENDING').toUpperCase();
      if (st.includes('CANCEL')) counts.CANCELLED++;
      else if (st.includes('DELIVER')) counts.DELIVERED++;
      else if (st.includes('SHIP')) counts.SHIPPED++;
      else if (st.includes('PRINT') || st.includes('PROCESS')) counts.PROCESSING++;
      else if (st.includes('CONFIRM') || o.paymentStatus === 'PAID') counts.CONFIRMED++;
      else counts.PENDING++;
    });
    return counts;
  }, [orders]);

  // Calculated Metrics
  const calculatedMetrics = useMemo(() => {
    const paidRevenue = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidCount = orders.filter((o) => o.paymentStatus === 'PAID').length;
    const avgOrderVal = paidCount > 0 ? Math.round(paidRevenue / paidCount) : 0;
    const pendingFulfillment = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const clientCount = usersList.filter((u) => u.role !== 'ADMIN').length;

    return {
      paidRevenue,
      avgOrderVal,
      pendingFulfillment,
      clientCount,
    };
  }, [orders, usersList]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await login({ email: adminEmail, password: adminPassword });
      if (res && res.success) {
        window.location.reload();
      } else {
        setLoginError(res?.error || 'Invalid administrator credentials.');
      }
    } catch {
      setLoginError('Network or authorization error.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setActionNotice(`✓ Order #${orderId.slice(-6)} status set to ${newStatus}`);
        setTimeout(() => setActionNotice(null), 3000);
        fetchAdminData();
      }
    } catch {
      alert('Error updating order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, paymentStatus }),
      });
      if (res.ok) {
        setActionNotice(`✓ Payment status updated to ${paymentStatus}`);
        setTimeout(() => setActionNotice(null), 3000);
        fetchAdminData();
      }
    } catch {
      alert('Error updating payment status');
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setUploadError(null);
    setProductForm({
      title: '',
      category: categoriesList[0]?.id || 'Business Cards',
      badge: '100 PCS @ ₹2,400',
      price: '₹2,400',
      numericPrice: 2400,
      unit: '100 Cards',
      image: '/images/visiting_cards/card_500gsm_velvet.jpg',
      description: '',
      features: 'High Quality Offset Print\nFast Dispatch in 3 Days\nPremium Cardstock',
      customizerId: 'visiting-card',
      isActive: true,
      paperOptions: [
        { label: '350 GSM Premium Matte', extraPrice: 0 },
        { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
        { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
        { label: 'Spot UV Selective Coating', extraPrice: 150 },
        { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
      ],
      quantityOptions: [
        { qty: 100, multiplier: 1 },
        { qty: 250, multiplier: 2.2 },
        { qty: 500, multiplier: 3.8 },
        { qty: 1000, multiplier: 6.5 },
      ],
      cornerOptions: 'Standard Cut, Rounded Corners',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setUploadError(null);
    setProductForm({
      title: prod.title || '',
      category: prod.category || 'Business Cards',
      badge: prod.badge || '',
      price: prod.price || `₹${prod.numericPrice || 0}`,
      numericPrice: prod.numericPrice || 0,
      unit: prod.unit || '100 Cards',
      image: prod.image || '',
      description: prod.description || '',
      features: Array.isArray(prod.features) ? prod.features.join('\n') : (prod.features || ''),
      customizerId: prod.customizerId || 'visiting-card',
      isActive: prod.isActive !== false,
      paperOptions: Array.isArray(prod.paperOptions) && prod.paperOptions.length > 0
        ? prod.paperOptions.map((p: any) => ({ label: p.label || '', extraPrice: Number(p.extraPrice) || 0 }))
        : [
            { label: '350 GSM Premium Matte', extraPrice: 0 },
            { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
            { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
            { label: 'Spot UV Selective Coating', extraPrice: 150 },
            { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
          ],
      quantityOptions: Array.isArray(prod.quantityOptions) && prod.quantityOptions.length > 0
        ? prod.quantityOptions.map((q: any) => ({ qty: Number(q.qty) || 100, multiplier: Number(q.multiplier) || 1 }))
        : [
            { qty: 100, multiplier: 1 },
            { qty: 250, multiplier: 2.2 },
            { qty: 500, multiplier: 3.8 },
            { qty: 1000, multiplier: 6.5 },
          ],
      cornerOptions: Array.isArray(prod.cornerOptions) && prod.cornerOptions.length > 0
        ? prod.cornerOptions.join(', ')
        : 'Standard Cut, Rounded Corners',
    });
    setShowProductModal(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setProductForm((prev) => ({ ...prev, image: base64Data }));

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data, folder: 'ayushman_products' }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setProductForm((prev) => ({ ...prev, image: data.url }));
            setActionNotice('✓ Image uploaded to Cloud CDN successfully!');
            setTimeout(() => setActionNotice(null), 3000);
          }
        } catch {
          // fallback
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingImage(false);
      setUploadError('Failed to read image file.');
    }
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = productForm.features
        ? (Array.isArray(productForm.features)
            ? productForm.features
            : productForm.features.split('\n').map((s: string) => s.trim()).filter(Boolean))
        : [];

      const cornersArray = productForm.cornerOptions
        ? (Array.isArray(productForm.cornerOptions)
            ? productForm.cornerOptions
            : productForm.cornerOptions.split(',').map((s: string) => s.trim()).filter(Boolean))
        : ['Standard Cut', 'Rounded Corners'];

      const numPrice = Number(productForm.numericPrice) || 0;
      const formattedPrice = `₹${numPrice.toLocaleString()}`;

      const payload = {
        ...productForm,
        id: editingProduct ? editingProduct.id : undefined,
        price: formattedPrice,
        numericPrice: numPrice,
        badge: productForm.badge || `100 PCS @ ${formattedPrice}`,
        unit: productForm.unit || '100 Cards',
        features: featuresArray,
        paperOptions: (productForm.paperOptions || []).filter((p) => p.label.trim() !== ''),
        quantityOptions: (productForm.quantityOptions || []).filter((q) => Number(q.qty) > 0),
        cornerOptions: cornersArray,
        isActive: productForm.isActive !== false,
      };

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowProductModal(false);
        setActionNotice(`✓ Product "${productForm.title}" saved successfully!`);
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('catalogUpdated'));
          localStorage.setItem('ayushman_catalog_updated_at', Date.now().toString());
        }
        await fetchAdminData();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch {
      alert('Error saving product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove it from the database and website.')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setProductsList((prev) => prev.filter((p) => p.id !== productId));
        setActionNotice('✓ Product permanently removed from store & database.');
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('catalogUpdated'));
          localStorage.setItem('ayushman_catalog_updated_at', Date.now().toString());
        }
        await fetchAdminData();
      } else {
        alert(data.error || `Failed to delete product (Status: ${res.status}). Please check admin login.`);
      }
    } catch (err: any) {
      alert(`Error deleting product: ${err?.message || err}`);
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ id: '', label: '', icon: '🏷️', description: '' });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      label: cat.label,
      icon: cat.icon || '🏷️',
      description: cat.description || '',
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.label.trim()) {
      alert('Category label is required.');
      return;
    }

    const autoId = categoryForm.id.trim() || categoryForm.label.trim().replace(/^[^\w\s]+/u, '').trim() || `cat_${Date.now()}`;
    const payload = {
      ...categoryForm,
      id: autoId,
      label: categoryForm.label.trim(),
    };

    try {
      const res = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setShowCategoryModal(false);
        setActionNotice(`✓ Category "${payload.label}" saved to database!`);
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('catalogUpdated'));
          localStorage.setItem('ayushman_catalog_updated_at', Date.now().toString());
        }
        await fetchAdminData();
      } else {
        alert(data.error || `Failed to save category (Status: ${res.status}). Please check admin login.`);
      }
    } catch (err: any) {
      alert(`Error saving category: ${err?.message || err}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryId}"? Products in this category will remain but the category tag will be removed.`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(categoryId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
        setActionNotice('✓ Category removed from store & database.');
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('catalogUpdated'));
          localStorage.setItem('ayushman_catalog_updated_at', Date.now().toString());
        }
        await fetchAdminData();
      } else {
        alert(data.error || `Failed to delete category (Status: ${res.status}). Please check admin login.`);
      }
    } catch (err: any) {
      alert(`Error deleting category: ${err?.message || err}`);
    }
  };

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerUploadError(null);
    setBannerForm({
      title: '',
      subtitle: '',
      badge: 'ROYAL COLLECTION 2026',
      image: '/images/wedding/scroll_royal_blue_velvet.png',
      link: '/products?category=Wedding Cards',
      buttonText: 'Explore Now',
      displayOrder: (bannersList.length || 0) + 1,
      isActive: true,
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (bnr: any) => {
    setEditingBanner(bnr);
    setBannerUploadError(null);
    setBannerForm({
      title: bnr.title || '',
      subtitle: bnr.subtitle || '',
      badge: bnr.badge || '',
      image: bnr.image || '/images/wedding/scroll_royal_blue_velvet.png',
      link: bnr.link || '/products',
      buttonText: bnr.buttonText || 'Explore Now',
      displayOrder: bnr.displayOrder || 1,
      isActive: bnr.isActive !== false,
    });
    setShowBannerModal(true);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBannerImg(true);
    setBannerUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setBannerForm((prev) => ({ ...prev, image: base64Data }));

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data, folder: 'ayushman_hero_banners' }),
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setBannerForm((prev) => ({ ...prev, image: data.url }));
            setActionNotice('✓ Banner image uploaded to CDN successfully!');
            setTimeout(() => setActionNotice(null), 3000);
          }
        } catch {
          // fallback
        } finally {
          setIsUploadingBannerImg(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingBannerImg(false);
      setBannerUploadError('Failed to read image file.');
    }
  };

  const handleSaveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...bannerForm,
        id: editingBanner ? editingBanner.id : undefined,
      };

      const res = await fetch('/api/admin/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowBannerModal(false);
        setActionNotice(`✓ Hero Banner "${bannerForm.title || 'Slide'}" saved successfully!`);
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bannersUpdated'));
          localStorage.setItem('ayushman_banners_updated_at', Date.now().toString());
        }
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to save hero banner');
      }
    } catch {
      alert('Error saving hero banner.');
    }
  };

  const handleToggleBannerActive = async (banner: any) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: banner.isActive === false }),
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bannersUpdated'));
          localStorage.setItem('ayushman_banners_updated_at', Date.now().toString());
        }
        fetchAdminData();
      }
    } catch {
      alert('Error updating banner status');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${bannerId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionNotice('✓ Hero Banner removed.');
        setTimeout(() => setActionNotice(null), 3500);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bannersUpdated'));
          localStorage.setItem('ayushman_banners_updated_at', Date.now().toString());
        }
        fetchAdminData();
      }
    } catch {
      alert('Error deleting banner');
    }
  };

  // Coupons / Discounts
  const handleSaveCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    const newCoupon: CouponItem = {
      id: `c-${Date.now()}`,
      code: couponForm.code.toUpperCase().trim(),
      discountType: couponForm.discountType || 'PERCENT',
      discountValue: couponForm.discountValue || 10,
      minOrderAmount: couponForm.minOrderAmount || 0,
      isActive: couponForm.isActive !== false,
      usageCount: 0,
    };
    setCouponsList([newCoupon, ...couponsList]);
    setShowCouponModal(false);
    setActionNotice(`✓ Coupon code "${newCoupon.code}" created!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDeleteCoupon = (id: string) => {
    setCouponsList(couponsList.filter((c) => c.id !== id));
    setActionNotice('✓ Coupon deleted.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddUserModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'CLIENT', phone: '' });
        setActionNotice(`✓ Account for ${newUser.name} created!`);
        setTimeout(() => setActionNotice(null), 3000);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch {
      alert('Error creating user.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      alert('Error deleting user');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Delete this customer inquiry?')) return;
    try {
      const res = await fetch(`/api/inquiries?id=${inquiryId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      }
    } catch {
      alert('Error deleting inquiry');
    }
  };

  const handleAdminSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingMessage(null);

    if (settingNewPassword && settingNewPassword !== settingConfirmPassword) {
      setSettingMessage({ text: 'New password and confirm password do not match!', type: 'error' });
      return;
    }

    setSettingSaving(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: settingName,
            email: settingEmail,
            phone: settingPhone,
            address: settingAddress,
            city: settingCity,
            state: settingState,
            pincode: settingPincode,
            newPassword: settingNewPassword ? settingNewPassword : undefined,
          }),
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proprietor: settingProprietor,
            shopName: settingShopName,
            address: settingAddress,
            city: settingCity,
            state: settingState,
            pincode: settingPincode,
            phonePrimary: settingPhone,
            phoneSecondary: settingPhoneSecondary,
            whatsappNumber: settingWhatsAppNumber,
            whatsappMessage: settingWhatsAppMsg,
            instagramUrl: settingInstagramUrl,
            instagramHandle: settingInstagramHandle,
            facebookUrl: settingFacebookUrl,
            youtubeUrl: settingYouTubeUrl,
          }),
        }),
      ]);

      const data = await profileRes.json();
      setSettingSaving(false);

      if (profileRes.ok && settingsRes.ok) {
        setSettingMessage({ text: '✓ Studio settings, WhatsApp, Instagram & credentials saved successfully!', type: 'success' });
        setSettingNewPassword('');
        setSettingConfirmPassword('');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settingsUpdated'));
          localStorage.setItem('ayushman_settings_updated_at', Date.now().toString());
        }
        refreshUser();
      } else {
        setSettingMessage({ text: data.error || 'Failed to update settings', type: 'error' });
      }
    } catch {
      setSettingSaving(false);
      setSettingMessage({ text: 'Network error updating settings.', type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter || o.paymentStatus === statusFilter;
    const matchesSearch =
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone?.includes(searchQuery) ||
      o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.eventType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = productsList.filter((p) => {
    const matchesCategory = productCatFilter === 'ALL' || p.category === productCatFilter;
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.badge?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredUsers = usersList.filter((u) => {
    return (
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
    );
  });

  if (!user || user.role !== 'ADMIN') {
    return (
      <>
        <Navbar />
        <main className="admin-scope" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2.5rem', maxWidth: '440px', width: '100%', border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#0B2545', margin: '0 0 0.5rem' }}>
              🛡️ Admin Portal Login
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 1.5rem' }}>
              Restricted management area for Ayushman Cards & Graphics.
            </p>

            {loginError && (
              <div style={{ padding: '0.65rem', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', fontSize: '0.8125rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.35rem' }}>Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@ayushmancards.com"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.875rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1E1E1E', marginBottom: '0.35rem' }}>Master Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.875rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '999px',
                  background: '#0B2545',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: loginLoading ? 'wait' : 'pointer',
                }}
              >
                {loginLoading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="admin-scope" style={{ minHeight: '85vh', background: '#F8FAFC', padding: 'clamp(1rem, 2vw, 2rem) clamp(0.75rem, 2vw, 1.25rem)', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  AYUSHMAN CARDS ADMIN PORTAL
                </h1>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '999px', background: '#FEF3C7', color: '#92400E' }}>
                  SUPER ADMIN
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                Real-time order fulfillment, revenue analytics, customer registrations and stock alerts
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/"
                target="_blank"
                style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#0B2545', fontWeight: 700, fontSize: '0.78125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>Store</span> <span>↗</span>
              </Link>
              <button
                type="button"
                onClick={fetchAdminData}
                style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#0B2545', fontWeight: 700, fontSize: '0.78125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>🔄</span> Refresh
              </button>
              <button
                type="button"
                onClick={() => logout()}
                style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: '0.78125rem', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {actionNotice && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#0B2545', color: '#FFF', fontSize: '0.84375rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {actionNotice}
            </div>
          )}

          {/* Navigation Tabs Bar (Scrollable on Mobile) */}
          <div className="admin-tabs-scroll" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'orders', label: 'Orders', icon: '🛍️', count: orders.length },
              { id: 'products', label: 'Products', icon: '📦', count: productsList.length },
              { id: 'categories', label: 'Categories', icon: '📑', count: categoriesList.length },
              { id: 'banners', label: 'Hero Banners', icon: '🖼️', count: bannersList.length },
              { id: 'customers', label: 'Customers', icon: '👥', count: usersList.filter((u) => u.role !== 'ADMIN').length },
              { id: 'discounts', label: 'Discounts', icon: '🏷️', count: couponsList.length },
              { id: 'inquiries', label: 'Inquiries', icon: '💬', count: inquiries.length },
              { id: 'staff', label: 'Staff & Roles', icon: '🛡️', count: usersList.filter((u) => u.role === 'ADMIN').length },
              { id: 'settings', label: 'Store Settings', icon: '⚙️' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#0B2545' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: isActive ? '0 2px 8px rgba(11,37,69,0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '999px',
                        background: isActive ? '#60B5FF' : '#F1F5F9',
                        color: isActive ? '#002B52' : '#64748B',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════
              TAB: DASHBOARD OVERVIEW & ANALYTICS
             ═══════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* 4 KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>PAID REVENUE</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0 0.15rem' }}>
                      ₹{calculatedMetrics.paidRevenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Avg: ₹{calculatedMetrics.avgOrderVal.toLocaleString()} / order
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
                    ₹
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>TOTAL ORDERS</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B2545', margin: '0.25rem 0 0.15rem' }}>
                      {orders.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>
                      {calculatedMetrics.pendingFulfillment} awaiting fulfillment
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    🛍️
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ACTIVE PRODUCTS</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B2545', margin: '0.25rem 0 0.15rem' }}>
                      {productsList.filter((p) => p.isActive !== false).length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      across {categoriesList.length} categories
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    📦
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>PATRONS / USERS</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0B2545', margin: '0.25rem 0 0.15rem' }}>
                      {usersList.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#2563EB' }}>
                      {inquiries.length} customer messages
                    </div>
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    👥
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons Row */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenAddProduct}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                >
                  <span>➕</span> Add Product
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                >
                  <span>🚚</span> Fulfill Orders
                </button>
                <button
                  onClick={() => {
                    setCouponForm({ code: '', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 2000, isActive: true });
                    setShowCouponModal(true);
                  }}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                >
                  <span>🏷️</span> Create Coupon
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                >
                  <span>💬</span> View Inquiries ({inquiries.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{ padding: '0.65rem 1.15rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                >
                  <span>⚙️</span> Store Settings
                </button>
              </div>

              {/* Order Lifecycle Distribution Card */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0B2545', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ORDER LIFECYCLE DISTRIBUTION
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    style={{ background: 'transparent', border: 'none', color: '#0B2545', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    Manage All Orders →
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'PENDING', count: lifecycleCounts.PENDING, bg: '#FEF3C7', color: '#92400E' },
                    { label: 'CONFIRMED', count: lifecycleCounts.CONFIRMED, bg: '#DBEAFE', color: '#1E40AF' },
                    { label: 'PROCESSING', count: lifecycleCounts.PROCESSING, bg: '#E0F2FE', color: '#0369A1' },
                    { label: 'SHIPPED', count: lifecycleCounts.SHIPPED, bg: '#EDE9FE', color: '#5B21B6' },
                    { label: 'DELIVERED', count: lifecycleCounts.DELIVERED, bg: '#D1FAE5', color: '#065F46' },
                    { label: 'CANCELLED', count: lifecycleCounts.CANCELLED, bg: '#FEE2E2', color: '#991B1B' },
                  ].map((st) => (
                    <div
                      key={st.label}
                      onClick={() => {
                        setStatusFilter(st.label);
                        setActiveTab('orders');
                      }}
                      style={{
                        background: st.bg,
                        borderRadius: '8px',
                        padding: '1rem 0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: st.color, marginBottom: '0.35rem' }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: st.color }}>
                        {st.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0B2545', textTransform: 'uppercase', margin: 0 }}>
                      RECENT ORDERS
                    </h3>
                    <button onClick={() => setActiveTab('orders')} style={{ background: 'transparent', border: 'none', color: '#0B2545', fontSize: '0.78125rem', fontWeight: 700, cursor: 'pointer' }}>
                      View All →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.84375rem' }}>No customer print orders yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.84375rem', color: '#0B2545' }}>#{ord.id.slice(-8).toUpperCase()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{ord.customerName} • {ord.eventType}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0B2545' }}>₹{ord.totalAmount?.toLocaleString()}</div>
                            <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', background: ord.paymentStatus === 'PAID' ? '#D1FAE5' : '#FEF3C7', color: ord.paymentStatus === 'PAID' ? '#065F46' : '#92400E' }}>
                              {ord.paymentStatus || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0B2545', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>⚠️</span> LOW STOCK INVENTORY ALERTS
                    </h3>
                    <button onClick={() => setActiveTab('products')} style={{ background: 'transparent', border: 'none', color: '#0B2545', fontSize: '0.78125rem', fontWeight: 700, cursor: 'pointer' }}>
                      Inventory →
                    </button>
                  </div>
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', color: '#059669', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                      ✓
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#065F46', marginBottom: '0.25rem' }}>
                      All print raw materials & inventory variant stocks are healthy!
                    </div>
                    <p style={{ fontSize: '0.78125rem', color: '#64748B', margin: 0 }}>
                      350 GSM Velvet Board, 3mm Acrylic Plates, Gold Foil ribbons, and Star Flex media reels are well-stocked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              TAB: ORDERS FULFILLMENT & INVOICES
             ═══════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 320px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search client name, phone, order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: '1 1 200px', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84375rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84375rem', background: '#FFFFFF', color: '#0F172A' }}
                  >
                    <option value="ALL">All Order Statuses ({orders.length})</option>
                    <option value="NEW">NEW</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PRINTING">PRINTING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="PAID">Paid Only</option>
                  </select>
                </div>
              </div>

              {/* Desktop View Table */}
              <div className="admin-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                      <th style={{ padding: '0.75rem' }}>Order ID</th>
                      <th style={{ padding: '0.75rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem' }}>Product / Specs</th>
                      <th style={{ padding: '0.75rem' }}>Total Amount</th>
                      <th style={{ padding: '0.75rem' }}>Payment</th>
                      <th style={{ padding: '0.75rem' }}>Fulfillment</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tax Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#0B2545' }}>
                          #{o.id.slice(-8).toUpperCase()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: '#0B2545' }}>{o.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>📱 {o.customerPhone}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{o.eventType}</div>
                          <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{o.packageType || 'Custom Print Job'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: '#0B2545' }}>
                          ₹{o.totalAmount?.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={o.paymentStatus || 'PENDING'}
                            onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: o.paymentStatus === 'PAID' ? '#D1FAE5' : '#FEF3C7',
                              color: o.paymentStatus === 'PAID' ? '#065F46' : '#92400E',
                            }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={o.status || 'NEW'}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: '#F1F5F9',
                              color: '#0B2545',
                            }}
                          >
                            <option value="NEW">NEW</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PRINTING">PRINTING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedInvoiceOrder(o)}
                            style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🧾 Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Phone Orders Card View */}
              <div className="admin-mobile-cards">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0B2545', fontSize: '0.875rem' }}>
                        #{o.id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                        ₹{o.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0B2545' }}>{o.customerName}</div>
                      <a href={`tel:${o.customerPhone}`} style={{ fontSize: '0.78125rem', color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        📱 {o.customerPhone}
                      </a>
                    </div>

                    <div style={{ fontSize: '0.78125rem', color: '#475569', background: '#F8FAFC', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{o.eventType}</div>
                      <div style={{ color: '#64748B' }}>{o.packageType || 'Custom Print Job'}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem' }}>PAYMENT</label>
                        <select
                          value={o.paymentStatus || 'PENDING'}
                          onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: o.paymentStatus === 'PAID' ? '#D1FAE5' : '#FEF3C7',
                            color: o.paymentStatus === 'PAID' ? '#065F46' : '#92400E',
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="FAILED">FAILED</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#64748B', marginBottom: '0.25rem' }}>STATUS</label>
                        <select
                          value={o.status || 'NEW'}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.4rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#F1F5F9',
                            color: '#0B2545',
                          }}
                        >
                          <option value="NEW">NEW</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="PRINTING">PRINTING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceOrder(o)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        background: '#0B2545',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.78125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      🧾 View Tax Invoice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              TAB: PRODUCTS CATALOG CMS
             ═══════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 350px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search product name, finish, badge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: '1 1 200px', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84375rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  />
                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    style={{ padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84375rem', background: '#FFFFFF', color: '#0F172A' }}
                  >
                    <option value="ALL">All Categories ({productsList.length})</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  style={{
                    padding: '0.65rem 1.35rem',
                    borderRadius: '999px',
                    background: '#0B2545',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  ➕ Add New Product
                </button>
              </div>

              {/* Desktop View Table */}
              <div className="admin-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                      <th style={{ padding: '0.75rem' }}>Product</th>
                      <th style={{ padding: '0.75rem' }}>Category</th>
                      <th style={{ padding: '0.75rem' }}>Price & Unit</th>
                      <th style={{ padding: '0.75rem' }}>Badge Tag</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#F1F5F9' }} />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0B2545' }}>{p.title}</div>
                              <div style={{ fontSize: '0.725rem', color: '#64748B' }}>Customizer: {p.customizerId || 'wedding-card'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{p.category}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0B2545' }}>
                          {p.price} <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>/ {p.unit || 'unit'}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {p.badge && (
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#E0E7FF', color: '#3730A3', fontSize: '0.6875rem', fontWeight: 700 }}>
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: p.isActive !== false ? '#D1FAE5' : '#FEE2E2', color: p.isActive !== false ? '#065F46' : '#991B1B' }}>
                            {p.isActive !== false ? 'Live' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0B2545', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Phone Card View */}
              <div className="admin-mobile-cards">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', background: '#F1F5F9', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.925rem', color: '#0B2545', lineHeight: 1.35, marginBottom: '0.35rem' }}>
                          {p.title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.725rem', color: '#475569', background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                            {p.category}
                          </span>
                          <span
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '999px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: p.isActive !== false ? '#D1FAE5' : '#FEE2E2',
                              color: p.isActive !== false ? '#065F46' : '#991B1B',
                            }}
                          >
                            {p.isActive !== false ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '0.55rem 0.75rem', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0B2545' }}>
                          {p.price}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          {p.unit || '100 Cards'}
                        </div>
                      </div>
                      {p.badge && (
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#E0E7FF', color: '#3730A3', fontSize: '0.6875rem', fontWeight: 700 }}>
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(p)}
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: '1.5px solid #0B2545',
                          background: '#FFFFFF',
                          color: '#0B2545',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        ✏️ Edit Product
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #FCA5A5',
                          background: '#FEE2E2',
                          color: '#991B1B',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Delete product"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: CATEGORIES CMS ═══ */}
          {activeTab === 'categories' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0B2545' }}>
                  Product Categories ({categoriesList.length})
                </h3>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  ➕ Add New Category
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                {categoriesList.map((cat) => (
                  <div key={cat.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: '#FAFAFA', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{cat.icon || '🏷️'}</span>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0B2545' }}>{cat.label}</div>
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        {cat.description || 'No description'}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.75rem' }}>
                        📦 {productsList.filter((p) => p.category === cat.id).length} Active Products
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #0B2545', background: 'rgba(11,37,69,0.06)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#0B2545' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#991B1B' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: HERO BANNERS CMS ═══ */}
          {activeTab === 'banners' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0B2545' }}>
                    Homepage Hero Banners ({bannersList.length})
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                    Recommended size: <strong>1920 × 600 px</strong>. Center-cropped and auto-advances on the homepage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBanner}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  ➕ Add Hero Banner
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                {bannersList.map((bnr, idx) => (
                  <div key={bnr.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ height: '140px', position: 'relative', background: '#0B2545' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bnr.image} alt={bnr.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.75)', color: '#FFF', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Slide #{bnr.displayOrder || idx + 1}
                      </div>
                      <button
                        onClick={() => handleToggleBannerActive(bnr)}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '999px', border: 'none', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', background: bnr.isActive !== false ? '#10B981' : '#EF4444', color: '#FFFFFF' }}
                      >
                        {bnr.isActive !== false ? 'Live' : 'Hidden'}
                      </button>
                    </div>

                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0B2545', marginBottom: '0.25rem' }}>
                          {bnr.title || 'Untitled Image Banner'}
                        </div>
                        {bnr.subtitle && (
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem' }}>
                            {bnr.subtitle}
                          </div>
                        )}
                        <div style={{ fontSize: '0.725rem', color: '#475569', background: '#F8FAFC', padding: '0.4rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                          🔗 {bnr.link || '/products'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                        <button
                          onClick={() => handleOpenEditBanner(bnr)}
                          style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #0B2545', background: 'rgba(11,37,69,0.06)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#0B2545' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(bnr.id)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#991B1B' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: CUSTOMERS / USERS ═══ */}
          {activeTab === 'customers' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0B2545' }}>
                  Registered Customers ({usersList.filter((u) => u.role !== 'ADMIN').length})
                </h3>
                <input
                  type="text"
                  placeholder="Search customer name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', maxWidth: '300px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8125rem', color: '#0F172A', backgroundColor: '#FFFFFF' }}
                />
              </div>

              {/* Desktop Table View */}
              <div className="admin-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                      <th style={{ padding: '0.75rem' }}>Customer Name</th>
                      <th style={{ padding: '0.75rem' }}>Email Address</th>
                      <th style={{ padding: '0.75rem' }}>Phone</th>
                      <th style={{ padding: '0.75rem' }}>Orders Placed</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.filter((u) => u.role !== 'ADMIN').map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0B2545' }}>{u.name}</td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#059669' }}>
                          {orders.filter((o) => o.customerEmail === u.email || o.userId === u.id).length} Orders
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="admin-mobile-cards">
                {filteredUsers.filter((u) => u.role !== 'ADMIN').map((u) => (
                  <div
                    key={u.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#0B2545', fontSize: '0.925rem' }}>{u.name}</span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 700, background: '#D1FAE5', color: '#065F46' }}>
                        {orders.filter((o) => o.customerEmail === u.email || o.userId === u.id).length} Orders
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      ✉️ {u.email}
                    </div>
                    {u.phone && (
                      <a href={`tel:${u.phone}`} style={{ fontSize: '0.78125rem', color: '#2563EB', textDecoration: 'none' }}>
                        📱 {u.phone}
                      </a>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #FCA5A5',
                          background: '#FEE2E2',
                          color: '#991B1B',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        🗑️ Delete User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: DISCOUNTS & COUPONS CMS ═══ */}
          {activeTab === 'discounts' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0B2545' }}>
                    Coupons & Promo Codes ({couponsList.length})
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                    Create percentage or flat discount coupon codes for customer checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCouponForm({ code: '', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 2000, isActive: true });
                    setShowCouponModal(true);
                  }}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  ➕ Create Coupon
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
                {couponsList.map((cpn) => (
                  <div key={cpn.id} style={{ border: '1.5px dashed #CBD5E1', borderRadius: '10px', padding: '1.25rem', background: '#FAFAFA', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0B2545', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                          {cpn.code}
                        </span>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 700, background: cpn.isActive ? '#D1FAE5' : '#FEE2E2', color: cpn.isActive ? '#065F46' : '#991B1B' }}>
                          {cpn.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0B2545', marginBottom: '0.35rem' }}>
                        {cpn.discountType === 'PERCENT' ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue} FLAT OFF`}
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        Min Order: ₹{cpn.minOrderAmount.toLocaleString()} • {cpn.usageCount} times redeemed
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                      <button onClick={() => handleDeleteCoupon(cpn.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: INQUIRIES ═══ */}
          {activeTab === 'inquiries' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#0B2545' }}>
                Customer Messages & Quote Requests ({inquiries.length})
              </h3>
              {inquiries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>No inquiries received yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {inquiries.map((inq) => (
                    <div key={inq.id} style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#FAFAFA' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 800, color: '#0B2545', fontSize: '0.9375rem' }}>{inq.name}</span>
                          <span style={{ color: '#6B7280', fontSize: '0.78125rem', marginLeft: '0.5rem' }}>📱 {inq.phone} • ✉️ {inq.email}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#1E1E1E', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Requested Service: <span style={{ color: '#059669' }}>{inq.eventType}</span>
                      </div>
                      <div style={{ fontSize: '0.84375rem', color: '#4B5563', background: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        "{inq.message}"
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <a href={`https://wa.me/91${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${inq.name}! Thank you for contacting Ayushman Cards & Graphics regarding "${inq.eventType}". How can we help you?`)}`} target="_blank" rel="noreferrer" style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', background: '#25D366', color: '#FFF', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>
                          💬 Reply on WhatsApp
                        </a>
                        <a href={`tel:${inq.phone}`} style={{ padding: '0.4rem 0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', color: '#0B2545', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                          📞 Call Customer
                        </a>
                        <button type="button" onClick={() => handleDeleteInquiry(inq.id)} style={{ padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: '0.75rem' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB: STAFF & ROLES ═══ */}
          {activeTab === 'staff' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0B2545' }}>
                  Admin & Studio Staff ({usersList.filter((u) => u.role === 'ADMIN').length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setNewUser({ name: '', email: '', password: '', role: 'ADMIN', phone: '' });
                    setShowAddUserModal(true);
                  }}
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  ➕ Create Admin Account
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="admin-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.725rem' }}>
                      <th style={{ padding: '0.75rem' }}>Staff Name</th>
                      <th style={{ padding: '0.75rem' }}>Email Address</th>
                      <th style={{ padding: '0.75rem' }}>Mobile</th>
                      <th style={{ padding: '0.75rem' }}>Role</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter((u) => u.role === 'ADMIN').map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0B2545' }}>{u.name}</td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem', color: '#475569' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, background: '#FEF3C7', color: '#92400E' }}>
                            ADMIN
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {u.email !== 'admin@ayushmancards.com' && (
                            <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: '0.75rem' }}>
                              🗑️ Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="admin-mobile-cards">
                {usersList.filter((u) => u.role === 'ADMIN').map((u) => (
                  <div
                    key={u.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#0B2545', fontSize: '0.925rem' }}>{u.name}</span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 800, background: '#FEF3C7', color: '#92400E' }}>
                        ADMIN
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78125rem', color: '#475569' }}>
                      ✉️ {u.email}
                    </div>
                    {u.phone && (
                      <a href={`tel:${u.phone}`} style={{ fontSize: '0.78125rem', color: '#2563EB', textDecoration: 'none' }}>
                        📱 {u.phone}
                      </a>
                    )}

                    {u.email !== 'admin@ayushmancards.com' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #FCA5A5',
                            background: '#FEE2E2',
                            color: '#991B1B',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          🗑️ Delete Staff
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TAB: STORE SETTINGS & CREDENTIALS ═══ */}
          {activeTab === 'settings' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: 'clamp(1rem, 2.5vw, 1.75rem)', maxWidth: '780px' }}>
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0B2545', margin: '0 0 0.3rem' }}>
                  ⚙️ Store Settings & Social Connections
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                  Manage your studio name, proprietor, address, phone numbers, WhatsApp, Instagram links, and admin login credentials. All changes reflect across the main website instantly.
                </p>
              </div>

              {settingMessage && (
                <div style={{ padding: '0.85rem 1.2rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.84375rem', fontWeight: 600, background: settingMessage.type === 'success' ? '#D1FAE5' : '#FFEBEE', color: settingMessage.type === 'success' ? '#065F46' : '#C62828' }}>
                  {settingMessage.text}
                </div>
              )}

              <form onSubmit={handleAdminSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* 1. STUDIO & PROPRIETOR INFO */}
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B2545', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🏢 Printing Studio & Proprietorship
                  </h3>
                  <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Proprietor Name *</label>
                      <input type="text" required value={settingProprietor} onChange={(e) => setSettingProprietor(e.target.value)} placeholder="Rajesh Saatoliya" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Studio / Shop Name *</label>
                      <input type="text" required value={settingShopName} onChange={(e) => setSettingShopName(e.target.value)} placeholder="Ayushman Cards & Graphics" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Full Business Address * (Shown across site & footer)</label>
                    <input type="text" required value={settingAddress} onChange={(e) => setSettingAddress(e.target.value)} placeholder="63, Varruchi Marg, Freeganj Ujjain" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                  </div>

                  <div className="admin-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>City</label>
                      <input type="text" value={settingCity} onChange={(e) => setSettingCity(e.target.value)} placeholder="Ujjain" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>State</label>
                      <input type="text" value={settingState} onChange={(e) => setSettingState(e.target.value)} placeholder="Madhya Pradesh" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Pincode</label>
                      <input type="text" value={settingPincode} onChange={(e) => setSettingPincode(e.target.value)} placeholder="456001" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>
                </div>

                {/* 2. WHATSAPP & INSTAGRAM SOCIAL CONNECTIONS */}
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B2545', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    💬 WhatsApp & Instagram Integration (Floating Buttons & Socials)
                  </h3>

                  <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>
                        WhatsApp Number * (e.g. +919479784979)
                      </label>
                      <input type="tel" required value={settingWhatsAppNumber} onChange={(e) => setSettingWhatsAppNumber(e.target.value)} placeholder="+919479784979" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>
                        Instagram URL or Username *
                      </label>
                      <input type="text" required value={settingInstagramUrl} onChange={(e) => setSettingInstagramUrl(e.target.value)} placeholder="https://instagram.com/ayushmancards_ujjain" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Default WhatsApp Inquiry Message</label>
                    <textarea rows={2} value={settingWhatsAppMsg} onChange={(e) => setSettingWhatsAppMsg(e.target.value)} placeholder="Pre-filled message when customer clicks floating WhatsApp button" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontFamily: 'inherit' }} />
                  </div>

                  <div className="admin-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Instagram Handle</label>
                      <input type="text" value={settingInstagramHandle} onChange={(e) => setSettingInstagramHandle(e.target.value)} placeholder="@ayushmancards_ujjain" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Primary Phone (Call)</label>
                      <input type="tel" value={settingPhone} onChange={(e) => setSettingPhone(e.target.value)} placeholder="9479784979" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Secondary Phone</label>
                      <input type="tel" value={settingPhoneSecondary} onChange={(e) => setSettingPhoneSecondary(e.target.value)} placeholder="9893022451" style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>
                </div>

                {/* 3. MASTER ADMIN CREDENTIALS */}
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0B2545', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🛡️ Master Admin Credentials
                  </h3>
                  <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Admin Name</label>
                      <input type="text" required value={settingName} onChange={(e) => setSettingName(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Admin Login Email</label>
                      <input type="email" required value={settingEmail} onChange={(e) => setSettingEmail(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Change Master Password (Optional)</label>
                    <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <input type="password" placeholder="New Password" value={settingNewPassword} onChange={(e) => setSettingNewPassword(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                      <input type="password" placeholder="Confirm Password" value={settingConfirmPassword} onChange={(e) => setSettingConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A' }} />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={settingSaving} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', background: 'linear-gradient(135deg, #0B2545 0%, #134074 100%)', color: '#FFF', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: settingSaving ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(11,37,69,0.25)' }}>
                  {settingSaving ? '💾 Saving Store Settings...' : '💾 Save All Store Settings & Socials'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ═══ MODALS ═══ */}
        {showProductModal && (
          <div className="admin-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }} onClick={() => setShowProductModal(false)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                  {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                </h3>
                <button type="button" onClick={() => setShowProductModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800, color: '#64748B' }}>✕</button>
              </div>

              <form onSubmit={handleSaveProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Economy Uncoated Natural Art Board Business Cards"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>

                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Visibility Status</label>
                    <select
                      value={productForm.isActive ? 'true' : 'false'}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.value === 'true' })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                    >
                      <option value="true">🟢 Live on Main Store</option>
                      <option value="false">🔴 Hidden / Draft</option>
                    </select>
                  </div>
                </div>

                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Price in INR (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={productForm.numericPrice}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setProductForm((prev) => ({
                          ...prev,
                          numericPrice: val,
                          price: `₹${val}`,
                          badge: prev.badge && prev.badge.includes('@') ? prev.badge.replace(/@\s*₹?[0-9,]+/, `@ ₹${val}`) : prev.badge,
                        }));
                      }}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Order Unit / Quantity *</label>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      placeholder="e.g. 100 Cards or 1000 Cards (₹0.55/card)"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Promotional Badge (Tag shown on product card)</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="e.g. 1000 PCS @ ₹550"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Image URL & Cloud Upload *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ padding: '0.65rem 1rem', background: '#0B2545', color: '#FFF', borderRadius: '8px', fontSize: '0.78125rem', fontWeight: 700, cursor: isUploadingImage ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                      📁 {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleProductImageUpload} disabled={isUploadingImage} style={{ display: 'none' }} />
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="/images/wedding/scroll_royal_blue_velvet.png or CDN URL"
                      style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                  {productForm.image && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={productForm.image} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }} onError={(e) => { (e.target as any).style.display = 'none'; }} />
                      <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Product Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Editorial description of materials, finishes, paper weights..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Features & Bullet Points (One per line)</label>
                  <textarea
                    rows={3}
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    placeholder="Natural Writable Surface&#10;Crisp HD Offset Typography&#10;Lowest Unit Cost for Bulk"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem', fontFamily: 'inherit' }}
                  />
                </div>

                {/* ═══ PAPER FINISH & COATING (WITH CUSTOM ADD-ON PRICES) ═══ */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                        ✨ Paper Finish & Coating Options (Customer Selectable + Pricing)
                      </label>
                      <span style={{ fontSize: '0.725rem', color: '#64748B' }}>
                        Set custom finish names and extra add-on costs in ₹ (shown on product page modal).
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            paperOptions: [
                              ...(prev.paperOptions || []),
                              { label: '', extraPrice: 0 },
                            ],
                          }));
                        }}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          background: '#0B2545',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ➕ Add Finish
                      </button>
                      <button
                        type="button"
                        title="Load 5 standard industry card finishes"
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            paperOptions: [
                              { label: '350 GSM Premium Matte', extraPrice: 0 },
                              { label: 'Glossy Laminated (350 GSM)', extraPrice: 30 },
                              { label: 'Velvet Touch Soft-Feel', extraPrice: 80 },
                              { label: 'Spot UV Selective Coating', extraPrice: 150 },
                              { label: 'Royal Gold Foil Embossed', extraPrice: 250 },
                            ],
                          }));
                        }}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          background: '#E2E8F0',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        📋 Presets
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(productForm.paperOptions || []).map((paper, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={paper.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductForm((prev) => {
                              const updated = [...(prev.paperOptions || [])];
                              updated[idx] = { ...updated[idx], label: val };
                              return { ...prev, paperOptions: updated };
                            });
                          }}
                          placeholder="e.g. Velvet Touch Soft-Feel"
                          style={{ flex: 2, padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.8125rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: '#0B2545', fontWeight: 700 }}>+₹</span>
                          <input
                            type="number"
                            min={0}
                            value={paper.extraPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setProductForm((prev) => {
                                const updated = [...(prev.paperOptions || [])];
                                updated[idx] = { ...updated[idx], extraPrice: val };
                                return { ...prev, paperOptions: updated };
                              });
                            }}
                            placeholder="Extra cost"
                            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              paperOptions: (prev.paperOptions || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Delete Finish"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(!productForm.paperOptions || productForm.paperOptions.length === 0) && (
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem' }}>
                        No finishes added. Click &quot;➕ Add Finish&quot; or &quot;📋 Presets&quot; to add.
                      </div>
                    )}
                  </div>
                </div>

                {/* ═══ QUANTITY TIERS & MULTIPLIERS ═══ */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#0B2545', margin: 0 }}>
                        📦 Print Quantities & Price Multipliers
                      </label>
                      <span style={{ fontSize: '0.725rem', color: '#64748B' }}>
                        Selectable quantity pills. Base price is multiplied by factor for total cost.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          quantityOptions: [
                            ...(prev.quantityOptions || []),
                            { qty: 2000, multiplier: 11.5 },
                          ],
                        }));
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: '#0B2545',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ➕ Add Qty Tier
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(productForm.quantityOptions || []).map((qtyObj, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="number"
                            min={1}
                            value={qtyObj.qty}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 100;
                              setProductForm((prev) => {
                                const updated = [...(prev.quantityOptions || [])];
                                updated[idx] = { ...updated[idx], qty: val };
                                return { ...prev, quantityOptions: updated };
                              });
                            }}
                            placeholder="Qty (e.g. 500)"
                            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.8125rem' }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Pcs</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>×</span>
                          <input
                            type="number"
                            step="0.1"
                            min={0.1}
                            value={qtyObj.multiplier}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              setProductForm((prev) => {
                                const updated = [...(prev.quantityOptions || [])];
                                updated[idx] = { ...updated[idx], multiplier: val };
                                return { ...prev, quantityOptions: updated };
                              });
                            }}
                            placeholder="Multiplier"
                            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.8125rem' }}
                          />
                          <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            = ₹{Math.round((productForm.numericPrice || 0) * (qtyObj.multiplier || 1)).toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              quantityOptions: (prev.quantityOptions || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Delete Quantity Tier"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══ CORNER STYLES & CUSTOMIZER LINK ═══ */}
                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>
                      ✂️ Corner Style Options (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={productForm.cornerOptions}
                      onChange={(e) => setProductForm({ ...productForm, cornerOptions: e.target.value })}
                      placeholder="Standard Cut, Rounded Corners"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>
                      🔗 3D Visual Customizer Link
                    </label>
                    <select
                      value={productForm.customizerId}
                      onChange={(e) => setProductForm({ ...productForm, customizerId: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                    >
                      <option value="visiting-card">Visiting Cards (3D Preview, Paper, Foils)</option>
                      <option value="wedding-card">Wedding Cards (Velvet Box, Shahi Scroll)</option>
                      <option value="flex-banner">Flex Banners (Grommets, Framing)</option>
                      <option value="photobook">Photobooks (Silk Sheet, Briefcase)</option>
                      <option value="custom-mug">Magic Photo Mugs (Color Reveal)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '999px', background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.925rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}>
                    {editingProduct ? '💾 Update Product' : '✓ Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowProductModal(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="admin-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowCategoryModal(false)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', marginBottom: '1.25rem' }}>
                {editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}
              </h3>
              <form onSubmit={handleSaveCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Category Label *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryForm((prev) => {
                        const cleanLabel = val.replace(/^[^\w\s]+/u, '').trim();
                        return {
                          ...prev,
                          label: val,
                          id: editingCategory ? prev.id : (cleanLabel || prev.id),
                        };
                      });
                    }}
                    placeholder="e.g. 💍 Wedding Invitation Cards"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>
                    Category ID (System Key)
                  </label>
                  <input
                    type="text"
                    disabled={!!editingCategory}
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    placeholder="Auto-generated from label (e.g. Wedding Cards)"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: editingCategory ? '#F1F5F9' : '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                    Used internally to link products. Leave blank to auto-create from label.
                  </span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Icon Emoji</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="e.g. 💍 or 💳 or 🪧"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '999px', background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.925rem', cursor: 'pointer' }}>
                    {editingCategory ? '💾 Update' : '✓ Save Category'}
                  </button>
                  <button type="button" onClick={() => setShowCategoryModal(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBannerModal && (
          <div className="admin-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }} onClick={() => setShowBannerModal(false)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', marginBottom: '1.25rem' }}>
                {editingBanner ? '✏️ Edit Hero Banner' : '➕ Create New Hero Banner'}
              </h3>
              <form onSubmit={handleSaveBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.35rem' }}>Banner Image * (1920x600 px recommended)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ padding: '0.65rem 1rem', background: '#0B2545', color: '#FFF', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: isUploadingBannerImg ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                      📁 {isUploadingBannerImg ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleBannerImageUpload} disabled={isUploadingBannerImg} style={{ display: 'none' }} />
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerForm.image}
                      onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                      style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Headline Title</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="e.g. Royal Velvet Box Wedding Invitations"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Subtitle</label>
                  <textarea
                    rows={2}
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Target Destination Link *</label>
                    <input
                      type="text"
                      required
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={bannerForm.displayOrder}
                      onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '999px', background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.925rem', cursor: 'pointer' }}>
                    {editingBanner ? '💾 Save Changes' : '✓ Publish Hero Banner'}
                  </button>
                  <button type="button" onClick={() => setShowBannerModal(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCouponModal && (
          <div className="admin-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowCouponModal(false)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', marginBottom: '1.25rem' }}>
                🏷️ Create Discount Coupon
              </h3>
              <form onSubmit={handleSaveCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAVE10"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.875rem' }}
                  />
                </div>
                <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                    >
                      <option value="PERCENT">% Percentage</option>
                      <option value="FLAT">₹ Flat Amount</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Min Order Amount (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.925rem', cursor: 'pointer' }}>
                    Create Coupon
                  </button>
                  <button type="button" onClick={() => setShowCouponModal(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddUserModal && (
          <div className="admin-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowAddUserModal(false)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '16px', padding: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0B2545', marginBottom: '1.25rem' }}>Create Account</h3>
              <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Password *</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 700, color: '#0B2545', marginBottom: '0.25rem' }}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem' }}
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.85rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontWeight: 800, fontSize: '0.925rem', cursor: 'pointer' }}>Create Account</button>
                  <button type="button" onClick={() => setShowAddUserModal(false)} style={{ padding: '0.85rem 1.5rem', borderRadius: '999px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedInvoiceOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }} onClick={() => setSelectedInvoiceOrder(null)}>
            <div className="admin-modal-card" style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1rem, 3vw, 2.5rem)', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 48px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>STUDIO TAX INVOICE / CASH RECEIPT</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => window.print()} style={{ padding: '0.5rem 1rem', borderRadius: '999px', background: '#0B2545', color: '#FFFFFF', border: 'none', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>🖨️ Print</button>
                  <button onClick={() => setSelectedInvoiceOrder(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #0B2545', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0B2545', margin: '0 0 0.25rem' }}>AYUSHMAN CARDS & GRAPHICS</h2>
                    <div style={{ fontSize: '0.78125rem', color: '#64748B' }}>63, Varruchi Marg, Freeganj Ujjain • Properiter - Rajesh Saatoliya</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.84375rem', fontWeight: 700 }}>Invoice #{selectedInvoiceOrder.id.slice(-8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#0B2545' }}>Billed To: {selectedInvoiceOrder.customerName}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Phone: {selectedInvoiceOrder.customerPhone}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 700, marginTop: '0.25rem' }}>Payment Status: {selectedInvoiceOrder.paymentStatus}</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84375rem', marginBottom: '1.5rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F1F5F9' }}>
                      <th style={{ padding: '0.65rem', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '0.65rem', textAlign: 'right' }}>Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 0.65rem' }}>{selectedInvoiceOrder.eventType} - {selectedInvoiceOrder.packageType || 'Custom Print'}</td>
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right', fontWeight: 700 }}>₹{selectedInvoiceOrder.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '0.75rem 0.65rem', fontWeight: 800, fontSize: '1rem', color: '#0B2545' }}>Grand Total (INR):</td>
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right', fontWeight: 800, fontSize: '1.2rem', color: '#0B2545' }}>₹{selectedInvoiceOrder.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Attached Print Artwork & Drive Links */}
                {(selectedInvoiceOrder.uploadedFiles?.length > 0 || selectedInvoiceOrder.driveLink || selectedInvoiceOrder.printInstructions) && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.8125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🎨 Attached Artwork & Printing Specifications</span>
                    </div>

                    {selectedInvoiceOrder.uploadedFiles && selectedInvoiceOrder.uploadedFiles.length > 0 && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', marginBottom: '0.35rem' }}>
                          Uploaded Files ({selectedInvoiceOrder.uploadedFiles.length}):
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {selectedInvoiceOrder.uploadedFiles.map((file: any, fIdx: number) => (
                            <a
                              key={fIdx}
                              href={file.previewUrl || '#'}
                              target="_blank"
                              rel="noreferrer"
                              download={file.name}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                background: '#FFFFFF',
                                border: '1px solid #86EFAC',
                                color: '#166534',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                              }}
                            >
                              <span>📥 {file.name}</span>
                              <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>({file.size})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedInvoiceOrder.driveLink && (
                      <div style={{ fontSize: '0.78125rem', marginBottom: '0.4rem' }}>
                        <strong style={{ color: '#166534' }}>Drive/Cloud Link: </strong>
                        <a href={selectedInvoiceOrder.driveLink} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {selectedInvoiceOrder.driveLink}
                        </a>
                      </div>
                    )}

                    {selectedInvoiceOrder.printInstructions && (
                      <div style={{ fontSize: '0.78125rem', color: '#374151', background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                        <strong style={{ color: '#166534' }}>Customer Instructions: </strong>
                        {selectedInvoiceOrder.printInstructions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
