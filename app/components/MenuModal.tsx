"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';



const defaultMenuImages: any[] = [];

export default function MenuModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Fetch dynamic menu pages
      (async () => {
        const { data } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category', 'MenuPage')
          .eq('active', true)
          .order('price', { ascending: true });

        if (data && data.length > 0) {
          setImages(data.map(item => item.image_url));
        }
      })();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  if (!isOpen) return null;

  return createPortal(
    <div className="menu-modal-overlay" onClick={onClose}>
      <div className="menu-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2 className="font-hand">Notre Carte</h2>
          <p>Explorez nos saveurs</p>
        </div>

        <div className="menu-gallery">
          {images.map((img, index) => (
            <div key={index} className="menu-page">
              {typeof img === 'string' ? (
                <img
                  src={img}
                  alt={`Menu page ${index + 1}`}
                  className="menu-img"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <Image
                  src={img}
                  alt={`Menu page ${index + 1}`}
                  className="menu-img"
                  placeholder="blur"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .menu-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .menu-modal-content {
          background: #111827;
          width: 100%;
          max-width: 1000px;
          height: 90vh;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .modal-header {
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: #1f2937;
        }

        .modal-header h2 {
          font-size: 2.5rem;
          color: #f6b17a;
          margin: 0 0 8px 0;
        }

        .modal-header p {
          color: #9ca3af;
          margin: 0;
        }

        .menu-gallery {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
        }

        .menu-page {
          width: 100%;
          max-width: 800px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: transform 0.3s ease;
          /* Ensure height is not constrained and item doesn't shrink in flex container */
          height: auto;
          flex-shrink: 0;
        }

        /* Target the Next.js image wrapper or img tag directly if needed, 
           but usually Next.js Image with static import works fine unless constrained.
           Let's add a global selector for the image within menu-page just in case. */
        :global(.menu-img) {
          width: 100%;
          height: auto;
          display: block;
        }

        .menu-page:hover {
          transform: scale(1.02);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Custom Scrollbar */
        .menu-gallery::-webkit-scrollbar {
          width: 8px;
        }
        .menu-gallery::-webkit-scrollbar-track {
          background: #111827;
        }
        .menu-gallery::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        .menu-gallery::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>,
    document.body
  );
}
