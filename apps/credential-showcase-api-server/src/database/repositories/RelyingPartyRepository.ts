import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import { relyingParties, relyingPartiesToCredentialDefinitions } from '../schema';
import { RelyingParty, NewRelyingParty, RepositoryDefinition } from '../../types';

@Service()
class RelyingPartyRepository implements RepositoryDefinition<RelyingParty, NewRelyingParty> {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly assetRepository: AssetRepository
    ) {}

    async create(relyingParty: NewRelyingParty): Promise<RelyingParty> {
        let logoResult = null
        if (relyingParty.logo) {
            logoResult = (typeof relyingParty.logo === 'string') // TODO logo in spec is of type string, so maybe drop,the new
                ? await this.assetRepository.findById(relyingParty.logo)
                : await this.assetRepository.create(relyingParty.logo)
        }

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
                    relyingPartyId: relyingPartyResult.id,
                    credentialDefinitionId
                })))
                .returning();

            return {
                ...relyingPartyResult,
                logo: logoResult,
                credentialDefinitions: relyingPartiesToCredentialDefinitionsResult.map((item) => item.credentialDefinitionId)
            };
        })
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(relyingParties)
            .where(eq(relyingParties.id, id))
    }

    async update(id: string, relyingParty: RelyingParty): Promise<RelyingParty> { // TODO see the result of openapi and the payloads to determine how we update an asset
        await this.findById(id)

        let logoResult = null
        if (relyingParty.logo && typeof relyingParty.logo === 'string') { // TODO we only need to support a string id
            logoResult = await this.assetRepository.findById(relyingParty.logo)
        }

        const [result] = await (await this.databaseService.getConnection())
            .update(relyingParties)
            .set({
                ...relyingParty,
                logo: logoResult ? logoResult.id : null
            })
            .returning();

        return {
            ...result,
            logo: logoResult,
            credentialDefinitions: relyingParty.credentialDefinitions
        };
    }

    async findById(id: string): Promise<RelyingParty> {
        const result = await (await this.databaseService.getConnection()).query.relyingParties.findFirst({
            where: eq(relyingParties.id, id),
            with: {
                credentialDefinitions: true,
                logo: true
            },
        })

        if (!result) {
            return Promise.reject(new NotFoundError(`No relying party found for id: ${id}`))
        }

        return {
            ...result,
            credentialDefinitions: result.credentialDefinitions.map((item) => item.credentialDefinitionId)
        }
    }

    async findAll(): Promise<RelyingParty[]> {
        const result = await (await this.databaseService.getConnection()).query.relyingParties.findMany({
            with: {
                credentialDefinitions: true, // TODO i think we are able to specify a column? maybe we can just return a array of strings?
                logo: true
            },
        })

        return result.map((relayingParty) => ({
            ...relayingParty,
            credentialDefinitions: relayingParty.credentialDefinitions.map((item) => item.credentialDefinitionId)
        }))
    }
}

export default RelyingPartyRepository
