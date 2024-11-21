import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Expose environment variables to the client
  define: {
    'import.meta.env.VITE_LLM_API_KEY': JSON.stringify(process.env.VITE_LLM_API_KEY)
  }
})