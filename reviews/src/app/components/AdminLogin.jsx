'use client';
import React, { useState } from "react";

export default function AdminLogin({ setViewMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setViewMode("admin-dashboard");
      } else {
        setAdminError(data.message || "Invalid Admin Master Password");
      }
    } catch (err) {
      setAdminError("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-6 mb-6">
        <div>
          <h1 className="text-2xl text-slate-900">Digital Paaji Admin 🛡️</h1>
          <p className="text-xs text-gray-500 mt-1">Master access to create client accounts.</p>
        </div>
        <button 
          onClick={() => setViewMode("client-login")}
          className="text- text-indigo-600 hover:underline font-semibold"
        >
          ← Back to Client Login
        </button>
      </div>

      {adminError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl">{adminError}</div>}

      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Admin Email *</label>
          <input
            type="email"
            placeholder="admin@digitalpaaji.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Password *</label>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white uppercase tracking-wider">
          Access Admin Panel ⚡
        </button>
      </form>
    </div>
  );
}