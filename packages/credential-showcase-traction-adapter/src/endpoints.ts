
const TRACTION_BASE = {
  API_BASE: process.env.TRACTION_API_ENDPOINT || 'http://localhost:8032',
  WALLET_ID: process.env.WALLET_ID || '3edcac06-4548-4416-95a1-9bbb4c9e5e16',
}

export const endpoints = {
  TRACTION: {
    ...TRACTION_BASE,
    TOKEN_ENDPOINT: `/multitenancy/wallet/${TRACTION_BASE.WALLET_ID}/token`,
    CREDENTIAL_DEFINITIONS: '/credential-definitions',
  },
}
