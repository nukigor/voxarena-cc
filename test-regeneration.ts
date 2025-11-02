/**
 * Test Google Gemini regeneration with current SDK
 */

import { GoogleProvider } from './src/lib/ai/providers/google-provider';

async function testRegeneration() {
  const provider = new GoogleProvider();

  console.log('Testing Google Gemini generation with @google/generative-ai SDK');
  console.log('='.repeat(60));

  try {
    // Test simple generation
    console.log('Test 1: Simple generation with gemini-1.5-pro');
    const response1 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-1.5-pro',
      prompt: 'Generate a 5 word teaser: Climate scientist challenging consensus',
      temperature: 0.7,
      maxTokens: 30,
    });

    console.log('✅ Response:', response1.content || '[EMPTY]');
    console.log('Usage:', response1.usage);
    console.log();

    // Test with system prompt
    console.log('Test 2: Generation with system prompt');
    const response2 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-1.5-flash',
      systemPrompt: 'You are a helpful assistant that generates ultra-short teasers.',
      prompt: 'Create a 5-word teaser for a climate scientist persona',
      temperature: 0.7,
      maxTokens: 30,
    });

    console.log('✅ Response:', response2.content || '[EMPTY]');
    console.log();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testRegeneration();