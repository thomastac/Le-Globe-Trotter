"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string | null;
}

export default function BoardingPassModal({ isOpen, onClose, submissionId }: BoardingPassModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    }
  }, [isOpen, submissionId]);

  if (!mounted || !isOpen || !submissionId) return null;

  const imageUrl = `/cartes/${submissionId}.png`;

  return createPortal(
    <div className="carnet-modal-overlay" onClick={onClose}>
      <div className="carnet-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="image-container">
          {imageError ? (
            <div className="error-message">
              <div className="error-icon">📋</div>
              <h3>Carte non générée</h3>
              <p>Cette carte d'embarcation n'a pas encore été créée.</p>
              <p className="hint">Les cartes sont générées depuis l'espace admin.</p>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Carte d'embarcation"
              onError={() => setImageError(true)}
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 40px)',
                objectFit: 'contain',
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
          border-radius: 50%  ;
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
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .error-message {
          text-align: center;
          color: #57534e;
          padding: 40px 20px;
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

        .error-message p {
          font-size: 16px;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .error-message .hint {
          font-size: 14px;
          opacity: 0.7;
          font-style: italic;
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
