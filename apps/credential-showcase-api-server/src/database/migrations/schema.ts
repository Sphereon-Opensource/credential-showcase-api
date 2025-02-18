import { pgTable, uuid, varchar, foreignKey } from "drizzle-orm/pg-core"

export const asset = pgTable("asset", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	mediaType: varchar("media_type", { length: 255 }).notNull(),
	fileName: varchar("file_name", { length: 255 }),
	description: varchar({ length: 255 }),
	// TODO: failed to parse database type 'bytea'
	content: varchar("content").notNull(),
});

export const persona = pgTable("persona", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
	headshotImageId: uuid("headshot_image_id"),
	bodyImageId: uuid("body_image_id"),
}, (table) => [
	foreignKey({
			columns: [table.headshotImageId],
			foreignColumns: [asset.id],
			name: "persona_headshot_image_id_asset_id_fk"
		}),
	foreignKey({
			columns: [table.bodyImageId],
			foreignColumns: [asset.id],
			name: "persona_body_image_id_asset_id_fk"
		}),
]);
