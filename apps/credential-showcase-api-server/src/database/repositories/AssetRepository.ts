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
        const [result] = await (await this.databaseService.getConnection())
            .insert(assets)
            .values(asset)
            .returning();

        return result
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(assets)
            .where(eq(assets.id, id))
    }

    async update(id: string, asset: Asset): Promise<Asset> { // TODO see the result of openapi and the payloads to determine how we update an asset
        await this.findById(id)
        const [result] = await (await this.databaseService.getConnection())
            .update(assets)
            .set(asset)
            .returning();

        return result
    }

    async findById(id: string): Promise<Asset> {
        const [result] = await (await this.databaseService.getConnection())
            .select()
            .from(assets)
            .where(eq(assets.id, id));

        if (!result) {
            return Promise.reject(new NotFoundError(`No asset found for id: ${id}`))
        }

        return result
    }

    async findAll(): Promise<Asset[]> {
        return (await this.databaseService.getConnection())
            .select()
            .from(assets);
    }
}

export default AssetRepository
