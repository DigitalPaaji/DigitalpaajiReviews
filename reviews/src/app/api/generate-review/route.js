
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

function generateFallbackReviews(businessName, stars) {
  const rating = Number(stars);

  const templates = {
    5: [
      `I had an excellent experience with ${businessName}. The overall service was professional and pleasant.`,
      `Really happy with my experience at ${businessName}. The service met my expectations.`,
      `A very positive experience with ${businessName}. I appreciated the professional approach.`,
      `I was pleased with the service provided by ${businessName}. Overall, a smooth experience.`,
      `My experience with ${businessName} was great. I would consider returning in the future.`,
    ],
    4: [
      `I had a good experience with ${businessName}. Overall, I was satisfied with the service.`,
      `The experience with ${businessName} was positive, with a few small areas that could improve.`,
      `Good overall service from ${businessName}. A little more attention to detail could make it even better.`,
      `I was happy with most aspects of my experience with ${businessName}.`,
      `A generally positive experience with ${businessName}. There is some room for improvement.`,
    ],
    3: [
      `My experience with ${businessName} was average overall. Some aspects were good, while others could improve.`,
      `The service from ${businessName} was reasonable, although the overall experience could be more consistent.`,
      `I had a mixed experience with ${businessName}. There were both positive aspects and areas to improve.`,
      `Overall, my experience with ${businessName} was satisfactory but not particularly memorable.`,
      `The experience with ${businessName} was okay. A few improvements could make a difference.`,
    ],
    2: [
      `My experience with ${businessName} was below expectations. Some aspects of the service could improve.`,
      `I was not fully satisfied with my experience with ${businessName}. Better communication would help.`,
      `The experience with ${businessName} could have been better. There is room for improvement.`,
      `I expected a better experience with ${businessName}. Some parts of the service disappointed me.`,
      `My experience with ${businessName} was not ideal. I hope the service improves.`,
    ],
    1: [
      `I was disappointed with my experience with ${businessName}. The service did not meet my expectations.`,
      `Unfortunately, my experience with ${businessName} was unsatisfactory.`,
      `I had a difficult experience with ${businessName} and hope the service improves.`,
      `My experience with ${businessName} fell short of what I expected.`,
      `I was not happy with my experience with ${businessName}. There is significant room for improvement.`,
    ],
  };

  return templates[rating] || templates[5];
}

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      businessName,
      location,
      description,
      services,
      industry,
      stars,
      customerExperience,
    } = body;

    if (typeof businessName !== "string" || !businessName.trim()) {
      return NextResponse.json(
        { error: "Business name is required." },
        { status: 400 }
      );
    }

    const rating = Number(stars);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Star rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[GENERATE REVIEW] GEMINI_API_KEY is missing");

      return NextResponse.json({
        reviews: generateFallbackReviews(businessName, rating),
        source: "fallback",
        warning: "Gemini API key is not configured.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Generate exactly 5 suggested review drafts for a customer to edit
so each reflects their own genuine experience. Do not present invented
experiences as verified facts.

Business: ${businessName.trim()}
Location: ${location || "Not specified"}
Industry: ${industry || "Not specified"}
Description: ${description || "Not specified"}
Services: ${services || "Not specified"}
Customer's own experience: ${customerExperience || "Not provided"}
Requested rating: ${rating}/5

Write natural, distinct drafts that match the rating.
Do not invent visits, transactions, employees, or specific events.
Keep each draft around 30–70 words.
Return only JSON in this format:
{"reviews":["draft 1","draft 2","draft 3","draft 4","draft 5"]}
`;

    console.log("[GENERATE REVIEW] Calling Gemini", {
      model: "gemini-2.5-flash",
      rating,
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = result.text?.trim();

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (
      !Array.isArray(parsed.reviews) ||
      parsed.reviews.length === 0 ||
      !parsed.reviews.every(
        (review) => typeof review === "string" && review.trim()
      )
    ) {
      throw new Error("Gemini returned an invalid reviews format.");
    }

    console.log("[GENERATE REVIEW] Gemini returned reviews:", parsed.reviews.length);

    return NextResponse.json({
      reviews: parsed.reviews.slice(0, 5),
      source: "gemini",
      business: {
        name: businessName.trim(),
        location,
        industry,
        stars: rating,
      },
    });
  } catch (error) {
    console.error("[GENERATE REVIEW] Failed:", error);

    return NextResponse.json(
      {
        error: "Unable to generate AI review suggestions.",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
