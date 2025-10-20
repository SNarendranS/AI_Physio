import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const getExercises = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/exercise`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};
const getExerciseById = (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/exercise/id/${id}`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};
const getExercisesByPainData = (id) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/exercise/painData/${id}`, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};

const createExercise = (painDataId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/exercise`, painDataId, {
        headers: { 'Authorization': 'Bearer ' + JSON.parse(token) }
    });
};

const exerciseService = {
    getExercises, getExerciseById, getExercisesByPainData, createExercise
}
export default exerciseService
