CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_type" varchar(255) NOT NULL,
	"file_name" varchar(255),
	"description" varchar(255),
	"content" "bytea" NOT NULL
);
