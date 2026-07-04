import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const allActivities = await db.select().from(activities);
    return NextResponse.json({ success: true, data: allActivities });
  } catch (error: any) {
    const isNotMigrated = error.message?.includes('relation') && error.message?.includes('does not exist');
    if (isNotMigrated) {
      console.log('Database tables not migrated yet. Please run migrations in Settings.');
      return NextResponse.json({ success: false, code: 'NOT_MIGRATED', error: 'Tabelas não encontradas no banco de dados.' }, { status: 200 });
    }
    console.error('Failed to fetch activities from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { action, activity } = body;

    if (action === 'delete') {
      await db.delete(activities).where(eq(activities.id, activity.id));
      return NextResponse.json({ success: true });
    }

    const activityData = {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: activity.time
    };

    await db.insert(activities)
      .values(activityData)
      .onConflictDoUpdate({
        target: activities.id,
        set: activityData
      });

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    console.error('Failed to sync activity with Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
