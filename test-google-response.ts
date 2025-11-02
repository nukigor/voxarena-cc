/**
 * Debug test to check Google GenAI response structure
 */

import { GoogleGenAI } from '@google/genai';

async function testResponseStructure() {
  const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello',
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });

    console.log('='.repeat(60));
    console.log('Full Response Object:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(response, null, 2));
    console.log('\n');

    console.log('='.repeat(60));
    console.log('Response Properties:');
    console.log('='.repeat(60));
    console.log('response.text:', response.text);
    console.log('response.candidates:', response.candidates);
    console.log('response.usageMetadata:', response.usageMetadata);

    if (response.candidates && response.candidates.length > 0) {
      console.log('\nFirst Candidate:');
      console.log(JSON.stringify(response.candidates[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testResponseStructure();
