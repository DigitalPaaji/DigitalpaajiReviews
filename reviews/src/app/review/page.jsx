"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ReviewContent() {
  const searchParams = useSearchParams();
  
  const businessName = searchParams.get("business") || "Local Business";
  const location = searchParams.get("location") || "";
  const description = searchParams.get("desc") || "";
  const placeId = searchParams.get("placeid") || "ChIJaakIxpQpEDkR76SF9ueUk2I";
  const services = searchParams.get("services") || "";
  const industry = searchParams.get("industry") || "";
  const customerExperience = searchParams.get("experience") || "";

const googleReviewUrl =
  `https://search.google.com/local/writereview?placeid=${placeId}`;

  const [stars, setStars] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  // Fetch 5 dynamic options from Gemini API based on business context
  const fetchAiReviews = async (selectedStars) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          businessName, 
          location,
          description,
          services,
          industry,
          customerExperience,
          stars: selectedStars
        }),
      });
      const data = await res.json();
      if (data.reviews && data.reviews.length > 0) {
        setReviewsList(data.reviews);
        setSelectedReview(data.reviews[0]);
      }
    } catch (err) {
      console.error(err);
      const fallback = ["Great service and wonderful experience overall! Highly recommended."];
      setReviewsList(fallback);
      setSelectedReview(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReviews(stars);
  }, [stars]);

const handleCopyAndOpen = async (textToPost) => {
  const text = textToPost || selectedReview;

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);

    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 2500);

    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank");
    }
  } catch (error) {
    console.error("Copy error:", error);

    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank");
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center  px-3 py-6">
      <div className="w-full max-w-md bg-white p-5 sm:p-6 relative border border-indigo-500/20">
        
        {/* Header Badge */}
        <div className="text-center mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5">
            ✨ Customer Feedback
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {businessName}
          </h2>
          {location && <p className="text-xs text-gray-400">{location}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Select your rating & pick an AI-crafted review option
          </p>
        </div>

        {/* Star Rating Selector */}
        <div className="flex justify-center gap-2 my-4 bg-indigo-50/60 py-3 rounded-2xl border border-indigo-100">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStars(s)}
              className={`text-3xl transition transform active:scale-95 hover:scale-110 ${
                s <= stars ? "text-amber-400 drop-shadow-sm" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Review Options Cards Container */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              AI Review Suggestions ({reviewsList.length})
            </label>
            <button
              onClick={() => fetchAiReviews(stars)}
              disabled={loading}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              🔄 Refresh AI
            </button>
          </div>

          <div className="max-h-[230px] overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="py-12 text-center text-sm text-indigo-700 font-medium animate-pulse flex flex-col items-center gap-2">
                <span>🤖</span> Gemini is writing tailored reviews...
              </div>
            ) : (
              reviewsList.map((rev, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedReview(rev)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    selectedReview === rev
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500"
                      : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-indigo-900 text-[10px] uppercase">
                      Option #{index + 1}
                    </span>
                    {selectedReview === rev && (
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
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
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
        >
          ⭐ Copy & Post on Google Maps
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-2.5">
          Review copies automatically. Just paste it on Google & submit!
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
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-indigo-500">Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}