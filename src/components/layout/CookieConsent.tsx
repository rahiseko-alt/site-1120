"use client";

import React, { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== "allowed" && saved !== "denied") {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setHiding(true);
    setTimeout(() => {
      setVisible(false);
      setHiding(false);
    }, 300);
  }, []);

  const handleAllow = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "allowed");
    dismiss();
  }, [dismiss]);

  const handleDeny = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "denied");
    dismiss();
  }, [dismiss]);

  if (!visible) return null;

  return (
    <>
      <div
        className="consent-banner-wrapper"
        data-hiding={hiding ? "true" : undefined}
      >
        <div className="consent-banner">
          <span className="consent-banner-text">
            We use cookies to enhance your experience.
          </span>
          <div className="consent-banner-buttons">
            <button
              type="button"
              className="consent-btn consent-btn-deny"
              onClick={handleDeny}
            >
              Deny
            </button>
            <button
              type="button"
              className="consent-btn consent-btn-allow"
              onClick={handleAllow}
            >
              Allow
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes consent-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        .consent-banner-wrapper {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 99999;
          display: flex;
          justify-content: center;
          padding: 12px 16px;
          pointer-events: none;
          animation: consent-slide-up 0.4s ease forwards;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .consent-banner-wrapper[data-hiding] {
          opacity: 0;
          transform: translateY(100%);
        }
        .consent-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 12px 12px 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          color: #000;
          font-size: 13px;
          font-family: inherit;
          line-height: 1.4;
          pointer-events: auto;
          max-width: max-content;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }
        .consent-banner-text {
          white-space: nowrap;
        }
        .consent-banner-buttons {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .consent-btn {
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .consent-btn:hover {
          opacity: 0.8;
        }
        .consent-btn-deny {
          border: 1px solid rgba(0, 0, 0, 0.25);
          color: #000;
          background: transparent;
        }
        .consent-btn-allow {
          background: #000;
          color: #fff;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
