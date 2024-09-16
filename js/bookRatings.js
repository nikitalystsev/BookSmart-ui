import {isBadRequest, isInternalServerError, isNotFound} from "./errors.js";
import {baseURL, httpMethodGet} from "./settings.js";

async function getRatings(event) {
    event.preventDefault();

    const selectedBook = JSON.parse(sessionStorage.getItem("selectedBook"));

    let params = {}
    params.book_id = selectedBook.id

    try {
        let response = await getRatingsFromStorage(params);

        if (isNotFound(response)) {
            document.getElementById('empty-ratings-list').innerHTML = '<h2>Эту книгу еще никто не оценил</h2>';
            return null;
        }

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isInternalServerError(response)) return response.text()

        await displayRatings(await response.json());

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getRatingsFromStorage(searchParams) {
    const params = new URLSearchParams(searchParams).toString()
    return await fetch(`${baseURL}/ratings?${params}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function displayRatings(ratings) {
    const ratingCardsContainer = document.getElementById('rating-cards');
    ratingCardsContainer.innerHTML = '';

    if (ratings.length === 0) {
        ratingCardsContainer.innerHTML = '<p>Книги не найдены.</p>';
        return;
    }

    for (const _rating of ratings) {
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';

        const {reader, review, rating} = _rating;

        console.log(_rating)
        console.log(reader)

        card.innerHTML = `
            <div class="card h-100" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h5 class="card-header">${reader}</h5>
                <div class="card-body">
                    <h5 class="card-title">Рейтинг: ${rating} / 5</h5>
                    <p class="card-text">${review}</p>
                </div>
            </div>; `

        ratingCardsContainer.appendChild(card);
    }
}

async function getRatingsWithMessage(event) {
    event.preventDefault();

    const message = await getRatings(event)

    const messageElement = document.getElementById('message');
    if (message) {
        console.log(message)
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}


document.addEventListener("DOMContentLoaded", getRatingsWithMessage)