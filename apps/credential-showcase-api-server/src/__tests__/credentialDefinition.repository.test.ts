import 'reflect-metadata';
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../services/DatabaseService';
import AssetRepository from '../database/repositories/AssetRepository';
import CredentialDefinitionRepository from '../database/repositories/CredentialDefinitionRepository';
import * as schema from '../database/schema';
import { NewAsset, NewCredentialDefinition } from '../types';
import { CredentialAttributeType, CredentialType } from '../types/rest';

describe('Database credential definition repository tests', (): void => {
    let credentialDefinitionRepository: CredentialDefinitionRepository;
    let assetRepository: AssetRepository;

    beforeEach(async (): Promise<void> => {
        const database: any = drizzle({ schema });
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        credentialDefinitionRepository = Container.get(CredentialDefinitionRepository);
        assetRepository = Container.get(AssetRepository);
    })

    afterEach((): void => {
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save credential definition to database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ],
            revocation: { // TODO OCARepresentation
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
        expect(savedCredentialDefinition.icon.mediaType).toEqual((<NewAsset>credentialDefinition.icon).mediaType)
        expect(savedCredentialDefinition.icon.fileName).toEqual((<NewAsset>credentialDefinition.icon).fileName)
        expect(savedCredentialDefinition.icon.description).toEqual((<NewAsset>credentialDefinition.icon).description)
        expect(savedCredentialDefinition.icon.content).toStrictEqual((<NewAsset>credentialDefinition.icon).content)
        expect(savedCredentialDefinition.attributes.length).toEqual(2)
        expect(savedCredentialDefinition.attributes[0].name).toEqual(credentialDefinition.attributes[0].name)
        expect(savedCredentialDefinition.attributes[0].value).toEqual(credentialDefinition.attributes[0].value)
        expect(savedCredentialDefinition.attributes[0].type).toEqual(credentialDefinition.attributes[0].type)
        expect(savedCredentialDefinition.representations.length).toEqual(2)
        // TODO representations
        expect(savedCredentialDefinition.revocation).not.toBeNull()
        expect(savedCredentialDefinition.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        expect(savedCredentialDefinition.revocation!.description).toEqual(credentialDefinition.revocation!.description)
    })

    it('Should save credential definition to database with icon id', async (): Promise<void> => {
        const asset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };

        const savedAsset = await assetRepository.create(asset)
        expect(savedAsset).toBeDefined()

        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: savedAsset.id,
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ]
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)

        expect(savedCredentialDefinition).toBeDefined()
        expect(savedCredentialDefinition.icon).toBeDefined()
        expect(savedCredentialDefinition.icon.id).toEqual(savedAsset.id)
        expect(savedCredentialDefinition.icon.mediaType).toEqual(savedAsset.mediaType)
        expect(savedCredentialDefinition.icon.fileName).toEqual(savedAsset.fileName)
        expect(savedCredentialDefinition.icon.description).toEqual(savedAsset.description)
        expect(savedCredentialDefinition.icon.content).toStrictEqual(savedAsset.content)
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
                },
                {
                    name: 'example_attribute_name2',
                    value: 'example_attribute_value2',
                    type: CredentialAttributeType.STRING
                }
            ],
            representations: [
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ]
        };

        await expect(credentialDefinitionRepository.create(credentialDefinition)).rejects.toThrowError(`No asset found for id: ${unknownIconId}`)
    })

    it('Should get credential definition by id from database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ],
            revocation: { // TODO OCARepresentation
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
        expect(fromDb.icon.mediaType).toEqual((<NewAsset>credentialDefinition.icon).mediaType)
        expect(fromDb.icon.fileName).toEqual((<NewAsset>credentialDefinition.icon).fileName)
        expect(fromDb.icon.description).toEqual((<NewAsset>credentialDefinition.icon).description)
        expect(fromDb.icon.content).toStrictEqual((<NewAsset>credentialDefinition.icon).content)
        expect(fromDb.attributes.length).toEqual(2)
        expect(fromDb.attributes[0].name).toEqual(credentialDefinition.attributes[0].name)
        expect(fromDb.attributes[0].value).toEqual(credentialDefinition.attributes[0].value)
        expect(fromDb.attributes[0].type).toEqual(credentialDefinition.attributes[0].type)
        expect(fromDb.representations.length).toEqual(2)
        // TODO representations
        expect(fromDb.revocation).not.toBeNull()
        expect(fromDb.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        expect(fromDb.revocation!.description).toEqual(credentialDefinition.revocation!.description)
    })

    it('Should get all credential definitions from database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ],
            revocation: { // TODO OCARepresentation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
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
            icon: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ],
            revocation: { // TODO OCARepresentation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        await credentialDefinitionRepository.delete(savedCredentialDefinition.id)

        await expect(credentialDefinitionRepository.findById(savedCredentialDefinition.id)).rejects.toThrowError(`No credential definition found for id: ${savedCredentialDefinition.id}`)
    })

    // TODO test attributes, 2 in, update 2 new ones, what happens to the old 2
    it('Should update credential definition in database', async (): Promise<void> => {
        const credentialDefinition: NewCredentialDefinition = {
            name: 'example_name',
            version: 'example_version',
            icon: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
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
                { // TODO AnonCredRevocation

                },
                { // TODO AnonCredRevocation

                }
            ],
            revocation: { // TODO OCARepresentation
                title: 'example_revocation_title',
                description: 'example_revocation_description'
            }
        };

        const savedCredentialDefinition = await credentialDefinitionRepository.create(credentialDefinition)
        expect(savedCredentialDefinition).toBeDefined()

        const newName = 'new_name'
        const updatedCredentialDefinition = await credentialDefinitionRepository.update(savedCredentialDefinition.id, { ...savedCredentialDefinition, name: newName })

        expect(updatedCredentialDefinition).toBeDefined()
        expect(updatedCredentialDefinition.name).toEqual(newName)
        expect(updatedCredentialDefinition.version).toEqual(credentialDefinition.version)
        expect(updatedCredentialDefinition.icon).toBeDefined()
        expect(updatedCredentialDefinition.icon.id).toBeDefined()
        expect(updatedCredentialDefinition.icon.mediaType).toEqual((<NewAsset>credentialDefinition.icon).mediaType)
        expect(updatedCredentialDefinition.icon.fileName).toEqual((<NewAsset>credentialDefinition.icon).fileName)
        expect(updatedCredentialDefinition.icon.description).toEqual((<NewAsset>credentialDefinition.icon).description)
        expect(updatedCredentialDefinition.icon.content).toStrictEqual((<NewAsset>credentialDefinition.icon).content)
        expect(updatedCredentialDefinition.attributes.length).toEqual(2)
        expect(updatedCredentialDefinition.attributes[0].name).toEqual(credentialDefinition.attributes[0].name)
        expect(updatedCredentialDefinition.attributes[0].value).toEqual(credentialDefinition.attributes[0].value)
        expect(updatedCredentialDefinition.attributes[0].type).toEqual(credentialDefinition.attributes[0].type)
        expect(updatedCredentialDefinition.representations.length).toEqual(2)
        // TODO representations
        expect(updatedCredentialDefinition.revocation).not.toBeNull()
        expect(updatedCredentialDefinition.revocation!.title).toEqual(credentialDefinition.revocation!.title)
        expect(updatedCredentialDefinition.revocation!.description).toEqual(credentialDefinition.revocation!.description)
    })
})
