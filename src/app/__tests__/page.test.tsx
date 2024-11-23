import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../page'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
}))

jest.mock('../components/TokenTransfer', () => ({
  TokenTransfer: () => <div>TokenTransfer Component</div>,
}))

describe('App', () => {
  beforeEach(() => {
    (useConnect as jest.Mock).mockReturnValue({
      connectors: [
        { uid: '1', name: 'MetaMask' },
        { uid: '2', name: 'WalletConnect' },
      ],
      connect: jest.fn(),
      status: 'idle',
      error: null,
    })
    
    ;(useDisconnect as jest.Mock).mockReturnValue({
      disconnect: jest.fn(),
    })
  })

  it('renders wallet connection buttons when disconnected', () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      status: 'disconnected',
      isConnected: false,
    })

    render(<App />)
    expect(screen.getByText(/Welcome to Token Transfer dApp/i)).toBeInTheDocument()
    expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument()
    expect(screen.getByText(/Connect WalletConnect/i)).toBeInTheDocument()
  })

  it('renders TokenTransfer component when connected', () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      status: 'connected',
      isConnected: true,
    })

    render(<App />)
    expect(screen.getByText(/Token Transfer dApp/i)).toBeInTheDocument()
    expect(screen.getByText(/TokenTransfer Component/i)).toBeInTheDocument()
  })

  it('handles disconnect button click', () => {
    const mockDisconnect = jest.fn()
    ;(useAccount as jest.Mock).mockReturnValue({
      status: 'connected',
      isConnected: true,
    })
    ;(useDisconnect as jest.Mock).mockReturnValue({
      disconnect: mockDisconnect,
    })

    render(<App />)
    const disconnectButton = screen.getByText(/Disconnect/i)
    fireEvent.click(disconnectButton)
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('shows connecting message when status is pending', () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      status: 'disconnected',
      isConnected: false,
    })
    ;(useConnect as jest.Mock).mockReturnValue({
      connectors: [{ uid: '1', name: 'MetaMask' }],
      connect: jest.fn(),
      status: 'pending',
      error: null,
    })

    render(<App />)
    expect(screen.getByText(/Connecting.../i)).toBeInTheDocument()
  })

  it('shows error message when connection fails', () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      status: 'disconnected',
      isConnected: false,
    })
    ;(useConnect as jest.Mock).mockReturnValue({
      connectors: [{ uid: '1', name: 'MetaMask' }],
      connect: jest.fn(),
      status: 'idle',
      error: new Error('Connection failed'),
    })

    render(<App />)
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument()
  })
}) 