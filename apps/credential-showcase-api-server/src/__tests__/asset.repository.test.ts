import 'reflect-metadata';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import { DatabaseService } from '../services/DatabaseService';
import AssetRepository from '../database/repositories/AssetRepository';
import { NewAsset } from '../types';

describe('Database asset repository tests', (): void => {
    let repository: AssetRepository;

    beforeEach(async (): Promise<void> => {
        const database: PgDatabase<any> = drizzle();
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        repository = Container.get(AssetRepository);
    })

    afterEach((): void => {
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save asset to database', async (): Promise<void> => {
        const asset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset = await repository.create(asset)

        expect(savedAsset).toBeDefined()
        expect(savedAsset.mediaType).toEqual(asset.mediaType)
        expect(savedAsset.fileName).toEqual(asset.fileName)
        expect(savedAsset.description).toEqual(asset.description)
        expect(savedAsset.content).toStrictEqual(asset.content);
    })

    it('Should get asset by id from database', async (): Promise<void> => {
        const asset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset = await repository.create(asset)
        expect(savedAsset).toBeDefined()

        const fromDb = await repository.findById(savedAsset.id)

        expect(fromDb).not.toBeNull()
        expect(fromDb!.mediaType).toEqual(asset.mediaType)
        expect(fromDb!.fileName).toEqual(asset.fileName)
        expect(fromDb!.description).toEqual(asset.description)
        expect(fromDb!.content).toStrictEqual(asset.content);
    })

    it('Should get all assets from database', async (): Promise<void> => {
        const asset1: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset1 = await repository.create(asset1)
        expect(savedAsset1).toBeDefined()

        const asset2: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset2 = await repository.create(asset2)
        expect(savedAsset2).toBeDefined()

        const fromDb = await repository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete asset from database', async (): Promise<void> => {
        const asset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset = await repository.create(asset)
        expect(savedAsset).toBeDefined()

        await repository.delete(savedAsset.id)

        await expect(repository.findById(savedAsset.id)).rejects.toThrowError(`No asset found for id: ${savedAsset.id}`)
    })

    it('Should update asset in database', async (): Promise<void> => {
        const asset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset = await repository.create(asset)
        expect(savedAsset).toBeDefined()

        const newFileName = 'new_image.png'
        const updatedAsset = await repository.update(savedAsset.id, { ...savedAsset, fileName: newFileName })

        expect(updatedAsset).toBeDefined()
        expect(updatedAsset.mediaType).toEqual(asset.mediaType)
        expect(updatedAsset.fileName).toEqual(newFileName)
        expect(updatedAsset.description).toEqual(asset.description)
        expect(updatedAsset.content).toStrictEqual(asset.content);
    })
})
