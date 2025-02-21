import 'reflect-metadata';

import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { NewPersona } from '../../../types'
import PersonaRepository from '../PersonaRepository'
import { Container } from 'typedi'
import { DatabaseService } from '../../../services/DatabaseService'
import { PGlite } from '@electric-sql/pglite'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../../schema'

describe('Database persona repository tests', (): void => {
  let client: PGlite
  let repository: PersonaRepository

  beforeEach(async (): Promise<void> => {
    client = new PGlite()
    const database = drizzle(client, { schema }) as unknown as NodePgDatabase<Record<string, never>>
    await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
    const mockDatabaseService = {
      getConnection: jest.fn().mockResolvedValue(database),
    }
    Container.set(DatabaseService, mockDatabaseService)
    repository = Container.get(PersonaRepository)
  })

  afterEach((): void => {
    jest.resetAllMocks()
    Container.reset()
  })

  it('Should save persona to database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedPersona = await repository.create(persona)

    expect(savedPersona).toBeDefined()
    expect(savedPersona.name).toStrictEqual(persona.name)
    expect(savedPersona.role).toStrictEqual(persona.role)
    expect(savedPersona.description).toStrictEqual(persona.description)
  })

  it('Should save persona with assets to database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
      bodyImage: '123',
      headshotImage: '456',
    }

    const savedPersona = await repository.create(persona)

    expect(savedPersona).toBeDefined()
    expect(savedPersona.name).toStrictEqual(persona.name)
    expect(savedPersona.role).toStrictEqual(persona.role)
    expect(savedPersona.description).toStrictEqual(persona.description)
    expect(savedPersona.bodyImage).toStrictEqual(persona.bodyImage)
    expect(savedPersona.headshotImage).toStrictEqual(persona.headshotImage)
  })

  it('Should get persona by id from database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const fromDb = await repository.findById(savedPersona.id)

    expect(fromDb).not.toBeNull()
    expect(fromDb!.name).toStrictEqual(persona.name)
    expect(fromDb!.role).toStrictEqual(persona.role)
    expect(fromDb!.description).toStrictEqual(persona.description)
  })

  it('Should get all personas from database', async (): Promise<void> => {
    const persona1: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedPersona1 = await repository.create(persona1)
    expect(savedPersona1).toBeDefined()

    const persona2: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedAsset2 = await repository.create(persona2)
    expect(savedAsset2).toBeDefined()

    const fromDb = await repository.findAll()

    expect(fromDb.length).toStrictEqual(2)
  })

  it('Should delete persona from database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const deletionResult = await repository.delete(savedPersona.id)
    expect(deletionResult).toStrictEqual(true)

    const fromDb = await repository.findById(savedPersona.id)
    expect(fromDb).toBeNull()
  })

  it('Should update persona in database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: 'test',
      role: 'tester',
      description: 'some persona',
    }

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const newRole = 'senior tester'
    const updatedPersona = await repository.update(savedPersona.id, {
      name: savedPersona.name,
      role: newRole,
      description: savedPersona.description || '',
    })

    expect(updatedPersona).toBeDefined()
    expect(updatedPersona.name).toStrictEqual(persona.name)
    expect(updatedPersona.role).toStrictEqual(newRole)
    expect(updatedPersona.description).toStrictEqual(persona.description)
  })
})
