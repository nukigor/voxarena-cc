import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAnthropicModel() {
  console.log('Updating personas with old Anthropic model names...')

  const result = await prisma.persona.updateMany({
    where: {
      contentProvider: 'ANTHROPIC',
      OR: [
        { contentModel: 'claude-3-5-sonnet-20241022' },
        { contentModel: 'claude-3-5-sonnet-20240620' },
        { contentModel: 'claude-3-opus-20240229' },
        { contentModel: 'claude-3-sonnet-20240229' },
        { contentModel: 'claude-3-haiku-20240307' },
      ]
    },
    data: {
      contentModel: 'claude-sonnet-4-5-20250929'
    }
  })

  console.log(`✓ Updated ${result.count} persona(s) to Claude Sonnet 4.5 (Latest)`)
}

fixAnthropicModel()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
