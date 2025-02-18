CREATE TABLE "persona" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"description" varchar(255),
	"headshot_image_id" uuid,
	"body_image_id" uuid
);
--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_headshot_image_id_asset_id_fk" FOREIGN KEY ("headshot_image_id") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_body_image_id_asset_id_fk" FOREIGN KEY ("body_image_id") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;