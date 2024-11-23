'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { createPublicClient, http } from 'viem'
import { NETWORK } from '@/config/chainConfig'
import { TOKEN_ABI } from '@/config/abis/tokenABI'

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`

export function TokenTransfer() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState<number>(18)
  const { address } = useAccount()

  const { data: balance } = useBalance({
    address,
    token: TOKEN_ADDRESS,
  })

  const { writeContract, isError, isSuccess } = useWriteContract()

  useEffect(() => {
    const getTokenInfo = async () => {
      const publicClient = createPublicClient({
        chain: NETWORK,
        transport: http()
      })
      
      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: TOKEN_ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: TOKEN_ABI,
          functionName: 'decimals',
        })
      ])
      
      setTokenSymbol(symbol as string)
      setTokenDecimals(Number(decimals))
    }
    getTokenInfo()
  }, [])

  const handleTransfer = async () => {
    try {
      const amountInSmallestUnit = parseUnits(amount, tokenDecimals)
      writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'transfer',
        args: [recipient, amountInSmallestUnit],
      })
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  return (
    <div className="card">
      <div className="balance-section">
        <h2>Your Balance</h2>
        <div className="balance-amount">
          <span className="amount">
            {balance ? formatUnits(balance.value, tokenDecimals) : '0'}
          </span>
          <span className="symbol">{tokenSymbol}</span>
        </div>
      </div>

      <div className="transfer-section">
        <h2>Transfer Tokens</h2>
        <div className="transfer-form">
          <div className="input-group">
            <label>Recipient Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>Amount</label>
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button 
            onClick={handleTransfer}
            disabled={!recipient || !amount}
            className="transfer-button"
          >
            Transfer {tokenSymbol}
          </button>
        </div>

        {isSuccess && (
          <div className="success-message">
            Transfer completed successfully!
          </div>
        )}
        
        {isError && (
          <div className="error-message">
            Transfer failed. Please try again.
          </div>
        )}
      </div>
    </div>
  )
} 