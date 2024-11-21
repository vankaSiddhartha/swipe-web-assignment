const PI_KEY = import.meta.env.VITE_LLM_API_KEY

if (!PI_KEY) {
  throw new Error('PI_KEY is not defined in environment variables')
}

export const piConfig = {
  apiKey: PI_KEY
}
