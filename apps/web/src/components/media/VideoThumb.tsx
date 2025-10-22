import React, { useEffect, useMemo, useState } from 'react'

const ytIdFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const parts = u.pathname.split('/')
      const idx = parts.indexOf('embed')
      if (idx >= 0 && parts[idx+1]) return parts[idx+1]
    }
  } catch {}
  return null
}

const vimeoIdFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('vimeo.com')) {
      const seg = u.pathname.split('/').filter(Boolean)
      const id = seg[0]
      if (id && /^\d+$/.test(id)) return id
    }
  } catch {}
  return null
}

export const VideoThumb: React.FC<{ url: string; width?: number; height?: number }> = ({ url, width=320, height=180 }) => {
  const [src, setSrc] = useState<string | null>(null)
  const provider = useMemo<'youtube'|'vimeo'|'other'>(() => {
    if (ytIdFromUrl(url)) return 'youtube'
    if (vimeoIdFromUrl(url)) return 'vimeo'
    return 'other'
  }, [url])

  useEffect(() => {
    const yt = ytIdFromUrl(url)
    if (provider === 'youtube' && yt) {
      setSrc(`https://img.youtube.com/vi/${yt}/hqdefault.jpg`)
      return
    }
    const vimeo = vimeoIdFromUrl(url)
    if (provider === 'vimeo' && vimeo) {
      // oEmbed para obter thumbnail
      const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
      fetch(oembed)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setSrc(data.thumbnail_url))
        .catch(() => setSrc(null))
      return
    }
    setSrc(null)
  }, [provider, url])

  return (
    <div style={{width, height, overflow:'hidden', borderRadius:10, background:'#0f1530', border:'1px solid #1f2b64', display:'grid', placeItems:'center'}}>
      {src ? (
        <img src={src} alt="thumbnail" style={{width:'100%', height:'100%', objectFit:'cover'}} />
      ) : (
        <div className="muted" style={{fontSize:12}}>Sem miniatura</div>
      )}
    </div>
  )
}

