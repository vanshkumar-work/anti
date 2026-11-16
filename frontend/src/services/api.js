/**
 * API client service for ReviewGuard backend integration.
 * Communicates with FastAPI backend endpoints.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMsg = errData.detail;
      }
    } catch {
      // keep fallback errorMsg
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse(res);
}

export async function getDashboardData() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  return handleResponse(res);
}

export async function analyzeSingleReview(text) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
}

export async function analyzeBatchFile(file, textColumn) {
  const formData = new FormData();
  formData.append("file", file);
  if (textColumn) {
    formData.append("text_column", textColumn);
  }

  const res = await fetch(`${BASE_URL}/analyze/batch`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function getSampleBatchData() {
  const res = await fetch(`${BASE_URL}/sample-batch`);
  return handleResponse(res);
}

export async function getAnalyticsData() {
  const res = await fetch(`${BASE_URL}/analytics`);
  return handleResponse(res);
}

export async function getModelInfoData() {
  const res = await fetch(`${BASE_URL}/model-info`);
  return handleResponse(res);
}
