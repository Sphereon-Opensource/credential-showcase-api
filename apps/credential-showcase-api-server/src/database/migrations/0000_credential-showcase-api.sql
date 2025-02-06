CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mediaType" varchar(255) NOT NULL,
	"fileName" varchar(255),
	"description" varchar(255),
	"content" "bytea" NOT NULL
);
