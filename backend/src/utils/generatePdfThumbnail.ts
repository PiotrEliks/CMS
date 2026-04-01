import { createCanvas } from 'canvas'
import path from 'path'
import fs from 'fs/promises'

export async function generatePdfThumbnail(pdfPath: string): Promise<string | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js')
    
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    }

    const thumbnailsDir = path.resolve(process.cwd(), 'uploads', 'thumbnails')
    await fs.mkdir(thumbnailsDir, { recursive: true })

    const baseName = path.basename(pdfPath, path.extname(pdfPath))
    const thumbnailPath = path.join(thumbnailsDir, `${baseName}-1.png`)

    const data = new Uint8Array(await fs.readFile(pdfPath))
    const loadingTask = pdfjsLib.getDocument({
      data,
      standardFontDataUrl: null,
      useSystemFonts: true,
    })
    const pdfDocument = await loadingTask.promise

    const page = await pdfDocument.getPage(1)

    const scale = 1.5
    const viewport = page.getViewport({ scale })

    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    const renderContext = {
      canvasContext: context as any,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    const buffer = canvas.toBuffer('image/png')
    await fs.writeFile(thumbnailPath, buffer)

    return `${baseName}-1.png`
  } catch (error) {
    console.error('❌ Error generating PDF thumbnail:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}