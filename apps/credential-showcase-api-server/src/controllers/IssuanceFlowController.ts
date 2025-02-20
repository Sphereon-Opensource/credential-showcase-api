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
import IssuanceFlowService from '../services/IssuanceFlowService';
import {
    IssuanceFlow,
    NewIssuanceFlow,
    NewStep,
    NewStepAction,
    Step,
    StepAction
} from '../types';

@JsonController('/workflows/issuances')
@Service()
class IssuanceFlowController {
    constructor(private issuanceFlowService: IssuanceFlowService) { }

    // ISSUANCE FLOW

    @Get('/')
    public async getAllIssuanceFlows(): Promise<IssuanceFlow[]> {
        return this.issuanceFlowService.getIssuanceFlows()
    }

    @Get('/:issuanceFlowId')
    getOneIssuanceFlow(
        @Param('issuanceFlowId') issuanceFlowId: string
    ): Promise<IssuanceFlow> {
        return this.issuanceFlowService.getIssuanceFlow(issuanceFlowId);
    }

    @HttpCode(201)
    @Post('/')
    postIssuanceFlow(
        @Body() issuanceFlow: NewIssuanceFlow
    ): Promise<IssuanceFlow> {
        return this.issuanceFlowService.createIssuanceFlow(issuanceFlow);
    }

    @Put('/:issuanceFlowId')
    putIssuanceFlow(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Body() issuanceFlow: IssuanceFlow
    ): Promise<IssuanceFlow> {
        return this.issuanceFlowService.updateIssuanceFlow(issuanceFlowId, issuanceFlow)
    }

    @OnUndefined(204)
    @Delete('/:issuanceFlowId')
    deleteIssuanceFlow(
        @Param('issuanceFlowId') issuanceFlowId: string
    ): Promise<void> {
        return this.issuanceFlowService.deleteIssuanceFlow(issuanceFlowId);
    }

    // ISSUANCE FLOW STEP

    @Get('/:issuanceFlowId/steps')
    public async getAllSteps(
        @Param('issuanceFlow') issuanceFlowId: string
    ): Promise<Step[]> {
        return this.issuanceFlowService.getIssuanceFlowSteps(issuanceFlowId)
    }

    @Get('/:issuanceFlowId/steps/:stepId')
    getOneIssuanceFlowStep(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<Step> {
        return this.issuanceFlowService.getIssuanceFlowStep(issuanceFlowId, stepId);
    }

    @HttpCode(201)
    @Post('/:issuanceFlowId/steps')
    postIssuanceFlowStep(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Body() step: NewStep
    ): Promise<Step> {
        return this.issuanceFlowService.createIssuanceFlowStep(issuanceFlowId, step);
    }

    @Put('/:issuanceFlowId/steps/:stepId')
    putIssuanceFlowStep(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string,
        @Body() step: NewStep
    ): Promise<Step> {
        return this.issuanceFlowService.updateIssuanceFlowStep(issuanceFlowId, stepId, step)
    }

    @OnUndefined(204)
    @Delete('/:issuanceFlowId/steps/:stepId')
    deleteIssuanceFlowStep(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<void> {
        return this.issuanceFlowService.deleteIssuanceFlowStep(issuanceFlowId, stepId);
    }

    // ISSUANCE FLOW STEP ACTION

    @Get('/:issuanceFlowId/steps/:stepId/actions')
    public async getAllIssuanceFlowStepActions(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string
    ): Promise<StepAction[]> {
        return this.issuanceFlowService.getIssuanceFlowStepActions(issuanceFlowId, stepId)
    }

    @Get('/:issuanceFlowId/steps/:stepId/actions/:actionId')
    getOneIssuanceFlowStepAction(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string
    ): Promise<StepAction> {
        return this.issuanceFlowService.getIssuanceFlowStepAction(issuanceFlowId, stepId, actionId);
    }

    @HttpCode(201)
    @Post('/:issuanceFlowId/steps/:stepId/actions')
    postIssuanceFlowStepAction(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string,
        @Body() action: NewStepAction
    ): Promise<StepAction> {
        return this.issuanceFlowService.createIssuanceFlowStepAction(issuanceFlowId, stepId, action);
    }

    @Put('/:issuanceFlowId/steps/:stepId/actions/:actionId')
    putIssuanceFlowStepAction(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string,
        @Body() action: NewStepAction
    ): Promise<StepAction> {
        return this.issuanceFlowService.updateIssuanceFlowStepAction(issuanceFlowId, stepId, actionId, action)
    }

    @OnUndefined(204)
    @Delete('/:issuanceFlowId/steps/:stepId/actions/:actionId')
    deleteIssuanceFlowStepAction(
        @Param('issuanceFlowId') issuanceFlowId: string,
        @Param('stepId') stepId: string,
        @Param('actionId') actionId: string
    ): Promise<void> {
        return this.issuanceFlowService.deleteIssuanceFlowStepAction(issuanceFlowId, stepId, actionId);
    }
}

export default IssuanceFlowController
