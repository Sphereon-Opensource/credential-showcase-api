import 'reflect-metadata';
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../services/DatabaseService';
import RelyingPartyRepository from '../database/repositories/RelyingPartyRepository';
import * as schema from '../database/schema';
import {NewAsset, NewCredentialDefinition, NewRelyingParty} from '../types';
import {CredentialAttributeType, CredentialType, RelyingPartyType} from '../types/rest';
import CredentialDefinitionRepository from '../database/repositories/CredentialDefinitionRepository';

describe('Database relying party repository tests', (): void => {
    let relyingPartyRepository: RelyingPartyRepository;
    let credentialDefinitionRepository: CredentialDefinitionRepository;

    beforeEach(async (): Promise<void> => {
        const database: any = drizzle({ schema });
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        relyingPartyRepository = Container.get(RelyingPartyRepository);
        credentialDefinitionRepository = Container.get(CredentialDefinitionRepository);
    })

    afterEach((): void => {
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save asset to database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: ['a'],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await relyingPartyRepository.create(relyingParty)

        expect(savedRelyingParty).toBeDefined()
        expect(savedRelyingParty.name).toEqual(relyingParty.name)
        expect(savedRelyingParty.type).toEqual(relyingParty.type)
        expect(savedRelyingParty.description).toEqual(relyingParty.description)
        expect(savedRelyingParty.organization).toStrictEqual(relyingParty.organization);
        expect(savedRelyingParty.logo).not.toBeNull()
        expect(savedRelyingParty.logo!.id).toBeDefined()
        expect(savedRelyingParty.logo!.mediaType).toEqual((<NewAsset>relyingParty.logo).mediaType)
        expect(savedRelyingParty.logo!.fileName).toEqual((<NewAsset>relyingParty.logo).fileName)
        expect(savedRelyingParty.logo!.description).toEqual((<NewAsset>relyingParty.logo).description)
        expect(savedRelyingParty.logo!.content).toStrictEqual((<NewAsset>relyingParty.logo).content)
    })

    it('Should get asset by id from database', async (): Promise<void> => {
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

        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [savedCredentialDefinition.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await relyingPartyRepository.create(relyingParty)
        expect(savedRelyingParty).toBeDefined()

        const fromDb = await relyingPartyRepository.findById(savedRelyingParty.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.name).toEqual(relyingParty.name)
        expect(fromDb.type).toEqual(relyingParty.type)
        expect(fromDb.description).toEqual(relyingParty.description)
        expect(fromDb.organization).toStrictEqual(relyingParty.organization);
        expect(fromDb.logo).not.toBeNull()
        expect(fromDb.logo!.id).toBeDefined()
        expect(fromDb.logo!.mediaType).toEqual((<NewAsset>relyingParty.logo).mediaType)
        expect(fromDb.logo!.fileName).toEqual((<NewAsset>relyingParty.logo).fileName)
        expect(fromDb.logo!.description).toEqual((<NewAsset>relyingParty.logo).description)
        expect(fromDb.logo!.content).toStrictEqual((<NewAsset>relyingParty.logo).content)
    })

    it('Should get all assets from database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: ['a'],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty1 = await relyingPartyRepository.create(relyingParty)
        expect(savedRelyingParty1).toBeDefined()

        const savedRelyingParty2 = await relyingPartyRepository.create(relyingParty)
        expect(savedRelyingParty2).toBeDefined()

        const fromDb = await relyingPartyRepository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete asset from database', async (): Promise<void> => {
        const relyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: ['a'],
            description: 'example_description',
            organization: 'example_organization',
            logo: {
                mediaType: 'image/png',
                fileName: 'icon.png',
                description: 'some icon',
                content: Buffer.from('some binary data'),
            },
        };

        const savedRelyingParty = await relyingPartyRepository.create(relyingParty)
        expect(savedRelyingParty).toBeDefined()

        await relyingPartyRepository.delete(savedRelyingParty.id)

        await expect(relyingPartyRepository.findById(savedRelyingParty.id)).rejects.toThrowError(`No relying party found for id: ${savedRelyingParty.id}`)
    })

    // it('Should update asset in database', async (): Promise<void> => {
    //     const asset: NewRelyingParty = {
    //         mediaType: 'image/png',
    //         fileName: 'image.png',
    //         description: 'some image',
    //         content: Buffer.from('some binary data'),
    //     };
    //
    //     const savedAsset = await repository.create(asset)
    //     expect(savedAsset).toBeDefined()
    //
    //     const newFileName = 'new_image.png'
    //     const updatedAsset = await repository.update(savedAsset.id, { ...savedAsset, fileName: newFileName })
    //
    //     expect(updatedAsset).toBeDefined()
    //     expect(updatedAsset.mediaType).toEqual(asset.mediaType)
    //     expect(updatedAsset.fileName).toEqual(newFileName)
    //     expect(updatedAsset.description).toEqual(asset.description)
    //     expect(updatedAsset.content).toStrictEqual(asset.content);
    // })
})
