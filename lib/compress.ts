// lib/compress.ts

import { PDFDocument } from 'pdf-lib'

export type CompressLevel = 'light' | 'medium' | 'heavy'

export type PresetKey = 'whatsapp' | 'email' | '1mb' | '500kb' | '200kb' | '100kb' | null

export interface CompressResult {
    bytes: Uint8Array
    originalSize: number
    compressedSize: number
    savedPercent: number
}

export const PRESET_TARGETS: Record<string, number> = {
    whatsapp: 16 * 1024 * 1024,
    email: 5 * 1024 * 1024,
    '1mb': 1 * 1024 * 1024,
    '500kb': 500 * 1024,
    '200kb': 200 * 1024,
    '100kb': 100 * 1024,
}

export function levelFromPreset(preset: PresetKey, fileSize: number): CompressLevel {
    if (!preset) return 'medium'
    const target = PRESET_TARGETS[preset]
    if (!target) return 'medium'
    if (fileSize <= target) return 'light'
    const ratio = fileSize / target
    if (ratio <= 2) return 'light'
    if (ratio <= 6) return 'medium'
    return 'heavy'
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export async function compressPDF(
    file: File,
    level: CompressLevel = 'medium'
): Promise<CompressResult> {
    const originalSize = file.size
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

    const saveOptions = {
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: level === 'heavy' ? 50 : level === 'medium' ? 20 : 10,
    }

    if (level === 'heavy' || level === 'medium') {
        pdfDoc.setTitle('')
        pdfDoc.setAuthor('')
        pdfDoc.setSubject('')
        pdfDoc.setKeywords([])
        pdfDoc.setProducer('')
        pdfDoc.setCreator('')
    }

    const bytes = await pdfDoc.save(saveOptions)
    const compressedSize = bytes.length
    const savedPercent = Math.max(
        0,
        Math.round(((originalSize - compressedSize) / originalSize) * 100)
    )

    return { bytes, originalSize, compressedSize, savedPercent }
}

export function downloadBlob(bytes: Uint8Array, filename: string) {
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}