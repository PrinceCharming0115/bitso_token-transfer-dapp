import '@testing-library/jest-dom' 

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) 