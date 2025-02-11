CREATE TYPE "public"."CredentialAttributeType" AS ENUM('STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE');--> statement-breakpoint
CREATE TYPE "public"."CredentialType" AS ENUM('ANONCRED');--> statement-breakpoint
CREATE TYPE "public"."RelyingPartyType" AS ENUM('ARIES');--> statement-breakpoint
CREATE TYPE "public"."StepType" AS ENUM('HUMAN_TASK', 'SERVICE', 'WORKFLOW');--> statement-breakpoint
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
	"credential_definition_id" uuid NOT NULL
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
	"credential_definition_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revocationInfo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"credential_definition_id" uuid NOT NULL,
	CONSTRAINT "revocationInfo_credential_definition_id_unique" UNIQUE("credential_definition_id")
);
--> statement-breakpoint
CREATE TABLE "relyingParty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"relying_party_type" "RelyingPartyType" NOT NULL,
	"description" varchar(255) NOT NULL,
	"organization" varchar(255),
	"logo" uuid
);
--> statement-breakpoint
CREATE TABLE "relyingPartiesToCredentialDefinitions" (
	"relying_party_id" uuid NOT NULL,
	"credential_definition_id" uuid NOT NULL,
	CONSTRAINT "relyingPartiesToCredentialDefinitions_relying_party_id_credential_definition_id_pk" PRIMARY KEY("relying_party_id","credential_definition_id")
);
--> statement-breakpoint
CREATE TABLE "issuanceFlow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentationFlow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"step_type" "StepType" NOT NULL,
	"sub_issuance_flow" uuid NOT NULL,
	"sub_presentation_flow" uuid NOT NULL,
	"issuance_flow_id" uuid,
	"presentation_flow_id" uuid
);
--> statement-breakpoint
CREATE TABLE "stepAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"text" varchar(255) NOT NULL,
	"step_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credentialAttribute" ADD CONSTRAINT "credentialAttribute_credential_definition_id_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition_id") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentialDefinition" ADD CONSTRAINT "credentialDefinition_icon_asset_id_fk" FOREIGN KEY ("icon") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentialRepresentation" ADD CONSTRAINT "credentialRepresentation_credential_definition_id_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition_id") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revocationInfo" ADD CONSTRAINT "revocationInfo_credential_definition_id_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition_id") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relyingParty" ADD CONSTRAINT "relyingParty_logo_asset_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relyingPartiesToCredentialDefinitions" ADD CONSTRAINT "relyingPartiesToCredentialDefinitions_relying_party_id_relyingParty_id_fk" FOREIGN KEY ("relying_party_id") REFERENCES "public"."relyingParty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relyingPartiesToCredentialDefinitions" ADD CONSTRAINT "relyingPartiesToCredentialDefinitions_credential_definition_id_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition_id") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_sub_issuance_flow_issuanceFlow_id_fk" FOREIGN KEY ("sub_issuance_flow") REFERENCES "public"."issuanceFlow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_sub_presentation_flow_presentationFlow_id_fk" FOREIGN KEY ("sub_presentation_flow") REFERENCES "public"."presentationFlow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_issuance_flow_id_issuanceFlow_id_fk" FOREIGN KEY ("issuance_flow_id") REFERENCES "public"."issuanceFlow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_presentation_flow_id_presentationFlow_id_fk" FOREIGN KEY ("presentation_flow_id") REFERENCES "public"."presentationFlow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stepAction" ADD CONSTRAINT "stepAction_step_id_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."step"("id") ON DELETE cascade ON UPDATE no action;