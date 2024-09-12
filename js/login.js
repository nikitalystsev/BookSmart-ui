import {isBadRequest, isConflict, isInternalServerError, isNotFound, isUnauthorized} from "./errors.js";
import {baseURL, httpMethodPost} from "./settings.js";

async function loginUser(event) {
    event.preventDefault();

    const user = parseLogin();

    sessionStorage.setItem('phone_number', user.phone_number);

    try {
        let response = await loginUserOnStorage(user);
        if (isNotFound(response)) return "Такого читателя не существует"
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return response.text()
        if (isInternalServerError(response)) return response.text()

        const tokens = await response.json();
        sessionStorage.setItem('tokens', JSON.stringify(tokens));
        sessionStorage.setItem('isAuthenticated', "true");

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function parseLogin() {
    const form = document.getElementById('loginForm');
    let userData = {}
    const phoneNumber = form.elements.phone_number,
        password = form.elements.password;

    if (phoneNumber) userData.phone_number = phoneNumber.value;
    if (password) userData.password = password.value;

    return userData;
}

async function loginUserOnStorage(userData) {
    return await fetch(baseURL + "/auth/sign-in", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}


async function loginAdmin(event) {
    event.preventDefault();

    const admin = parseLogin();

    sessionStorage.setItem('phone_number', admin.phone_number);

    try {
        let response = await loginAdminOnStorage(admin);
        if (isNotFound(response)) return "Такого читателя не существует"
        if (isConflict(response)) return response.text()
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isInternalServerError(response)) return response.text()
        if (isUnauthorized(response)) return "У вас нет прав администратора"

        const tokens = await response.json();
        sessionStorage.setItem('tokens', JSON.stringify(tokens));
        sessionStorage.setItem('isAuthenticated', "true");
        sessionStorage.setItem("isAdmin", "true")

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function loginAdminOnStorage(adminData) {
    return await fetch(baseURL + "/auth/admin/sign-in", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
    });
}

async function loginUserWithMessage(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    // Получаем состояние чекбокса
    const isAdmin = document.getElementById('adminCheckbox').checked;

    let message;
    if (isAdmin) message = await loginAdmin(event)
    else message = await loginUser(event);

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Вход прошел успешно!';
        window.location.href = '../templates/index.html';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}


document.getElementById('loginForm').addEventListener('submit', loginUserWithMessage);