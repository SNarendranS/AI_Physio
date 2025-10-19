import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const userById = (id) => {
    return axios.get(`${API_URL}/user/${id}`);
};

const user = () => {
    const token = JSON.parse(localStorage.getItem('token'));
    return axios.get(`${API_URL}/user`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
};

// Correct version: sends FormData for multer
const updateProfile = (formData) => {
    const token = JSON.parse(localStorage.getItem('token'));
    return axios.post(`${API_URL}/user/update`, formData, {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'multipart/form-data'
        }
    });
};

const UserService = {
    user,
    userById,
    updateProfile
};

export default UserService;
