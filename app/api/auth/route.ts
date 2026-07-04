import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      const user = foundUsers[0];

      if (user && user.password === password) {
        return NextResponse.json({ 
          success: true, 
          user: { email: user.email, name: user.name } 
        });
      } else {
        return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos.' }, { status: 401 });
      }
    }

    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json({ success: false, error: 'Todos os campos são obrigatórios.' }, { status: 400 });
      }

      const existingUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existingUsers.length > 0) {
        return NextResponse.json({ success: false, error: 'Este e-mail já está cadastrado.' }, { status: 400 });
      }

      const newUser = await db.insert(users).values({
        email: email.toLowerCase(),
        password,
        name
      }).returning();

      return NextResponse.json({ 
        success: true, 
        user: { email: newUser[0].email, name: newUser[0].name } 
      });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to authenticate in Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
