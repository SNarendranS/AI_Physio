import axios from 'axios'
const API_URL = import.meta.env.VITE_APP_API_URL;


const painDataById = (id) => {

    return axios.get(`${API_URL}/data/${id}`)
}


const painData = () => {
    const token = localStorage.getItem('token')
    return axios.get(`${API_URL}/data`, { headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })
}
const postPainData = (update) => {
    const token = localStorage.getItem('token')
    return axios.post(`${API_URL}/data`, update, { headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })
}
const postPainDataAndCreateExercise = (update) => {
    const token = localStorage.getItem('token')
    return axios.post(`${API_URL}/data/exercise`, update, { headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })
}

const postPainDataById = (id, update) => {
    return axios.post(`${API_URL}/data/${id}`, update)
}


const PainDataService = {
    painData, painDataById, postPainData, postPainDataById, postPainDataAndCreateExercise
}
export default PainDataService