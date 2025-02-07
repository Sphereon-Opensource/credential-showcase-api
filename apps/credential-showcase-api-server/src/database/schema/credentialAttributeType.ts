import { pgEnum } from 'drizzle-orm/pg-core';
import { CredentialAttributeType } from '../../types/rest';

export const CredentialAttributeTypePg = pgEnum('CredentialAttributeType', Object.values(CredentialAttributeType) as [string, ...string[]]); // TODO use openapi model
