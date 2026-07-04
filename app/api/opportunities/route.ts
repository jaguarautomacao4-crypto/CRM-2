import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { opportunities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const allOpportunities = await db.select().from(opportunities);
    const formattedOpportunities = allOpportunities.map(o => ({
      ...o,
      dealValue: Number(o.dealValue)
    }));
    return NextResponse.json({ success: true, data: formattedOpportunities });
  } catch (error: any) {
    const isNotMigrated = error.message?.includes('relation') && error.message?.includes('does not exist');
    if (isNotMigrated) {
      console.log('Database tables not migrated yet. Please run migrations in Settings.');
      return NextResponse.json({ success: false, code: 'NOT_MIGRATED', error: 'Tabelas não encontradas no banco de dados.' }, { status: 200 });
    }
    console.error('Failed to fetch opportunities from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { action, opportunity } = body;

    if (action === 'delete') {
      await db.delete(opportunities).where(eq(opportunities.id, opportunity.id));
      return NextResponse.json({ success: true });
    }

    const opportunityData = {
      id: opportunity.id,
      company: opportunity.company,
      contact: opportunity.contact || '',
      dealValue: String(opportunity.dealValue || 0),
      stage: opportunity.stage,
      probability: Number(opportunity.probability || 0),
      active: !!opportunity.active,
      initials: opportunity.initials
    };

    await db.insert(opportunities)
      .values(opportunityData)
      .onConflictDoUpdate({
        target: opportunities.id,
        set: opportunityData
      });

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error: any) {
    console.error('Failed to sync opportunity with Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
