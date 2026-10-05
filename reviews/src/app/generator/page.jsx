"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QrGeneratorPage() {
  const [businessName, setBusinessName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!businessName || !placeId) return;

    // Get current website origin dynamically (e.g., https://yourdomain.com)
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/?business=${encodeURIComponent(businessName)}&placeid=${encodeURIComponent(placeId)}`;
    setGeneratedUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-900 to-zinc-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-amber-500/20">
        <div className="text-center mb-6">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            🚀 Business Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Generate Your Review QR Code
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter your details below to create a custom AI review link & QR code for your tables.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Business Name
            </label>
            <input
              type="text"
              placeholder="e.g. Club 16 or Spice & Grill"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Google Place ID
            </label>
            <input
              type="text"
              placeholder="e.g. ChIJaakIxpQpEDkR76SF9ueUk2I"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Tip: You can find your Place ID using Google's Place ID Finder tool.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-lg shadow-amber-600/30 active:scale-[0.98]"
          >
            Generate QR Code & Link 🎯
          </button>
        </form>

        {generatedUrl && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Your Custom QR Code for {businessName}:
            </h3>
            
            {/* QR Code Canvas/SVG */}
            <div className="p-4 bg-white border-2 border-amber-200 rounded-2xl shadow-md mb-4">
              <QRCodeSVG value={generatedUrl} size={180} level={"H"} includeMargin={true} />
            </div>

            <p className="text-xs text-gray-500 break-all bg-gray-50 p-2.5 rounded-xl border border-gray-200 w-full mb-3">
              {generatedUrl}
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl);
                alert("Review URL copied to clipboard!");
              }}
              className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              📋 Copy Direct URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}