// PaymentFactory deployed on Celo Mainnet
export const PAYMENT_FACTORY_ADDRESS = "0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c" as `0x${string}`

// Network configurations
export const CELO_MAINNET = {
  chainId: 42220,
  name: 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: ['https://forno.celo.org'] } },
  blockExplorerUrls: { default: 'https://celoscan.io' }
} as const

export const CELO_ALFAJORES = {
  chainId: 44787,
  name: 'Celo Alfajores',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: ['https://alfajores-forno.celo-testnet.org'] } },
  blockExplorerUrls: { default: 'https://alfajores.celoscan.io' }
} as const

// ConditionalPayment condition types
export enum ConditionType {
  TIMESTAMP = 0,
  MANUAL = 1,
  RECURRING = 2,
  ORACLE = 3
}

// Supported networks for deployment
export const SUPPORTED_NETWORKS = {
  celo: CELO_MAINNET,
  celoAlfajores: CELO_ALFAJORES
} as const

// Default network for deployments
export const DEFAULT_NETWORK = 'celo' as const
