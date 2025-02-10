import { pgEnum } from 'drizzle-orm/pg-core';
import { RelyingPartyType } from '../../types/rest';

export const RelyingPartyTypePg = pgEnum('RelyingPartyType', Object.values(RelyingPartyType) as [string, ...string[]]); // TODO use openapi model
