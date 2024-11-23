'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { createPublicClient, http } from 'viem'
import { NETWORK } from '@/config/chainConfig'
import ContractABI from '@/config/abis/MockERC20.json'

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`

export function TokenTransfer() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState<number>(18)
  const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null)
  const [isPending, setIsPending] = useState(false)
  const { address } = useAccount()

  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: TOKEN_ADDRESS,
  })

  const { writeContract, data: hash, isError, isSuccess } = useWriteContract()

  useEffect(() => {
    const getTokenInfo = async () => {
      const publicClient = createPublicClient({
        chain: NETWORK,
        transport: http()
      })
      
      const [symbol, decimals] = await Promise.all([
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ContractABI.abi,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ContractABI.abi,
          functionName: 'decimals',
        })
      ])
      
      setTokenSymbol(symbol as string)
      setTokenDecimals(Number(decimals))
    }
    getTokenInfo()
  }, [])

  useEffect(() => {
    const estimateGas = async () => {
      if (!recipient || !amount || !address) return

      try {
        const amountInSmallestUnit = parseUnits(amount, tokenDecimals)
        const publicClient = createPublicClient({
          chain: NETWORK,
          transport: http()
        })

        const gasEstimate = await publicClient.estimateContractGas({
          address: TOKEN_ADDRESS,
          abi: ContractABI.abi,
          functionName: 'transfer',
          args: [recipient, amountInSmallestUnit],
          account: address,
        })

        setEstimatedGas(gasEstimate)
      } catch (error) {
        console.error('Gas estimation failed:', error)
        setEstimatedGas(null)
      }
    }

    // Initial estimation
    estimateGas()

    // Set up interval for periodic updates
    const intervalId = setInterval(estimateGas, 10000) // 10 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId)
  }, [recipient, amount, address, tokenDecimals])

  useEffect(() => {
    const waitForTransaction = async () => {
      if (hash) {
        const publicClient = createPublicClient({
          chain: NETWORK,
          transport: http()
        })
        await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` })
        refetchBalance()
      }
    }
    waitForTransaction()
  }, [hash])

  const handleTransfer = async () => {
    try {
      setIsPending(true)
      const amountInSmallestUnit = parseUnits(amount, tokenDecimals)
      
       await writeContract({
        address: TOKEN_ADDRESS,
        abi: ContractABI.abi,
        functionName: 'transfer',
        args: [recipient, amountInSmallestUnit],
        gas: estimatedGas || undefined,
      })
      
      setIsPending(false)
    } catch (error) {
      console.error('Transfer failed:', error)
      setIsPending(false)
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

          {estimatedGas && (
            <div className="gas-estimate">
              <span>Estimated Gas for Token Transfer: {estimatedGas.toString()} wei</span>
            </div>
          )}

          <button 
            onClick={handleTransfer}
            disabled={!recipient || !amount}
            className="transfer-button"
          >
            Transfer {tokenSymbol}
          </button>
        </div>

        {isPending && (
          <div className="pending-message">
            Transaction pending...
          </div>
        )}

        {isSuccess && !isPending && (
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