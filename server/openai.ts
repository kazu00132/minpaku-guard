import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function countPeopleInImage(base64Image: string): Promise<{
  count: number;
  confidence: number;
  description: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in analyzing images to count people. Count the number of people visible in the image. Respond with JSON in this format: { 'count': number, 'confidence': number (0-1), 'description': string }",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この画像に写っている人の数を正確に数えてください。一部だけ写っている人も含めてください。信頼度スコア（0-1）と簡潔な説明も含めてください。",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      count: Math.max(0, Math.round(result.count || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      description: result.description || "",
    };
  } catch (error) {
    console.error("OpenAI Vision API error:", error);
    throw new Error("画像の人数検出に失敗しました: " + (error instanceof Error ? error.message : String(error)));
  }
}
