import {userKey} from "./auth.service";

export default function addAuthHeader() {
    const readerStr = sessionStorage.getItem(userKey);
    let reader = null;
    if (readerStr) {
        reader = JSON.parse(readerStr);
    }

    if (reader && reader.access_token) {
        return {Authorization: 'Bearer ' + reader.access_token};
    }

    return {Authorization: ''};
}