import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    if (!businessName || !stars) {
      return NextResponse.json(
        {
          error: "Business name and star rating are required.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json({
        reviews: generateFallbackReviews(
          businessName,
          location,
          stars
        ),
      });
    }

    const rating = Number(stars);

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          error: "Star rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    const companyDetails = `
Business Name: ${businessName}
Location: ${location || "Not specified"}
Industry: ${industry || "General business"}
Business Description: ${
      description || "A professional local business serving customers."
    }
Services Offered: ${services || "Not specified"}
Customer Experience: ${
      customerExperience || "General customer experience."
    }
`;

    let ratingInstruction = "";

    switch (rating) {
      case 5:
        ratingInstruction = `
Generate enthusiastic 5-star reviews.

The customer should sound genuinely impressed and satisfied.
Mention specific positive aspects of the business where appropriate.
The review should feel natural, personal and authentic rather than promotional.

Do NOT make the review sound like an advertisement.
Do NOT exaggerate with unrealistic claims.
`;

        break;

      case 4:
        ratingInstruction = `
Generate positive 4-star reviews.

The customer is satisfied overall but should sound slightly more realistic
than a perfect 5-star review.

Include praise along with a small casual observation or minor area that
could be improved, without making the business sound bad.

The tone should remain positive and natural.
`;

        break;

      case 3:
        ratingInstruction = `
Generate balanced 3-star reviews.

The customer experience was average.
Mention some positive aspects while also mentioning one or two genuine-sounding
areas that could be improved.

Do not be insulting or overly negative.
The review should sound like a normal customer giving honest feedback.
`;

        break;

      case 2:
        ratingInstruction = `
Generate polite but critical 2-star reviews.

The customer had several issues with their experience.
Clearly mention areas that could be improved while keeping the tone respectful.

Do not invent serious accusations, illegal activity, discrimination,
fraud, safety incidents or other extreme claims.
`;

        break;

      case 1:
        ratingInstruction = `
Generate respectful 1-star reviews.

The customer was very dissatisfied.
Explain the main source of dissatisfaction in a realistic and specific way.

Do not make defamatory claims.
Do not accuse the company or employees of crimes.
Keep the feedback focused on the customer's experience.
`;

        break;

      default:
        ratingInstruction = `
Generate a natural customer review matching the selected rating.
`;
    }

    const prompt = `
You are an expert at writing realistic customer feedback for local businesses.

IMPORTANT:
These are review DRAFTS/SUGGESTIONS for customers.
Do not pretend that you personally visited the business.
Do not invent highly specific facts that were not provided.
Do not mention that you are an AI.
Do not use marketing language.
Do not use hashtags.
Do not use emojis unless they naturally fit the customer's tone.

BUSINESS INFORMATION:
${companyDetails}

SELECTED CUSTOMER RATING:
${rating}/5 stars

${ratingInstruction}

CUSTOMER EXPERIENCE CONTEXT:
${customerExperience || "No additional experience provided."}

WRITING REQUIREMENTS:

1. Generate exactly 5 different review options.
2. Each review should be approximately 40–80 words.
3. Every review must be relevant to the business.
4. Use the business name naturally where appropriate, but do not repeat it excessively.
5. Avoid making all five reviews sound alike.
6. Vary sentence structure and vocabulary.
7. Make them sound like different real customers.
8. Do not include quotation marks around the review itself.
9. Do not mention information that is not provided in the business details.
10. Match the selected star rating accurately.
11. Do not create fake specific employee names, prices, dates or transactions.
12. Do not make medical, legal, financial or safety claims unless explicitly supplied.

OUTPUT REQUIREMENT:

Return ONLY valid JSON.

The response must be an object in exactly this format:

{
  "reviews": [
    "Review 1",
    "Review 2",
    "Review 3",
    "Review 4",
    "Review 5"
  ]
}

No markdown.
No code block.
No explanation.
`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "";

    rawText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error("Gemini JSON parse error:", error);
      console.error("Gemini response:", rawText);

      return NextResponse.json({
        reviews: generateFallbackReviews(
          businessName,
          location,
          rating
        ),
      });
    }

    if (
      !parsed ||
      !Array.isArray(parsed.reviews) ||
      parsed.reviews.length === 0
    ) {
      return NextResponse.json({
        reviews: generateFallbackReviews(
          businessName,
          location,
          rating
        ),
      });
    }

    return NextResponse.json({
      reviews: parsed.reviews.slice(0, 5),
      business: {
        name: businessName,
        location,
        industry,
        stars: rating,
      },
    });
  } catch (error) {
    console.error("Review generation error:", error);

    return NextResponse.json(
      {
        reviews: [
          "I had a good overall experience and appreciated the service provided.",
          "The team was professional and the overall experience was satisfactory.",
          "The service was handled well and I was reasonably satisfied with the experience.",
        ],
      },
      { status: 200 }
    );
  }
}

function generateFallbackReviews(
  businessName,
  location,
  stars
) {
  const rating = Number(stars);

  if (rating === 5) {
    return [
      `Really happy with my experience at ${businessName}. The service was professional, smooth and well handled from start to finish. I would definitely recommend them to others looking for a reliable business.`,
      `Excellent experience with ${businessName}. The team was helpful, professional and made the overall process very easy. I was genuinely satisfied with the service and would be happy to visit again.`,
      `Had a great experience at ${businessName}. Everything was handled professionally and the service quality was impressive. Definitely a business I would recommend to others.`,
      `Very pleased with the service at ${businessName}. The overall experience was smooth and the team was friendly and professional. Would happily recommend them.`,
      `A really positive experience with ${businessName}. Good service, professional approach and a pleasant overall experience. I would definitely consider coming back again.`,
    ];
  }

  if (rating === 4) {
    return [
      `Overall, I had a very good experience with ${businessName}. The service was professional and the team was helpful. There is always room for small improvements, but I was satisfied with the experience.`,
      `Good experience at ${businessName}. The service was handled well and the staff was professional. A few small things could be improved, but overall I was happy with the service.`,
      `I had a positive experience with ${businessName}. The team was helpful and the service was good overall. With a few minor improvements, the experience could be even better.`,
      `Quite satisfied with my experience at ${businessName}. The service was good and everything was handled professionally. Overall, I would recommend giving them a try.`,
      `Good service and a professional experience overall at ${businessName}. There were a couple of minor things that could be better, but I was generally happy with the visit.`,
    ];
  }

  if (rating === 3) {
    return [
      `My experience with ${businessName} was fairly average. Some parts of the service were good, while a few areas could definitely be improved. Overall, it was an okay experience.`,
      `The experience at ${businessName} was mixed. The team was helpful in some areas, but there were also things that could have been handled better. Hopefully these areas improve in the future.`,
      `I had an average experience with ${businessName}. There were some positive aspects, but the overall service could be more consistent.`,
      `The service at ${businessName} was okay overall. Some things went smoothly while other parts could have been better. There is definitely room for improvement.`,
      `A fairly average experience. ${businessName} has some good aspects, but improving consistency and customer service would make the overall experience much better.`,
    ];
  }

  if (rating === 2) {
    return [
      `My experience with ${businessName} was below expectations. Some parts of the service were okay, but there were several areas that could be improved. Hopefully the team takes customer feedback seriously.`,
      `Unfortunately, I was not completely satisfied with my experience at ${businessName}. The service could have been more organized and attentive. I hope there are improvements going forward.`,
      `The experience was not as good as I expected. There were some issues with the service at ${businessName} that could definitely be handled better.`,
      `I expected a better experience from ${businessName}. Some aspects were fine, but there were enough issues to leave me disappointed overall.`,
      `Not the best experience with ${businessName}. There are several areas where the customer experience could be improved, especially with service and communication.`,
    ];
  }

  return [
    `Unfortunately, my experience with ${businessName} was very disappointing. The service did not meet my expectations and I hope the business works on improving the customer experience.`,
    `I was quite disappointed with my experience at ${businessName}. The overall service could have been much better and there are several areas that need improvement.`,
    `My experience was not satisfactory. I expected better service from ${businessName} and hope they take customer feedback into consideration.`,
    `Unfortunately, I did not have a good experience with ${businessName}. The overall service fell short of my expectations and could use significant improvement.`,
    `Very disappointing experience overall. I hope ${businessName} improves its service and customer experience in the future.`,
  ];
}
