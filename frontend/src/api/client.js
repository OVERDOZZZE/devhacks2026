import axios from 'axios'

const client = axios.create({
  baseURL: 'https://diann-unfallen-kadence.ngrok-free.dev/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  config.headers['ngrok-skip-browser-warning'] = 'true'
  return config
})

export default client