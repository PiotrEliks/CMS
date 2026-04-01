import path from 'path'
import fs from 'fs/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function generatePdfThumbnail(
  pdfPath: string,
  thumbnailsDir?: string
): Promise<string | null> {
  try {
    const resolvedThumbnailsDir =
      thumbnailsDir ?? path.resolve(process.cwd(), 'uploads', 'thumbnails')
    await fs.mkdir(resolvedThumbnailsDir, { recursive: true })

    const baseName = path.basename(pdfPath, path.extname(pdfPath))
    const outputPrefix = path.join(resolvedThumbnailsDir, baseName)
    const thumbnailPath = `${outputPrefix}-1.png`

    // pdftoppm is part of poppler-utils (available on macOS via brew, Linux via apt, Windows via poppler binaries)
    await execFileAsync('pdftoppm', [
      '-png',
      '-r', '108',      // ~72dpi * 1.5 scale
      '-singlefile',
      '-f', '1',
      '-l', '1',
      pdfPath,
      outputPrefix,
    ])

    await fs.access(thumbnailPath)
    return `${baseName}-1.png`
  } catch (error) {
    console.error('❌ Error generating PDF thumbnail:', error)
    return null
  }
}
