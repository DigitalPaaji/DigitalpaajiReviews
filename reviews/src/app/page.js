"use client";

import { useEffect, useState } from "react";
import { reviewsByCourse } from "./reviews";

const courses = Object.keys(reviewsByCourse);

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJaakIxpQpEDkR76SF9ueUk2I";

export default function ReviewPage() {
  const [course, setCourse] = useState("");
  const [review, setReview] = useState("");
  const [toast, setToast] = useState(false);

  // ✅ Get random course
  const getRandomCourse = () =>
    courses[Math.floor(Math.random() * courses.length)];

  // ✅ Generate random review for selected course
  const generateReview = (selectedCourse) => {
    const list = reviewsByCourse[selectedCourse];
    const randomReview = list[Math.floor(Math.random() * list.length)];
    setReview(randomReview);
  };

  // ✅ On first load → random course + random review
  useEffect(() => {
    const randomCourse = getRandomCourse();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCourse(randomCourse);
    generateReview(randomCourse);
  }, []);

  // ✅ Whenever course changes → new random review
  useEffect(() => {
    if (course) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateReview(course);
    }
  }, [course]);

  const openGoogleMaps = async () => {
    if (!review) return;

    // Auto-copy review
    await navigator.clipboard.writeText(review);

    // Show toast
    setToast(true);
    setTimeout(() => setToast(false), 2500);

    // Open Google Maps
    window.open(GOOGLE_REVIEW_URL, "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">
        <h2 className="text-2xl font-bold text-center mb-1 ">
          Review Digital Paaji Academy ⭐
        </h2>

        <p className="text-sm text-gray-500 text-center mb-4">
          A random course & review is selected for you
        </p>

        {/* Course Selector */}
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {courses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Review Box */}
        <div className="border rounded-xl p-4 text-gray-700 min-h-[100px] mb-4 bg-gray-50">
          {review}
        </div>

        {/* Change Review */}
        <button
          onClick={() => generateReview(course)}
          className="w-full mb-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          🔄 Change Review
        </button>

        {/* Post Button */}
        <button
          onClick={openGoogleMaps}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
        >
          ⭐ Post on Google Maps
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Review will be copied automatically. Just paste & post.
        </p>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-full shadow-lg">
            ✅ Review copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
}
