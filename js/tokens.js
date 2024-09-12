import {baseURL, httpMethodPost} from "./settings.js";

export async function fetchWithAuth(url, options) {
    let tokens;
    if (sessionStorage.getItem('tokens')) {
        tokens = JSON.parse(sessionStorage.getItem('tokens'));
    } else return logOut()


    if (!options.headers) options.headers = {};

    if (!tokens) return fetch(url, options)


    if (Date.now() < tokens.expired_at) {
        options.headers.Authorization = `Bearer ${tokens.access_token}`;
        return fetch(url, options)
    }

    try {
        tokens = await refreshTokens(tokens.refresh_token);
        if (tokens) {
            sessionStorage.setItem('tokens', JSON.stringify(tokens));
        } else return logOut();

    } catch {
        return logOut();
    }

    options.headers.Authorization = `Bearer ${tokens.access_token}`;

    return fetch(url, options);
}

function refreshTokens(token) {
    return fetch(baseURL + '/auth/refresh', {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            token,
        ),
    })
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            }

            return null;
        });
}

function logOut() {
    sessionStorage.setItem('isAuthenticated', "false");
    sessionStorage.clear()
    window.location.replace('../templates/index.html')
}