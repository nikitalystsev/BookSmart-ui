import {isBadRequest, isConflict, isInternalServerError, isNotFound} from "./errors.js";
import {fetchWithAuth} from "./tokens.js";
import {baseURL, httpMethodGet, httpMethodPut} from "./settings.js";

function displaySelectedReservation() {
    const selectedReservation = JSON.parse(sessionStorage.getItem('selectedReservation'));
    if (!selectedReservation) {
        document.getElementById("empty-reservation").innerHTML = '<h2>Бронь не найдена</h2>';
        return;
    }

    const reservationStates = {
        "Issued": "Выдана",
        "Extended": "Продлена",
        "Expired": "Просрочена",
        "Closed": "Закрыта"
    };

    const {bookInfo, reservation} = selectedReservation;
    document.getElementById('book-title').textContent = bookInfo;
    document.getElementById('reservation-state').textContent = reservationStates[reservation.state];
    document.getElementById('reservation-issue-date').textContent = reservation.issue_date.slice(0, 10);
    document.getElementById('reservation-return-date').textContent = reservation.return_date.slice(0, 10);
}

async function getActualSelectedReservation() {
    const selectedReservation = JSON.parse(sessionStorage.getItem('selectedReservation'));
    let {bookInfo, reservation} = selectedReservation;
    if (!reservation) {
        document.getElementById("empty-reservation").innerHTML = '<h2>Бронь не найдена</h2>';
        return;
    }

    try {
        const response = await getActualSelectedReservationFromStorage(reservation.id)

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isNotFound(response)) return "Бронь не найдена"
        if (isInternalServerError(response)) return response.text()

        reservation = await response.json()

        sessionStorage.setItem("selectedReservation", JSON.stringify({bookInfo, reservation}))
        return null
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getActualSelectedReservationFromStorage(reservationID) {
    return await fetchWithAuth(`${baseURL}/api/reservations/${reservationID}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function updateSelectedReservation(event) {
    event.preventDefault()

    const selectedReservation = JSON.parse(sessionStorage.getItem('selectedReservation'));
    const {bookInfo, reservation} = selectedReservation;
    if (!reservation) {
        document.getElementById("empty-reservation").innerHTML = '<h2>Бронь не найдена</h2>';
        return;
    }

    try {
        let response = await updateSelectedReservationOnStorage(reservation.id);

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return response.text()
        if (isNotFound(response)) return response.text()
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"

        const res = await getActualSelectedReservation()
        if (res) return res

        // location.reload()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function updateSelectedReservationOnStorage(reservationID) {
    return await fetchWithAuth(`${baseURL}/api/reservations/${reservationID}`, {
        method: httpMethodPut,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationID)
    });
}


async function updateSelectedReservationWithMessage(event) {
    event.preventDefault();

    const message = await updateSelectedReservation(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success';
        messageElement.textContent = 'Бронирование было успешно продлено!';
    } else {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none');
}

document.addEventListener('DOMContentLoaded', displaySelectedReservation);
document.getElementById("update-reservation-btn").addEventListener("click", updateSelectedReservationWithMessage)