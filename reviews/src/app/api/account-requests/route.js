import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AccountRequest from "@/models/AccountRequest";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();

    const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const googleUrl = typeof body.googleUrl === "string" ? body.googleUrl.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!contactName || !businessName || !email || !phone || !location) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (contactName.length > 100 || businessName.length > 150 ||
        email.length > 254 || phone.length > 30 ||
        location.length > 150 || message.length > 1000) {
      return NextResponse.json(
        { success: false, message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (googleUrl) {
      try {
        const url = new URL(googleUrl);
        if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      } catch {
        return NextResponse.json(
          { success: false, message: "Please enter a valid Google Business URL." },
          { status: 400 }
        );
      }
    }

    await connectDB();

    await AccountRequest.create({
      contactName,
      businessName,
      email,
      phone,
      location,
      googleUrl,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your request has been received. Our team will contact you.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Account request failed:", error.message);

    return NextResponse.json(
      { success: false, message: "Unable to submit your request right now." },
      { status: 500 }
    );
  }
}