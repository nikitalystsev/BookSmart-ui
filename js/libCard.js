import {fetchWithAuth} from "./tokens.js";
import {isBadRequest, isConflict, isInternalServerError, isNotFound} from "./errors.js";
import {baseURL, httpMethodGet, httpMethodPost, httpMethodPut} from "./settings.js";

async function createLibCard(event) {
    event.preventDefault()

    try {
        let response = await createLibCardOnStorage();
        if (isConflict(response)) return "Читательский билет уже создан"
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"
        if (isBadRequest(response)) return "Ошибка запроса"

        location.reload();

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function createLibCardOnStorage() {
    return await fetchWithAuth(baseURL + "/api/lib-cards", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function createLibCardWithMessage(event) {
    event.preventDefault();

    const message = await createLibCard(event)

    const messageElement = document.getElementById('message2');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Читательский билет был успешно создан!';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}

async function loadLibCardIfExists() {
    const createLibCardContainer = document.getElementById('no-card-container')
    const libCardContainer = document.getElementById('lib-card-container')

    try {
        let response = await getLibCardFromStorage();

        if (isNotFound(response)) {
            createLibCardContainer.classList.remove('d-none');
            libCardContainer.classList.add('d-none');
            return null
        }
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"
        if (isBadRequest(response)) return "Ошибка запроса"

        displayLibCard(await response.json())

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function displayLibCard(libCard) {
    const {validity, action_status, issue_date, lib_card_num} = libCard;
    addUpdateButtonIfActionStatusFalse(action_status === true)
    document.getElementById("lib-card-number").textContent = lib_card_num
    document.getElementById("lib-card-validity").textContent = validity + " дней"
    document.getElementById("lib-card-issue-date").textContent = issue_date.slice(0, 10)
    document.getElementById("lib-card-action-status").textContent = action_status === true ? "Действующий" : "Недействующий"
}

async function getLibCardFromStorage() {
    return await fetchWithAuth(baseURL + "/api/lib-cards", {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function getLibCardWithMessage() {
    const message = await loadLibCardIfExists()

    const messageElement = document.getElementById('message');
    if (message) {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}

async function updateLibCard() {
    try {
        let response = await updateLibCardFromStorage();

        if (isNotFound(response)) return "Читательский билет не найден"
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"
        if (isConflict(response)) return "Читательский билет и так действующий"
        if (isBadRequest(response)) return "Ошибка запроса"

        location.reload()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}


async function updateLibCardFromStorage() {
    return await fetchWithAuth(baseURL + "/api/lib-cards", {
        method: httpMethodPut,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function updateLibCardWithMessage(event) {
    event.preventDefault();

    const message = await updateLibCard(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Читательский билет был успешно обновлен!';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}

function addUpdateButtonIfActionStatusFalse(condition) {
    if (condition) return

    const btnContainer = document.getElementById('lib-card-btn');

    const updateLibCardBtn = document.createElement('a');
    updateLibCardBtn.href = '#';
    updateLibCardBtn.id = 'update-lib-card-btn'
    updateLibCardBtn.className = 'btn btn-primary mt-3';
    updateLibCardBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Обновить билет';

    btnContainer.appendChild(updateLibCardBtn);

    updateLibCardBtn.addEventListener("click", updateLibCardWithMessage)
}


document.addEventListener('DOMContentLoaded', getLibCardWithMessage);
document.getElementById('create-lib-card-btn').addEventListener('click', createLibCardWithMessage);