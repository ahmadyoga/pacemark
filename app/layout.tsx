import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pacemark — running sticker generator',
  description: 'Turn your runs into shareable Instagram stickers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
