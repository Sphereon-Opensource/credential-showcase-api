import { and, eq } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import { stepActions, steps, workflows } from '../schema';
import {
    IssuanceFlow,
    NewIssuanceFlow,
    NewStep,
    NewStepAction,
    RepositoryDefinition,
    Step,
    StepAction,
    WorkflowType
} from '../../types';

@Service()
class IssuanceFlowRepository implements RepositoryDefinition<IssuanceFlow, NewIssuanceFlow> {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly assetRepository: AssetRepository
    ) {}

    // ISSUANCE FLOW

    async create(issuanceFlow: NewIssuanceFlow): Promise<IssuanceFlow> {
        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<IssuanceFlow> => {
            const [issuanceFlowResult] = await tx.insert(workflows)
                .values(issuanceFlow)
                .returning();

            const stepsResult = await tx.insert(steps)
                .values(issuanceFlow.steps.map((step: NewStep) => ({
                    ...step,
                    workflow: issuanceFlowResult.id
                })))
                .returning();

            const stepActionsResult = await tx.insert(stepActions)
                .values(stepsResult.flatMap((stepResult, index) =>
                    issuanceFlow.steps[index].actions.map(action => ({
                        ...action,
                        step: stepResult.id,
                    }))
                ))
                .returning();

            // const stepPromises = issuanceFlow.steps.map(async (step: NewStep) => {
            //     await this.assetRepository.findById(step.image)
            //     return {
            //         ...step,
            //         workflow: issuanceFlowResult.id
            //     }
            // })

            // const stepsResult = await tx.insert(steps)
            //     .values(await Promise.all(stepPromises))
            //     .returning();


            // const stepResultPromises = stepsResult.map(async step => {
            //     return {
            //         ...step,
            //         image: await this.assetRepository.findById(step.image),
            //     }
            // })
            //
            // const xx = await Promise.all(stepResultPromises)

            // @ts-ignore
            return {
                ...issuanceFlowResult,
                // @ts-ignore // TODO return image object in steps
                steps: stepsResult.map((stepResult) => ({
                    ...stepResult,
                    actions: stepActionsResult.filter(stepActionResult => stepActionResult.step === stepResult.id)
                })),
                // @ts-ignore
                relyingParty: null // TODO
            }
        })




        // const [result] = await (await this.databaseService.getConnection())
        //     .insert(workflows)
        //     .values(issuanceFlow)
        //     .returning();
        //
        // // TODO
        // return {
        //     ...result,
        //     steps: [],
        //     // @ts-ignore
        //     relyingParty: null
        // }
    }

    async delete(issuanceFlowId: string): Promise<void> {
        await this.findById(issuanceFlowId)
        await (await this.databaseService.getConnection())
            .delete(workflows)
            .where(eq(workflows.id, issuanceFlowId))
    }

    async update(issuanceFlowId: string, issuanceFlow: NewIssuanceFlow): Promise<IssuanceFlow> { // TODO see the result of openapi and the payloads to determine how we update an asset
        await this.findById(issuanceFlowId)
        const [result] = await (await this.databaseService.getConnection())
            .update(workflows)
            // @ts-ignore
            .set(issuanceFlow)
            .returning();

        // TODO
        // @ts-ignore
        return {
            ...result,
            steps: [],
            // @ts-ignore
            relyingParty: null
        }
    }

    async findById(issuanceFlowId: string): Promise<IssuanceFlow> {
        const result = await (await this.databaseService.getConnection()).query.workflows.findFirst({
            where: eq(workflows.id, issuanceFlowId),
            with: {
                steps: {
                    with: {
                        actions: true,
                        asset: true
                    }
                },
                issuer: {
                    with: {
                        credentialDefinitions: {
                            with: {
                                cd: {
                                    with: {
                                        icon: true,
                                        attributes: true,
                                        representations: true,
                                        revocation: true
                                    }
                                }
                            }
                        },
                        logo: true
                    }
                }
            }
        })

        if (!result) {
            return Promise.reject(new NotFoundError(`No issuance flow found for id: ${issuanceFlowId}`))
        }

        // TODO
        // @ts-ignore
        return {
            ...result,
            relyingParty: {
                // @ts-ignore
                ...result.relyingParty,
                // @ts-ignore
                credentialDefinitions: result.relyingParty?.credentialDefinitions.map((credentialDefinition: any) => credentialDefinition.cd) // TODO needs to be issuer // any
            }
        }
    }

    async findAll(): Promise<IssuanceFlow[]> {
        const result = await (await this.databaseService.getConnection()).query.workflows.findMany({
            where: eq(workflows.workflowType, WorkflowType.PRESENTATION), // TODO issuance
            with: {
                steps: {
                    with: {
                        actions: true,
                        asset: true
                    }
                },
                issuer: {
                    with: {
                        credentialDefinitions: {
                            with: {
                                cd: {
                                    with: {
                                        icon: true,
                                        attributes: true,
                                        representations: true,
                                        revocation: true
                                    }
                                }
                            }
                        },
                        logo: true
                    }
                }
            }
        });

        return result.map((workflow: any) => ({
            ...workflow,
            relyingParty: {
                ...workflow.relyingParty,
                credentialDefinitions: workflow.relyingParty.credentialDefinitions.map((credentialDefinition: any) => credentialDefinition.cd) // TODO needs to be issuer // any
            }
        }));
    }

    // ISSUANCE FLOW STEP

    async createStep(issuanceFlowId: string, step: NewStep): Promise<Step> {
        await this.findById(issuanceFlowId)
        const imageResult = await this.assetRepository.findById(step.asset)
        const [result] = await (await this.databaseService.getConnection())
            .insert(steps)
            .values({ ...step, workflow: issuanceFlowId })
            .returning();

        return {
            ...result,
            actions: [], // TODO
            asset: imageResult
        }
    }

    async deleteStep(issuanceFlowId: string, stepId: string): Promise<void> {
        await this.findByStepId(issuanceFlowId, stepId)
        await (await this.databaseService.getConnection())
            .delete(steps)
            .where(and(eq(steps.id, stepId), eq(steps.workflow, issuanceFlowId)));
    }

    async updateStep(issuanceFlowId: string, stepId: string, step: NewStep): Promise<Step> { // TODO see the result of openapi and the payloads to determine how we update an asset
        return Promise.reject(Error('Not yet implemented'))

        // await this.findById(issuanceFlowId)
        // const [result] = await (await this.databaseService.getConnection())
        //     .update(workflows)
        //     .set(issuanceFlow)
        //     .returning();
        //
        // return result
    }

    async findByStepId(issuanceFlowId: string, stepId: string): Promise<Step> {
        const [result] = await (await this.databaseService.getConnection())
            .select()
            .from(steps)
            .where(and(eq(steps.id, stepId), eq(steps.workflow, issuanceFlowId)));

        if (!result) {
            return Promise.reject(new NotFoundError(`No step found for issuance flow id ${issuanceFlowId} and step id: ${stepId}`))
        }

        //const imageResult = await this.assetRepository.findById(result.image)
        // @ts-ignore // TODO return image object in steps
        return {
            ...result,
            //image: imageResult
        }
    }

    async findAllSteps(issuanceFlowId: string): Promise<Step[]> {
        // const result = await (await this.databaseService.getConnection())
        //     .select()
        //     .from(steps)
        //     .where(eq(steps.workflow, issuanceFlowId));
        //
        // return result
        return (await this.databaseService.getConnection()).query.steps.findMany({
            where: eq(steps.workflow, issuanceFlowId),
            with: {
                asset: true,
                actions: true,
            },
        });
    }

    // ISSUANCE FLOW STEP ACTION

    async createStepAction(issuanceFlowId: string, stepId: string, action: NewStepAction): Promise<StepAction> {
        await this.findByStepId(issuanceFlowId, stepId)
        const [result] = await (await this.databaseService.getConnection())
            .insert(stepActions)
            .values({ ...action, step: stepId })
            .returning();

        return result
    }

    async deleteStepAction(issuanceFlowId: string, stepId: string, actionId: string): Promise<void> {
        await this.findByStepActionId(issuanceFlowId, stepId, actionId)
        await (await this.databaseService.getConnection())
            .delete(stepActions)
            .where(and(eq(stepActions.id, actionId), eq(stepActions.step, stepId)));
    }

    async updateStepAction(issuanceFlowId: string, stepId: string, actionId: string, action: NewStepAction): Promise<StepAction> { // TODO see the result of openapi and the payloads to determine how we update an asset
        return Promise.reject(Error('Not yet implemented'))

        // await this.findById(id)
        // const [result] = await (await this.databaseService.getConnection())
        //     .update(workflows)
        //     .set(issuanceFlow)
        //     .returning();
        //
        // return result
    }

    async findByStepActionId(issuanceFlowId: string, stepId: string, actionId: string): Promise<StepAction> {
        await this.findById(issuanceFlowId)
        const [result] = await (await this.databaseService.getConnection())
            .select()
            .from(stepActions)
            //.innerJoin(steps, eq(stepActions.step, steps.id))
            .where(and(
                eq(stepActions.id, actionId),
                eq(stepActions.step, stepId),
                //eq(steps.workflow, issuanceFlowId)
            ));

        if (!result) {
            return Promise.reject(new NotFoundError(`No step found for step id ${stepId} and step action id: ${actionId}`))
        }

        return result
    }

    async findAllStepActions(issuanceFlowId: string, stepId: string): Promise<StepAction[]> {
        // TODO issuanceFlowId is not being used
        return (await this.databaseService.getConnection()).query.stepActions.findMany({
            where: eq(stepActions.step, stepId)
        });
    }
}

export default IssuanceFlowRepository
