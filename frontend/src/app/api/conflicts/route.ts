import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  const email = process.env.ACLED_EMAIL;
  const key = process.env.ACLED_PASS;

  if (!email || !key) {
    return NextResponse.json({ events: getMockConflicts() });
  }

  // Get events from the last 30 days
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const url = `https://api.acleddata.com/acled/read?key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}&event_date=${past}|${today}&event_date_where=BETWEEN&limit=200`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('ACLED API Error: ' + res.status);
    
    const data = await res.json();
    if (!data.success) throw new Error('ACLED success: false');

    const events = (data.data || []).map((e: any) => ({
      lat: parseFloat(e.latitude),
      lng: parseFloat(e.longitude),
      name: e.event_type || 'Conflict Event',
      type: e.sub_event_type || 'Armed clash',
      severity: e.fatalities > 10 ? 'critical' : e.fatalities > 0 ? 'warning' : 'info',
      desc: e.notes || 'ACLED conflict event reported.',
      date: e.event_date
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('[API] ACLED fetch failed:', error);
    return NextResponse.json({ events: getMockConflicts() });
  }
}

function getMockConflicts() {
  return [
    { lat: 48.5, lng: 35.0, name: 'Ukraine-Russia Front', type: 'Active War', severity: 'critical', desc: 'Ongoing military conflict. Eastern and southern front lines active.' },
    { lat: 31.5, lng: 34.4, name: 'Israel-Gaza Conflict', type: 'Active Hostilities', severity: 'critical', desc: 'Intensive military operations, regional escalation risk.' },
    { lat: 15.3, lng: 32.5, name: 'Sudan Civil Conflict', type: 'Civil War', severity: 'critical', desc: 'Armed conflict between SAF and RSF causing severe humanitarian crisis.' },
    { lat: 12.5, lng: 43.3, name: 'Red Sea Crisis', type: 'Naval Conflict', severity: 'warning', desc: 'Houthi attacks on commercial shipping causing rerouting of global trade.' },
    { lat: 16.8, lng: 96.1, name: 'Myanmar Internal Conflict', type: 'Civil War', severity: 'critical', desc: 'Ongoing conflict between military junta and resistance forces.' },
  ];
}
