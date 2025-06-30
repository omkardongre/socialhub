import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // Avoid static optimization

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl?.startsWith('https://')) return new Response('Invalid URL', { status: 400 })

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`)
    
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/*',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new Response('Image fetch failed', { status: 500 })
  }
}
