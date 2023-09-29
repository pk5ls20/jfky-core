import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://jf.whitefea5.top/api'
});

instance.defaults.withCredentials = true;
instance.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    if (token) {
        config.headers.Authorization = 'Bearer ' + token.split('=')[1];
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default instance;
