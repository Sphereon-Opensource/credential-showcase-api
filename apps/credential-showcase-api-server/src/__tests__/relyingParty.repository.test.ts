import 'reflect-metadata';
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../services/DatabaseService';
import RelyingPartyRepository from '../database/repositories/RelyingPartyRepository';
import CredentialDefinitionRepository from '../database/repositories/CredentialDefinitionRepository';
import * as schema from '../database/schema';
import { CredentialDefinition, NewAsset, NewCredentialDefinition, NewRelyingParty } from '../types';
import { CredentialAttributeType, CredentialType, RelyingPartyType } from '../types/rest';

describe('Database relying party repository tests', (): void => {
    let repository: RelyingPartyRepository;
    let credentialDefinition1: CredentialDefinition
    let credentialDefinition2: CredentialDefinition

    beforeEach(async (): Promise<void> => {
        const database: any = drizzle({ schema });
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        repository = Container.get(RelyingPartyRepository);
        const credentialDefinitionRepository = Container.get(CredentialDefinitionRepository);
        const newCredentialDefinition: NewCredentialDefinition = {
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
        credentialDefinition1 = await credentialDefinitionRepository.create(newCredentialDefinition)
        credentialDefinition2 = await credentialDefinitionRepository.create(newCredentialDefinition)
    })

    afterEach((): void => {
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save relying party to database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition1.id, credentialDefinition2.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await repository.create(relyingParty)

        expect(savedRelyingParty).toBeDefined()
        expect(savedRelyingParty.name).toEqual(relyingParty.name)
        expect(savedRelyingParty.type).toEqual(relyingParty.type)
        expect(savedRelyingParty.description).toEqual(relyingParty.description)
        expect(savedRelyingParty.organization).toEqual(relyingParty.organization);
        expect(savedRelyingParty.credentialDefinitions.length).toEqual(2);
        expect(savedRelyingParty.logo).not.toBeNull()
        expect(savedRelyingParty.logo!.id).toBeDefined()
        expect(savedRelyingParty.logo!.mediaType).toEqual((<NewAsset>relyingParty.logo).mediaType)
        expect(savedRelyingParty.logo!.fileName).toEqual((<NewAsset>relyingParty.logo).fileName)
        expect(savedRelyingParty.logo!.description).toEqual((<NewAsset>relyingParty.logo).description)
        expect(savedRelyingParty.logo!.content).toStrictEqual((<NewAsset>relyingParty.logo).content)
    })

    it('Should get relying party by id from database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition1.id, credentialDefinition2.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await repository.create(relyingParty)
        expect(savedRelyingParty).toBeDefined()

        const fromDb = await repository.findById(savedRelyingParty.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.name).toEqual(relyingParty.name)
        expect(fromDb.type).toEqual(relyingParty.type)
        expect(fromDb.description).toEqual(relyingParty.description)
        expect(fromDb.organization).toEqual(relyingParty.organization);
        expect(fromDb.credentialDefinitions.length).toEqual(2);
        expect(fromDb.logo).not.toBeNull()
        expect(fromDb.logo!.id).toBeDefined()
        expect(fromDb.logo!.mediaType).toEqual((<NewAsset>relyingParty.logo).mediaType)
        expect(fromDb.logo!.fileName).toEqual((<NewAsset>relyingParty.logo).fileName)
        expect(fromDb.logo!.description).toEqual((<NewAsset>relyingParty.logo).description)
        expect(fromDb.logo!.content).toStrictEqual((<NewAsset>relyingParty.logo).content)
    })

    it('Should get all relying parties from database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition1.id, credentialDefinition2.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty1 = await repository.create(relyingParty)
        expect(savedRelyingParty1).toBeDefined()

        const savedRelyingParty2 = await repository.create(relyingParty)
        expect(savedRelyingParty2).toBeDefined()

        const fromDb = await repository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete relying party from database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition1.id, credentialDefinition2.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await repository.create(relyingParty)
        expect(savedRelyingParty).toBeDefined()

        await repository.delete(savedRelyingParty.id)

        await expect(repository.findById(savedRelyingParty.id)).rejects.toThrowError(`No relying party found for id: ${savedRelyingParty.id}`)
    })

    it('Should update relying party in database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition1.id, credentialDefinition2.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await repository.create(relyingParty)
        expect(savedRelyingParty).toBeDefined()

        const newName = 'new_name'
        const updatedAsset = await repository.update(savedRelyingParty.id, { ...savedRelyingParty, name: newName })

        expect(updatedAsset).toBeDefined()
        expect(updatedAsset.name).toEqual(newName)
        expect(updatedAsset.type).toEqual(relyingParty.type)
        expect(updatedAsset.description).toEqual(relyingParty.description)
        expect(updatedAsset.organization).toEqual(relyingParty.organization);
        expect(updatedAsset.credentialDefinitions.length).toEqual(2);
        // expect(updatedAsset.logo).not.toBeNull()
        // expect(updatedAsset.logo!.id).toBeDefined()
        // expect(updatedAsset.logo!.mediaType).toEqual((<NewAsset>relyingParty.logo).mediaType)
        // expect(updatedAsset.logo!.fileName).toEqual((<NewAsset>relyingParty.logo).fileName)
        // expect(updatedAsset.logo!.description).toEqual((<NewAsset>relyingParty.logo).description)
        // expect(updatedAsset.logo!.content).toStrictEqual((<NewAsset>relyingParty.logo).content)
    })
})
