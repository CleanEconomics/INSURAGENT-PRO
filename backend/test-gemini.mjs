// Quick test of Gemini API
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/genai';

dotenv.config();

async function testGemini() {
  try {
    console.log('🤖 Testing Gemini API...\n');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say "InsurAgent Pro AI is working!" if you can read this.');
    const text = result.response.text();
    
    console.log(`✅ Gemini API Working!`);
    console.log(`Response: ${text}\n`);
    
  } catch (error) {
    console.log(`❌ Gemini API Failed: ${error.message}\n`);
  }
}

testGemini();

