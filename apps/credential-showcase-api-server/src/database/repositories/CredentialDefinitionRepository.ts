import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import {
    credentialAttributes,
    credentialDefinitions,
    credentialRepresentations,
    revocationInfo
} from '../schema';
import {
    CredentialDefinition,
    NewCredentialAttribute,
    NewCredentialDefinition,
    NewCredentialRepresentation,
    RepositoryDefinition
} from '../../types';

@Service()
class CredentialDefinitionRepository implements RepositoryDefinition<CredentialDefinition, NewCredentialDefinition> {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly assetRepository: AssetRepository
    ) {}

    async create(credentialDefinition: NewCredentialDefinition): Promise<CredentialDefinition> {
        const iconResult = (typeof credentialDefinition.icon === 'string') // TODO icon in spec is of type string, so maybe drop,the new
            ? await this.assetRepository.findById(credentialDefinition.icon)
            : await this.assetRepository.create(credentialDefinition.icon)

        return (await this.databaseService.getConnection()).transaction(async (tx): Promise<CredentialDefinition> => {
            const credentialDefinitionResult = (await tx.insert(credentialDefinitions)
                .values({
                    name: credentialDefinition.name,
                    version: credentialDefinition.version,
                    icon: iconResult.id,
                    type: credentialDefinition.type,
                })
                .returning())[0];

            const credentialAttributesResult = await tx.insert(credentialAttributes)
                    .values(credentialDefinition.attributes.map((attribute: NewCredentialAttribute) => ({
                        ...attribute,
                        credentialDefinitionId: credentialDefinitionResult.id
                    })))
                .returning();

            const credentialRepresentationsResult = await tx.insert(credentialRepresentations)
                .values(credentialDefinition.representations.map((representation: NewCredentialRepresentation) => ({
                    ...representation,
                    credentialDefinitionId: credentialDefinitionResult.id
                })))
                .returning();

            let revocationResult = null;
            if (credentialDefinition.revocation) {
                revocationResult = (await tx.insert(revocationInfo)
                    .values({
                        ...credentialDefinition.revocation,
                        credentialDefinitionId: credentialDefinitionResult.id
                    })
                    .returning())[0];
            }

            return {
                ...credentialDefinitionResult,
                icon: iconResult,
                attributes: credentialAttributesResult,
                representations: credentialRepresentationsResult,
                revocation: revocationResult,
            };
        })
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(credentialDefinitions)
            .where(eq(credentialDefinitions.id, id))
    }

    async update(id: string, credentialDefinition: CredentialDefinition): Promise<CredentialDefinition> { // TODO see the result of openapi and the payloads to determine how we update a credentialDefinition
        await this.findById(id)
        const result = (await (await this.databaseService.getConnection())
            .update(credentialDefinitions)
            .set({
                id: credentialDefinition.id,
                name: credentialDefinition.name,
                type: credentialDefinition.type,
                version: credentialDefinition.version,
                icon: credentialDefinition.icon.id // TODO we should make it possible to also only use an id
            })
            .returning())[0]

        return {
            ...result,
            icon: await this.assetRepository.findById(credentialDefinition.icon.id),
            attributes: credentialDefinition.attributes,
            representations: credentialDefinition.representations,
            revocation: credentialDefinition.revocation
        }
    }

    async findById(id: string): Promise<CredentialDefinition> {
        const result = await (await this.databaseService.getConnection()).query.credentialDefinitions.findFirst({
            where: eq(credentialDefinitions.id, id),
            with: {
                icon: true,
                attributes: true,
                representations: true,
                revocation: true
            },
        })

        if (!result) {
            return Promise.reject(new NotFoundError(`No credential definition found for id: ${id}`))
        }

        return result
    }

    async findAll(): Promise<CredentialDefinition[]> {
        return (await this.databaseService.getConnection()).query.credentialDefinitions.findMany({
            with: {
                icon: true,
                attributes: true,
                representations: true,
                revocation: true
            },
        });
    }
}

export default CredentialDefinitionRepository
