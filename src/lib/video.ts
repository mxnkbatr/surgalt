export type VideoSource =
  | { kind: 'youtube'; id: string; embedUrl: string }
  | { kind: 'vimeo'; id: string; embedUrl: string }
  | { kind: 'file'; src: string }

/** YouTube / Vimeo / MP4 / public folder URL-г ялгана */
export function parseVideoUrl(url: string): VideoSource | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const yt =
    trimmed.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    )?.[1] ?? null
  if (yt) {
    return {
      kind: 'youtube',
      id: yt,
      embedUrl: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`,
    }
  }

  const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] ?? null
  if (vimeo) {
    return {
      kind: 'vimeo',
      id: vimeo,
      embedUrl: `https://player.vimeo.com/video/${vimeo}?autoplay=1`,
    }
  }

  // /videos/lesson-1.mp4 эсвэл https://cdn.example.com/a.mp4
  return { kind: 'file', src: trimmed }
}
