import { useState } from 'react'
import { ImgHTMLAttributes } from 'react'

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSeed?: string
}

export function Img({ src, fallbackSeed, alt = '', ...props }: ImgProps) {
  const [failed, setFailed] = useState(false)
  const fallback = `https://picsum.photos/seed/${fallbackSeed ?? 'img'}/1200/800`
  return <img {...props} alt={alt} src={failed ? fallback : (src as string)} onError={() => setFailed(true)} />
}
