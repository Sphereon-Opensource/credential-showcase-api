import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';
import { NotFoundError } from '../../errors/NotFoundError';
import { assets } from '../schema';
import { Asset, AssetRepositoryDefinition, NewAsset } from '../../types';

@Service()
class AssetRepository implements AssetRepositoryDefinition {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(asset: NewAsset): Promise<Asset> {
        const result = await (await this.databaseService.getConnection())
            .insert(assets)
            .values(asset)
            .returning();

        return result[0]
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(assets)
            .where(eq(assets.id, id))
    }

    async update(id: string, asset: Asset): Promise<Asset> {  // TODO use id and asset
        await this.findById(id) // TODO fetch asset and update, maybe use NewAsset as update?
        const result = await (await this.databaseService.getConnection())
            .update(assets)
            .set(asset)
            .returning();

        return result[0]
    }

    async findById(id: string): Promise<Asset> {
        const result = await (await this.databaseService.getConnection())
            .select()
            .from(assets)
            .where(eq(assets.id, id));

        if (result.length === 0 && !result[0]) {
            return Promise.reject(new NotFoundError(`No asset found for id: ${id}`))
        }

        return result[0]
    }

    async findAll(): Promise<Asset[]> {
        return (await this.databaseService.getConnection())
            .select()
            .from(assets);
    }
}

export default AssetRepository
