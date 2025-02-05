import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { assets } from '../schema';
import { Asset, AssetRepositoryArgs, AssetRepositoryDefinition, NewAsset } from '../../types';

class AssetRepository implements AssetRepositoryDefinition {
    private database: NodePgDatabase;

    constructor(args: AssetRepositoryArgs) {
        const { database } = args
        this.database = database
    }

    async create(asset: NewAsset): Promise<Asset> {
        const result = await this.database
            .insert(assets)
            .values(asset)
            .returning();
        return result[0]
    }

    async delete(assetId: string): Promise<boolean> {
        return this.database
            .delete(assets)
            .where(eq(assets.assetId, assetId))
            .then(() => true)
    }

    async update(asset: Asset): Promise<Asset> {
        const result = await this.database
            .update(assets)
            .set(asset)
            .returning();
        return result[0]
    }

    async findById(assetId: string): Promise<Asset | null> {
        const result = await this.database
            .select()
            .from(assets)
            .where(eq(assets.assetId, assetId));
        return result.length > 0 ? result[0] : null;
    }

    async findAll(): Promise<Asset[]> {
        return this.database
            .select()
            .from(assets);
    }
}

export default AssetRepository
