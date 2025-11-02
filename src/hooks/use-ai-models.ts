/**
 * Custom hook to fetch available AI models from providers
 */

import { useState, useEffect } from 'react';

export interface AiModel {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
}

interface UseAiModelsResult {
  models: AiModel[];
  loading: boolean;
  error: string | null;
}

export function useAiModels(
  provider: string | null | undefined,
  type: 'text' | 'image' = 'text'
): UseAiModelsResult {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ai-providers/models?provider=${provider}&type=${type}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch models');
        }

        const data = await response.json();
        setModels(data.models || []);
      } catch (err) {
        console.error('Error fetching AI models:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [provider, type]);

  return { models, loading, error };
}