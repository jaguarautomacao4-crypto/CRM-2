import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const allTasks = await db.select().from(tasks);
    return NextResponse.json({ success: true, data: allTasks });
  } catch (error: any) {
    const isNotMigrated = error.message?.includes('relation') && error.message?.includes('does not exist');
    if (isNotMigrated) {
      console.log('Database tables not migrated yet. Please run migrations in Settings.');
      return NextResponse.json({ success: false, code: 'NOT_MIGRATED', error: 'Tabelas não encontradas no banco de dados.' }, { status: 200 });
    }
    console.error('Failed to fetch tasks from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, error: 'DATABASE_URL not configured' }, { status: 200 });
  }

  try {
    const body = await req.json();
    const { action, task } = body;

    if (action === 'delete') {
      await db.delete(tasks).where(eq(tasks.id, task.id));
      return NextResponse.json({ success: true });
    }

    const taskData = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      due: task.due,
      assigneeAvatar: task.assigneeAvatar || '',
      assigneeInitials: task.assigneeInitials,
      completed: !!task.completed
    };

    await db.insert(tasks)
      .values(taskData)
      .onConflictDoUpdate({
        target: tasks.id,
        set: taskData
      });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Failed to sync task with Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
