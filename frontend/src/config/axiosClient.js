import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api/'
});

export default {
    auth: {
        login(body) {
            return axiosClient.post('/login', body);
        },
        signup(body) {
            return axiosClient.post('/submit-new-user', body);
        }
    },
    fetch: {
        getItems() {
            return axiosClient.get('/items');
        },
        getWishListItems(body) {
            return axiosClient.get('/wish-list', body);
        },
        getReadingHistory(body) {
            return axiosClient.get('/reading-history', body);
        },
        getHolds(body) {
            return axiosClient.get('/holds', body);
        },
        getUserInfo(body) {
            return axiosClient.get('/user-info', body);
        },
        getCheckedOut(body) {
            return axiosClient.get('/checked-out', body);
        }
    },
    update: {
        addToWishList(body) {
            return axiosClient.post('/wish-list', body);
        },
        addToHold(body) {
            return axiosClient.post('/holds', body);
        },
        renewItem(body) {
            return axiosClient.post('/checked-out', body);
        }
    }
}