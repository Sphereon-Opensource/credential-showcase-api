import { CredentialDefinition } from 'credential-showcase-openapi'
import { CredentialDefinitionSendRequestToJSON } from 'credential-showcase-traction-openapi'
import { endpoints } from './endpoints'
import { credentialDefinitionToCredDefPostRequest } from './mappers/credential-definition'

const credentialsEndpoint = `${endpoints.TRACTION.API_BASE}${endpoints.TRACTION.CREDENTIAL_DEFINITIONS}`

export async function storeAnonCredentialDefinition(credentialDef: CredentialDefinition) {
  const storeRequest = credentialDefinitionToCredDefPostRequest(credentialDef)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const response = await fetch(credentialsEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(CredentialDefinitionSendRequestToJSON(storeRequest)),
  })

  if (!response.ok) {
    throw new Error(`HTTP error in storeAnonCredentialDefinition! status: ${response.status}`)
  }

  return await response.json()
}

/* Probably not needed

 const tokenEndpoint = `${endpoints.TRACTION.API_BASE}${endpoints.TRACTION.TOKEN_ENDPOINT}`

export async function getWalletToken(): Promise<string> {
  const request: CreateWalletTokenRequest = {
    walletKey: environment.WALLET_KEY,
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(CreateWalletTokenRequestToJSON(request)),
  })

  if (!response.ok) {
    throw new Error(`Failed to get wallet API token: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.token
}
*/
