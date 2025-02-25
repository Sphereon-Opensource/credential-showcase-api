import { Topic } from './types'

export const environment = {
  AMQ_HOST: process.env.AMQ_HOST || 'localhost',
  AMQ_PORT: parseInt(process.env.AMQ_PORT || '5672', 10),
  AMQ_USER: process.env.AMQ_USER || 'guest',
  AMQ_PASSWORD: process.env.AMQ_PASSWORD || 'guest',

  DEFAULT_API_BASE_PATH: process.env.DEFAULT_API_BASE_PATH ?? 'http://localhost:8032',

  TENANT_SESSION_CACHE_SIZE: parsePositiveInt(process.env.TENANT_SESSION_CACHE_SIZE, 1024),
  TENANT_SESSION_TTL_MINS: parsePositiveInt(process.env.TENANT_SESSION_TTL_MINS, 1440),
  MESSAGE_PROCESSOR_TOPIC: (process.env.MESSAGE_PROCESSOR_TOPIC ?? 'showcase-cmd') as Topic,
}

function parsePositiveInt(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue
  }

  const parsed = parseInt(value, 10)

  if (isNaN(parsed) || parsed <= 0) {
    return defaultValue
  }

  return parsed
}
