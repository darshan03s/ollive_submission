import { LanguageModel } from 'ai'

export type Model = {
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'meta'
  model: LanguageModel
  modelId: string
}

export const models: Model[] = [
  {
    provider: 'openai',
    model: 'openai/gpt-4o',
    modelId: 'gpt-4o'
  },
  {
    provider: 'anthropic',
    model: 'anthropic/claude-3-haiku',
    modelId: 'claude-3-haiku'
  },
  {
    provider: 'google',
    model: 'google/gemini-2.5-flash-lite',
    modelId: 'gemini-2.5-flash-lite'
  },
  {
    provider: 'xai',
    model: 'xai/grok-4.1-fast-non-reasoning',
    modelId: 'grok-4.1-fast-non-reasoning'
  },
  {
    provider: 'meta',
    model: 'meta/llama-3.1-70b',
    modelId: 'llama-3.1-70b'
  }
]

export const modelProviders = models.map((m) => m.provider)
