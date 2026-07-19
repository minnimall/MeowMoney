import api from './api';

function normalize(fav) {
  return { ...fav, id: fav._id };
}

export async function getFavorites() {
  const res = await api.get('/favorites');
  return res.data.data.map(normalize);
}

// @body { label, type, category, amount, note }
export async function createFavorite(payload) {
  const res = await api.post('/favorites', payload);
  return normalize(res.data.data);
}

export async function deleteFavorite(id) {
  await api.delete(`/favorites/${id}`);
}