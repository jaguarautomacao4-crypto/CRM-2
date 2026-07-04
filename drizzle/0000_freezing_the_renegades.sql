CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"time" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
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
--> statement-breakpoint
CREATE TABLE "opportunities" (
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
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due" text NOT NULL,
	"assignee_avatar" text,
	"assignee_initials" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
