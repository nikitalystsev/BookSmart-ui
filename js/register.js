import {isBadRequest, isConflict, isInternalServerError} from "./errors.js";
import {baseURL, httpMethodPost} from "./settings.js";

async function registerUser(event) {
    event.preventDefault();

    const user = parseRegistration();

    try {
        let response = await saveUserToStorage(user);
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return "Вы уже зарегистрированы"
        if (isInternalServerError(response)) return response.text()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function parseRegistration() {
    const form = document.getElementById('registrationForm');
    let userData = {}
    const fio = form.elements.fio,
        age = form.elements.age,
        phoneNumber = form.elements.phone_number,
        password = form.elements.password;

    if (fio) userData.fio = fio.value;
    if (age) userData.age = parseInt(age.value, 10);
    if (phoneNumber) userData.phone_number = phoneNumber.value;
    if (password) userData.password = password.value;

    return userData;
}

async function saveUserToStorage(userData) {
    return await fetch(baseURL + "/auth/sign-up", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}


async function registerUserWithMessage(event) {
    event.preventDefault();

    const message = await registerUser(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success';
        messageElement.textContent = 'Регистрация прошла успешно!';
        window.location.href = '../templates/index.html';
    } else {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none');
}


document.getElementById('registrationForm').addEventListener('submit', registerUserWithMessage);