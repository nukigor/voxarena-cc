import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateDebateModes() {
  try {
    console.log('Starting debate mode migration...')

    // Find the Mode records by slug
    const debateMode = await prisma.mode.findUnique({
      where: { slug: 'debate-mode' },
    })

    const podcastMode = await prisma.mode.findUnique({
      where: { slug: 'podcast-mode' },
    })

    if (!debateMode) {
      console.error('Error: Could not find Mode with slug "debate-mode"')
      console.log('Please create a Mode with slug "debate-mode" first')
      process.exit(1)
    }

    if (!podcastMode) {
      console.error('Error: Could not find Mode with slug "podcast-mode"')
      console.log('Please create a Mode with slug "podcast-mode" first')
      process.exit(1)
    }

    console.log(`Found debate mode: ${debateMode.name} (${debateMode.id})`)
    console.log(`Found podcast mode: ${podcastMode.name} (${podcastMode.id})`)

    // Update all debates with mode = DEBATE
    const debatesUpdated = await prisma.debate.updateMany({
      where: {
        mode: 'DEBATE',
        modeId: null,
      },
      data: {
        modeId: debateMode.id,
      },
    })

    console.log(`✅ Updated ${debatesUpdated.count} debates with DEBATE mode`)

    // Update all debates with mode = PODCAST
    const podcastsUpdated = await prisma.debate.updateMany({
      where: {
        mode: 'PODCAST',
        modeId: null,
      },
      data: {
        modeId: podcastMode.id,
      },
    })

    console.log(`✅ Updated ${podcastsUpdated.count} debates with PODCAST mode`)

    // Verify migration
    const totalDebates = await prisma.debate.count()
    const migratedDebates = await prisma.debate.count({
      where: {
        modeId: { not: null },
      },
    })

    console.log('\n📊 Migration Summary:')
    console.log(`Total debates: ${totalDebates}`)
    console.log(`Migrated debates: ${migratedDebates}`)
    console.log(`Unmigrated debates: ${totalDebates - migratedDebates}`)

    if (totalDebates === migratedDebates) {
      console.log('\n✨ All debates have been successfully migrated!')
    } else {
      console.warn('\n⚠️  Some debates were not migrated. Please check manually.')
    }
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateDebateModes()
