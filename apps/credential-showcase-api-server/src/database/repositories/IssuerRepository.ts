import { eq } from 'drizzle-orm';
import { Service } from 'typedi';
import { DatabaseService } from '../../services/DatabaseService';
import { NotFoundError } from '../../errors';
import { issuers } from '../schema';
import { Issuer, NewIssuer, RepositoryDefinition } from '../../types';

@Service()
class IssuerRepository implements RepositoryDefinition<Issuer, NewIssuer> {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(issuer: NewIssuer): Promise<Issuer> {
    const [result] = await (await this.databaseService.getConnection())
      .insert(issuers)
      .values(issuer)
      .returning();

    return result
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await (await this.databaseService.getConnection())
      .delete(issuers)
      .where(eq(issuers.id, id))
  }

  async update(id: string, issuer: NewIssuer): Promise<Issuer> {
    await this.findById(id)
    const [result] = await (await this.databaseService.getConnection())
      .update(issuers)
      .set(issuer)
      .returning();

    return result
  }

  async findById(id: string): Promise<Issuer> {
    const [result] = await (await this.databaseService.getConnection())
      .select()
      .from(issuers)
      .where(eq(issuers.id, id));

    if (!result) {
      return Promise.reject(new NotFoundError(`No issuer found for id: ${id}`))
    }

    return result
  }

  async findAll(): Promise<Issuer[]> {
    return (await this.databaseService.getConnection())
      .select()
      .from(issuers);
  }
}

export default IssuerRepository
