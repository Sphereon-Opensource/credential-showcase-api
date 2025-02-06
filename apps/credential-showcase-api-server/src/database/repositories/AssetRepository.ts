import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {Inject, Service} from 'typedi';
import { assets } from '../schema';
import { Asset, AssetRepositoryDefinition, NewAsset } from '../../types';


//AssetRepositoryArgs

@Service()
class AssetRepository implements AssetRepositoryDefinition {
    // private database: NodePgDatabase;
    //
    // constructor(args: AssetRepositoryArgs) {
    //     const { database } = args
    //     this.database = database
    // }

    constructor(@Inject("database") private readonly database: NodePgDatabase) {}

    async create(asset: NewAsset): Promise<Asset> {
        const result = await this.database
            .insert(assets)
            .values(asset)
            .returning();
        return result[0]
    }

    async delete(assetId: string): Promise<void> {
        await this.database
            .delete(assets)
            .where(eq(assets.assetId, assetId))
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
