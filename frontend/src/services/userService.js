import axios from 'axios'
const API_URL = process.env.REACT_APP_API_URL


const userById = (id) => {

    return axios.get(`${API_URL}/user/${id}`)

}


const user = () => {
    const token = localStorage.getItem('token')
    return axios.get(`${API_URL}/user`, { headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })

}
const updateProfile = (userChange, update) => {
    const token = localStorage.getItem('token')
    return axios.post(`${API_URL}/user/update`, { "user": userChange, "update": update }, { headers: { 'Authorization': 'Bearer ' + JSON.parse(token) } })

}
const UserService = {
    user, userById, updateProfile
}
export default UserService