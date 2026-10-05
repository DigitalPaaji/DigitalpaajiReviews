import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { businessName, stars, diningType } = await request.json();

    if (!businessName || !stars) {
      return NextResponse.json(
        { error: "Business name and stars are required" },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful assistant writing Google Local Guide reviews for a restaurant named "${businessName}". 
    The user chose a rating of ${stars} out of 5 stars and an experience type of "${diningType || "Dine-in"}".
    
    Generate exactly 5 distinct, realistic, and engaging review options varying in wording and length (50 to 90 words each). 
    - For 5 stars: Praise ambience, service, and food quality.
    - For 4 stars: Very positive with minor constructive details.
    - For 3 stars or lower: Polite, balanced critique.
    
    CRITICAL: Return your response strictly as a valid JSON array of strings, with no extra markdown formatting, intro text, or code blocks. Example format:
    ["Review text one...", "Review text two...", "Review text three...", "Review text four...", "Review text five..."]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text?.trim() || "[]";
    
    // Clean up any markdown blocks if the model accidentally includes them
    rawText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");

    const reviewsArray = JSON.parse(rawText);

    return NextResponse.json({ reviews: reviewsArray });
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback array if parsing fails
    return NextResponse.json({ 
      reviews: [
        "Amazing food quality and wonderful ambience! Will definitely visit again.",
        "Great atmosphere and prompt service. Highly recommended for families.",
        "Delicious dishes and very polite staff. Had a wonderful dining experience."
      ] 
    });
  }
}