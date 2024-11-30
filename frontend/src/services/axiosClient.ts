import axios from "axios";

export const axiosClient = axios.create({
    baseURL: 'http://localhost/api/v1',
});