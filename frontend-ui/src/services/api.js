const API_BASE = 'http://localhost:8080/api/land';

// Backend may return either JSON or plain text error payloads.
const parseResponse = async (res) => {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try { return JSON.parse(text); } catch { return text; }
};

/** POST /api/land */
export const registerLand = (data) =>
  fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

/** GET /api/land/{ulpin} */
export const getLandByUlpin = (ulpin) =>
  fetch(`${API_BASE}/${encodeURIComponent(ulpin)}`).then(parseResponse);

/** GET /api/land/owner/{ownerId} */
export const getLandByOwner = (ownerId) =>
  fetch(`${API_BASE}/owner/${encodeURIComponent(ownerId)}`).then(parseResponse);

/** PUT /api/land/{ulpin}/transfer */
export const transferOwnership = (ulpin, data) =>
  fetch(`${API_BASE}/${encodeURIComponent(ulpin)}/transfer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);

/** POST /api/land/{ulpin}/mutate */
export const mutateLand = (ulpin, data) =>
  fetch(`${API_BASE}/${encodeURIComponent(ulpin)}/mutate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseResponse);
