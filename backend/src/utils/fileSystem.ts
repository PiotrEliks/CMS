import fs from 'fs/promises';

export async function safeUnlink(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch (e: any) {
    // jeśli plik nie istnieje -> ignoruj
    if (e?.code !== 'ENOENT') throw e;
  }
}
