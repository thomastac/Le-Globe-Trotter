"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Submission } from '../../lib/fetchSubmissions';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

export default function BoardingPassModal({ isOpen, onClose, submission }: BoardingPassModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setIsGenerating(false);
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
        setLocalBlobUrl(null);
      }
    }
  }, [isOpen, submission]);

  if (!mounted || !isOpen || !submission) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const defaultImageUrl = `${supabaseUrl}/storage/v1/object/public/cartes/${submission.id}.png`;
  const displayUrl = localBlobUrl || defaultImageUrl;

  const handleImageError = async () => {
    if (imageError || localBlobUrl || isGenerating) return;
    setImageError(true);
    setIsGenerating(true);

    try {
      const { generateBoardingPassImage, saveBoardingPassCard } = await import('../../utils/generateBoardingPassImage');
      // Generate dynamically client-side
      const blob = await generateBoardingPassImage(submission as any);
      
      // We set a local URL instantly so the user sees it without waiting for upload
      const objectUrl = URL.createObjectURL(blob);
      setLocalBlobUrl(objectUrl);
      setImageError(false);

      // Save to Supabase in background (Sliding Window API)
      await saveBoardingPassCard(submission.id, blob);
    } catch (err) {
      console.error("Failed to regenerate boarding pass:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return createPortal(
    <div className="carnet-modal-overlay" onClick={onClose}>
      <div className="carnet-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="image-container">
          {isGenerating ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <h3>Génération de votre carnet...</h3>
              <p>Juste un instant, nous préparons l'aperçu dynamique géographique.</p>
            </div>
          ) : imageError && !isGenerating && !localBlobUrl ? (
            <div className="error-message">
              <div className="error-icon">📋</div>
              <h3>Carte non générée</h3>
              <p>Impossible de créer cette carte dynamiquement.</p>
            </div>
          ) : (
              <img
                src={displayUrl}
                alt="Carte d'embarcation"
                onError={handleImageError}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 'calc(90vh - 100px)',
                  objectFit: 'contain',
                  opacity: isGenerating ? 0 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              />
          )}
        </div>
      </div>

      <style jsx>{`
        .carnet-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .carnet-modal-content {
          background: #f5f5f4;
          width: 100%;
          max-width: 600px;
          min-height: 400px;
          max-height: 90vh;
          border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          position: relative;
          overflow: hidden;
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.1);
        }

        .image-container {
            flex: 1;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #fff;
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #57534e;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #E8E0D0;
          border-bottom-color: #CE425B;
          border-radius: 50%;
          animation: rotation 1s linear infinite;
          margin-bottom: 24px;
        }

        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-container h3 {
          font-size: 22px;
          font-weight: 700;
          color: #292524;
          margin-bottom: 8px;
        }

        .loader-container p {
          font-size: 15px;
          color: #78716c;
          max-width: 280px;
          line-height: 1.5;
        }

        .error-message {
          text-align: center;
          color: #57534e;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .error-message h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #292524;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
