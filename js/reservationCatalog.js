import {isBadRequest, isInternalServerError, isNotFound} from "./errors.js";
import {fetchWithAuth} from "./tokens.js";
import {baseURL, httpMethodGet} from "./settings.js";

async function getReservations(event) {
    event.preventDefault();

    try {
        let response = await getReservationsFromStorage();

        if (isNotFound(response)) {
            document.getElementById('empty-reservations-list').innerHTML = '<h2>Вы еще ничего не забронировали</h2>';
            return null;
        }
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isInternalServerError(response)) return response.text()

        await displayReservations(await response.json());

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getReservationsFromStorage() {
    return await fetchWithAuth(baseURL + "/api/reservations", {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function choiceBook(reservation) {
    sessionStorage.setItem('selectedReservation', JSON.stringify(reservation));
    window.location.href = '../templates/reservation.html';
}

async function displayReservations(reservations) {
    const reservationCardsContainer = document.getElementById('reservation-cards');
    reservationCardsContainer.innerHTML = '';

    if (reservations.length === 0) {
        reservationCardsContainer.innerHTML = '<p>Книги не найдены.</p>';
        return;
    }

    const reservationStates = {
        "Issued": "Выдана",
        "Extended": "Продлена",
        "Expired": "Просрочена",
        "Closed": "Закрыта"
    };

    for (const reservation of reservations) {
        const bookInfo = await getTitleAndAuthor(reservation.book_id.toString())
        if (bookInfo === null) continue
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';

        const tmp = {bookInfo, reservation}
        card.innerHTML = `
            <div class="card h-100" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h5 class="card-header">${bookInfo}</h5>
                <div class="card-body">
                    <h5 class="card-title">${reservationStates[reservation.state]}</h5>
                    <a href="#" class="btn btn-primary" data-book='${JSON.stringify(tmp)}'>Подробнее</a>
                </div>
            </div> `;

        reservationCardsContainer.appendChild(card);
    }
    // Добавление обработчика событий для всех кнопок
    reservationCardsContainer.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const tmp = JSON.parse(button.getAttribute('data-book'));
            choiceBook(tmp);
        });
    });
}

async function getTitleAndAuthor(bookID) {
    try {
        let response = await getBookFromStorage(bookID)

        if (isBadRequest(response)) return null
        if (isNotFound(response)) return null
        if (isInternalServerError(response)) return null

        const book = await response.json()

        return book.title + ";" + book.author
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getBookFromStorage(bookID) {
    return await fetchWithAuth(`${baseURL}/books/${bookID}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function getReservationsWithMessage(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    const message = await getReservations(event)

    const messageElement = document.getElementById('message');

    if (message) {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}

document.addEventListener("DOMContentLoaded", getReservationsWithMessage)