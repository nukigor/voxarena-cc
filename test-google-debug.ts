/**
 * Debug test for Google Gemini teaser generation issue
 */

import { GoogleProvider } from './src/lib/ai/providers/google-provider';

async function testGoogleTeaser() {
  console.log('='.repeat(60));
  console.log('Testing Google Gemini Teaser Generation');
  console.log('='.repeat(60));

  const provider = new GoogleProvider();

  // Replicate the exact system and user prompts from the teaser generation
  const systemPrompt = `You are an expert copywriter crafting ultra-short, punchy teasers for VoxArena persona cards. Your task is to capture what makes this persona compelling for DEBATES.

CRITICAL REQUIREMENTS:
- MAXIMUM 8 WORDS
- No filler words or generic phrases
- Focus on DEBATE PERSPECTIVE, not job titles
- Make users want to include this persona in debates
- Make it memorable and intriguing

APPROACH - READ CAREFULLY:
- The characteristics are listed in PRIORITY ORDER
- First listed = most important for the teaser (worldview, ideology, values)
- Last listed = background context only (don't lead with this)
- DON'T just describe what they DO professionally
- DO describe their STANCE, PERSPECTIVE, or DEBATE ANGLE
- Think: "What would they ARGUE in a debate?" not "What's their job?"

FORBIDDEN PATTERNS (DO NOT USE):
❌ "Global strategist doing X"
❌ "Senior professional in Y field"
❌ "Expert leading Z initiative"
❌ Generic job title descriptions

GOOD PATTERNS (USE THESE):
✓ Ideology + specific challenge (e.g., "Anarchist challenging food industry hierarchies")
✓ Perspective + what they defend (e.g., "Traditionalist defending cultural preservation")
✓ Stance + what they question (e.g., "Skeptic questioning digital dependency")
✓ Values + tension they navigate (e.g., "Pragmatist balancing ideals and reality")

Examples of debate-focused teasers:
- "Anarchist chef challenging food industry power"
- "Former teacher defending traditional learning values"
- "Tech skeptic questioning digital dependency"
- "Pragmatic idealist bridging vision and reality"
- "Contrarian economist rethinking market assumptions"

Return ONLY the teaser text, nothing else.`;

  const userPrompt = `Create an ultra-short teaser (max 8 words) for a DEBATE persona with these characteristics:

Persona name: John Johnovic
Nickname: Juice
Age Group:
- Adult (26–39)
Gender Identity:
- Man

Background context: Climate Scientist & Research Director

IMPORTANT: The characteristics are listed in priority order. Focus on the TOP characteristics (worldview, values, ideology) to create the teaser. The "Background context" at the bottom is just context - don't make it the focus of the teaser.

What STANCE or PERSPECTIVE do they bring to debates? What would they ARGUE or CHALLENGE?

Remember: Maximum 8 words. Focus on debate perspective, NOT job title.`;

  try {
    console.log('\nTesting with systemPrompt in generate()...');
    const response1 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.5-flash',
      systemPrompt: systemPrompt,
      prompt: userPrompt,
      temperature: 0.5,
      maxTokens: 30,
    });

    console.log('Response 1 (with systemPrompt):');
    console.log('- Content:', response1.content || '[EMPTY]');
    console.log('- Content length:', response1.content?.length || 0);
    console.log('- Usage:', JSON.stringify(response1.usage, null, 2));
    console.log();

    console.log('Testing without systemPrompt (combined prompt)...');
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const response2 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.5-flash',
      prompt: combinedPrompt,
      temperature: 0.5,
      maxTokens: 30,
    });

    console.log('Response 2 (combined prompt):');
    console.log('- Content:', response2.content || '[EMPTY]');
    console.log('- Content length:', response2.content?.length || 0);
    console.log('- Usage:', JSON.stringify(response2.usage, null, 2));
    console.log();

    console.log('Testing simple prompt...');
    const response3 = await provider.generate({
      provider: 'GOOGLE',
      model: 'gemini-2.5-flash',
      prompt: 'Write a 5-word teaser: "Climate scientist challenging consensus"',
      temperature: 0.3,
      maxTokens: 20,
    });

    console.log('Response 3 (simple prompt):');
    console.log('- Content:', response3.content || '[EMPTY]');
    console.log('- Content length:', response3.content?.length || 0);
    console.log('- Usage:', JSON.stringify(response3.usage, null, 2));

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

testGoogleTeaser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });