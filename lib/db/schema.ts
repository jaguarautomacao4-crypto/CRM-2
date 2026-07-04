import { pgTable, serial, text, timestamp, boolean, integer, numeric } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contacts table
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(), // Using text to match 'c-1', 'c-2' or uuids
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  status: text('status').notNull(), // 'Active' | 'Lead' | 'Inactive'
  type: text('type').notNull(), // 'Customer' | 'Lead' | 'Partner'
  lastContact: text('last_contact').notNull(),
  dealValue: numeric('deal_value').notNull(),
  initials: text('initials').notNull(),
  avatar: text('avatar'),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(), // Match 't-1', 't-2' or uuids
  title: text('title').notNull(),
  description: text('description'),
  due: text('due').notNull(),
  assigneeAvatar: text('assignee_avatar'),
  assigneeInitials: text('assignee_initials').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Opportunities (Pipeline Deals) table
export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey(), // Match 'o-1', 'o-2' or uuids
  company: text('company').notNull(),
  contact: text('contact'),
  dealValue: numeric('deal_value').notNull(),
  stage: text('stage').notNull(),
  probability: integer('probability').notNull(),
  active: boolean('active').notNull().default(true),
  initials: text('initials').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activities (Timeline/Logs) table
export const activities = pgTable('activities', {
  id: text('id').primaryKey(), // Match 'a-1', 'a-2' or uuids
  type: text('type').notNull(), // 'mail' | 'call' | 'event' | 'note' | 'user'
  title: text('title').notNull(),
  description: text('description').notNull(),
  time: text('time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
