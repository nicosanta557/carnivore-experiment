import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'carnivore30'
const START_WEIGHT = 251.4

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return NextResponse.json({ startWeight: START_WEIGHT, entries: data || [] })
  } catch (e) {
    console.error('GET error:', e)
    return NextResponse.json({ startWeight: START_WEIGHT, entries: [] })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    if (body.action === 'saveEntry') {
      const { error } = await supabase
        .from('entries')
        .upsert({
          date: body.entry.date,
          day: body.entry.day,
          weight: body.entry.weight,
          calories: body.entry.calories,
          protein: body.entry.protein,
          fat: body.entry.fat,
          carbs: body.entry.carbs,
          note: body.entry.note,
        }, { onConflict: 'date' })

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (body.action === 'deleteEntry') {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('date', body.date)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}