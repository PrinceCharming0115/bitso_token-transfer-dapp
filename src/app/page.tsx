'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { TokenTransfer } from './components/TokenTransfer'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (account.status === 'disconnected' || !account.isConnected) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="text-center">Welcome to Token Transfer dApp</h1>
          <p className="text-center">Connect your wallet to get started</p>
          
          <div className="wallet-buttons">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                className="wallet-button"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
          
          {status === 'pending' && (
            <p className="success-message">Connecting...</p>
          )}
          {error && (
            <p className="error-message">{error.message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Token Transfer dApp</h1>
        <button 
          className="disconnect-button"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
      <TokenTransfer />
    </div>
  )
}

export default App
