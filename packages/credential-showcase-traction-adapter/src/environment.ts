export const environment = {
  RABBITMQ_HOST: process.env.RABBITMQ_HOST || 'localhost',
  RABBITMQ_PORT: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
  RABBITMQ_USER: process.env.RABBITMQ_USER || 'guest',
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || 'guest',

  WALLET_KEY: process.env.WALLET_KEY,
  WALLET_KEY_EXPIRES_AFTER_SECONDS: process.env.WALLET_KEY_EXPIRES_AFTER_SECONDS || 1800,
}
