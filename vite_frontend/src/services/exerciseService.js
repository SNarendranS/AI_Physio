import axios from 'axios';
const API_URL = import.meta.env.VITE_APP_API_URL+'/exercise';

const getExercises = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};
const getExerciseById = (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/id/${id}`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};
const getExercisesByPainData = (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/painData/${id}`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};

const createExercise = (painDataId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}`, painDataId, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};

const exerciseService = {
    getExercises, getExerciseById, getExercisesByPainData, createExercise
}
export default exerciseService
