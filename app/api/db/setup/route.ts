import dns from 'node:dns';
import { NextRequest, NextResponse } from 'next/server';
import { db, isDbConfigured } from '@/lib/db';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { contacts, tasks, opportunities, activities, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

dns.setDefaultResultOrder('ipv4first');

// Get database connection status and configuration information
export async function GET(req: NextRequest) {
  const configured = isDbConfigured();
  
  if (!configured) {
    return NextResponse.json({
      success: true,
      configured: false,
      status: 'not_configured',
      message: 'DATABASE_URL is not set or has an invalid format in .env or secrets.',
      databaseUrl: process.env.DATABASE_URL || ''
    });
  }

  // Try to test the database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 3000,
  });

  try {
    const client = await pool.connect();
    client.release();
    await pool.end();

    // Check if tables exist by querying them
    let migrationStatus = 'pending';
    try {
      await db.select().from(tasks).limit(1);
      migrationStatus = 'migrated';
    } catch (e) {
      migrationStatus = 'pending';
    }

    return NextResponse.json({
      success: true,
      configured: true,
      status: 'connected',
      migrationStatus,
      message: 'Successfully connected to the database!',
      databaseUrl: maskDatabaseUrl(process.env.DATABASE_URL)
    });
  } catch (error: any) {
    await pool.end().catch(() => {});
    return NextResponse.json({
      success: true,
      configured: true,
      status: 'error',
      message: `Failed to connect to database: ${error.message || error}`,
      databaseUrl: maskDatabaseUrl(process.env.DATABASE_URL)
    });
  }
}

// Post request triggers database migration and seeding
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'DATABASE_URL is not configured correctly.'
    }, { status: 400 });
  }

  const { seed = true } = await req.json().catch(() => ({ seed: true }));
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    max: 1,
  });

  try {
    const client = await pool.connect();
    try {
      console.log('Running custom migrations...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS "activities" (
          "id" text PRIMARY KEY NOT NULL,
          "type" text NOT NULL,
          "title" text NOT NULL,
          "description" text NOT NULL,
          "time" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS "contacts" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "role" text,
          "company" text,
          "status" text NOT NULL,
          "type" text NOT NULL,
          "last_contact" text NOT NULL,
          "deal_value" numeric NOT NULL,
          "initials" text NOT NULL,
          "avatar" text,
          "email" text NOT NULL,
          "phone" text,
          "created_at" timestamp DEFAULT now()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS "opportunities" (
          "id" text PRIMARY KEY NOT NULL,
          "company" text NOT NULL,
          "contact" text,
          "deal_value" numeric NOT NULL,
          "stage" text NOT NULL,
          "probability" integer NOT NULL,
          "active" boolean DEFAULT true NOT NULL,
          "initials" text NOT NULL,
          "created_at" timestamp DEFAULT now()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS "tasks" (
          "id" text PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "due" text NOT NULL,
          "assignee_avatar" text,
          "assignee_initials" text NOT NULL,
          "completed" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now()
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY NOT NULL,
          "email" text NOT NULL,
          "password" text NOT NULL,
          "name" text NOT NULL,
          "created_at" timestamp DEFAULT now(),
          CONSTRAINT "users_email_unique" UNIQUE("email")
        );
      `);

      // Enable Row Level Security (RLS) for all tables in Supabase to secure them
      console.log('Enabling Row Level Security on tables...');
      await client.query('ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;');
      await client.query('ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;');
      await client.query('ALTER TABLE "opportunities" ENABLE ROW LEVEL SECURITY;');
      await client.query('ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;');
      await client.query('ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;');
      
      console.log('Custom migrations completed successfully!');
    } finally {
      client.release();
    }

    // Optional seeding
    let seededCount = { contacts: 0, tasks: 0, opportunities: 0, activities: 0 };
    
    if (seed) {
      // Seed default admin user if not exists
      const existingUser = await db.select().from(users).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          email: 'admin@salesintel.com',
          password: 'admin',
          name: 'Alex Rivera'
        });
      }

      // Check if contacts are empty and seed
      const existingContacts = await db.select().from(contacts).limit(1);
      if (existingContacts.length === 0) {
        const INITIAL_CONTACTS = [
          {
            id: 'c-1',
            name: 'Jane Doe',
            role: 'Chief Procurement Officer',
            company: 'Global Logistics Inc.',
            status: 'Active',
            type: 'Customer',
            lastContact: '2 hours ago',
            dealValue: '42500',
            initials: 'JD',
            email: 'jane.doe@globallogistics.com',
            phone: '+1 (555) 234-5678'
          },
          {
            id: 'c-2',
            name: 'Marcus Sterling',
            role: 'Lead Architect',
            company: 'Apex Solutions',
            status: 'Lead',
            type: 'Lead',
            lastContact: 'Yesterday',
            dealValue: '18200',
            initials: 'MS',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo6hMOhEz0miY6h3MgB2GH9fTDx2_m707RtOMNwzfnXSQfp5SLwCF22lY63zT5OaEcI8XvbiyzPgXUF5tb0msj5R2KS_nw7O3caNpFSpvmRWswz1e0fGnPYQ5iRDfQZU1NpqcF-oJjwLmqG80RneS18r1ZxdKYPb0Z-W0wfWoKuYY5ea8rtCV66XSa0LIPo3iMY8l_1qD9RUY3_GUFV6UuqUz-cOURuVSQM02Wrgu408Kd3gqfbXTtmO3bircKlH-N05LW-pxUvieL',
            email: 'm.sterling@apexsolutions.io',
            phone: '+1 (555) 876-5432'
          },
          {
            id: 'c-3',
            name: 'Elena Rodriguez',
            role: 'VP Engineering',
            company: 'CloudScale Labs',
            status: 'Active',
            type: 'Customer',
            lastContact: 'Oct 12, 2023',
            dealValue: '124000',
            initials: 'EL',
            email: 'elena@cloudscalelabs.com',
            phone: '+1 (555) 901-2345'
          }
        ];
        await db.insert(contacts).values(INITIAL_CONTACTS);
        seededCount.contacts = INITIAL_CONTACTS.length;
      }

      // Check if tasks are empty and seed
      const existingTasks = await db.select().from(tasks).limit(1);
      if (existingTasks.length === 0) {
        const INITIAL_TASKS = [
          {
            id: 't-1',
            title: 'Client Follow-up',
            description: 'Call Sarah to confirm the Q4 hardware order details.',
            due: 'Today',
            assigneeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhK6AE4gX1llHKCznifMMWc6fRfNtmQdMGmxuYe8PTq7wZjVfZIZEEO0D6m94QLLr-hEYGrKmTcmoD4qndRXhsX91PTIdIdswoHtMJxkAClJ0Q3XKcsfXpgeAr_cXez6-2JbVK4OTaYcAwvi9_Xtps7AThkdjZ2RjUFOJbHU4Y5r32CRojx52ggQv2Efe-3evRGCVCNmwHbh5ufzWwNfi9y4iYcXNRZ4eWuwgf1iVBvsuSIQXMbAElkfhrmOjFBhBcwWSVI98m9Y7',
            assigneeInitials: 'SJ',
            completed: false
          },
          {
            id: 't-2',
            title: 'Review Contract',
            description: 'Send legal team the revised terms for Global logistics.',
            due: 'Tomorrow',
            assigneeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGMJXC9hN2TQ2s1fonJVWzwqXghWg7nCCehqPxp1TU0y5ubj7TcQnpx-inlCdCeScPD1F2MDetDitKgT5UWBZ0_SVTZQloaNceBy77Ctl6XHa5qgMMBz8VRLpNv_0BNaMjpJd1BOwGjktgwPCfKrc4l-QNqU3m7rq5nPEOVU-CBuhmx3hwBUpINudWVkghJTZK3VUJHLTAke2DF_jhRqTggXlO5VsVFmlsscN9nb_WooIw3TNuJ6FEaD3vdnMSFixTHzZ2hBEG-e_M',
            assigneeInitials: 'MS',
            completed: false
          }
        ];
        await db.insert(tasks).values(INITIAL_TASKS);
        seededCount.tasks = INITIAL_TASKS.length;
      }

      // Check if opportunities are empty and seed
      const existingOpps = await db.select().from(opportunities).limit(1);
      if (existingOpps.length === 0) {
        const INITIAL_OPPORTUNITIES = [
          {
            id: 'o-1',
            company: 'NovaSoft Corp',
            contact: 'Jessica Wu',
            dealValue: '82000',
            stage: 'Negotiation',
            probability: 85,
            active: true,
            initials: 'NS'
          },
          {
            id: 'o-2',
            company: 'Peak Logistics',
            contact: 'David Miller',
            dealValue: '45500',
            stage: 'Proposal Sent',
            probability: 60,
            active: true,
            initials: 'PL'
          }
        ];
        await db.insert(opportunities).values(INITIAL_OPPORTUNITIES);
        seededCount.opportunities = INITIAL_OPPORTUNITIES.length;
      }

      // Check if activities are empty and seed
      const existingActs = await db.select().from(activities).limit(1);
      if (existingActs.length === 0) {
        const INITIAL_ACTIVITIES = [
          {
            id: 'a-1',
            type: 'mail',
            title: 'Email sent to Sarah Jenkins',
            description: 'Follow-up on Q4 Proposal',
            time: '14 mins ago'
          },
          {
            id: 'a-2',
            type: 'call',
            title: 'Call finished with Mark Thompson',
            description: 'Contract negotiation phase',
            time: '2 hours ago'
          }
        ];
        await db.insert(activities).values(INITIAL_ACTIVITIES);
        seededCount.activities = INITIAL_ACTIVITIES.length;
      }
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Migrations completed and tables successfully configured in Supabase!',
      seededCount
    });
  } catch (error: any) {
    await pool.end().catch(() => {});
    return NextResponse.json({
      success: false,
      error: `Migration error: ${error.message || error}`
    }, { status: 500 });
  }
}

function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return '';
  try {
    // Basic masking to not expose passwords in UI
    const parts = url.split('@');
    if (parts.length > 1) {
      const creds = parts[0].split(':');
      if (creds.length > 2) {
        return `${creds[0]}:${creds[1]}:******@${parts[1]}`;
      }
      return `******@${parts[1]}`;
    }
    return url.substring(0, 15) + '...';
  } catch (e) {
    return 'Configured (Masked)';
  }
}
