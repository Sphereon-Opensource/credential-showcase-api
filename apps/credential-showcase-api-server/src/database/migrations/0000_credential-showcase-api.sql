CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_type" varchar(255) NOT NULL,
	"file_name" varchar(255),
	"description" varchar(255),
	"content" "bytea" NOT NULL
);

CREATE TYPE "issuer_type" AS ENUM ('ARIES');

CREATE TABLE "issuer" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" varchar(255),
    "type" issuer_type NOT NULL,
    "organization" varchar(255) NOT NULL,
    "logo_id" uuid REFERENCES "asset" ("id")
);