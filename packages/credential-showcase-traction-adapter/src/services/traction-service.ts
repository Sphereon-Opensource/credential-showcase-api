import { CredentialDefinition } from 'credential-showcase-openapi'
import {
  AnoncredsCredentialDefinitionsApi,
  AnoncredsSchemasApi,
  ApiResponse,
  Configuration,
  ConfigurationParameters,
  CreateWalletTokenRequest,
  CreateWalletTokenResponse,
  CredDefResult,
  type CustomCreateWalletTokenRequest,
  MultitenancyApi,
  ResponseError,
  SchemaResult,
} from 'credential-showcase-traction-openapi'
import {
  credentialDefinitionToCredDefPostRequest,
  credentialDefinitionToSchemaPostRequest,
  extractSchemaIdFromCredentialDef,
  getCredDefResultToCredDefResult,
} from '../mappers/credential-definition'
import { environment } from '../environment'

export class TractionService {
  private readonly config: Configuration
  private readonly configOptions: ConfigurationParameters
  private anoncredsApi: AnoncredsCredentialDefinitionsApi
  private multitenancyApi: MultitenancyApi
  private schemasApi: AnoncredsSchemasApi

  constructor(
    private tenantId: string,
    private basePath: string = environment.DEFAULT_API_BASE_PATH,
    private walletId?: string,
    private accessToken?: string,
  ) {
    // Create a shared configuration for this tenant
    this.configOptions = {
      basePath,
      ...(accessToken && { apiKey: this.tokenCallback(accessToken) }), // Probably an error in the generated code, it's mapping apiKey not accessToken
    }
    this.config = new Configuration(this.configOptions)

    // Initialize APIs with shared config
    this.anoncredsApi = new AnoncredsCredentialDefinitionsApi(this.config)
    this.multitenancyApi = new MultitenancyApi(this.config)
    this.schemasApi = new AnoncredsSchemasApi(this.config)
  }

  public updateBearerToken(token: string): void {
    this.configOptions.apiKey = this.tokenCallback(token)
  }

  private tokenCallback(token: string) {
    return async (name: string) => {
      if (name === 'Authorization') {
        return `Bearer ${token}`
      }
      return ''
    }
  }

  /**
   * Checks if a schema with the given name and version exists
   * @param name The schema name
   * @param version The schema version
   * @returns The schema ID if found, otherwise null
   */
  public async findExistingSchema(name: string, version: string): Promise<string | null> {
    try {
      const response = await this.schemasApi.anoncredsSchemasGet({
        schemaName: name,
        schemaVersion: version,
      })

      if (response.schemaIds && response.schemaIds.length > 0) {
        return response.schemaIds[0]
      }
      return null
    } catch (error) {
      console.error('Error checking if schema exists:', error)
      return null
    }
  }

  /**
   * Creates a schema from a credential definition
   * @param credentialDef The credential definition to create a schema from
   * @returns The created schema ID
   */
  public async createSchema(credentialDef: CredentialDefinition): Promise<string> {
    const schemaRequest = credentialDefinitionToSchemaPostRequest(credentialDef)

    const apiResponse = await this.schemasApi.anoncredsSchemaPostRaw({
      body: schemaRequest,
    })

    const result = await this.handleApiResponse<SchemaResult>(apiResponse)
    if (!result?.schemaState?.schemaId) {
      return Promise.reject(Error('No schema ID was returned'))
    }

    return result.schemaState.schemaId
  }

  /**
   * Checks if a credential definition with the given schema ID and tag exists
   * @param schemaId The schema ID
   * @param tag The credential definition tag (version)
   * @returns The credential definition ID if found, otherwise null
   */
  public async findExistingCredentialDefinition(schemaId: string, tag: string): Promise<CredDefResult | undefined> {
    try {
      const response = await this.anoncredsApi.anoncredsCredentialDefinitionsGet({
        schemaId,
      })

      if (response.credentialDefinitionIds && response.credentialDefinitionIds.length > 0) {
        // For each credential definition ID, check if tag matches
        for (const credDefId of response.credentialDefinitionIds) {
          try {
            const credDefResponse = await this.anoncredsApi.anoncredsCredentialDefinitionCredDefIdGet({
              credDefId,
            })

            // Check if this credential definition has the requested tag
            if (credDefResponse.credentialDefinition?.tag === tag) {
              return getCredDefResultToCredDefResult(credDefResponse)
            }
          } catch (error) {
            console.error(`Error fetching credential definition ${credDefId}:`, error)
          }
        }
      }

      return undefined
    } catch (error) {
      console.error('Error checking if credential definition exists:', error)
      return undefined
    }
  }

  public async storeAnonCredentialDefinition(credentialDef: CredentialDefinition): Promise<CredDefResult> {
    // First, try to extract schema ID from the credential definition
    let schemaId = extractSchemaIdFromCredentialDef(credentialDef)

    // If no schema ID was found in the representations, check if a schema exists by name/version
    if (!schemaId) {
      schemaId = await this.findExistingSchema(credentialDef.name, credentialDef.version)

      // If schema doesn't exist, create it
      if (!schemaId) {
        schemaId = await this.createSchema(credentialDef)
      }
    }

    // Check if credential definition exists for this schema and tag
    const existingCredDef = await this.findExistingCredentialDefinition(schemaId, credentialDef.version)
    if (existingCredDef) {
      return existingCredDef
    }

    // Create new credential definition
    const apiResponse = await this.anoncredsApi.anoncredsCredentialDefinitionPostRaw({
      body: credentialDefinitionToCredDefPostRequest(credentialDef, schemaId),
    })
    return this.handleApiResponse(apiResponse)
  }

  public async getTenantToken(apiKey: string, walletKey?: string): Promise<string> {
    if (!this.tenantId) {
      return Promise.reject(Error('in order to get a tenant token, tenantId must be set'))
    }
    const request: CustomCreateWalletTokenRequest = {
      apiKey,
      walletKey, // Only required for unmanaged wallets
    }

    const apiResponse = await this.multitenancyApi.multitenancyTenantTenantIdTokenPostRaw({
      tenantId: this.tenantId,
      body: request,
    })

    const tokenResponse = await this.handleApiResponse<CreateWalletTokenResponse>(apiResponse)
    if (!tokenResponse?.token) {
      return Promise.reject(Error('no token was returned'))
    }
    return tokenResponse.token
  }

  public async getSubWalletToken(walletKey: string): Promise<string> {
    if (!this.walletId) {
      return Promise.reject(Error('in order to get a wallet token, walletId must be set'))
    }
    const request: CreateWalletTokenRequest = {
      walletKey,
    }

    const apiResponse = await this.multitenancyApi.multitenancyWalletWalletIdTokenPostRaw({
      walletId: this.walletId,
      body: request,
    })

    const tokenResponse = await this.handleApiResponse<CreateWalletTokenResponse>(apiResponse)
    if (!tokenResponse?.token) {
      return Promise.reject(Error('no token was returned'))
    }
    return tokenResponse.token
  }

  private async handleApiResponse<T>(response: ApiResponse<T>): Promise<T> {
    if (!response.raw.ok) {
      const errorText = await response.raw.text().catch(() => 'No error details available')
      throw new ResponseError(response.raw, `HTTP error! Status: ${response.raw.status}, Details: ${errorText}`)
    }
    return response.value()
  }
}

export function createTractionService(apiBase: string, tenantId: string, walletId?: string): TractionService {
  return new TractionService(tenantId, apiBase, walletId)
}
