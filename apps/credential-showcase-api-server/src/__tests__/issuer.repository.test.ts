import 'reflect-metadata';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Container } from 'typedi';
import { DatabaseService } from '../services/DatabaseService';
import { NewIssuer } from '../types'
import IssuerRepository from '../database/repositories/IssuerRepository'

describe('Database issuer repository tests', (): void => {
  let repository: IssuerRepository;

  beforeEach(async (): Promise<void> => {
    const database: PgDatabase<any> = drizzle();
    await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
    const mockDatabaseService = {
      getConnection: jest.fn().mockResolvedValue(database),
    };
    Container.set(DatabaseService, mockDatabaseService);
    repository = Container.get(IssuerRepository);
  })

  afterEach((): void => {
    jest.resetAllMocks();
    Container.reset();
  });

  it('Should save issuer to database', async (): Promise<void> => {
    const issuer: NewIssuer = {
      name: 'test_issuer',
      type: 'ARIES',
      description: 'test_issuer',
      organization: 'test_organization'
    };

    const savedIssuer = await repository.create(issuer)

    expect(savedIssuer).toBeDefined()
    expect(savedIssuer.name).toEqual(issuer.name)
    expect(savedIssuer.type).toEqual(issuer.type)
    expect(savedIssuer.description).toEqual(issuer.description)
    expect(savedIssuer.organization).toEqual(issuer.organization);
  })

  it('Should get issuer by id from database', async (): Promise<void> => {
    const issuer: NewIssuer = {
      name: 'test_issuer',
      type: 'ARIES',
      description: 'test_issuer',
      organization: 'test_organization'
    };

    const savedIssuer = await repository.create(issuer)
    expect(savedIssuer).toBeDefined()

    const fromDb = await repository.findById(savedIssuer.id)

    expect(fromDb).not.toBeNull()
    expect(savedIssuer.name).toEqual(issuer.name)
    expect(savedIssuer.type).toEqual(issuer.type)
    expect(savedIssuer.description).toEqual(issuer.description)
    expect(savedIssuer.organization).toEqual(issuer.organization);
  })

  it('Should get all issuers from database', async (): Promise<void> => {
    const issuer1: NewIssuer = {
      name: 'test_issuer1',
      type: 'ARIES',
      description: 'test_issuer1',
      organization: 'test_organization1'
    };

    const savedIssuer1 = await repository.create(issuer1)
    expect(savedIssuer1).toBeDefined()

    const issuer2: NewIssuer = {
      name: 'test_issuer2',
      type: 'ARIES',
      description: 'test_issuer2',
      organization: 'test_organization2'
    };

    const savedIssuer2 = await repository.create(issuer2)
    expect(savedIssuer2).toBeDefined()

    const fromDb = await repository.findAll()

    expect(fromDb.length).toEqual(2)
  })

  it('Should delete issuer from database', async (): Promise<void> => {
    const issuer: NewIssuer = {
      name: 'test_issuer',
      type: 'ARIES',
      description: 'test_issuer',
      organization: 'test_organization'
    };

    const savedIssuer = await repository.create(issuer)
    expect(savedIssuer).toBeDefined()

    await repository.delete(savedIssuer.id)

    await expect(repository.findById(savedIssuer.id)).rejects.toThrowError(`No issuer found for id: ${savedIssuer.id}`)
  })

  it('Should update issuer in database', async (): Promise<void> => {
    const issuer: NewIssuer = {
      name: 'test_issuer',
      type: 'ARIES',
      description: 'test_issuer',
      organization: 'test_organization'
    };

    const savedIssuer = await repository.create(issuer)
    expect(savedIssuer).toBeDefined()

    const newName = 'new_test_issuer'
    const updatedIssuer = await repository.update(savedIssuer.id, { ...savedIssuer, name: newName })

    expect(updatedIssuer).toBeDefined()
    expect(savedIssuer.name).toEqual(issuer.name)
    expect(savedIssuer.type).toEqual(issuer.type)
    expect(savedIssuer.description).toEqual(issuer.description)
    expect(savedIssuer.organization).toEqual(issuer.organization);
  })
})
