import { and, eq, inArray } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import RelyingPartyRepository from './RelyingPartyRepository';
import { NotFoundError } from '../../errors';
import { assets, stepActions, steps, workflows } from '../schema';
import { sortSteps } from '../../utils/sortUtils';
import {
    PresentationFlow,
    NewPresentationFlow,
    NewStep,
    NewStepAction,
    RepositoryDefinition,
    Step,
    StepAction,
    WorkflowType
} from '../../types';

@Service()
class PresentationFlowRepository implements RepositoryDefinition<PresentationFlow, NewPresentationFlow> {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly assetRepository: AssetRepository,
        private readonly relyingPartyRepository: RelyingPartyRepository
    ) {}

    // PRESENTATION FLOW

    async create(presentationFlow: NewPresentationFlow): Promise<PresentationFlow> {
        if (presentationFlow.steps.length === 0) {
            return Promise.reject(Error('At least one step is required'));
        }
        const relyingPartyResult = await this.relyingPartyRepository.findById(presentationFlow.relyingParty)

        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<PresentationFlow> => {
            const [presentationFlowResult] = await tx.insert(workflows)
                .values({
                    name: presentationFlow.name,
                    description: presentationFlow.description,
                    relyingParty: relyingPartyResult.id,
                    workflowType: WorkflowType.PRESENTATION
                })
                .returning();

            const stepsResult = await tx.insert(steps)
                .values(presentationFlow.steps.map((step: NewStep) => ({
                    ...step,
                    workflow: presentationFlowResult.id
                })))
                .returning();

            const stepActionsResult = await tx.insert(stepActions)
                .values(stepsResult.flatMap((stepResult, index) =>
                    presentationFlow.steps[index].actions.map(action => ({
                        ...action,
                        step: stepResult.id,
                    }))
                ))
                .returning();

            const stepAssetsResult = await tx.query.assets.findMany({
                where: inArray(assets.id, stepsResult.map(step => step.asset).filter(assetId => assetId !== null))
            })

            const flowSteps = stepsResult.map(stepResult => ({
                ...stepResult,
                actions: stepActionsResult.filter(stepActionResult => stepActionResult.step === stepResult.id),
                asset: stepAssetsResult.find(asset => asset.id === stepResult.asset)
            }))

            return {
                ...presentationFlowResult,
                steps: sortSteps(flowSteps),
                relyingParty: relyingPartyResult
            }
        })
    }

    async delete(presentationFlowId: string): Promise<void> {
        await this.findById(presentationFlowId)
        await (await this.databaseService.getConnection())
            .delete(workflows)
            .where(eq(workflows.id, presentationFlowId))
    }

    async update(presentationFlowId: string, presentationFlow: NewPresentationFlow): Promise<PresentationFlow> {
        await this.findById(presentationFlowId)
        if (presentationFlow.steps.length === 0) {
            return Promise.reject(Error('At least one step is required'));
        }
        const relyingPartyResult = await this.relyingPartyRepository.findById(presentationFlow.relyingParty)

        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<PresentationFlow> => {
            const [presentationFlowResult] = await tx.update(workflows)
                .set({
                    name: presentationFlow.name,
                    description: presentationFlow.description,
                    relyingParty: relyingPartyResult.id,
                    workflowType: WorkflowType.PRESENTATION
                })
                .where(eq(workflows.id, presentationFlowId))
                .returning();

            const selectedSteps = await tx.select({ id: steps.id })
                .from(steps)
                .where(eq(steps.workflow, presentationFlowId));
            await tx.delete(steps).where(eq(steps.workflow, presentationFlowId))
            await tx.delete(stepActions).where(inArray(stepActions.step, selectedSteps.map(step => step.id)));

            const stepsResult = await tx.insert(steps)
                .values(presentationFlow.steps.map((step: NewStep) => ({
                    ...step,
                    workflow: presentationFlowResult.id
                })))
                .returning();

            const stepActionsResult = await tx.insert(stepActions)
                .values(stepsResult.flatMap((stepResult, index) =>
                    presentationFlow.steps[index].actions.map(action => ({
                        ...action,
                        step: stepResult.id,
                    }))
                ))
                .returning();

            const stepAssetsResult = await tx.query.assets.findMany({
                where: inArray(assets.id, stepsResult.map(step => step.asset).filter(assetId => assetId !== null))
            })

            const flowSteps = stepsResult.map(stepResult => ({
                ...stepResult,
                actions: stepActionsResult.filter(stepActionResult => stepActionResult.step === stepResult.id),
                asset: stepAssetsResult.find(asset => asset.id === stepResult.asset)
            }))

            return {
                ...presentationFlowResult,
                steps: sortSteps(flowSteps),
                relyingParty: relyingPartyResult
            }
        })
    }

    async findById(presentationFlowId: string): Promise<PresentationFlow> {
        const result = await (await this.databaseService.getConnection()).query.workflows.findFirst({
            where: and(eq(workflows.id, presentationFlowId), eq(workflows.workflowType, WorkflowType.PRESENTATION)),
            with: {
                steps: {
                    with: {
                        actions: true,
                        asset: true
                    }
                },
                relyingParty: {
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
            return Promise.reject(new NotFoundError(`No presentation flow found for id: ${presentationFlowId}`))
        }

        return {
            ...result,
            steps: sortSteps(result.steps),
            relyingParty: {
                ...result.relyingParty as any, // TODO check this typing issue at a later point in time
                credentialDefinitions: result.relyingParty!.credentialDefinitions.map(credentialDefinition => credentialDefinition.cd)
            }
        };
    }

    async findAll(): Promise<PresentationFlow[]> {
        const result = await (await this.databaseService.getConnection()).query.workflows.findMany({
            where: eq(workflows.workflowType, WorkflowType.PRESENTATION),
            with: {
                steps: {
                    with: {
                        actions: true,
                        asset: true
                    }
                },
                relyingParty: {
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
            steps: sortSteps(workflow.steps),
            issuer: {
                ...workflow.relyingParty,
                credentialDefinitions: workflow.relyingParty.credentialDefinitions.map((credentialDefinition: any) => credentialDefinition.cd) // TODO any
            }
        }));
    }

    // PRESENTATION FLOW STEP

    async createStep(presentationFlowId: string, step: NewStep): Promise<Step> {
        await this.findById(presentationFlowId)

        if (step.actions.length === 0) {
            return Promise.reject(Error('At least one action is required'));
        }

        const assetResult = step.asset ? await this.assetRepository.findById(step.asset) : null
        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Step> => {
            const [stepResult] = await tx.insert(steps)
                .values({
                    ...step,
                    workflow: presentationFlowId
                })
                .returning();

            const actionsResult = await tx.insert(stepActions)
                .values(step.actions.map((action: NewStepAction) => ({
                    ...action,
                    step: stepResult.id
                })))
                .returning();

            return {
                ...stepResult,
                actions: actionsResult,
                asset: assetResult
            }
        })
    }

    async deleteStep(presentationFlowId: string, stepId: string): Promise<void> {
        await this.findByStepId(presentationFlowId, stepId)
        await (await this.databaseService.getConnection())
            .delete(steps)
            .where(and(eq(steps.id, stepId), eq(steps.workflow, presentationFlowId)));
    }

    async updateStep(presentationFlowId: string, stepId: string, step: NewStep): Promise<Step> {
        await this.findById(presentationFlowId)

        if (step.actions.length === 0) {
            return Promise.reject(Error('At least one action is required'));
        }

        const assetResult = step.asset ? await this.assetRepository.findById(step.asset) : null
        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Step> => {
            const [stepResult] = await tx.update(steps)
                .set({
                    ...step,
                    workflow: presentationFlowId
                })
                .where(eq(steps.id, stepId))
                .returning();

            await tx.delete(stepActions).where(eq(stepActions.step, stepId))

            const actionsResult = await tx.insert(stepActions)
                .values(step.actions.map((action: NewStepAction) => ({
                    ...action,
                    step: stepResult.id
                })))
                .returning();

            return {
                ...stepResult,
                actions: actionsResult,
                asset: assetResult
            }
        })
    }

    async findByStepId(presentationFlowId: string, stepId: string): Promise<Step> {
        const result = await (await this.databaseService.getConnection()).query.steps.findFirst({
            where: and(and(eq(steps.id, stepId), eq(steps.workflow, presentationFlowId))),
            with: {
                actions: true,
                asset: true
            }
        })

        if (!result) {
            return Promise.reject(new NotFoundError(`No step found for presentation flow id ${presentationFlowId} and step id: ${stepId}`))
        }

        return result
    }

    async findAllSteps(presentationFlowId: string): Promise<Step[]> {
        const result = await (await this.databaseService.getConnection()).query.steps.findMany({
            where: eq(steps.workflow, presentationFlowId),
            with: {
                asset: true,
                actions: true,
            },
        });

        return sortSteps(result)
    }

    // PRESENTATION FLOW STEP ACTION

    async createStepAction(presentationFlowId: string, stepId: string, action: NewStepAction): Promise<StepAction> {
        await this.findByStepId(presentationFlowId, stepId)
        const [result] = await (await this.databaseService.getConnection())
            .insert(stepActions)
            .values({ ...action, step: stepId })
            .returning();

        return result
    }

    async deleteStepAction(presentationFlowId: string, stepId: string, actionId: string): Promise<void> {
        await this.findByStepActionId(presentationFlowId, stepId, actionId)
        await (await this.databaseService.getConnection())
            .delete(stepActions)
            .where(and(eq(stepActions.id, actionId), eq(stepActions.step, stepId)));
    }

    async updateStepAction(presentationFlowId: string, stepId: string, actionId: string, action: NewStepAction): Promise<StepAction> {
        await this.findByStepId(presentationFlowId, stepId)

        const [result] = await (await this.databaseService.getConnection())
            .update(stepActions)
            .set({
                ...action,
                step: stepId
            })
            .where(eq(stepActions.id, actionId))
            .returning();

        return result
    }

    async findByStepActionId(presentationFlowId: string, stepId: string, actionId: string): Promise<StepAction> {
        await this.findById(presentationFlowId)
        const [result] = await (await this.databaseService.getConnection())
            .select()
            .from(stepActions)
            .where(and(
                eq(stepActions.id, actionId),
                eq(stepActions.step, stepId),
            ));

        if (!result) {
            return Promise.reject(new NotFoundError(`No step found for step id ${stepId} and step action id: ${actionId}`))
        }

        return result
    }

    async findAllStepActions(presentationFlowId: string, stepId: string): Promise<StepAction[]> {
        // TODO presentationFlowId is not being used
        return (await this.databaseService.getConnection()).query.stepActions.findMany({
            where: eq(stepActions.step, stepId)
        });
    }
}

export default PresentationFlowRepository
