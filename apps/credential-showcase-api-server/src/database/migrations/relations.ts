import { relations } from "drizzle-orm/relations";
import { asset, persona } from "./schema";

export const personaRelations = relations(persona, ({one}) => ({
	asset_headshotImageId: one(asset, {
		fields: [persona.headshotImageId],
		references: [asset.id],
		relationName: "persona_headshotImageId_asset_id"
	}),
	asset_bodyImageId: one(asset, {
		fields: [persona.bodyImageId],
		references: [asset.id],
		relationName: "persona_bodyImageId_asset_id"
	}),
}));

export const assetRelations = relations(asset, ({many}) => ({
	personas_headshotImageId: many(persona, {
		relationName: "persona_headshotImageId_asset_id"
	}),
	personas_bodyImageId: many(persona, {
		relationName: "persona_bodyImageId_asset_id"
	}),
}));