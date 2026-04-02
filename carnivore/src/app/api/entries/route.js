import { put, head, getDownloadUrl } from '@vercel/blob'
import { NextResponse } from 'next/server'

const BLOB_KEY = 'carnivore-entries.json'
const ADMIN_PASSWORD = 'carnivore30'

async function getEntries() {
  try {
    const blob = await head(BLOB_KEY)
    const res = await fetch(blob.downloadUrl)
    return await res.json()
  } catch {
    return { startWeight: 251.4, entries: [] }
  }
}

export async function GET() {
  const data = await getEntries()
  return NextResponse.json(data)
}

export async function POST(request) {
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
    await put(BLOB_KEY, JSON.stringify(newData), { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'deleteEntry') {
    const entries = current.entries.filter(e => e.date !== body.date)
    const newData = { ...current, entries }
    await put(BLOB_KEY, JSON.stringify(newData), { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'setStartWeight') {
    const newData = { ...current, startWeight: body.weight }
    await put(BLOB_KEY, JSON.stringify(newData), { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
