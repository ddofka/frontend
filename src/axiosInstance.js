import axios from 'axios';

const axiosInstance = axios.create();


axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request headers:", config.headers);
    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if(error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;