import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { NETWORK } from '@/config/chainConfig'

export function getConfig() {
  return createConfig({
    chains: [NETWORK],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [NETWORK.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
