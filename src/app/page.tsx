'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { TokenTransfer } from './components/TokenTransfer'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (account.status === 'disconnected') {
    return (
      <div>
        <h2>Connect Wallet</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
      <TokenTransfer />
    </div>
  )
}

export default App
