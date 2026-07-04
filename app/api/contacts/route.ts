import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const allContacts = await db.select().from(contacts);
    const formattedContacts = allContacts.map(c => ({
      ...c,
      dealValue: Number(c.dealValue)
    }));
    return NextResponse.json({ success: true, data: formattedContacts });
  } catch (error: any) {
    const isNotMigrated = error.message?.includes('relation') && error.message?.includes('does not exist');
    if (isNotMigrated) {
      console.log('Database tables not migrated yet. Please run migrations in Settings.');
      return NextResponse.json({ success: false, code: 'NOT_MIGRATED', error: 'Tabelas não encontradas no banco de dados.' }, { status: 200 });
    }
    console.error('Failed to fetch contacts from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { action, contact } = body;

    if (action === 'delete') {
      await db.delete(contacts).where(eq(contacts.id, contact.id));
      return NextResponse.json({ success: true });
    }

    const contactData = {
      id: contact.id,
      name: contact.name,
      role: contact.role || '',
      company: contact.company || '',
      status: contact.status,
      type: contact.type,
      lastContact: contact.lastContact,
      dealValue: String(contact.dealValue || 0),
      initials: contact.initials,
      avatar: contact.avatar || '',
      email: contact.email,
      phone: contact.phone || ''
    };

    await db.insert(contacts)
      .values(contactData)
      .onConflictDoUpdate({
        target: contacts.id,
        set: contactData
      });

    return NextResponse.json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Failed to sync contact with Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
