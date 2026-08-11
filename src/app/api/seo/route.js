import { NextResponse } from 'next/server'
import { getSeoForPath } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const seo = await getSeoForPath(path)
    return NextResponse.json({ success: true, seo })
  } catch (error) {
    console.error('Error in GET /api/seo:', error)
    return NextResponse.json({ success: false, message: 'Failed to resolve SEO' }, { status: 500 })
  }
}
