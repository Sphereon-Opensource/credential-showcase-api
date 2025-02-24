import { Connection, Receiver, ReceiverEvents, ReceiverOptions } from 'rhea-promise'
import { environment } from './environment'
import { CredentialDefinitionFromJSON } from 'credential-showcase-openapi'
import { getWalletToken, sendCredentialDefinition } from './traction-functions'

export class MessageProcessor {
  private readonly connection: Connection
  private receiver!: Receiver
  private tokenCache: { token: string; expiry: number } | null = null

  constructor(private topic: string) {
    this.connection = new Connection({
      hostname: environment.RABBITMQ_HOST,
      port: environment.RABBITMQ_PORT,
      transport: 'tcp',
      reconnect: true,
      username: environment.RABBITMQ_USER,
      password: environment.RABBITMQ_PASSWORD,
    })
  }

  async start() {
    await this.connection.open()

    const receiverOptions: ReceiverOptions = {
      source: {
        address: this.topic,
        durable: 2,
        filter: {
          'topic-filter': this.topic,
        },
      },
    }

    this.receiver = await this.connection.createReceiver(receiverOptions)

    this.receiver.on(ReceiverEvents.message, async (context) => {
      if (context.message) {
        const jsonData = JSON.parse(context.message.body as string)
        const credentialDef = CredentialDefinitionFromJSON(jsonData)
        try {
          console.debug('Received credential definition', credentialDef)
          await sendCredentialDefinition(credentialDef, await this.getApiToken())
          if (context.delivery) {
            context.delivery.accept()
          }
        } catch (e) {
          console.error(`An error occurred while sending credential definition ${credentialDef.id}/${credentialDef.name} of type ${credentialDef.type} to Traction`)
          if (context.delivery) {
            context.delivery.reject() // FIXME context.delivery.release() to redeliver ??
          }
        }
      }
    })

    this.receiver.on(ReceiverEvents.receiverError, (context) => {
      console.error(`[${this.topic}] Receiver error:`, context.receiver?.error)
    })
  }

  async stop() {
    if (this.receiver) {
      await this.receiver.close()
    }
    if (this.connection) {
      await this.connection.close()
    }
  }

  private async getApiToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && this.tokenCache.expiry > Date.now()) {
      return Promise.resolve(this.tokenCache.token)
    }

    // No, get a new one
    const token = await getWalletToken()
    const expiresAfterMs = Number(environment.WALLET_KEY_EXPIRES_AFTER_SECONDS) * 1000
    this.tokenCache = {
      token,
      expiry: Date.now() + expiresAfterMs,
    }
    return token
  }
}
