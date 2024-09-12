import {fetchWithAuth} from "./tokens.js";
import {isBadRequest, isInternalServerError, isNotFound} from "./errors.js";
import {baseURL, httpMethodGet} from "./settings.js";

async function getUser(event) {
    event.preventDefault();

    const phoneNumber = sessionStorage.getItem('phone_number');
    if (!phoneNumber) return;

    let phone = {'phone_number': phoneNumber}

    try {
        const response = await getUserFromStorage(phone);

        if (isNotFound(response)) return "Читателя не существует"
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"
        if (isBadRequest(response)) return "Ошибка запроса"

        displayUser(await response.json())

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getUserFromStorage(phoneNumber) {
    const params = new URLSearchParams(phoneNumber).toString();
    return await fetchWithAuth(`${baseURL}/api/readers?${params}`, {
        method: httpMethodGet,
    })
}

function displayUser(user) {
    document.getElementById('fio').textContent = user.fio;
    document.getElementById('phone_number').textContent = user.phone_number;
    document.getElementById('age').textContent = user.age;
}

async function getUserWithMessage(event) {
    event.preventDefault();

    const message = await getUser(event)

    const messageElement = document.getElementById('message');

    if (message) {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');

}

function logOutFromSystem() {
    sessionStorage.clear()
    window.location.href = '../templates/index.html';
}

// Обработчик события для кнопки "Выйти"
document.getElementById('logoutButton').addEventListener('click', logOutFromSystem);
document.addEventListener('DOMContentLoaded', getUserWithMessage);
