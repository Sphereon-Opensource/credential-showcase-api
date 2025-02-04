/* tslint:disable */
/* eslint-disable */
/**
 * Credential Showcase API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { StepAction } from './StepAction';
import {
    StepActionFromJSON,
    StepActionFromJSONTyped,
    StepActionToJSON,
    StepActionToJSONTyped,
} from './StepAction';
import type { StepType } from './StepType';
import {
    StepTypeFromJSON,
    StepTypeFromJSONTyped,
    StepTypeToJSON,
    StepTypeToJSONTyped,
} from './StepType';
import type { Asset } from './Asset';
import {
    AssetFromJSON,
    AssetFromJSONTyped,
    AssetToJSON,
    AssetToJSONTyped,
} from './Asset';
import type { Workflow } from './Workflow';
import {
    WorkflowFromJSON,
    WorkflowFromJSONTyped,
    WorkflowToJSON,
    WorkflowToJSONTyped,
} from './Workflow';

/**
 * 
 * @export
 * @interface Step
 */
export interface Step {
    /**
     * Unique identifier for the step
     * @type {string}
     * @memberof Step
     */
    id?: string;
    /**
     * Title of the step
     * @type {string}
     * @memberof Step
     */
    title: string;
    /**
     * Detailed description of the step
     * @type {string}
     * @memberof Step
     */
    description?: string;
    /**
     * Order of the step in the workflow
     * @type {number}
     * @memberof Step
     */
    order?: number;
    /**
     * 
     * @type {StepType}
     * @memberof Step
     */
    type: StepType;
    /**
     * 
     * @type {Workflow}
     * @memberof Step
     */
    subFlow?: Workflow;
    /**
     * List of actions associated with this step
     * @type {Array<StepAction>}
     * @memberof Step
     */
    actions?: Array<StepAction>;
    /**
     * List of assets referenced by this step
     * @type {Array<Asset>}
     * @memberof Step
     */
    assets?: Array<Asset>;
}



/**
 * Check if a given object implements the Step interface.
 */
export function instanceOfStep(value: object): value is Step {
    if (!('title' in value) || value['title'] === undefined) return false;
    if (!('type' in value) || value['type'] === undefined) return false;
    return true;
}

export function StepFromJSON(json: any): Step {
    return StepFromJSONTyped(json, false);
}

export function StepFromJSONTyped(json: any, ignoreDiscriminator: boolean): Step {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'title': json['title'],
        'description': json['description'] == null ? undefined : json['description'],
        'order': json['order'] == null ? undefined : json['order'],
        'type': StepTypeFromJSON(json['type']),
        'subFlow': json['subFlow'] == null ? undefined : WorkflowFromJSON(json['subFlow']),
        'actions': json['actions'] == null ? undefined : ((json['actions'] as Array<any>).map(StepActionFromJSON)),
        'assets': json['assets'] == null ? undefined : ((json['assets'] as Array<any>).map(AssetFromJSON)),
    };
}

export function StepToJSON(json: any): Step {
    return StepToJSONTyped(json, false);
}

export function StepToJSONTyped(value?: Step | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'title': value['title'],
        'description': value['description'],
        'order': value['order'],
        'type': StepTypeToJSON(value['type']),
        'subFlow': WorkflowToJSON(value['subFlow']),
        'actions': value['actions'] == null ? undefined : ((value['actions'] as Array<any>).map(StepActionToJSON)),
        'assets': value['assets'] == null ? undefined : ((value['assets'] as Array<any>).map(AssetToJSON)),
    };
}

