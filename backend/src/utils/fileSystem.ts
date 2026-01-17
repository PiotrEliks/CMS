import fs from 'fs/promises'
import { existsSync } from 'fs'

export async function safeUnlink(filePath: string): Promise<boolean> {
  try {
    if (!existsSync(filePath)) {
      console.warn(`[safeUnlink] File does not exist: ${filePath}`)
      return false
    }

    await fs.unlink(filePath)
    console.log(`[safeUnlink] Successfully deleted: ${filePath}`)
    return true
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`[safeUnlink] File already deleted: ${filePath}`)
      return false
    }

    console.error(`[safeUnlink] Failed to delete ${filePath}:`, error.message)
    return false
  }
}

export async function safeRmdir(dirPath: string): Promise<boolean> {
  try {
    if (!existsSync(dirPath)) {
      return false
    }

    await fs.rm(dirPath, { recursive: true, force: true })
    console.log(`[safeRmdir] Successfully deleted directory: ${dirPath}`)
    return true
  } catch (error: any) {
    console.error(`[safeRmdir] Failed to delete ${dirPath}:`, error.message)
    return false
  }
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath)
}
