// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = process.env.PAYLOAD_REVALIDATION_TOKEN;
  const { path } = await req.json();

  // 1. On vérifie le secret partagé
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. On vérifie que le chemin à revalider est bien fourni
  if (!path) {
    return NextResponse.json({ message: 'Missing path param' }, { status: 400 })
  }

  try {
    // 3. On dit à Next.js de reconstruire la page
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err: unknown) {
    console.error(`Error revalidating path ${path}:`, err)
    return NextResponse.json({ message: `Error revalidating: ${err}` }, { status: 500 })
  }
}