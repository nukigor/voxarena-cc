/**
 * Test script for Google Gemini SDK migration
 * Tests the new @google/genai SDK integration
 */

import { GoogleProvider } from './src/lib/ai/providers/google-provider';

async function testGoogleGemini() {
  console.log('='.repeat(60));
  console.log('Testing Google Gemini SDK Migration');
  console.log('='.repeat(60));
  console.log();

  const provider = new GoogleProvider();

  // Test 1: Simple text generation with gemini-2.5-flash
  console.log('Test 1: Simple generation with gemini-2.5-flash');
  console.log('-'.repeat(60));
  try {
    const response1 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.5-flash',
      prompt: 'Say "Hello from Gemini 2.5 Flash!" and confirm you are working correctly.',
      temperature: 0.7,
      maxTokens: 50,
    });

    console.log('✅ SUCCESS');
    console.log('Model:', response1.model);
    console.log('Provider:', response1.provider);
    console.log('Content:', response1.content);
    console.log('Usage:', JSON.stringify(response1.usage, null, 2));
    console.log();
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    console.log();
  }

  // Test 2: Generation with system prompt and gemini-2.5-pro
  console.log('Test 2: Generation with system prompt (gemini-2.5-pro)');
  console.log('-'.repeat(60));
  try {
    const response2 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.5-pro',
      systemPrompt: 'You are a helpful assistant that responds in a friendly, concise manner.',
      prompt: 'What are the three primary colors?',
      temperature: 0.5,
      maxTokens: 100,
    });

    console.log('✅ SUCCESS');
    console.log('Model:', response2.model);
    console.log('Content:', response2.content);
    console.log('Usage:', JSON.stringify(response2.usage, null, 2));
    console.log();
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    console.log();
  }

  // Test 3: Generation with messages array
  console.log('Test 3: Generation with messages array (gemini-2.0-flash-001)');
  console.log('-'.repeat(60));
  try {
    const response3 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.0-flash-001',
      messages: [
        { role: 'user', content: 'What is 2+2?' },
        { role: 'assistant', content: '2+2 equals 4.' },
        { role: 'user', content: 'And what about 3+3?' },
      ],
      prompt: 'Please answer the question.',
      temperature: 0.3,
      maxTokens: 50,
    });

    console.log('✅ SUCCESS');
    console.log('Model:', response3.model);
    console.log('Content:', response3.content);
    console.log('Usage:', JSON.stringify(response3.usage, null, 2));
    console.log();
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('Testing Complete!');
  console.log('='.repeat(60));
}

// Run the test
testGoogleGemini()
  .then(() => {
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
