import { put, list } from '@vercel/blob'
import { NextResponse } from 'next/server'

const BLOB_KEY = 'carnivore-entries.json'
const ADMIN_PASSWORD = 'carnivore30'

async function getEntries() {
  try {
    const { blobs } = await list()
    const blob = blobs.find(b => b.pathname === BLOB_KEY)
    if (!blob) return { startWeight: 251.4, entries: [] }
    const res = await fetch(blob.downloadUrl, { cache: 'no-store' })
    return await res.json()
  } catch (e) {
    console.error('getEntries error:', e)
    return { startWeight: 251.4, entries: [] }
  }
}

export async function GET() {
  const data = await getEntries()
  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const current = await getEntries()

    if (body.action === 'saveEntry') {
      const entry = body.entry
      const entries = current.entries.filter(e => e.date !== entry.date)
      entries.push(entry)
      entries.sort((a, b) => a.date.localeCompare(b.date))

      if (entry.weight && current.entries.length === 0) {
        current.startWeight = entry.weight
      }

      const newData = { ...current, entries }
      await put(BLOB_KEY, JSON.stringify(newData), { access: 'private', addRandomSuffix: false })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'deleteEntry') {
      const entries = current.entries.filter(e => e.date !== body.date)
      const newData = { ...current, entries }
      await put(BLOB_KEY, JSON.stringify(newData), { access: 'private', addRandomSuffix: false })
      return NextResponse.json({ success: true })
    }

    if (body.action === 'setStartWeight') {
      const newData = { ...current, startWeight: body.weight }
      await put(BLOB_KEY, JSON.stringify(newData), { access: 'private', addRandomSuffix: false })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
