import { CredentialAttribute, CredentialDefinition } from 'credential-showcase-openapi'
import { CredDefPostOptions, CredDefPostRequest, InnerCredDef } from 'credential-showcase-traction-openapi'

/**
 * Converts a CredentialDefinition to a CredDefPostRequest
 * @param credentialDef The credential definition to convert
 * @returns A CredDefPostRequest object
 */
export function credentialDefinitionToCredDefPostRequest(credentialDef: CredentialDefinition): CredDefPostRequest {
  const innerCredDef: InnerCredDef = {
    issuerId: getRequiredAttribute(credentialDef.attributes, 'issuerId'), // ie. "did:(method):WgWxqztrNooG92RXvxSTWv"
    schemaId: getRequiredAttribute(credentialDef.attributes, 'schemaId'), // ie. "did:(method):2:schema_name:1.0"
    tag: credentialDef.version,
  }

  return {
    credentialDefinition: innerCredDef,
    options: getRevocationOptions(credentialDef),
  }
}

/**
 * Maps credential type to a supported revocation configuration
 * @param credDef The credential definition
 * @returns Options with revocation settings
 */
export function getRevocationOptions(credDef: CredentialDefinition): CredDefPostOptions {
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

function getRequiredAttribute(attributes: Array<CredentialAttribute>, name: string): string {
  const attr = attributes.find((att) => att.type === 'STRING' && att.name === name)
  if (!attr || !attr.value) {
    throw new Error(`Missing required attribute: ${name} in `)
  }
  return attr.value
}
