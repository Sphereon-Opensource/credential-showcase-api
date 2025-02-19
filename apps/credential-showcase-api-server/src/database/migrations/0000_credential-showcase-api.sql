CREATE TYPE "public"."CredentialAttributeType" AS ENUM('STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE');--> statement-breakpoint
CREATE TYPE "public"."CredentialType" AS ENUM('ANONCRED');--> statement-breakpoint
CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_type" varchar(255) NOT NULL,
	"file_name" varchar(255),
	"description" varchar(255),
	"content" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentialAttribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"credential_attribute_type" "CredentialAttributeType",
	"credential_definition" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentialDefinition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(255) NOT NULL,
	"icon" uuid NOT NULL,
	"credential_type" "CredentialType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentialRepresentation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credential_definition" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revocationInfo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"credential_definition" uuid NOT NULL,
	CONSTRAINT "revocationInfo_credential_definition_unique" UNIQUE("credential_definition")
);
--> statement-breakpoint
ALTER TABLE "credentialAttribute" ADD CONSTRAINT "credentialAttribute_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentialDefinition" ADD CONSTRAINT "credentialDefinition_icon_asset_id_fk" FOREIGN KEY ("icon") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentialRepresentation" ADD CONSTRAINT "credentialRepresentation_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revocationInfo" ADD CONSTRAINT "revocationInfo_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;