import { CredentialDefinition, instanceOfAnonCredRevocation } from 'credential-showcase-openapi'
import {
  CreateWalletTokenRequest,
  CreateWalletTokenRequestToJSON,
  CredentialDefinitionSendRequest,
  CredentialDefinitionSendRequestToJSON,
} from 'credential-showcase-traction-openapi'
import { endpoints } from './endpoints'
import { environment } from './environment'

const credentialsEndpoint = `${endpoints.TRACTION.API_BASE}${endpoints.TRACTION.CREDENTIAL_DEFINITIONS}`
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

export async function sendCredentialDefinition(credentialDef: CredentialDefinition, apiToken: string) {
  const sendRequest: CredentialDefinitionSendRequest = {
    schemaId: credentialDef.id,
    tag: credentialDef.name,
    supportRevocation: false,
  }

  if (credentialDef.revocation) {
    sendRequest.supportRevocation = true

    if (instanceOfAnonCredRevocation(credentialDef.revocation)) {
      sendRequest.revocationRegistrySize = 1000 // FIXME do we need this?
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
  }

  const response = await fetch(credentialsEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(CredentialDefinitionSendRequestToJSON(sendRequest)),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
