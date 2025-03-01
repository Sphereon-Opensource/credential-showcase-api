import 'reflect-metadata';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../../../services/DatabaseService';
import AssetRepository from '../AssetRepository';
import CredentialDefinitionRepository from '../CredentialDefinitionRepository';
import * as schema from '../../schema';
import { Asset, NewAsset, CredentialAttributeType, CredentialType, NewCredentialDefinition } from '../../../types';

describe('Database credential definition repository tests', (): void => {
    let client: PGlite;
    let credentialDefinitionRepository: CredentialDefinitionRepository;
    let asset: Asset;

    beforeEach(async (): Promise<void> => {
        client = new PGlite();
        const database = drizzle(client, { schema }) as unknown as NodePgDatabase;
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        credentialDefinitionRepository = Container.get(CredentialDefinitionRepository);
        const assetRepository = Container.get(AssetRepository);
        const newAsset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };
        asset = await assetRepository.create(newAsset)
    })

    afterEach(async (): Promise<void> => {
        await client.close();
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save credential definition to database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {

                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                },
                {
                    name: 'example_attribute_name2',
                    value: 'example_attribute_value2',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                },
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ],
            revocation: { // TODO SHOWCASE-80 AnonCredRevocation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)

        expect(savedCredentialDefinition).toBeDefined()
        expect(savedCredentialDefinition.name).toEqual(credentialDefinition.name)
        expect(savedCredentialDefinition.version).toEqual(credentialDefinition.version)
        expect(savedCredentialDefinition.icon).toBeDefined()
        expect(savedCredentialDefinition.icon.id).toBeDefined()
        expect(savedCredentialDefinition.icon.mediaType).toEqual(asset.mediaType)
        expect(savedCredentialDefinition.icon.fileName).toEqual(asset.fileName)
        expect(savedCredentialDefinition.icon.description).toEqual(asset.description)
        expect(savedCredentialDefinition.icon.content).toStrictEqual(asset.content)
        expect(savedCredentialDefinition.attributes.length).toEqual(2)
        expect(savedCredentialDefinition.attributes[0].name).toEqual(credentialDefinition.attributes[0].name)
        expect(savedCredentialDefinition.attributes[0].value).toEqual(credentialDefinition.attributes[0].value)
        expect(savedCredentialDefinition.attributes[0].type).toEqual(credentialDefinition.attributes[0].type)
        expect(savedCredentialDefinition.representations.length).toEqual(2)
        // TODO SHOWCASE-81 representations
        expect(savedCredentialDefinition.revocation).not.toBeNull()
        expect(savedCredentialDefinition.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        expect(savedCredentialDefinition.revocation!.description).toEqual(credentialDefinition.revocation!.description)
        // TODO SHOWCASE-80 AnonCredRevocation
    })

    it('Should throw error when saving credential definition with invalid icon id', async (): Promise<void> => {
        const unknownIconId = 'a197e5b2-e4e5-4788-83b1-ecaa0e99ed3a'
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: unknownIconId,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ]
        };

        await expect(credentialDefinitionRepository.create(credentialDefinition)).rejects.toThrowError(`No asset found for id: ${unknownIconId}`)
    })

    it('Should get credential definition by id from database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                },
                {
                    name: 'example_attribute_name2',
                    value: 'example_attribute_value2',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                },
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ],
            revocation: { // TODO SHOWCASE-80 AnonCredRevocation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        const fromDb = await credentialDefinitionRepository.findById(savedCredentialDefinition.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.name).toEqual(credentialDefinition.name)
        expect(fromDb.version).toEqual(credentialDefinition.version)
        expect(fromDb.icon).toBeDefined()
        expect(fromDb.icon.id).toBeDefined()
        expect(fromDb.icon.mediaType).toEqual(asset.mediaType)
        expect(fromDb.icon.fileName).toEqual(asset.fileName)
        expect(fromDb.icon.description).toEqual(asset.description)
        expect(fromDb.icon.content).toStrictEqual(asset.content)
        expect(fromDb.attributes.length).toEqual(2)
        expect(fromDb.attributes[0].name).toEqual(credentialDefinition.attributes[0].name)
        expect(fromDb.attributes[0].value).toEqual(credentialDefinition.attributes[0].value)
        expect(fromDb.attributes[0].type).toEqual(credentialDefinition.attributes[0].type)
        expect(fromDb.representations.length).toEqual(2)
        // TODO SHOWCASE-81 representations
        expect(fromDb.revocation).not.toBeNull()
        expect(fromDb.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        expect(fromDb.revocation!.description).toEqual(credentialDefinition.revocation!.description)
        // TODO SHOWCASE-80 AnonCredRevocation
    })

    it('Should get all credential definitions from database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ]
        };

        const savedCredentialDefinition1 = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition1).toBeDefined()

        const savedCredentialDefinition2 = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition2).toBeDefined()

        const fromDb = await credentialDefinitionRepository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete credential definition from database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ]
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        await credentialDefinitionRepository.delete(savedCredentialDefinition.id)

        await expect(credentialDefinitionRepository.findById(savedCredentialDefinition.id)).rejects.toThrowError(`No credential definition found for id: ${savedCredentialDefinition.id}`)
    })

    it('Should update credential definition in database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                },
                {
                    name: 'example_attribute_name2',
                    value: 'example_attribute_value2',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                },
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ],
            revocation: { // TODO SHOWCASE-80 AnonCredRevocation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        const newName = 'new_name'
        const updatedCredentialDefinition = await credentialDefinitionRepository.update(savedCredentialDefinition.id, {
            ...savedCredentialDefinition,
            icon: savedCredentialDefinition.icon.id,
            name: newName,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.BOOLEAN
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ]
        })

        expect(updatedCredentialDefinition).toBeDefined()
        expect(updatedCredentialDefinition.name).toEqual(newName)
        expect(updatedCredentialDefinition.version).toEqual(credentialDefinition.version)
        expect(updatedCredentialDefinition.icon).toBeDefined()
        expect(updatedCredentialDefinition.icon.id).toBeDefined()
        expect(updatedCredentialDefinition.icon.mediaType).toEqual(asset.mediaType)
        expect(updatedCredentialDefinition.icon.fileName).toEqual(asset.fileName)
        expect(updatedCredentialDefinition.icon.description).toEqual(asset.description)
        expect(updatedCredentialDefinition.icon.content).toStrictEqual(asset.content)
        expect(updatedCredentialDefinition.attributes.length).toEqual(1)
        expect(updatedCredentialDefinition.attributes[0].name).toEqual(updatedCredentialDefinition.attributes[0].name)
        expect(updatedCredentialDefinition.attributes[0].value).toEqual(updatedCredentialDefinition.attributes[0].value)
        expect(updatedCredentialDefinition.attributes[0].type).toEqual(updatedCredentialDefinition.attributes[0].type)
        expect(updatedCredentialDefinition.representations.length).toEqual(1)
        // TODO SHOWCASE-81 representations
        // expect(updatedCredentialDefinition.revocation).not.toBeNull()
        // expect(updatedCredentialDefinition.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        // expect(updatedCredentialDefinition.revocation!.description).toEqual(credentialDefinition.revocation!.description)
        // TODO SHOWCASE-80 AnonCredRevocation
    })

    it('Should throw error when updating credential definition with invalid icon id', async (): Promise<void> => {
        const unknownIconId = 'a197e5b2-e4e5-4788-83b1-ecaa0e99ed3a';
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: asset.id,
            type: CredentialType.ANONCRED,
            attributes: [
                {
                    name: 'example_attribute_name1',
                    value: 'example_attribute_value1',
                    type: CredentialAttributeType.STRING
                },
                {
                    name: 'example_attribute_name2',
                    value: 'example_attribute_value2',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO SHOWCASE-81 OCARepresentation

                },
                { // TODO SHOWCASE-81 OCARepresentation

                }
            ],
            revocation: { // TODO SHOWCASE-80 AnonCredRevocation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        const updatedCredentialDefinition: NewCredentialDefinition = {
            ...savedCredentialDefinition,
            icon: unknownIconId
        }

        await expect(credentialDefinitionRepository.update(savedCredentialDefinition.id, updatedCredentialDefinition)).rejects.toThrowError(`No asset found for id: ${unknownIconId}`)
    })
})
