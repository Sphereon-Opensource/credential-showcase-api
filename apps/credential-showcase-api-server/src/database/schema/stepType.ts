import { pgEnum } from 'drizzle-orm/pg-core';
import { StepType } from '../../types/rest';

export const StepTypePg = pgEnum('StepType', Object.values(StepType) as [string, ...string[]]); // TODO use openapi model
