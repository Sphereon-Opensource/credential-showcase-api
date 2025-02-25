CREATE TYPE "public"."CredentialAttributeType" AS ENUM('STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'DATE');--> statement-breakpoint
CREATE TYPE "public"."CredentialType" AS ENUM('ANONCRED');--> statement-breakpoint
CREATE TYPE "public"."IssuerType" AS ENUM('ARIES');--> statement-breakpoint
CREATE TYPE "public"."StepType" AS ENUM('HUMAN_TASK', 'SERVICE', 'WORKFLOW');--> statement-breakpoint
CREATE TYPE "public"."WorkflowType" AS ENUM('ISSUANCE', 'PRESENTATION');--> statement-breakpoint
CREATE TYPE "public"."RelyingPartyType" AS ENUM('ARIES');--> statement-breakpoint
CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_type" text NOT NULL,
	"file_name" text,
	"description" text,
	"content" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentialAttribute" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"credential_attribute_type" "CredentialAttributeType" NOT NULL,
	"credential_definition" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentialDefinition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
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
	"name" text NOT NULL,
	"relying_party_type" "RelyingPartyType" NOT NULL,
	"description" text NOT NULL,
	"organization" text,
	"logo" uuid
);
--> statement-breakpoint
CREATE TABLE "issuer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"issuer_type" "IssuerType" NOT NULL,
	"description" text NOT NULL,
	"organization" text,
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
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"step_type" "StepType" NOT NULL,
	"sub_flow" uuid,
	"workflow" uuid NOT NULL,
	"asset" uuid,
	CONSTRAINT "step_order_workflow_unique" UNIQUE("order","workflow")
);
--> statement-breakpoint
CREATE TABLE "stepAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actionType" text NOT NULL,
	"title" text NOT NULL,
	"text" text NOT NULL,
	"step" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
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
	"title" text NOT NULL,
	"description" text NOT NULL,
	"credential_definition" uuid NOT NULL,
	CONSTRAINT "revocationInfo_credential_definition_unique" UNIQUE("credential_definition")
);
--> statement-breakpoint
CREATE TABLE "persona" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"description" text NOT NULL,
	"headshot_image" uuid,
	"body_image" uuid
);
--> statement-breakpoint
CREATE TABLE "workflowsToPersonas" (
	"workflow" uuid NOT NULL,
	"persona" uuid NOT NULL,
	CONSTRAINT "workflowsToPersonas_workflow_persona_pk" PRIMARY KEY("workflow","persona")
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
ALTER TABLE "step" ADD CONSTRAINT "step_sub_flow_workflow_id_fk" FOREIGN KEY ("sub_flow") REFERENCES "public"."workflow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_workflow_workflow_id_fk" FOREIGN KEY ("workflow") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_asset_asset_id_fk" FOREIGN KEY ("asset") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stepAction" ADD CONSTRAINT "stepAction_step_step_id_fk" FOREIGN KEY ("step") REFERENCES "public"."step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_issuer_issuer_id_fk" FOREIGN KEY ("issuer") REFERENCES "public"."issuer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_relying_party_relyingParty_id_fk" FOREIGN KEY ("relying_party") REFERENCES "public"."relyingParty"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revocationInfo" ADD CONSTRAINT "revocationInfo_credential_definition_credentialDefinition_id_fk" FOREIGN KEY ("credential_definition") REFERENCES "public"."credentialDefinition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_headshot_image_asset_id_fk" FOREIGN KEY ("headshot_image") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_body_image_asset_id_fk" FOREIGN KEY ("body_image") REFERENCES "public"."asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflowsToPersonas" ADD CONSTRAINT "workflowsToPersonas_workflow_workflow_id_fk" FOREIGN KEY ("workflow") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflowsToPersonas" ADD CONSTRAINT "workflowsToPersonas_persona_persona_id_fk" FOREIGN KEY ("persona") REFERENCES "public"."persona"("id") ON DELETE cascade ON UPDATE no action;