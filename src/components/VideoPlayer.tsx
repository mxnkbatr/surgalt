import { parseVideoUrl } from '../lib/video'

type Props = {
  url: string
  title: string
}

export function VideoPlayer({ url, title }: Props) {
  const source = parseVideoUrl(url)

  if (!source) {
    return (
      <div className="video-player video-player--empty">
        <p>Видео URL буруу байна</p>
      </div>
    )
  }

  if (source.kind === 'youtube' || source.kind === 'vimeo') {
    return (
      <div className="video-player">
        <iframe
          key={source.embedUrl}
          src={source.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="video-player">
      <video key={source.src} src={source.src} controls autoPlay playsInline>
        Таны браузер видео тоглуулахгүй байна.
      </video>
    </div>
  )
}
