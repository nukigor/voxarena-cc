import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function testModels() {
  const testModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-sonnet-latest',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
  ]

  for (const model of testModels) {
    try {
      console.log(`Testing model: ${model}`)
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      })
      console.log(`✓ ${model} works!`)
    } catch (error: any) {
      if (error.status === 404) {
        console.log(`✗ ${model} not found (404)`)
      } else {
        console.log(`? ${model} error: ${error.message}`)
      }
    }
  }
}

testModels()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
