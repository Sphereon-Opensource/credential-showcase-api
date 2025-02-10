import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import {relyingParties, relyingPartiesToCredentialDefinitions} from '../schema';
import { RelyingParty, NewRelyingParty, RepositoryDefinition
    //, Asset
} from '../../types';

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

            //const userId = relyingPartyResult.id;

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

        // const result = await (await this.databaseService.getConnection())
        //     .insert(relyingParties)
        //     .values({
        //         ...relyingParty,
        //         logo: logoResult ? logoResult.id : null
        //     })
        //     .returning();
        //
        // return {
        //     ...result[0],
        //     logo: logoResult
        // }
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(relyingParties)
            .where(eq(relyingParties.id, id))
    }

    async update(id: string, relyingParty: RelyingParty): Promise<RelyingParty> { // TODO see the result of openapi and the payloads to determine how we update an asset

        return Promise.reject(Error('Not yet implemented'))

        // await this.findById(id)
        // const result = await (await this.databaseService.getConnection())
        //     .update(relyingParties)
        //     .set(relyingParty)
        //     .returning();
        //
        // return result[0]
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
                credentialDefinitions: true,
                logo: true
            },
        });

        console.log(result)

        return [] // TODO fix
    }
}

export default RelyingPartyRepository
