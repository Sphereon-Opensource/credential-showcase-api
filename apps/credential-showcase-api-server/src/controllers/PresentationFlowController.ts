import {
    Body,
    Delete,
    Get,
    HttpCode,
    JsonController,
    OnUndefined,
    Param,
    Post,
    Put
} from 'routing-controllers';
import { Service } from 'typedi';
import PresentationFlowService from '../services/PresentationFlowService';
import {
    PresentationFlowRequest,
    PresentationFlowRequestToJSONTyped,
    PresentationFlowResponse,
    PresentationFlowResponseFromJSONTyped,
    PresentationFlowsResponse,
    PresentationFlowsResponseFromJSONTyped,
    StepsResponse,
    StepsResponseFromJSONTyped,
    StepResponse,
    StepResponseFromJSONTyped,
    StepRequest,
    StepRequestToJSONTyped,
    StepActionsResponse,
    StepActionsResponseFromJSONTyped,
    StepActionResponse,
    StepActionResponseFromJSONTyped,
    StepActionRequest,
    StepActionRequestToJSONTyped
} from 'credential-showcase-openapi';
import { presentationFlowDTOFrom, stepDTOFrom } from '../utils/mappers';

@JsonController('/workflows/presentations')
@Service()
class PresentationFlowController {
    constructor(private presentationFlowService: PresentationFlowService) { }

    // PRESENTATION FLOW

    @Get('/')
    public async getAllPresentationFlows(): Promise<PresentationFlowsResponse> {
        const result = await this.presentationFlowService.getPresentationFlows();
        const presentationFlows = result.map(presentationFlow => presentationFlowDTOFrom(presentationFlow));
        return PresentationFlowsResponseFromJSONTyped({ presentationFlows }, false);
    }

    @Get('/:presentationFlowId')
    public async getOnePresentationFlow(
        @Param('presentationFlowId') presentationFlowId: string
    ): Promise<PresentationFlowResponse> {
        const result = await this.presentationFlowService.getPresentationFlow(presentationFlowId);
        return PresentationFlowResponseFromJSONTyped({ presentationFlow: presentationFlowDTOFrom(result) }, false);
    }

    @HttpCode(201)
    @Post('/')
    public async postPresentationFlow(
        @Body() presentationFlowRequest: PresentationFlowRequest
    ): Promise<PresentationFlowResponse> {
        const result = await this.presentationFlowService.createPresentationFlow(PresentationFlowRequestToJSONTyped(presentationFlowRequest));
        return PresentationFlowResponseFromJSONTyped({ presentationFlow: presentationFlowDTOFrom(result) }, false);
    }

    @Put('/:presentationFlowId')
    public async putPresentationFlow(
        @Param('presentationFlowId') presentationFlowId: string,
        @Body() presentationFlowRequest: PresentationFlowRequest
    ): Promise<PresentationFlowResponse> {
        const result = await this.presentationFlowService.updatePresentationFlow(presentationFlowId, PresentationFlowRequestToJSONTyped(presentationFlowRequest));
        return PresentationFlowResponseFromJSONTyped({ presentationFlow: presentationFlowDTOFrom(result) }, false);
    }

    @OnUndefined(204)
    @Delete('/:presentationFlowId')
    public async deletePresentationFlow(
        @Param('presentationFlowId') presentationFlowId: string
    ): Promise<void> {
        return await this.presentationFlowService.deletePresentationFlow(presentationFlowId);
    }

    // PRESENTATION FLOW STEP

    @Get('/:presentationFlowId/steps')
    public async getAllSteps(
        @Param('presentationFlowId') presentationFlowId: string
    ): Promise<StepsResponse> {
        const result = await this.presentationFlowService.getPresentationFlowSteps(presentationFlowId)
        const steps = result.map(step => stepDTOFrom(step));
        return StepsResponseFromJSONTyped({ steps }, false);
    }

    @Get('/:presentationFlowId/steps/:stepId')
    public async getOnePresentationFlowStep(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<StepResponse> {
        const result = await this.presentationFlowService.getPresentationFlowStep(presentationFlowId, stepId);
        return StepResponseFromJSONTyped({ step: stepDTOFrom(result) }, false);
    }

    @HttpCode(201)
    @Post('/:presentationFlowId/steps')
    public async postPresentationFlowStep(
        @Param('presentationFlowId') presentationFlowId: string,
        @Body() stepRequest: StepRequest
    ): Promise<StepResponse> {
        const result = await this.presentationFlowService.createPresentationFlowStep(presentationFlowId, StepRequestToJSONTyped(stepRequest));
        return StepResponseFromJSONTyped({ step: stepDTOFrom(result) }, false);
    }

    @Put('/:presentationFlowId/steps/:stepId')
    public async putPresentationFlowStep(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string,
        @Body() stepRequest: StepRequest
    ): Promise<StepResponse> {
        const result = await this.presentationFlowService.updatePresentationFlowStep(presentationFlowId, stepId, StepRequestToJSONTyped(stepRequest))
        return StepResponseFromJSONTyped({ step: stepDTOFrom(result) }, false);
    }

    @OnUndefined(204)
    @Delete('/:presentationFlowId/steps/:stepId')
    public async deletePresentationFlowStep(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<void> {
        return this.presentationFlowService.deletePresentationFlowStep(presentationFlowId, stepId);
    }

    // PRESENTATION FLOW STEP ACTION

    @Get('/:presentationFlowId/steps/:stepId/actions')
    public async getAllPresentationFlowStepActions(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<StepActionsResponse> {
        const result = await this.presentationFlowService.getPresentationFlowStepActions(presentationFlowId, stepId)
        const actions = result.map(action => action);
        return StepActionsResponseFromJSONTyped({ actions }, false);
    }

    @Get('/:presentationId/steps/:stepId/actions/:actionId')
    public async getOnePresentationFlowStepAction(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string
    ): Promise<StepActionResponse> {
        const result = await this.presentationFlowService.getPresentationFlowStepAction(presentationFlowId, stepId, actionId);
        return StepActionResponseFromJSONTyped({ step: result }, false);
    }

    @HttpCode(201)
    @Post('/:presentationFlowId/steps/:stepId/actions')
    public async postPresentationFlowStepAction(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string,
        @Body() actionRequest: StepActionRequest
    ): Promise<StepActionResponse> {
        const result = await this.presentationFlowService.createPresentationFlowStepAction(presentationFlowId, stepId, StepActionRequestToJSONTyped(actionRequest));
        return StepActionResponseFromJSONTyped({ step: result }, false);
    }

    @Put('/:presentationFlowId/steps/:stepId/actions/:actionId')
    public async putPresentationFlowStepAction(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string,
        @Body() actionRequest: StepActionRequest
    ): Promise<StepActionResponse> {
        const result = await this.presentationFlowService.updatePresentationFlowStepAction(presentationFlowId, stepId, actionId, StepActionRequestToJSONTyped(actionRequest))
        return StepActionResponseFromJSONTyped({ step: result }, false);
    }

    @OnUndefined(204)
    @Delete('/:presentationFlowId/steps/:stepId/actions/:actionId')
    public async deletePresentationFlowStepAction(
        @Param('presentationFlowId') presentationFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string
    ): Promise<void> {
        return this.presentationFlowService.deletePresentationFlowStepAction(presentationFlowId, stepId, actionId);
    }
}

export default PresentationFlowController
