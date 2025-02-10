import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';
import { NotFoundError } from '../../errors/NotFoundError';
import { issuers } from '../schema'
import { Issuer, IssuerRepositoryDefinition, NewIssuer } from '../../types'

@Service()
class IssuerRepository implements IssuerRepositoryDefinition {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(issuer: NewIssuer): Promise<Issuer> {
    const result = await (await this.databaseService.getConnection())
      .insert(issuers)
      .values(issuer)
      .returning();

    return result[0]
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await (await this.databaseService.getConnection())
      .delete(issuers)
      .where(eq(issuers.id, id))
  }

  async update(id: string, issuer: Issuer): Promise<Issuer> {
    await this.findById(id)
    const result = await (await this.databaseService.getConnection())
      .update(issuers)
      .set(issuer)
      .returning();

    return result[0]
  }

  async findById(id: string): Promise<Issuer> {
    const result = await (await this.databaseService.getConnection())
      .select()
      .from(issuers)
      .where(eq(issuers.id, id));

    if (result.length === 0 && !result[0]) {
      return Promise.reject(new NotFoundError(`No issuer found for id: ${id}`))
    }

    return result[0]
  }

  async findAll(): Promise<Issuer[]> {
    return (await this.databaseService.getConnection())
      .select()
      .from(issuers);
  }
}

export default IssuerRepository
