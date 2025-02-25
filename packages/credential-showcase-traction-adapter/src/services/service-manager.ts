import { TractionService } from './traction-service'
import { environment } from '../environment'
import { LRUCache } from 'lru-cache'

class ServiceManager {
  private readonly services = new LRUCache<string, TractionService>({
    max: environment.TENANT_SESSION_CACHE_SIZE,
    ttl: environment.TENANT_SESSION_TTL_MINS * 60,
  })

  public getTractionService(tenantId: string, apiUrlBase?: string, walletId?: string, accessTokenEnc?: string): TractionService {
    const key = this.buildKey(apiUrlBase, tenantId, walletId)

    // Return existing service if it exists
    if (this.services.has(key)) {
      const service = this.services.get(key)!

      // Update token if provided
      if (accessTokenEnc) {
        service.updateBearerToken(accessTokenEnc)
      }

      return service
    }

    const service = new TractionService(tenantId, apiUrlBase, walletId, accessTokenEnc)

    this.services.set(key, service)
    return service
  }

  private buildKey(apiUrlBase: string = environment.DEFAULT_API_BASE_PATH, tenantId: string, walletId?: string): string {
    return walletId ? `${apiUrlBase}:${tenantId}:${walletId}` : `${apiUrlBase}:${tenantId}`
  }
}

// Singleton instance
const serviceRegistry = new ServiceManager()

export function getTractionService(tenantId: string, apiUrlBase?: string, walletId?: string, accessTokenEnc?: string): TractionService {
  if (!tenantId) {
    throw new Error('tenantId is required')
  }

  return serviceRegistry.getTractionService(tenantId, apiUrlBase, walletId, accessTokenEnc)
}
