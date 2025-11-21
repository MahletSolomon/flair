CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"size" varchar(50),
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;