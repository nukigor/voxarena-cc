/**
 * Test raw Google GenAI response structure
 */

import { GoogleGenAI } from '@google/genai';

async function testRawResponse() {
  const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello world',
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });

    console.log('Full response object keys:', Object.keys(response));
    console.log('\nFull response JSON:');
    console.log(JSON.stringify(response, null, 2));

    // Try different ways to access content
    console.log('\n' + '='.repeat(60));
    console.log('Attempting different access patterns:');
    console.log('='.repeat(60));
    console.log('response.text:', response.text);
    console.log('response.candidates:', response.candidates);
    if (response.candidates && response.candidates[0]) {
      console.log('\nFirst candidate:', response.candidates[0]);
      if (response.candidates[0].content) {
        console.log('First candidate content:', response.candidates[0].content);
        if (response.candidates[0].content.parts) {
          console.log('First candidate parts:', response.candidates[0].content.parts);
          if (response.candidates[0].content.parts[0]) {
            console.log('First part text:', response.candidates[0].content.parts[0].text);
          }
        }
      }
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testRawResponse();