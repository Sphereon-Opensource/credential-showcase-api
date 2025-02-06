import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NewPersona } from '../types'
import PersonaRepository from '../database/repositories/personaRepository'

describe('Database persona repository tests', (): void => {
  let repository: PersonaRepository;

  beforeEach(async (): Promise<void> => {
    const database: any = drizzle();
    await migrate(database, { migrationsFolder: './apps/credential-showcase-api-server/src/database/migrations' })
    repository = new PersonaRepository({ database })
  })

  it('Should save persona to database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: "test",
      role: "tester",
      description: 'some persona',
    };

    const savedPersona = await repository.create(persona)

    expect(savedPersona).toBeDefined()
    expect(savedPersona.name).toEqual(persona.name)
    expect(savedPersona.role).toEqual(persona.role)
    expect(savedPersona.description).toEqual(persona.description)
  })

  it('Should get persona by id from database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: "test",
      role: "tester",
      description: "some persona"
    };

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const fromDb = await repository.findById(savedPersona.personaId)

    expect(fromDb).not.toBeNull()
    expect(fromDb!.name).toEqual(persona.name)
    expect(fromDb!.role).toEqual(persona.role)
    expect(fromDb!.description).toEqual(persona.description)
  })

  it('Should get all personas from database', async (): Promise<void> => {
    const persona1: NewPersona = {
      name: "test",
      role: "tester",
      description: "some persona"
    };

    const savedPersona1 = await repository.create(persona1)
    expect(savedPersona1).toBeDefined()

    const persona2: NewPersona = {
      name: "test",
      role: "tester",
      description: "some persona"
    };

    const savedAsset2 = await repository.create(persona2)
    expect(savedAsset2).toBeDefined()

    const fromDb = await repository.findAll()

    expect(fromDb.length).toEqual(2)
  })

  it('Should delete persona from database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: "test",
      role: "tester",
      description: "some persona"
    };

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const deletionResult = await repository.delete(savedPersona.personaId)
    expect(deletionResult).toEqual(true)

    const fromDb = await repository.findById(savedPersona.personaId)
    expect(fromDb).toBeNull()
  })

  it('Should update persona in database', async (): Promise<void> => {
    const persona: NewPersona = {
      name: "test",
      role: "tester",
      description: "some persona"
    };

    const savedPersona = await repository.create(persona)
    expect(savedPersona).toBeDefined()

    const newRole = 'senior tester'
    const updatedPersona = await repository.update({ ...savedPersona, role: newRole })

    expect(updatedPersona).toBeDefined()
    expect(updatedPersona.name).toEqual(persona.name)
    expect(updatedPersona.role).toEqual(newRole)
    expect(updatedPersona.description).toEqual(persona.description)
  })
})
