// Test setup file for vitest
import { beforeAll, afterAll } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  process.env.VITE_SUPABASE_URL = 'http://localhost:54321'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-key'
})

afterAll(() => {
  // Cleanup if needed
})