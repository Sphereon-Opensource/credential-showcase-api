import 'reflect-metadata';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../services/DatabaseService';
import PresentationFlowRepository from '../database/repositories/PresentationFlowRepository';
import RelyingPartyRepository from '../database/repositories/RelyingPartyRepository';
import CredentialDefinitionRepository from '../database/repositories/CredentialDefinitionRepository';
import AssetRepository from '../database/repositories/AssetRepository';
import * as schema from '../database/schema';
import {
    Asset,
    NewAsset,
    NewCredentialDefinition,
    NewPresentationFlow,
    NewStep,
    NewStepAction,
    CredentialAttributeType,
    CredentialType,
    StepType,
    NewRelyingParty,
    RelyingPartyType,
    RelyingParty
} from '../types';

describe('Database presentation flow repository tests', (): void => {
    let client: PGlite;
    let repository: PresentationFlowRepository;
    let relyingParty: RelyingParty
    let asset: Asset

    beforeEach(async (): Promise<void> => {
        client = new PGlite();
        const database = drizzle(client, { schema }) as unknown as NodePgDatabase;
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        repository = Container.get(PresentationFlowRepository);
        const relyingPartyRepository = Container.get(RelyingPartyRepository);
        const credentialDefinitionRepository = Container.get(CredentialDefinitionRepository);
        const assetRepository = Container.get(AssetRepository);
        const newAsset: NewAsset = {
            mediaType: 'image/png',
            fileName: 'image.png',
            description: 'some image',
            content: Buffer.from('some binary data'),
        };
        asset = await assetRepository.create(newAsset)
        const newCredentialDefinition: NewCredentialDefinition = {
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
        const credentialDefinition = await credentialDefinitionRepository.create(newCredentialDefinition)
        const newRelyingParty: NewRelyingParty = {
            name: 'example_name',
            type: RelyingPartyType.ARIES,
            credentialDefinitions: [credentialDefinition.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: asset.id,
        };
        relyingParty = await relyingPartyRepository.create(newRelyingParty)
    })

    afterEach(async (): Promise<void> => {
        await client.close();
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save presentation flow to database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)

        expect(savedPresentationFlow).toBeDefined()
        expect(savedPresentationFlow.name).toEqual(presentationFlow.name)
        expect(savedPresentationFlow.description).toEqual(presentationFlow.description)
        expect(savedPresentationFlow.steps).toBeDefined();
        expect(savedPresentationFlow.steps.length).toEqual(2)
        expect(savedPresentationFlow.steps[0].title).toEqual(presentationFlow.steps[0].title)
        expect(savedPresentationFlow.steps[0].order).toEqual(presentationFlow.steps[0].order)
        expect(savedPresentationFlow.steps[0].type).toEqual(presentationFlow.steps[0].type)
        expect(savedPresentationFlow.steps[0].actions.length).toEqual(1)
        expect(savedPresentationFlow.steps[0].actions[0].id).toBeDefined()
        expect(savedPresentationFlow.steps[0].actions[0].title).toEqual(presentationFlow.steps[0].actions[0].title)
        expect(savedPresentationFlow.steps[0].actions[0].actionType).toEqual(presentationFlow.steps[0].actions[0].actionType)
        expect(savedPresentationFlow.steps[0].actions[0].text).toEqual(presentationFlow.steps[0].actions[0].text)
        expect(savedPresentationFlow.steps[0].asset).not.toBeNull()
        expect(savedPresentationFlow.steps[0].asset!.mediaType).toEqual(asset.mediaType)
        expect(savedPresentationFlow.steps[0].asset!.fileName).toEqual(asset.fileName)
        expect(savedPresentationFlow.steps[0].asset!.description).toEqual(asset.description)
        expect(savedPresentationFlow.steps[0].asset!.content).toStrictEqual(asset.content)
        expect(savedPresentationFlow.relyingParty).not.toBeNull()
        expect(savedPresentationFlow.relyingParty!.name).toEqual(relyingParty.name);
        expect(savedPresentationFlow.relyingParty!.credentialDefinitions.length).toEqual(1);
        expect(savedPresentationFlow.relyingParty!.description).toEqual(relyingParty.description);
        expect(savedPresentationFlow.relyingParty!.organization).toEqual(relyingParty.organization);
        expect(savedPresentationFlow.relyingParty!.logo).not.toBeNull()
    })

    it('Should throw error when saving presentation flow with no steps', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: []
            // personas
        };

        await expect(repository.create(presentationFlow)).rejects.toThrowError(`At least one step is required`)
    })

    it('Should throw error when saving presentation flow with invalid relying party id', async (): Promise<void> => {
        const unknownRelyingPartyId = 'a197e5b2-e4e5-4788-83b1-ecaa0e99ed3a'
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: unknownRelyingPartyId,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        await expect(repository.create(presentationFlow)).rejects.toThrowError(`No relying party found for id: ${unknownRelyingPartyId}`)
    })

    it('Should throw error when saving presentation flow with duplicate step order', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        await expect(repository.create(presentationFlow)).rejects.toThrowError('duplicate key value violates unique constraint "step_order_workflow_unique"') // FIXME would be nice if we can set a custom error message returns by a constraint
    })

    it('Should get presentation flow by id from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const fromDb = await repository.findById(savedPresentationFlow.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.name).toEqual(presentationFlow.name)
        expect(fromDb.description).toEqual(presentationFlow.description)
        expect(fromDb.steps).toBeDefined()
        expect(fromDb.steps.length).toEqual(2)
    })

    it('Should get all presentation flows from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow1 = await repository.create(presentationFlow)
        expect(savedPresentationFlow1).toBeDefined()

        const savedPresentationFlow2 = await repository.create(presentationFlow)
        expect(savedPresentationFlow2).toBeDefined()

        const fromDb = await repository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete presentation flow from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        await repository.delete(savedPresentationFlow.id)

        await expect(repository.findById(savedPresentationFlow.id)).rejects.toThrowError(`No presentation flow found for id: ${savedPresentationFlow.id}`)
    })

    it('Should update presentation flow in database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedPresentationFlow: NewPresentationFlow = {
            ...savedPresentationFlow,
            name: 'new_name',
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title1',
                            actionType: 'example_type1',
                            text: 'example_text1'
                        },
                        {
                            title: 'example_title2',
                            actionType: 'example_type2',
                            text: 'example_text2'
                        }
                    ]
                }
            ],
            relyingParty: savedPresentationFlow.relyingParty!.id,
        }
        const updatedPresentationFlowResult = await repository.update(savedPresentationFlow.id, updatedPresentationFlow)

        expect(updatedPresentationFlowResult).toBeDefined()
        expect(updatedPresentationFlowResult.name).toEqual(updatedPresentationFlow.name)
        expect(updatedPresentationFlowResult.description).toEqual(updatedPresentationFlow.description)
        expect(updatedPresentationFlowResult.steps).toBeDefined();
        expect(updatedPresentationFlowResult.steps.length).toEqual(1)
        expect(updatedPresentationFlowResult.steps[0].title).toEqual(updatedPresentationFlow.steps[0].title)
        expect(updatedPresentationFlowResult.steps[0].order).toEqual(updatedPresentationFlow.steps[0].order)
        expect(updatedPresentationFlowResult.steps[0].type).toEqual(updatedPresentationFlow.steps[0].type)
        expect(updatedPresentationFlowResult.steps[0].actions.length).toEqual(2)
        expect(updatedPresentationFlowResult.steps[0].actions[0].id).toBeDefined()
        expect(updatedPresentationFlowResult.steps[0].actions[0].title).toEqual(updatedPresentationFlow.steps[0].actions[0].title)
        expect(updatedPresentationFlowResult.steps[0].actions[0].actionType).toEqual(updatedPresentationFlow.steps[0].actions[0].actionType)
        expect(updatedPresentationFlowResult.steps[0].actions[0].text).toEqual(updatedPresentationFlow.steps[0].actions[0].text)
        expect(updatedPresentationFlowResult.steps[0].asset).not.toBeNull()
        expect(updatedPresentationFlowResult.steps[0].asset!.mediaType).toEqual(asset.mediaType)
        expect(updatedPresentationFlowResult.steps[0].asset!.fileName).toEqual(asset.fileName)
        expect(updatedPresentationFlowResult.steps[0].asset!.description).toEqual(asset.description)
        expect(updatedPresentationFlowResult.steps[0].asset!.content).toStrictEqual(asset.content)
    })

    it('Should throw error when updating presentation flow with no steps', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedPresentationFlow: NewPresentationFlow = {
            ...savedPresentationFlow,
            steps: [],
            relyingParty: savedPresentationFlow.relyingParty!.id,
        }

        await expect(repository.update(savedPresentationFlow.id, updatedPresentationFlow)).rejects.toThrowError(`At least one step is required`)
    })

    it('Should throw error when updating presentation flow with invalid relying party id', async (): Promise<void> => {
        const unknownRelyingPartyId = 'a197e5b2-e4e5-4788-83b1-ecaa0e99ed3a'
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedPresentationFlow: NewPresentationFlow = {
            ...savedPresentationFlow,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
            ],
            relyingParty: unknownRelyingPartyId,
        }

        await expect(repository.update(savedPresentationFlow.id, updatedPresentationFlow)).rejects.toThrowError(`No relying party found for id: ${unknownRelyingPartyId}`)
    })

    it('Should add presentation flow step to database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const step: NewStep = {
            title: 'example_title',
            order: 2,
            type: StepType.HUMAN_TASK,
            asset: asset.id,
            actions: [
                {
                    title: 'example_title1',
                    actionType: 'example_type1',
                    text: 'example_text1'
                },
                {
                    title: 'example_title2',
                    actionType: 'example_type2',
                    text: 'example_text2'
                }
            ]
        };
        const savedStep = await repository.createStep(savedPresentationFlow.id, step)
        expect(savedStep).toBeDefined();

        const fromDb = await repository.findById(savedPresentationFlow.id)
        expect(fromDb).toBeDefined()

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(2)
        expect(fromDb.steps[1].title).toEqual(step.title)
        expect(fromDb.steps[1].order).toEqual(step.order)
        expect(fromDb.steps[1].type).toEqual(step.type)
        expect(fromDb.steps[1].actions.length).toEqual(2)
        expect(fromDb.steps[1].actions[0].id).toBeDefined()
        expect(fromDb.steps[1].actions[0].title).toEqual(step.actions[0].title)
        expect(fromDb.steps[1].actions[0].actionType).toEqual(step.actions[0].actionType)
        expect(fromDb.steps[1].actions[0].text).toEqual(step.actions[0].text)
        expect(fromDb.steps[1].asset).not.toBeNull()
        expect(fromDb.steps[1].asset!.mediaType).toEqual(asset.mediaType)
        expect(fromDb.steps[1].asset!.fileName).toEqual(asset.fileName)
        expect(fromDb.steps[1].asset!.description).toEqual(asset.description)
        expect(fromDb.steps[1].asset!.content).toStrictEqual(asset.content);
    })

    it('Should throw error when adding presentation flow step with no actions', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const step: NewStep = {
            title: 'example_title',
            order: 2,
            type: StepType.HUMAN_TASK,
            asset: asset.id,
            actions: []
        };

        await expect(repository.createStep(savedPresentationFlow.id, step)).rejects.toThrowError(`At least one action is required`)
    })

    it('Should get presentation flow step by step id from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title1',
                            actionType: 'example_type1',
                            text: 'example_text1'
                        },
                        {
                            title: 'example_title2',
                            actionType: 'example_type2',
                            text: 'example_text2'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const fromDb = await repository.findByStepId(savedPresentationFlow.id, savedPresentationFlow.steps[0].id)

        expect(fromDb).toBeDefined()
        expect(fromDb.id).toEqual(savedPresentationFlow.steps[0].id)
        expect(fromDb.title).toEqual(presentationFlow.steps[0].title)
        expect(fromDb.order).toEqual(presentationFlow.steps[0].order)
        expect(fromDb.type).toEqual(presentationFlow.steps[0].type)
        expect(fromDb.actions.length).toEqual(2)
        expect(fromDb.actions[0].id).toBeDefined()
        expect(fromDb.actions[0].title).toEqual(presentationFlow.steps[0].actions[0].title)
        expect(fromDb.actions[0].actionType).toEqual(presentationFlow.steps[0].actions[0].actionType)
        expect(fromDb.actions[0].text).toEqual(presentationFlow.steps[0].actions[0].text)
        expect(fromDb.asset).not.toBeNull()
        expect(fromDb.asset!.mediaType).toEqual(asset.mediaType)
        expect(fromDb.asset!.fileName).toEqual(asset.fileName)
        expect(fromDb.asset!.description).toEqual(asset.description)
        expect(fromDb.asset!.content).toStrictEqual(asset.content);
    })

    it('Should get all presentation flow steps from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const fromDb = await repository.findAllSteps(savedPresentationFlow.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.length).toEqual(2)
        expect(fromDb[0].id).toBeDefined()
        expect(fromDb[0].title).toEqual(presentationFlow.steps[0].title)
        expect(fromDb[0].order).toEqual(presentationFlow.steps[0].order)
        expect(fromDb[0].type).toEqual(presentationFlow.steps[0].type)
        expect(fromDb[0].actions.length).toEqual(1)
        expect(fromDb[0].actions[0].id).toBeDefined()
        expect(fromDb[0].actions[0].title).toEqual(presentationFlow.steps[0].actions[0].title)
        expect(fromDb[0].actions[0].actionType).toEqual(presentationFlow.steps[0].actions[0].actionType)
        expect(fromDb[0].actions[0].text).toEqual(presentationFlow.steps[0].actions[0].text)
        expect(fromDb[0].asset).not.toBeNull()
        expect(fromDb[0].asset!.mediaType).toEqual(asset.mediaType)
        expect(fromDb[0].asset!.fileName).toEqual(asset.fileName)
        expect(fromDb[0].asset!.description).toEqual(asset.description)
        expect(fromDb[0].asset!.content).toStrictEqual(asset.content);
    })

    it('Should delete presentation flow step from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()
        expect(savedPresentationFlow.steps).toBeDefined();
        expect(savedPresentationFlow.steps.length).toEqual(2)

        await repository.deleteStep(savedPresentationFlow.id, savedPresentationFlow.steps[1].id)
        const fromDb = await repository.findById(savedPresentationFlow.id)

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(1)
    })

    it('Should update presentation flow step in database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedStep: NewStep = {
            ...savedPresentationFlow.steps[0],
            title: 'new_title',
            actions: [
                {
                    title: 'example_title1',
                    actionType: 'example_type1',
                    text: 'example_text1'
                },
                {
                    title: 'example_title2',
                    actionType: 'example_type2',
                    text: 'example_text2'
                }
            ],
            asset: savedPresentationFlow.steps[0].asset!.id
        }
        const updatedStepResult = await repository.updateStep(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, updatedStep)

        expect(updatedStepResult).toBeDefined()
        expect(updatedStepResult.title).toEqual(updatedStep.title)
        expect(updatedStepResult.order).toEqual(updatedStep.order)
        expect(updatedStepResult.type).toEqual(updatedStep.type)
        expect(updatedStepResult.actions.length).toEqual(2)
        expect(updatedStepResult.actions[0].id).toBeDefined()
        expect(updatedStepResult.actions[0].title).toEqual(updatedStep.actions[0].title)
        expect(updatedStepResult.actions[0].actionType).toEqual(updatedStep.actions[0].actionType)
        expect(updatedStepResult.actions[0].text).toEqual(updatedStep.actions[0].text)
        expect(updatedStepResult.asset).not.toBeNull()
        expect(updatedStepResult.asset!.mediaType).toEqual(asset.mediaType)
        expect(updatedStepResult.asset!.fileName).toEqual(asset.fileName)
        expect(updatedStepResult.asset!.description).toEqual(asset.description)
        expect(updatedStepResult.asset!.content).toStrictEqual(asset.content)
    })

    it('Should throw error when updating presentation flow step with no actions', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedStep: NewStep = {
            ...savedPresentationFlow.steps[0],
            actions: [],
            asset: savedPresentationFlow.steps[0].asset!.id
        }

        await expect(repository.updateStep(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, updatedStep)).rejects.toThrowError(`At least one action is required`)
    })

    it('Should add to presentation flow step action to database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const action: NewStepAction = {
            title: 'example_title',
            actionType: 'example_type',
            text: 'example_text'
        };
        const savedStepAction = await repository.createStepAction(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, action)
        expect(savedStepAction).toBeDefined();

        const fromDb = await repository.findById(savedPresentationFlow.id)
        expect(fromDb).toBeDefined()

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(1)
        expect(fromDb.steps[0].actions).toBeDefined()
        expect(fromDb.steps[0].actions.length).toEqual(2)
        expect(fromDb.steps[0].actions[1].id).toBeDefined()
        expect(fromDb.steps[0].actions[1].title).toEqual(action.title)
        expect(fromDb.steps[0].actions[1].actionType).toEqual(action.actionType)
        expect(fromDb.steps[0].actions[1].text).toEqual(action.text)
    })

    it('Should get presentation flow step action by action id from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const fromDb = await repository.findByStepActionId(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, savedPresentationFlow.steps[0].actions[0].id)

        expect(fromDb.id).toEqual(savedPresentationFlow.steps[0].actions[0].id)
        expect(fromDb.title).toEqual(presentationFlow.steps[0].actions[0].title)
        expect(fromDb.actionType).toEqual(presentationFlow.steps[0].actions[0].actionType)
        expect(fromDb.text).toEqual(presentationFlow.steps[0].actions[0].text)
    })

    it('Should get all presentation flow step actions from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        },
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const fromDb = await repository.findAllStepActions(savedPresentationFlow.id, savedPresentationFlow.steps[0].id)

        expect(fromDb).toBeDefined()
        expect(fromDb.length).toEqual(2)
        expect(fromDb[0].id).toBeDefined()
        expect(fromDb[0].title).toEqual(presentationFlow.steps[0].actions[0].title)
        expect(fromDb[0].actionType).toEqual(presentationFlow.steps[0].actions[0].actionType)
        expect(fromDb[0].text).toEqual(presentationFlow.steps[0].actions[0].text)
    })

    it('Should delete presentation flow step action from database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        },
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()
        expect(savedPresentationFlow.steps[0].actions).toBeDefined();
        expect(savedPresentationFlow.steps[0].actions.length).toEqual(2)

        await repository.deleteStepAction(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, savedPresentationFlow.steps[0].actions[1].id)
        const fromDb = await repository.findById(savedPresentationFlow.id)

        expect(fromDb.steps[0].actions).toBeDefined();
        expect(fromDb.steps[0].actions.length).toEqual(1)
    })

    it('Should update presentation flow step action in database', async (): Promise<void> => {
        const presentationFlow: NewPresentationFlow = {
            name: 'example_name',
            description: 'example_description',
            relyingParty: relyingParty.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            actionType: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedPresentationFlow = await repository.create(presentationFlow)
        expect(savedPresentationFlow).toBeDefined()

        const updatedStepAction: NewStepAction = {
            ...savedPresentationFlow.steps[0].actions[0],
            title: 'new_title',
        }
        const updatedStepResult = await repository.updateStepAction(savedPresentationFlow.id, savedPresentationFlow.steps[0].id, savedPresentationFlow.steps[0].actions[0].id, updatedStepAction)

        expect(updatedStepResult).toBeDefined();
        expect(updatedStepResult.id).toBeDefined()
        expect(updatedStepResult.title).toEqual(updatedStepAction.title)
        expect(updatedStepResult.actionType).toEqual(updatedStepAction.actionType)
        expect(updatedStepResult.text).toEqual(updatedStepAction.text)
    })
})
