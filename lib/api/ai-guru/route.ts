import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemPrompt = `
      You are Kuroni AI, an expert anime recommendation engine.
      The user will describe what they want to watch. 
      Recommend exactly 3 legal anime titles.
      CRITICAL: Respond ONLY with a raw JSON array of 3 objects. Do NOT use markdown code blocks or additional text.
      Format:
      [
        {"title": "Anime Name 1", "reason": "Short 1-sentence explanation why it fits."},
        {"title": "Anime Name 2", "reason": "Short 1-sentence explanation why it fits."},
        {"title": "Anime Name 3", "reason": "Short 1-sentence explanation why it fits."}
      ]
    `;

    const result = await model.generateContent(`${systemPrompt}\nUser Request: ${prompt}`);
    const rawText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    const recommendations = JSON.parse(rawText);
    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}