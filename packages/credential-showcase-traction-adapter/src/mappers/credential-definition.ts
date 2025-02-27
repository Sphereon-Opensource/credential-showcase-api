import { CredentialAttribute, CredentialDefinition } from 'credential-showcase-openapi'
import {
  CredDefPostOptions,
  CredDefPostRequest,
  InnerCredDef,
  AnonCredsSchema,
  SchemaPostRequest,
  GetCredDefResult,
  CredDefResult,
  CredDefState,
} from 'credential-showcase-traction-openapi'

/**
 * Converts a CredentialDefinition to a SchemaPostRequest
 * @param credentialDef The credential definition to convert
 * @returns A SchemaPostRequest object
 */
export function credentialDefinitionToSchemaPostRequest(credentialDef: CredentialDefinition): SchemaPostRequest {
  // Extract attribute names from the CredentialDefinition
  const attributeNames = credentialDef.attributes.map((attr) => attr.name)

  const schema: AnonCredsSchema = {
    attrNames: attributeNames,
    issuerId: 'did:(method):WgWxqztrNooG92RXvxSTWv', // TODO will be available in CredentialDefinition
    name: credentialDef.name,
    version: credentialDef.version,
  }

  return {
    schema,
  }
}

/**
 * Converts a CredentialDefinition to a CredDefPostRequest
 * @param credentialDef The credential definition to convert
 * @param schemaId The schema ID to use in the credential definition
 * @returns A CredDefPostRequest object
 */
export function credentialDefinitionToCredDefPostRequest(credentialDef: CredentialDefinition, schemaId: string): CredDefPostRequest {
  const innerCredDef: InnerCredDef = {
    issuerId: 'did:(method):WgWxqztrNooG92RXvxSTWv', // TODO will be available in CredentialDefinition
    schemaId: schemaId,
    tag: credentialDef.version,
  }

  return {
    credentialDefinition: innerCredDef,
    options: getOptions(credentialDef),
  }
}

/**
 * Maps credential type to a supported revocation configuration
 * @param credDef The credential definition
 * @returns Options with revocation settings
 */
export function getOptions(credDef: CredentialDefinition): CredDefPostOptions {
  if (!credDef.revocation) {
    return {
      supportRevocation: false,
    }
  }

  // Default registry size since we don't have access to the actual structure
  return {
    supportRevocation: true,
    revocationRegistrySize: 1000, // Default size
  }
}

/**
 * Attempts to extract a schema ID from the credential definition representations
 * @param credentialDef The credential definition to extract from
 * @returns The schema ID if found, otherwise null
 */
export function extractSchemaIdFromCredentialDef(credentialDef: CredentialDefinition): string | null {
  // Try to find an OCA representation which contains a schema ID
  for (const representation of credentialDef.representations) {
    if ('schemaId' in representation) {
      return representation.schemaId
    }
  }
  return null
}

/**
 * Converts a GetCredDefResult to a CredDefResult
 * @param result The GetCredDefResult to convert
 * @returns A CredDefResult object
 */
export function getCredDefResultToCredDefResult(result: GetCredDefResult): CredDefResult {
  if (!result) {
    return {}
  }

  // Create a CredDefState from the credential definition
  const credentialDefinitionState: CredDefState = {
    credentialDefinition: result.credentialDefinition,
    credentialDefinitionId: result.credentialDefinitionId,
    state: 'finished', // FIXME double-check: Assume the state is finished since it was successfully retrieved
  }

  return {
    credentialDefinitionMetadata: result.credentialDefinitionsMetadata || {},
    credentialDefinitionState: credentialDefinitionState,
    registrationMetadata: result.resolutionMetadata || {},
    // jobId is left undefined as it doesn't exist in GetCredDefResult
  }
}

function getRequiredAttribute(attributes: Array<CredentialAttribute>, name: string): string {
  const attr = attributes.find((att) => att.type === 'STRING' && att.name === name)
  if (!attr || !attr.value) {
    throw new Error(`Missing required attribute: ${name} in `)
  }
  return attr.value
}
