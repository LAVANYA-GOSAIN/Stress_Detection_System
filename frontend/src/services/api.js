/**
 * API Service for MindScope Frontend
 * Communicates with the FastAPI backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Check backend health status
 * @returns {Promise<{status: string, model_loaded: boolean}>}
 */
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch trained model architecture and metadata
 * @returns {Promise<any>}
 */
export async function fetchModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`);
  if (!response.ok) {
    throw new Error(`Failed to fetch model info (status ${response.status})`);
  }
  return response.json();
}

/**
 * Send 20 validated feature inputs to generate stress class prediction
 * @param {Record<string, number>} featurePayload
 * @returns {Promise<{predicted_class: number, probabilities: Record<number, number>, disclaimer: string}>}
 */
export async function submitStressPrediction(featurePayload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(featurePayload),
  });

  if (!response.ok) {
    let errorDetail = 'Prediction failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch {
      errorDetail = `Server returned status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

