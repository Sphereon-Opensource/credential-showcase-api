import { pgEnum } from 'drizzle-orm/pg-core';
import { CredentialType } from '../../types/rest';

export const CredentialTypePg = pgEnum('CredentialType', Object.values(CredentialType) as [string, ...string[]]); // TODO use openapi model
