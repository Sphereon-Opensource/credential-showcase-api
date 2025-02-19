import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';
import { NotFoundError } from '../../errors/NotFoundError';
import { assets, personas } from '../schema';
import { Persona, NewPersona, RepositoryDefinition } from '../../types';

@Service()
class PersonaRepository implements RepositoryDefinition<Persona, NewPersona> {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(persona: NewPersona): Promise<Persona> {
        const [result] = await (await this.databaseService.getConnection())
            .insert(personas)
            .values(persona)
            .returning();

        return result
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await (await this.databaseService.getConnection())
            .delete(assets)
            .where(eq(assets.id, id))
    }

    async update(id: string, persona: NewPersona): Promise<Persona> {
        await this.findById(id)
        const [result] = await (await this.databaseService.getConnection())
            .update(personas)
            .set(persona)
            .where(eq(personas.id, id))
            .returning();

        return result
    }

    async findById(id: string): Promise<Persona> {
        const [result] = await (await this.databaseService.getConnection())
            .select()
            .from(personas)
            .where(eq(personas.id, id));

        if (!result) {
            return Promise.reject(new NotFoundError(`No asset found for id: ${id}`))
        }

        return result
    }

    async findAll(): Promise<Persona[]> {
        return (await this.databaseService.getConnection())
            .select()
            .from(personas);
    }
}

export default PersonaRepository
