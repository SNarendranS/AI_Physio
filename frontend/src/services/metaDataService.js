import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const getPainTypes = () => {
    return axios.get(`${API_URL}/metadata/painTypes`);
};
const getInjuryPlaces = () => {
    return axios.get(`${API_URL}/metadata/injuryPlaces`);
};

const MetaDataService = {
getPainTypes,
getInjuryPlaces
};

export default MetaDataService;
