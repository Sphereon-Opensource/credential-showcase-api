import { Service } from 'typedi';
import ScenarioRepository from '../database/repositories/ScenarioRepository';
import {
    PresentationFlow,
    NewPresentationFlow,
    NewStep,
    NewAriesOOBAction,
    Step,
    AriesOOBAction,
    WorkflowType
} from '../types';

@Service()
class PresentationFlowService {
    constructor(private readonly scenarioRepository: ScenarioRepository) {}

    // PRESENTATION FLOW

    public getPresentationFlows = async (): Promise<PresentationFlow[]> => {
        return this.scenarioRepository.findAll({ filter: { scenarioType: WorkflowType.PRESENTATION } })
    };

    public getPresentationFlow = async (presentationFlowId: string): Promise<PresentationFlow> => {
        return this.scenarioRepository.findById(presentationFlowId)
    };

    public createPresentationFlow = async (presentationFlow: NewPresentationFlow): Promise<PresentationFlow> => {
        return this.scenarioRepository.create(presentationFlow)
    };

    public updatePresentationFlow = async (presentationFlowId: string, presentationFlow: NewPresentationFlow): Promise<PresentationFlow> => {
        return this.scenarioRepository.update(presentationFlowId, presentationFlow)
    };

    public deletePresentationFlow = async (presentationFlowId: string): Promise<void> => {
        return this.scenarioRepository.delete(presentationFlowId)
    };

    // PRESENTATION FLOW STEP

    public getPresentationFlowSteps = async (presentationFlowId: string): Promise<Step[]> => {
        return this.scenarioRepository.findAllSteps(presentationFlowId)
    };

    public getPresentationFlowStep = async (presentationFlowId: string, stepId: string): Promise<Step> => {
        return this.scenarioRepository.findByStepId(presentationFlowId, stepId)
    };

    public createPresentationFlowStep = async (presentationFlowId: string, step: NewStep): Promise<Step> => {
        return this.scenarioRepository.createStep(presentationFlowId, step)
    };

    public updatePresentationFlowStep = async (presentationFlowId: string, stepId: string, step: NewStep): Promise<Step> => {
        return this.scenarioRepository.updateStep(presentationFlowId, stepId, step)
    };

    public deletePresentationFlowStep = async (presentationFlowId: string, stepId: string): Promise<void> => {
        return this.scenarioRepository.deleteStep(presentationFlowId, stepId)
    };

    // PRESENTATION FLOW STEP ACTION

    public getPresentationFlowStepActions = async (presentationFlowId: string, stepId: string): Promise<AriesOOBAction[]> => {
        return this.scenarioRepository.findAllStepActions(presentationFlowId, stepId)
    };

    public getPresentationFlowStepAction = async (presentationFlowId: string, stepId: string, actionId: string): Promise<AriesOOBAction> => {
        return this.scenarioRepository.findByStepActionId(presentationFlowId, stepId, actionId)
    };

    public createPresentationFlowStepAction = async (presentationFlowId: string, stepId: string, action: NewAriesOOBAction): Promise<AriesOOBAction> => {
        return this.scenarioRepository.createStepAction(presentationFlowId, stepId, action)
    };

    public updatePresentationFlowStepAction = async (presentationFlowId: string, stepId: string, actionId: string, action: NewAriesOOBAction): Promise<AriesOOBAction> => {
        return this.scenarioRepository.updateStepAction(presentationFlowId, stepId, actionId, action)
    };

    public deletePresentationFlowStepAction = async (presentationFlowId: string, stepId: string, actionId: string): Promise<void> => {
        return this.scenarioRepository.deleteStepAction(presentationFlowId, stepId, actionId)
    };
}

export default PresentationFlowService
