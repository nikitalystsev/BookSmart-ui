import {isBadRequest, isConflict, isForbidden, isInternalServerError, isNotFound} from "./errors.js";
import {fetchWithAuth} from "./tokens.js";
import {baseURL, httpMethodPost} from "./settings.js";

async function addRating(event) {
    event.preventDefault();

    const review = parseReview();

    try {
        let response = await saveReviewToStorage(review);
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return "Вы уже оценивали эту книгу"
        if (isNotFound(response)) return "Вы никогда не бронировали эту книгу"
        if (isForbidden(response)) return "У вас нет прав для добавления нового отзыва"
        if (isInternalServerError(response)) return response.text()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function parseReview() {
    const selectedBook = JSON.parse(sessionStorage.getItem("selectedBook"));

    const form = document.getElementById('reviewForm');
    let review = {}
    const title = form.elements.title,
        rating = form.elements.rating;

    review.book_id = selectedBook.id;

    if (title) review.review = title.value;
    if (rating) review.rating = parseInt(rating.value);


    return review
}

async function saveReviewToStorage(review) {
    return await fetchWithAuth(baseURL + "/api/ratings", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(review)
    });
}

async function addReviewWithMessage(event) {
    event.preventDefault();

    const message = await addRating(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Новый отзыв был успешно добавлен!';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}

document.getElementById("addNewRating").addEventListener("click", addReviewWithMessage)