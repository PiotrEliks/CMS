import { convert } from 'pdf-poppler'
import path from 'path'
import fs from 'fs/promises'

export async function generatePdfThumbnail(pdfPath: string) {
    const thumbnailsDir = path.resolve(process.cwd(), 'uploads', 'thumbnails')

    await fs.mkdir(thumbnailsDir, { recursive: true })

    const baseName = path.basename(pdfPath, path.extname(pdfPath))

    await convert(pdfPath, {
        format: 'png',
        out_dir: thumbnailsDir,
        out_prefix: baseName,
        page: 1,
    })

    return `${baseName}-1.png`
}
