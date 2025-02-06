CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mediaType" varchar(255) NOT NULL,
	"fileName" varchar(255),
	"description" varchar(255),
	"data" "bytea" NOT NULL
);

CREATE TABLE "persona" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "role" varchar(255) NOT NULL,
    "description" varchar(255),
    "headshotImageId" uuid REFERENCES "asset" ("id") ON DELETE SET NULL,
    "bodyImageId" uuid REFERENCES "asset" ("id") ON DELETE SET NULL
)