"use client";
import React, { useState } from 'react';
import Image from "next/image";

export default function Home() {
  const [status, setStatus] = useState("Submit Details");
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    spouseName: '',
    email: '',
    birthday: '',
    anniversary: ''
  });

  // Calculate the date 18 years ago from today for validation
  const today = new Date();
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final check for 18 years
    if (formData.birthday > maxBirthDate) {
      alert("You must be at least 18 years old to register.");
      return;
    }

    setStatus("Sending...");
    const SHEETDB_API_URL = "https://sheetdb.io/api/v1/5yyey0li0vxu6";

    try {
      const response = await fetch(SHEETDB_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [formData] })
      });

      if (response.ok) {
        setStatus("Success!");
        setShowPopup(true); // Show the premium popup
        setFormData({ fullName: '', spouseName: '', email: '', birthday: '', anniversary: '' });
        setTimeout(() => setStatus("Submit Details"), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error Try Again");
    }
  };

  return (
    <div className="flex min-h-screen  flex-col lg:flex-row justify-center gap-8 bg-white font-sans relative ">
      
      {/* Premium Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 max-w-sm w-full text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          <div className="xl:hidden mb-2 xl:mb-10 text-center">
            <Image className="mx-auto" src="/bnilogo.png" alt="Next.js logo" width={100} height={20} />
          </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-2">Milestone Captured!</h3>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              Your special days are now woven into our community calendar. We can&apos;t wait to celebrate with you.
            </p>
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-3 bg-zinc-800 text-white font-semibold hover:bg-zinc-800 transition-colors"
            >
              Great, thank you!
            </button>
          </div>
        </div>
      )}
{/* Left Side: Visual / Branding Section */}
<section className=" relative w-full lg:w-1/2 flex flex-col overflow-hidden xl:min-h-screen">
  
  {/* The Image Container */}
  <div className="relative w-full h-full flex-1">
    <img 
      src="/bni4.webp" 
      alt="Branding Image" 
      className="object-cover lg:object-cover" // This ensures the image covers the area without stretching
    />
  </div>
  

</section>

      {/* Right Side: Form Section */}
      <main className="flex-1 flex flex-col items-center justify-start 2xl:justify-center py-4 xl:py-16 px-6 sm:px-12 xl:px-24">
        <div className="w-full max-w-xl">
     {/* <div className="xl:hidden mb-2 xl:mb-10 text-center">
            <Image className="mx-auto" src="/bnilogo.png" alt="Next.js logo" width={100} height={20} />
          </div> */}

          <div className="mb-10 text-center xl:text-left">
            <h2 className="lavishly-yours-regular text-5xl xl:text-6xl font-bold text-black leading-tight">Registration Form</h2>
            <p className="text-zinc-500 mt-2">Please fill in the details below to stay updated.</p>
          </div>

          <form className="space-y-2 xl:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <input 
                  type="text" name="fullName" required value={formData.fullName}
                  onChange={handleChange} placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-transparent focus:ring-2 focus:ring-black transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Spouse Name</label>
                <input 
                  type="text" name="spouseName" value={formData.spouseName}
                  onChange={handleChange} placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-transparent focus:ring-2 focus:ring-black transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Email Address</label>
              <input 
                type="email" name="email" required value={formData.email}
                onChange={handleChange} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-transparent focus:ring-2 focus:ring-black transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Birthday Date</label>
                <input 
                  type="date" 
                  name="birthday" 
                  required 
                  max={maxBirthDate}
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-transparent focus:ring-2 focus:ring-black transition-all outline-none cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Anniversary Date</label>
                <input 
                  type="date" name="anniversary" value={formData.anniversary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-transparent focus:ring-2 focus:ring-black transition-all outline-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === "Sending..."}
              className="w-full py-4 mt-4 rounded-xl bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {status}
              <Image className="invert" src="/vercel.svg" alt="icon" width={14} height={14} />
            </button>
          </form>

          <footer className="my-12 flex justify-center gap-6 text-sm text-zinc-400">
            <a href="https://digitalpaaji.com" className="hover:text-black transition-colors">Digital Paaji</a>
            <a href="https://digitalpaajiacademy.com" className="hover:text-black transition-colors">Digital Paaji Academy</a>
          </footer>
        </div>
      </main>
    </div>
  );
}