"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RestaurantReviewContent() {
  const searchParams = useSearchParams();
  
  const businessName = searchParams.get("business") || "Spice & Grill Restaurant";
  const placeId = searchParams.get("placeid") || "ChIJaakIxpQpEDkR76SF9ueUk2I";
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

  const [stars, setStars] = useState(5);
  const [diningType, setDiningType] = useState("Dine-in (Dinner)");
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const diningOptions = [
    "Dine-in (Dinner)",
    "Dine-in (Lunch)",
    "Takeout / Delivery",
    "Family Gathering",
    "Quick Snack / Café"
  ];

  const fetchAiReviews = async (selectedStars, selectedDining) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          businessName, 
          stars: selectedStars, 
          diningType: selectedDining 
        }),
      });
      const data = await res.json();
      if (data.reviews && data.reviews.length > 0) {
        setReviewsList(data.reviews);
        setSelectedReview(data.reviews[0]);
      }
    } catch (err) {
      console.error(err);
      const fallback = ["Amazing food quality and wonderful ambience! Highly recommended."];
      setReviewsList(fallback);
      setSelectedReview(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReviews(stars, diningType);
  }, [stars, diningType]);

  const handleCopyAndOpen = async (textToPost) => {
    const text = textToPost || selectedReview;
    if (!text) return;
    
    await navigator.clipboard.writeText(text);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
    window.open(googleReviewUrl, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-stone-900 to-zinc-950 px-3 py-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 relative border border-amber-500/20">
        
        <div className="text-center mb-3">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
            🍽️ Live AI Review Assistant
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {businessName}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Select rating & choose from 5 AI options below
          </p>
        </div>

        {/* Star Rating Selector */}
        <div className="flex justify-center gap-2 my-3 bg-amber-50/60 py-2.5 rounded-2xl border border-amber-100">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStars(s)}
              className={`text-3xl transition transform active:scale-95 hover:scale-110 ${
                s <= stars ? "text-amber-500 drop-shadow-sm" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Experience Selector */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">
            Experience Type
          </label>
          <select
            value={diningType}
            onChange={(e) => setDiningType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {diningOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Review Options Cards Container */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Choose a Review Style ({reviewsList.length} Options)
            </label>
            <button
              onClick={() => fetchAiReviews(stars, diningType)}
              disabled={loading}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium underline"
            >
              🔄 Refresh AI
            </button>
          </div>

          <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {loading ? (
              <div className="py-10 text-center text-sm text-amber-700 font-medium animate-pulse flex flex-col items-center gap-2">
                <span>🍳</span> Generating 5 custom review options via Gemini...
              </div>
            ) : (
              reviewsList.map((rev, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedReview(rev)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedReview === rev
                      ? "border-amber-600 bg-amber-50/70 shadow-sm ring-1 ring-amber-500"
                      : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-amber-900 text-[10px] uppercase">
                      Option #{index + 1}
                    </span>
                    {selectedReview === rev && (
                      <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="italic leading-relaxed">"{rev}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={() => handleCopyAndOpen()}
          disabled={loading || !selectedReview}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition shadow-lg shadow-amber-600/30 active:scale-[0.98] disabled:opacity-50"
        >
          ⭐ Copy Selected & Post on Google Maps
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-2.5">
          Tapping copies text automatically and takes you straight to Google Maps.
        </p>

        {/* Toast Notification */}
        {toast && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <span>✅</span> Copied! Opening Google Maps...
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-500">Loading...</div>}>
      <RestaurantReviewContent />
    </Suspense>
  );
}