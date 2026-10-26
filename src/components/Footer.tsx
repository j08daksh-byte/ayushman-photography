'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StoreSettings {
  proprietor: string;
  address: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  proprietor: 'Rajesh Saatoliya',
  address: '63, Varruchi Marg, Freeganj Ujjain',
  whatsappNumber: '+919479784979',
  instagramUrl: 'https://instagram.com/ayushmancards_ujjain',
  facebookUrl: 'https://facebook.com/ayushmancards',
  youtubeUrl: 'https://youtube.com/@ayushmancards',
};

const footerColumns = [
  {
    title: 'Let Us Help You',
    links: [
      { label: 'My Account', href: '/dashboard' },
      { label: 'My Profile', href: '/profile' },
      { label: 'Track My Order', href: '/dashboard' },
      { label: 'Returns & Refunds', href: '/cancellation' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Our Products',
    links: [
      { label: 'Visiting Cards', href: '/products?category=Business Cards' },
      { label: 'Wedding Cards', href: '/products?category=Wedding Cards' },
      { label: 'Stationery & Letterheads', href: '/products?category=Office Stationery' },
      { label: 'Flex Banners & Signage', href: '/products?category=Flex Banners' },
      { label: 'Labels & Stickers', href: '/products?category=Stickers & Labels' },
      { label: 'Photo Albums & Mugs', href: '/products?category=Custom Gifts' },
    ],
  },
  {
    title: 'Our Company',
    links: [
      { label: 'About Ayushman Cards & Graphics', href: '/about' },
      { label: 'Customer Reviews', href: '/reviews' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/about' },
    ],
  },
  {
    title: 'Our Policies',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Cancellation Policy', href: '/cancellation' },
      { label: 'Shipping Policy', href: '/shipping' },
      { label: 'Copyright', href: '/copyright' },
    ],
  },
];

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setSettings({
              proprietor: data.settings.proprietor || DEFAULT_SETTINGS.proprietor,
              address: data.settings.address || DEFAULT_SETTINGS.address,
              whatsappNumber: data.settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
              instagramUrl: data.settings.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
              facebookUrl: data.settings.facebookUrl || DEFAULT_SETTINGS.facebookUrl,
              youtubeUrl: data.settings.youtubeUrl || DEFAULT_SETTINGS.youtubeUrl,
            });
          }
        }
      } catch (err) {
        console.warn('Using default footer settings:', err);
      }
    }

    loadSettings();

    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}`;
  const instagramUrl = settings.instagramUrl.startsWith('http')
    ? settings.instagramUrl
    : `https://instagram.com/${settings.instagramUrl.replace('@', '')}`;

  return (
    <footer
      style={{
        background: '#F8F9FA',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      {/* Main Footer Columns */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '3rem clamp(1rem, 3vw, 2.5rem) 2rem',
        }}
      >
        <div
          className="vp-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}
        >
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#1E1E1E',
                  marginBottom: '1rem',
                }}
              >
                {col.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: '0.5rem' }}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8125rem',
                        color: '#6B7280',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#0B2545';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6B7280';
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods & Social */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: '#6B7280',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              We accept
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['UPI', 'PhonePe', 'Visa', 'Mastercard', 'Razorpay'].map((m) => (
                <span
                  key={m}
                  style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    color: '#4B5563',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {[
              { label: 'Instagram', href: instagramUrl },
              { label: 'Facebook', href: settings.facebookUrl || 'https://facebook.com/ayushmancards' },
              { label: 'YouTube', href: settings.youtubeUrl || 'https://youtube.com/@ayushmancards' },
              { label: 'WhatsApp', href: whatsappUrl },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.8125rem',
                  color: '#6B7280',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0B2545';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright & Proprietor bar (GSTIN Removed) */}
      <div
        style={{
          borderTop: '1px solid #E5E7EB',
          padding: '1rem clamp(1rem, 3vw, 2.5rem)',
          background: '#F3F4F6',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: '#9CA3AF',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Ayushman Cards & Graphics. All rights reserved. {settings.address}
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: '#9CA3AF',
              margin: 0,
            }}
          >
            Properiter - {settings.proprietor}
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .vp-footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .vp-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
