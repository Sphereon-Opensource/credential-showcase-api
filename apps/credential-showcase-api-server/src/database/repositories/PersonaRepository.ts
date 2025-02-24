import { eq } from 'drizzle-orm'
import { Service } from 'typedi'
import { DatabaseService } from '../../services/DatabaseService'
import { NotFoundError } from '../../errors/NotFoundError'
import { personas } from '../schema'
import { Persona, NewPersona, RepositoryDefinition } from '../../types'
import AssetRepository from './AssetRepository'

@Service()
class PersonaRepository implements RepositoryDefinition<Persona, NewPersona> {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly assetRepository: AssetRepository,
  ) {}

  async create(newPersona: NewPersona): Promise<Persona> {
    if (newPersona.headshotImage !== undefined && newPersona.headshotImage !== null) {
      try {
        await this.assetRepository.findById(newPersona.headshotImage)
      } catch (error) {
        throw new NotFoundError(`No asset found for id: ${newPersona.headshotImage}`)
      }
    }

    if (newPersona.bodyImage !== undefined && newPersona.bodyImage !== null) {
      try {
        await this.assetRepository.findById(newPersona.bodyImage)
      } catch (error) {
        throw new NotFoundError(`No asset found for id: ${newPersona.bodyImage}`)
      }
    }
    
    return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Persona> => {
      const [result] = await tx
        .insert(personas)
        .values({
          name: newPersona.name,
          role: newPersona.role,
          description: newPersona.description,
          headshotImage: newPersona.headshotImage || null,
          bodyImage: newPersona.bodyImage || null,
        })
        .returning({
          id: personas.id,
        });

      return this.findById(result.id);
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await (await this.databaseService.getConnection())
      .delete(personas)
      .where(eq(personas.id, id));
  }

  async update(id: string, body: NewPersona): Promise<Persona> {
    await this.findById(id);
    if (body.headshotImage) {
      try {
        await this.assetRepository.findById(body.headshotImage)
      } catch (error) {
        throw new NotFoundError(`No asset found for id: ${body.headshotImage}`)
      }
    }
    if (body.bodyImage) {
      try {
        await this.assetRepository.findById(body.bodyImage)
      } catch (error) {
        throw new NotFoundError(`No asset found for id: ${body.bodyImage}`)
      }
    }

    const [result] = await (await this.databaseService.getConnection())
      .update(personas)
      .set({
        name: body.name,
        role: body.role,
        description: body.description,
        headshotImage: body.headshotImage,
        bodyImage: body.bodyImage,
      })
      .where(eq(personas.id, id))
      .returning({
        id: personas.id,
      });

    return this.findById(result.id);
  }

  async findById(id: string): Promise<Persona> {
    const result = await (
      await this.databaseService.getConnection()
    ).query.personas.findFirst({
      where: eq(personas.id, id),
      with: {
        headshotImage: true,
        bodyImage: true,
      },
    });

    if (!result) {
      throw new NotFoundError(`No persona found for id: ${id}`);
    }

    return result;
  }

  async findAll(): Promise<Persona[]> {
    return (await this.databaseService.getConnection())
      .query.personas.findMany({
        with: {
          headshotImage: true,
          bodyImage: true,
        },
      });
  }
}

export default PersonaRepository;