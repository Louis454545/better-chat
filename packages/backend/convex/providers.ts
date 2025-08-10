"use node";

import { createGoogleGenerativeAI } from '@ai-sdk/google';

export interface ProviderConfig {
  apiKey: string;
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

const SUPPORTED_MODELS: ModelInfo[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
];

export function listModels(): ModelInfo[] {
  return SUPPORTED_MODELS;
}

export function isValidModel(modelId: string): boolean {
  return SUPPORTED_MODELS.some(model => model.id === modelId);
}

export function getModelInfo(modelId: string): ModelInfo | null {
  return SUPPORTED_MODELS.find(model => model.id === modelId) || null;
}

export function createProvider(config: ProviderConfig) {
  const modelInfo = getModelInfo(config.model);
  
  if (!modelInfo) {
    throw new Error(`Unsupported model: ${config.model}. Supported models: ${SUPPORTED_MODELS.map(m => m.id).join(', ')}`);
  }

  switch (modelInfo.provider) {
    case 'google':
      const google = createGoogleGenerativeAI({
        apiKey: config.apiKey,
      });
      return google(config.model);
    
    default:
      throw new Error(`Unsupported provider: ${modelInfo.provider}`);
  }
}

export interface ProviderError {
  type: 'api_key_invalid' | 'model_invalid' | 'quota_exceeded' | 'billing_issue' | 'network_error' | 'unknown';
  message: string;
  originalError?: any;
}

export function parseProviderError(error: any): ProviderError {
  console.error('Provider error details:', {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    cause: error.cause,
    stack: error.stack
  });

  if (error.status === 401 || error.code === 'UNAUTHENTICATED') {
    return {
      type: 'api_key_invalid',
      message: 'Invalid API key provided',
      originalError: error
    };
  }

  if (error.status === 400 && error.message?.toLowerCase().includes('model')) {
    return {
      type: 'model_invalid', 
      message: 'Invalid model specified',
      originalError: error
    };
  }

  if (error.status === 429 || error.code === 'RESOURCE_EXHAUSTED') {
    return {
      type: 'quota_exceeded',
      message: 'API quota exceeded. Please check your usage limits.',
      originalError: error
    };
  }

  if (error.status === 402 || error.message?.toLowerCase().includes('billing')) {
    return {
      type: 'billing_issue',
      message: 'Billing issue detected. Please check your account status.',
      originalError: error
    };
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return {
      type: 'network_error',
      message: 'Network connectivity issue. Please try again.',
      originalError: error
    };
  }

  return {
    type: 'unknown',
    message: `AI generation failed: ${error.message || 'Unknown error'}`,
    originalError: error
  };
}