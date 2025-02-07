import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';
import { NotFoundError } from '../../errors/NotFoundError';
import {credentialDefinitions} from '../schema';
import {
    CredentialDefinition,
    CredentialDefinitionRepositoryDefinition,
    NewCredentialDefinition
} from '../../types';

@Service()
class CredentialDefinitionRepository implements CredentialDefinitionRepositoryDefinition {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(credentialDefinition: NewCredentialDefinition): Promise<CredentialDefinition> {
        const result = await (await this.databaseService.getConnection())
            .insert(credentialDefinitions)
            .values(credentialDefinition)
            .returning();
// @ts-ignore
        return result[0]
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(credentialDefinitions)
            .where(eq(credentialDefinitions.id, id))
    }

    async update(id: string, credentialDefinition: CredentialDefinition): Promise<CredentialDefinition> { // TODO see the result of openapi and the payloads to determine how we update a credentialDefinition
        await this.findById(id)
        const result = await (await this.databaseService.getConnection())
            .update(credentialDefinitions)
            .set(credentialDefinition)
            .returning();
// @ts-ignore
        return result[0]
    }

    async findById(id: string): Promise<CredentialDefinition> {
        const result = await (await this.databaseService.getConnection())
            .select()
            .from(credentialDefinitions)
            .where(eq(credentialDefinitions.id, id));

        if (result.length === 0 && !result[0]) {
            return Promise.reject(new NotFoundError(`No credential definition found for id: ${id}`))
        }
// @ts-ignore
        return result[0]
    }

    async findAll(): Promise<CredentialDefinition[]> {
        // @ts-ignore
        return (await this.databaseService.getConnection()).query.credentialDefinitions.findMany({
            with: {
                attributes: true,
                // credentialRepresentations: true,
                // revocationInfo: true
            },
        });
    }
}

export default CredentialDefinitionRepository
