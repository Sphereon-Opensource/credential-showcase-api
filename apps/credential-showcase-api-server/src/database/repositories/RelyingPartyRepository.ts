import {eq, inArray} from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import { credentialDefinitions, relyingParties, relyingPartiesToCredentialDefinitions } from '../schema';
import { RelyingParty, NewRelyingParty, RepositoryDefinition } from '../../types';

@Service()
class RelyingPartyRepository implements RepositoryDefinition<RelyingParty, NewRelyingParty> {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly assetRepository: AssetRepository
    ) {}

    async create(relyingParty: NewRelyingParty): Promise<RelyingParty> {
        const logoResult = relyingParty.logo ? await this.assetRepository.findById(relyingParty.logo) : null

        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<RelyingParty> => {
            const [relyingPartyResult] = (await tx.insert(relyingParties)
                .values({
                    name: relyingParty.name,
                    type: relyingParty.type,
                    description: relyingParty.description,
                    organization: relyingParty.organization,
                    logo: logoResult ? logoResult.id : null
                })
                .returning())

            const relyingPartiesToCredentialDefinitionsResult = await tx.insert(relyingPartiesToCredentialDefinitions)
                .values(relyingParty.credentialDefinitions.map((credentialDefinitionId: string) => ({
                    relyingParty: relyingPartyResult.id,
                    credentialDefinition: credentialDefinitionId
                })))
                .returning();

            const credentialDefinitionsResult = await tx.query.credentialDefinitions.findMany({
                where: inArray(credentialDefinitions.id, relyingPartiesToCredentialDefinitionsResult.map(item => item.credentialDefinition)),
                with: {
                    attributes: true,
                    representations: true,
                    revocation: true,
                    icon: true
                },
            })

            return {
                ...relyingPartyResult,
                logo: logoResult,
                credentialDefinitions: credentialDefinitionsResult
            };
        })
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(relyingParties)
            .where(eq(relyingParties.id, id))
    }

    async update(id: string, relyingParty: NewRelyingParty): Promise<RelyingParty> {
        await this.findById(id)

        const logoResult = relyingParty.logo ? await this.assetRepository.findById(relyingParty.logo) : null
        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<RelyingParty> => {
            const [relyingPartyResult] = await tx.update(relyingParties)
                .set({
                    name: relyingParty.name,
                    type: relyingParty.type,
                    description: relyingParty.description,
                    organization: relyingParty.organization,
                    logo: logoResult ? logoResult.id : null
                })
                .where(eq(relyingParties.id, id))
                .returning();

            await tx.delete(relyingPartiesToCredentialDefinitions).where(eq(relyingPartiesToCredentialDefinitions.relyingParty, id))

            const relyingPartiesToCredentialDefinitionsResult = await tx.insert(relyingPartiesToCredentialDefinitions)
                .values(relyingParty.credentialDefinitions.map((credentialDefinitionId: string) => ({
                    relyingParty: relyingPartyResult.id,
                    credentialDefinition: credentialDefinitionId
                })))
                .returning();

            const credentialDefinitionsResult = await tx.query.credentialDefinitions.findMany({
                where: inArray(credentialDefinitions.id, relyingPartiesToCredentialDefinitionsResult.map(item => item.credentialDefinition)),
                with: {
                    attributes: true,
                    representations: true,
                    revocation: true,
                    icon: true
                },
            })

            return {
                ...relyingPartyResult,
                logo: logoResult,
                credentialDefinitions: credentialDefinitionsResult
            };
        })
    }

    async findById(id: string): Promise<RelyingParty> {
        const result = await (await this.databaseService.getConnection()).query.relyingParties.findFirst({
            where: eq(relyingParties.id, id),
            with: {
                credentialDefinitions: {
                    with: {
                        credentialDefinition: {
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
            },
        })

        if (!result) {
            return Promise.reject(new NotFoundError(`No relying party found for id: ${id}`))
        }

        return {
            ...result,
            credentialDefinitions: result.credentialDefinitions.map((item) => item.credentialDefinition)
        }
    }

    async findAll(): Promise<RelyingParty[]> {
        const result = await (await this.databaseService.getConnection()).query.relyingParties.findMany({
            with: {
                credentialDefinitions: {
                    with: {
                        credentialDefinition: {
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
            },
        })

        return result.map((relayingParty) => ({
            ...relayingParty,
            credentialDefinitions: relayingParty.credentialDefinitions.map(item => item.credentialDefinition)
        }))
    }
}

export default RelyingPartyRepository
