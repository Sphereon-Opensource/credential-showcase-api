import { eq, inArray } from 'drizzle-orm';
import { Service } from 'typedi';
import DatabaseService from '../../services/DatabaseService';
import AssetRepository from './AssetRepository';
import { NotFoundError } from '../../errors';
import { credentialDefinitions, issuers, issuersToCredentialDefinitions } from '../schema';
import { Issuer, NewIssuer, RepositoryDefinition } from '../../types';

@Service()
class IssuerRepository implements RepositoryDefinition<Issuer, NewIssuer> {
  constructor(
      private readonly databaseService: DatabaseService,
      private readonly assetRepository: AssetRepository
  ) {}

  async create(issuer: NewIssuer): Promise<Issuer> {
    const logoResult = issuer.logo ? await this.assetRepository.findById(issuer.logo) : null

    return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Issuer> => {
      const [issuerResult] = (await tx.insert(issuers)
          .values({
            name: issuer.name,
            type: issuer.type,
            description: issuer.description,
            organization: issuer.organization,
            logo: logoResult ? logoResult.id : null
          })
          .returning())

      const issuersToCredentialDefinitionsResult = await tx.insert(issuersToCredentialDefinitions)
          .values(issuer.credentialDefinitions.map((credentialDefinitionId: string) => ({
            issuer: issuerResult.id,
            credentialDefinition: credentialDefinitionId
          })))
          .returning();

      const credentialDefinitionsResult = await tx.query.credentialDefinitions.findMany({
        where: inArray(credentialDefinitions.id, issuersToCredentialDefinitionsResult.map(item => item.credentialDefinition)),
        with: {
          attributes: true,
          representations: true,
          revocation: true,
          icon: true
        },
      })

      return {
        ...issuerResult,
        logo: logoResult,
        credentialDefinitions: credentialDefinitionsResult
      };
    })
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await (await this.databaseService.getConnection())
      .delete(issuers)
      .where(eq(issuers.id, id))
  }

  async update(id: string, issuer: NewIssuer): Promise<Issuer> {
    await this.findById(id)

    const logoResult = issuer.logo ? await this.assetRepository.findById(issuer.logo) : null
    return (await this.databaseService.getConnection()).transaction(async (tx): Promise<Issuer> => {
      const [issuerResult] = await tx.update(issuers)
          .set({
            name: issuer.name,
            type: issuer.type,
            description: issuer.description,
            organization: issuer.organization,
            logo: logoResult ? logoResult.id : null
          })
          .where(eq(issuers.id, id))
          .returning();

      await tx.delete(issuersToCredentialDefinitions).where(eq(issuersToCredentialDefinitions.issuer, id))

      const issuersToCredentialDefinitionsResult = await tx.insert(issuersToCredentialDefinitions)
          .values(issuer.credentialDefinitions.map((credentialDefinitionId: string) => ({
            issuer: issuerResult.id,
            credentialDefinition: credentialDefinitionId
          })))
          .returning();

      const credentialDefinitionsResult = await tx.query.credentialDefinitions.findMany({
        where: inArray(credentialDefinitions.id, issuersToCredentialDefinitionsResult.map(item => item.credentialDefinition)),
        with: {
          attributes: true,
          representations: true,
          revocation: true,
          icon: true
        },
      })

      return {
        ...issuerResult,
        logo: logoResult,
        credentialDefinitions: credentialDefinitionsResult
      };
    })
  }

  async findById(id: string): Promise<Issuer> {
    const result = await (await this.databaseService.getConnection()).query.issuers.findFirst({
      where: eq(issuers.id, id),
      with: {
        credentialDefinitions: {
          with: {
            cd: {
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
      return Promise.reject(new NotFoundError(`No issuer found for id: ${id}`))
    }

    return {
      ...result,
      credentialDefinitions: result.credentialDefinitions.map((item) => item.cd)
    }
  }

  async findAll(): Promise<Issuer[]> {
    const result = await (await this.databaseService.getConnection()).query.issuers.findMany({
      with: {
        credentialDefinitions: {
          with: {
            cd: {
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

    return result.map(issuer => ({
      ...issuer,
      credentialDefinitions: issuer.credentialDefinitions.map(item => item.cd)
    }))
  }
}

export default IssuerRepository
