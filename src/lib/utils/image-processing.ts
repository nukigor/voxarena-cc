import sharp from 'sharp'

/**
 * Processes an avatar image for optimal web delivery
 * - Resizes to 512x512px
 * - Converts to JPEG with 85% quality
 * - Optimizes for file size
 *
 * @param imageBuffer - Raw image buffer (from DALL-E or upload)
 * @returns Processed JPEG image buffer
 */
export async function processAvatarImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const processedImage = await sharp(imageBuffer)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer()

    console.log(`Image processed: ${imageBuffer.length} bytes → ${processedImage.length} bytes`)

    return processedImage
  } catch (error) {
    console.error('Error processing avatar image:', error)
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets image metadata without processing
 */
export async function getImageMetadata(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata()
    return metadata
  } catch (error) {
    console.error('Error getting image metadata:', error)
    throw new Error(`Failed to read image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
