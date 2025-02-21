import 'reflect-metadata';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import DatabaseService from '../services/DatabaseService';
import IssuanceFlowRepository from '../database/repositories/IssuanceFlowRepository';
import IssuerRepository from '../database/repositories/IssuerRepository';
import CredentialDefinitionRepository from '../database/repositories/CredentialDefinitionRepository';
import AssetRepository from '../database/repositories/AssetRepository';
import * as schema from '../database/schema';
import {
    Asset,
    NewAsset,
    NewCredentialDefinition,
    NewIssuanceFlow,
    NewStep,
    NewStepAction,
    CredentialAttributeType,
    CredentialType,
    StepType,
    NewIssuer,
    IssuerType,
    Issuer
} from '../types';

describe('Database issuance flow repository tests', (): void => {
    let client: PGlite;
    let repository: IssuanceFlowRepository;
    let issuer: Issuer
    let asset: Asset

    beforeEach(async (): Promise<void> => {
        client = new PGlite();
        const database = drizzle(client, { schema }) as unknown as NodePgDatabase;
        await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
        const mockDatabaseService = {
            getConnection: jest.fn().mockResolvedValue(database),
        };
        Container.set(DatabaseService, mockDatabaseService);
        repository = Container.get(IssuanceFlowRepository);
        const issuerRepository = Container.get(IssuerRepository);
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
        const newIssuer: NewIssuer = {
            name: 'example_name',
            type: IssuerType.ARIES,
            credentialDefinitions: [credentialDefinition.id],
            description: 'example_description',
            organization: 'example_organization',
            logo: asset.id,
        };
        issuer = await issuerRepository.create(newIssuer)
    })

    afterEach(async (): Promise<void> => {
        await client.close();
        jest.resetAllMocks();
        Container.reset();
    });

    it('Should save issuance flow to database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)

        expect(savedIssuanceFlow).toBeDefined()
        expect(savedIssuanceFlow.name).toEqual(issuanceFlow.name)
        expect(savedIssuanceFlow.description).toEqual(issuanceFlow.description)
        expect(savedIssuanceFlow.steps).toBeDefined();
        expect(savedIssuanceFlow.steps.length).toEqual(2)
        expect(savedIssuanceFlow.steps[0].title).toEqual(issuanceFlow.steps[0].title)
        expect(savedIssuanceFlow.steps[0].order).toEqual(issuanceFlow.steps[0].order)
        expect(savedIssuanceFlow.steps[0].type).toEqual(issuanceFlow.steps[0].type)
        expect(savedIssuanceFlow.steps[0].actions.length).toEqual(1)
        expect(savedIssuanceFlow.steps[0].actions[0].id).toBeDefined()
        expect(savedIssuanceFlow.steps[0].actions[0].title).toEqual(issuanceFlow.steps[0].actions[0].title)
        expect(savedIssuanceFlow.steps[0].actions[0].type).toEqual(issuanceFlow.steps[0].actions[0].type)
        expect(savedIssuanceFlow.steps[0].actions[0].text).toEqual(issuanceFlow.steps[0].actions[0].text)
        expect(savedIssuanceFlow.steps[0].asset).toBeDefined()
        expect(savedIssuanceFlow.steps[0].asset.mediaType).toEqual(asset.mediaType)
        expect(savedIssuanceFlow.steps[0].asset.fileName).toEqual(asset.fileName)
        expect(savedIssuanceFlow.steps[0].asset.description).toEqual(asset.description)
        expect(savedIssuanceFlow.steps[0].asset.content).toStrictEqual(asset.content)
    })

    it('Should get issuance flow by id from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const fromDb = await repository.findById(savedIssuanceFlow.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.name).toEqual(issuanceFlow.name)
        expect(fromDb.description).toEqual(issuanceFlow.description)
        expect(fromDb.steps).toBeDefined()
        expect(fromDb.steps.length).toEqual(2)
    })

    it('Should get all issuance flows from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow1 = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow1).toBeDefined()

        const savedIssuanceFlow2 = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow2).toBeDefined()

        const fromDb = await repository.findAll()

        expect(fromDb.length).toEqual(2)
    })

    it('Should delete issuance flow from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        await repository.delete(savedIssuanceFlow.id)

        await expect(repository.findById(savedIssuanceFlow.id)).rejects.toThrowError(`No issuance flow found for id: ${savedIssuanceFlow.id}`)
    })

    it('Should update issuance flow in database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                },
                {
                    title: 'example_title',
                    order: 2, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const updatedIssuanceFlow: NewIssuanceFlow = {
            ...savedIssuanceFlow,
            name: 'new_name',
            steps: [
                {
                    title: 'example_title',
                    order: 1, // TODO test on duplicate order
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title1',
                            type: 'example_type1',
                            text: 'example_text1'
                        },
                        {
                            title: 'example_title2',
                            type: 'example_type2',
                            text: 'example_text2'
                        }
                    ]
                }
            ],
            issuer: savedIssuanceFlow.issuer!.id,
        }
        const updatedIssuanceFlowResult = await repository.update(savedIssuanceFlow.id, updatedIssuanceFlow)

        expect(updatedIssuanceFlowResult).toBeDefined()
        expect(updatedIssuanceFlowResult.name).toEqual(updatedIssuanceFlow.name)
        expect(updatedIssuanceFlowResult.description).toEqual(updatedIssuanceFlow.description)
        expect(updatedIssuanceFlowResult.steps).toBeDefined();
        expect(updatedIssuanceFlowResult.steps.length).toEqual(1)
        expect(updatedIssuanceFlowResult.steps[0].title).toEqual(updatedIssuanceFlow.steps[0].title)
        expect(updatedIssuanceFlowResult.steps[0].order).toEqual(updatedIssuanceFlow.steps[0].order)
        expect(updatedIssuanceFlowResult.steps[0].type).toEqual(updatedIssuanceFlow.steps[0].type)
        expect(updatedIssuanceFlowResult.steps[0].actions.length).toEqual(2)
        expect(updatedIssuanceFlowResult.steps[0].actions[0].id).toBeDefined()
        expect(updatedIssuanceFlowResult.steps[0].actions[0].title).toEqual(updatedIssuanceFlow.steps[0].actions[0].title)
        expect(updatedIssuanceFlowResult.steps[0].actions[0].type).toEqual(updatedIssuanceFlow.steps[0].actions[0].type)
        expect(updatedIssuanceFlowResult.steps[0].actions[0].text).toEqual(updatedIssuanceFlow.steps[0].actions[0].text)
        expect(updatedIssuanceFlowResult.steps[0].asset).toBeDefined()
        expect(updatedIssuanceFlowResult.steps[0].asset.mediaType).toEqual(asset.mediaType)
        expect(updatedIssuanceFlowResult.steps[0].asset.fileName).toEqual(asset.fileName)
        expect(updatedIssuanceFlowResult.steps[0].asset.description).toEqual(asset.description)
        expect(updatedIssuanceFlowResult.steps[0].asset.content).toStrictEqual(asset.content)
    })

    it('Should add to issuance flow step to database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const step: NewStep = {
            title: 'example_title',
            order: 2,
            type: StepType.HUMAN_TASK,
            asset: asset.id,
            actions: [
                {
                    title: 'example_title1',
                    type: 'example_type1',
                    text: 'example_text1'
                },
                {
                    title: 'example_title2',
                    type: 'example_type2',
                    text: 'example_text2'
                }
            ]
        };
        const savedStep = await repository.createStep(savedIssuanceFlow.id, step)
        expect(savedStep).toBeDefined();

        const fromDb = await repository.findById(savedIssuanceFlow.id)
        expect(fromDb).toBeDefined()

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(2)
        expect(fromDb.steps[1].title).toEqual(step.title)
        expect(fromDb.steps[1].order).toEqual(step.order)
        expect(fromDb.steps[1].type).toEqual(step.type)
        expect(fromDb.steps[1].actions.length).toEqual(2)
        expect(fromDb.steps[1].actions[0].id).toBeDefined()
        expect(fromDb.steps[1].actions[0].title).toEqual(step.actions[0].title)
        expect(fromDb.steps[1].actions[0].type).toEqual(step.actions[0].type)
        expect(fromDb.steps[1].actions[0].text).toEqual(step.actions[0].text)
        expect(fromDb.steps[1].asset).toBeDefined()
        expect(fromDb.steps[1].asset.mediaType).toEqual(asset.mediaType)
        expect(fromDb.steps[1].asset.fileName).toEqual(asset.fileName)
        expect(fromDb.steps[1].asset.description).toEqual(asset.description)
        expect(fromDb.steps[1].asset.content).toStrictEqual(asset.content);
    })

    it('Should get issuance flow step by step id from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title1',
                            type: 'example_type1',
                            text: 'example_text1'
                        },
                        {
                            title: 'example_title2',
                            type: 'example_type2',
                            text: 'example_text2'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const fromDb = await repository.findByStepId(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id)

        expect(fromDb).toBeDefined()
        expect(fromDb.id).toEqual(savedIssuanceFlow.steps[0].id)
        expect(fromDb.title).toEqual(issuanceFlow.steps[0].title)
        expect(fromDb.order).toEqual(issuanceFlow.steps[0].order)
        expect(fromDb.type).toEqual(issuanceFlow.steps[0].type)
        expect(fromDb.actions.length).toEqual(2)
        expect(fromDb.actions[0].id).toBeDefined()
        expect(fromDb.actions[0].title).toEqual(issuanceFlow.steps[0].actions[0].title)
        expect(fromDb.actions[0].type).toEqual(issuanceFlow.steps[0].actions[0].type)
        expect(fromDb.actions[0].text).toEqual(issuanceFlow.steps[0].actions[0].text)
        expect(fromDb.asset).toBeDefined()
        expect(fromDb.asset.mediaType).toEqual(asset.mediaType)
        expect(fromDb.asset.fileName).toEqual(asset.fileName)
        expect(fromDb.asset.description).toEqual(asset.description)
        expect(fromDb.asset.content).toStrictEqual(asset.content);
    })

    it('Should get all issuance flow steps from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
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
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const fromDb = await repository.findAllSteps(savedIssuanceFlow.id)

        expect(fromDb).toBeDefined()
        expect(fromDb.length).toEqual(2)
        expect(fromDb[0].id).toBeDefined()
        expect(fromDb[0].title).toEqual(issuanceFlow.steps[0].title)
        expect(fromDb[0].order).toEqual(issuanceFlow.steps[0].order)
        expect(fromDb[0].type).toEqual(issuanceFlow.steps[0].type)
        expect(fromDb[0].actions.length).toEqual(1)
        expect(fromDb[0].actions[0].id).toBeDefined()
        expect(fromDb[0].actions[0].title).toEqual(issuanceFlow.steps[0].actions[0].title)
        expect(fromDb[0].actions[0].type).toEqual(issuanceFlow.steps[0].actions[0].type)
        expect(fromDb[0].actions[0].text).toEqual(issuanceFlow.steps[0].actions[0].text)
        expect(fromDb[0].asset).toBeDefined()
        expect(fromDb[0].asset.mediaType).toEqual(asset.mediaType)
        expect(fromDb[0].asset.fileName).toEqual(asset.fileName)
        expect(fromDb[0].asset.description).toEqual(asset.description)
        expect(fromDb[0].asset.content).toStrictEqual(asset.content);
    })

    it('Should delete issuance flow step from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
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
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()
        expect(savedIssuanceFlow.steps).toBeDefined();
        expect(savedIssuanceFlow.steps.length).toEqual(2)

        await repository.deleteStep(savedIssuanceFlow.id, savedIssuanceFlow.steps[1].id)
        const fromDb = await repository.findById(savedIssuanceFlow.id)

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(1)
    })

    it('Should update issuance flow step in database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const updatedStep: NewStep = {
            ...savedIssuanceFlow.steps[0],
            title: 'new_title',
            actions: [
                {
                    title: 'example_title1',
                    type: 'example_type1',
                    text: 'example_text1'
                },
                {
                    title: 'example_title2',
                    type: 'example_type2',
                    text: 'example_text2'
                }
            ],
            asset: savedIssuanceFlow.steps[0].asset.id
        }
        const updatedStepResult = await repository.updateStep(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id, updatedStep)

        expect(updatedStepResult).toBeDefined()
        expect(updatedStepResult.title).toEqual(updatedStep.title)
        expect(updatedStepResult.order).toEqual(updatedStep.order)
        expect(updatedStepResult.type).toEqual(updatedStep.type)
        expect(updatedStepResult.actions.length).toEqual(2)
        expect(updatedStepResult.actions[0].id).toBeDefined()
        expect(updatedStepResult.actions[0].title).toEqual(updatedStep.actions[0].title)
        expect(updatedStepResult.actions[0].type).toEqual(updatedStep.actions[0].type)
        expect(updatedStepResult.actions[0].text).toEqual(updatedStep.actions[0].text)
        expect(updatedStepResult.asset).toBeDefined()
        expect(updatedStepResult.asset.mediaType).toEqual(asset.mediaType)
        expect(updatedStepResult.asset.fileName).toEqual(asset.fileName)
        expect(updatedStepResult.asset.description).toEqual(asset.description)
        expect(updatedStepResult.asset.content).toStrictEqual(asset.content)
    })

    it('Should add to issuance flow step action to database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const action: NewStepAction = {
            title: 'example_title',
            type: 'example_type',
            text: 'example_text'
        };
        const savedStepAction = await repository.createStepAction(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id, action)
        expect(savedStepAction).toBeDefined();

        const fromDb = await repository.findById(savedIssuanceFlow.id)
        expect(fromDb).toBeDefined()

        expect(fromDb.steps).toBeDefined();
        expect(fromDb.steps.length).toEqual(1)
        expect(fromDb.steps[0].actions).toBeDefined()
        expect(fromDb.steps[0].actions.length).toEqual(2)
        expect(fromDb.steps[0].actions[1].id).toBeDefined()
        expect(fromDb.steps[0].actions[1].title).toEqual(action.title)
        expect(fromDb.steps[0].actions[1].type).toEqual(action.type)
        expect(fromDb.steps[0].actions[1].text).toEqual(action.text)
    })

    it('Should get issuance flow step action by action id from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const fromDb = await repository.findByStepActionId(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id, savedIssuanceFlow.steps[0].actions[0].id)

        expect(fromDb.id).toEqual(savedIssuanceFlow.steps[0].actions[0].id)
        expect(fromDb.title).toEqual(issuanceFlow.steps[0].actions[0].title)
        expect(fromDb.type).toEqual(issuanceFlow.steps[0].actions[0].type)
        expect(fromDb.text).toEqual(issuanceFlow.steps[0].actions[0].text)
    })

    it('Should get all issuance flow step actions from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        },
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const fromDb = await repository.findAllStepActions(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id)

        expect(fromDb).toBeDefined()
        expect(fromDb.length).toEqual(2)
        expect(fromDb[0].id).toBeDefined()
        expect(fromDb[0].title).toEqual(issuanceFlow.steps[0].actions[0].title)
        expect(fromDb[0].type).toEqual(issuanceFlow.steps[0].actions[0].type)
        expect(fromDb[0].text).toEqual(issuanceFlow.steps[0].actions[0].text)
    })

    it('Should delete issuance flow step action from database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        },
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()
        expect(savedIssuanceFlow.steps[0].actions).toBeDefined();
        expect(savedIssuanceFlow.steps[0].actions.length).toEqual(2)

        await repository.deleteStepAction(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id, savedIssuanceFlow.steps[0].actions[1].id)
        const fromDb = await repository.findById(savedIssuanceFlow.id)

        expect(fromDb.steps[0].actions).toBeDefined();
        expect(fromDb.steps[0].actions.length).toEqual(1)
    })

    it('Should update issuance flow step action in database', async (): Promise<void> => {
        const issuanceFlow: NewIssuanceFlow = {
            name: 'example_name',
            description: 'example_description',
            issuer: issuer.id,
            steps: [
                {
                    title: 'example_title',
                    order: 1,
                    type: StepType.HUMAN_TASK,
                    asset: asset.id,
                    actions: [
                        {
                            title: 'example_title',
                            type: 'example_type',
                            text: 'example_text'
                        }
                    ]
                }
            ]
            // personas
        };

        const savedIssuanceFlow = await repository.create(issuanceFlow)
        expect(savedIssuanceFlow).toBeDefined()

        const updatedStepAction: NewStepAction = {
            ...savedIssuanceFlow.steps[0].actions[0],
            title: 'new_title',
        }
        const updatedStepResult = await repository.updateStepAction(savedIssuanceFlow.id, savedIssuanceFlow.steps[0].id, savedIssuanceFlow.steps[0].actions[0].id, updatedStepAction)

        expect(updatedStepResult).toBeDefined();
        expect(updatedStepResult.id).toBeDefined()
        expect(updatedStepResult.title).toEqual(updatedStepAction.title)
        expect(updatedStepResult.type).toEqual(updatedStepAction.type)
        expect(updatedStepResult.text).toEqual(updatedStepAction.text)
    })
})
