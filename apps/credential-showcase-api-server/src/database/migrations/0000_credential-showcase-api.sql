CREATE TYPE "public"."CredentialAttributeType" AS ENUM('STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE');--> statement-breakpoint
CREATE TYPE "public"."CredentialType" AS ENUM('ANONCRED');--> statement-breakpoint
CREATE TYPE "public"."IssuerType" AS ENUM('ARIES');--> statement-breakpoint
CREATE TYPE "public"."StepType" AS ENUM('HUMAN_TASK', 'SERVICE', 'WORKFLOW');--> statement-breakpoint
CREATE TYPE "public"."WorkflowType" AS ENUM('ISSUANCE', 'PRESENTATION');--> statement-breakpoint
CREATE TYPE "public"."RelyingPartyType" AS ENUM('ARIES');--> statement-breakpoint
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
	"credential_attribute_type" "CredentialAttributeType" NOT NULL,
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
CREATE TABLE "relyingPartiesToCredentialDefinitions" (
	"relying_party" uuid NOT NULL,
	"credential_definition" uuid NOT NULL,
	CONSTRAINT "relyingPartiesToCredentialDefinitions_relying_party_credential_definition_pk" PRIMARY KEY("relying_party","credential_definition")
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
CREATE TABLE "issuer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"issuer_type" "IssuerType" NOT NULL,
	"description" varchar(255) NOT NULL,
	"organization" varchar(255),
	"logo" uuid
);
--> statement-breakpoint
CREATE TABLE "issuersToCredentialDefinitions" (
	"issuer" uuid NOT NULL,
	"credential_definition" uuid NOT NULL,
	CONSTRAINT "issuersToCredentialDefinitions_issuer_credential_definition_pk" PRIMARY KEY("issuer","credential_definition")
);
--> statement-breakpoint
CREATE TABLE "step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"step_type" "StepType" NOT NULL,
	"workflow" uuid NOT NULL,
	"asset" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stepAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"text" varchar(255) NOT NULL,
	"step" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"workflow_type" "WorkflowType" NOT NULL,
	"issuer" uuid,
	"relying_party" uuid,
	CONSTRAINT "workflow_type_check" CHECK (
            (workflow_type = 'PRESENTATION' AND relying_party IS NOT NULL) OR
            (workflow_type = 'ISSUANCE' AND issuer IS NOT NULL)
        )
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
ALTER TABLE "relyingPartiesToCredentialDefinitions" ADD CONSTRAINT "relyingPartiesToCredentialDefinitions_relying_party_relyingParty_id_fk" FOREIGN KEY ("relying_party") REFERENCES "public"."relyingParty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relyingPartiesToCredentialDefinitions" ADD CONSTRAINT "relyingPartiesToCredentialDefinitions_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relyingParty" ADD CONSTRAINT "relyingParty_logo_asset_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issuer" ADD CONSTRAINT "issuer_logo_asset_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issuersToCredentialDefinitions" ADD CONSTRAINT "issuersToCredentialDefinitions_issuer_issuer_id_fk" FOREIGN KEY ("issuer") REFERENCES "public"."issuer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issuersToCredentialDefinitions" ADD CONSTRAINT "issuersToCredentialDefinitions_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_workflow_workflow_id_fk" FOREIGN KEY ("workflow") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_asset_asset_id_fk" FOREIGN KEY ("asset") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stepAction" ADD CONSTRAINT "stepAction_step_step_id_fk" FOREIGN KEY ("step") REFERENCES "public"."step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_issuer_issuer_id_fk" FOREIGN KEY ("issuer") REFERENCES "public"."issuer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_relying_party_relyingParty_id_fk" FOREIGN KEY ("relying_party") REFERENCES "public"."relyingParty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revocationInfo" ADD CONSTRAINT "revocationInfo_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;