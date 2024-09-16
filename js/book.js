import {fetchWithAuth} from "./tokens.js";
import {isBadRequest, isConflict, isForbidden, isInternalServerError, isNotFound} from "./errors.js";
import {baseURL, httpMethodDelete, httpMethodGet, httpMethodPost} from "./settings.js";

async function displaySelectedBook(event) {
    event.preventDefault();

    console.log("call displaySelectedBook")

    const selectedBook = JSON.parse(sessionStorage.getItem("selectedBook"));

    if (!selectedBook) {
        document.getElementById('empty-book').innerHTML = '<h2>Книга не найдена.</h2>';
        return;
    }

    const avg_rating = await getAvgRatingBook()

    let info_rating;

    if (avg_rating == null) info_rating = "Книга не оценена"
    else info_rating = avg_rating.avg_rating

    const {copies_number, publisher, age_limit, rarity, title, author, genre, language, publishing_year} = selectedBook;

    document.getElementById('book-title').textContent = title;
    document.getElementById('book-author').textContent = author;
    document.getElementById('book-publisher').textContent = publisher || 'Нет данных';
    document.getElementById('book-copies-number').textContent = copies_number || 'Нет данных';
    document.getElementById('book-rarity').textContent = rarity || 'Нет данных';
    document.getElementById('book-genre').textContent = genre || 'Нет данных';
    document.getElementById('book-publishing-year').textContent = publishing_year || 'Нет данных';
    document.getElementById('book-language').textContent = language || 'Нет данных';
    document.getElementById('book-age-limit').textContent = age_limit || 'Нет данных';
    document.getElementById('book-avg-rating').textContent = info_rating;
}

async function getActualSelectedBook() {
    let selectedBook = JSON.parse(sessionStorage.getItem("selectedBook"));
    if (!selectedBook) {
        document.getElementById("empty-book").innerHTML = '<h2>Книга не найдена</h2>';
        return;
    }
    try {
        const response = await getActualSelectedBookFromStorage(selectedBook.id)

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isNotFound(response)) return "Книга не найдена"
        if (isInternalServerError(response)) return response.text()

        selectedBook = await response.json()

        sessionStorage.setItem("selectedBook", JSON.stringify(selectedBook))

        updateBookFromCurrPage(selectedBook.id, selectedBook)

        return null
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getActualSelectedBookFromStorage(bookID) {
    return await fetchWithAuth(`${baseURL}/books/${bookID}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function getAvgRatingBook() {
    let selectedBook = JSON.parse(sessionStorage.getItem("selectedBook"));
    if (!selectedBook) {
        document.getElementById("empty-book").innerHTML = '<h2>Книга не найдена</h2>';
        return;
    }

    let params = {}
    params.book_id = selectedBook.id

    try {
        const response = await getAvgRatingBookFromStorage(params)

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isNotFound(response)) return null
        if (isInternalServerError(response)) return response.text()

        return await response.json()
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getAvgRatingBookFromStorage(searchParams) {
    const params = new URLSearchParams(searchParams).toString()
    return await fetch(`${baseURL}/ratings/avg?${params}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

function updateBookFromCurrPage(bookId, book) {
    const pageNumber = sessionStorage.getItem("currPageNum");
    if (!pageNumber) {
        return;
    }
    const books = JSON.parse(sessionStorage.getItem(pageNumber));

    if (!Array.isArray(books)) {
        return;
    }

    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        books[bookIndex] = book;
        sessionStorage.setItem(pageNumber, JSON.stringify(books));
    }
}


async function reserveSelectedBook(event) {
    event.preventDefault()

    const selectedBook = JSON.parse(sessionStorage.getItem('selectedBook'));

    if (!selectedBook) {
        document.getElementById('empty-book').innerHTML = '<h2>Книга не найдена.</h2>';
        return;
    }

    try {
        let response = await reserveBookOnStorage(selectedBook.id);

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return response.text()
        if (isNotFound(response)) return response.text()
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"

        await getActualSelectedBook()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function reserveBookOnStorage(bookID) {
    return await fetchWithAuth(baseURL + "/api/reservations", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookID)
    });
}

async function reserveSelectedBookWithMessage(event) {
    event.preventDefault();

    const message = await reserveSelectedBook(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success';
        messageElement.textContent = 'Книга была успешно забронирована!';
    } else {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none');
}


async function addToFavoritesSelectedBook(event) {
    event.preventDefault()

    const selectedBook = JSON.parse(sessionStorage.getItem('selectedBook'));

    if (!selectedBook) {
        document.getElementById('empty-book').innerHTML = '<h2>Книга не найдена.</h2>';
        return;
    }

    try {
        let response = await addBookToFavoritesOnStorage(selectedBook.id);

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isConflict(response)) return response.text()
        if (isNotFound(response)) return response.text()
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function addBookToFavoritesOnStorage(bookID) {
    return await fetchWithAuth(baseURL + "/api/favorites", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookID)
    });
}

async function addToFavoritesSelectedBookWithMessage(event) {
    event.preventDefault();

    const message = await addToFavoritesSelectedBook(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success';
        messageElement.textContent = 'Книга была успешно Добавлена в избранное!';
    } else {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none');
}

function addButtonsIfAuthenticated() {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");

    const btnContainer = document.getElementById('book-btn');

    if (!isAuthenticated) return

    const reserveBookBtn = document.createElement('a');
    reserveBookBtn.href = '#';
    reserveBookBtn.id = 'reserveBookBtn'
    reserveBookBtn.className = 'btn btn-primary mt-3';
    reserveBookBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Забронировать';

    const addBookToFavoriteBtn = document.createElement('a');
    addBookToFavoriteBtn.href = '#';
    addBookToFavoriteBtn.className = 'btn btn-secondary mt-3';
    addBookToFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Добавить в избранное';

    const addRatingBookBtn = document.createElement('a');
    addRatingBookBtn.href = '../templates/addRating.html';
    addRatingBookBtn.id = 'ratingBookBtn'
    addRatingBookBtn.className = 'btn btn-primary mt-3';
    addRatingBookBtn.innerHTML = '<i class="fas fa-star"></i> Добавить отзыв';

    btnContainer.appendChild(reserveBookBtn);
    btnContainer.appendChild(addBookToFavoriteBtn);
    btnContainer.appendChild(addRatingBookBtn);

    reserveBookBtn.addEventListener("click", reserveSelectedBookWithMessage)
    addBookToFavoriteBtn.addEventListener("click", addToFavoritesSelectedBookWithMessage)
    addRatingBookBtn.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = addRatingBookBtn.href;
    });
}

function addButtonDeleteBookIfAdmin() {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) return

    const btnContainer = document.getElementById('book-btn');

    const deleteBookBtn = document.createElement('a');
    deleteBookBtn.href = '#';
    deleteBookBtn.className = 'btn btn-secondary mt-3';
    deleteBookBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить книгу';

    btnContainer.appendChild(deleteBookBtn);

    deleteBookBtn.addEventListener("click", deleteBookWithMessage)
}

async function getReservationsBySelectedBook() {

    const selectedBook = JSON.parse(sessionStorage.getItem('selectedBook'));

    if (!selectedBook) {
        document.getElementById('empty-book').innerHTML = '<h2>Книга не найдена.</h2>';
        return;
    }

    let id = {'book_id': selectedBook.id}
    try {
        let response = await getReservationsBySelectedBookOnStorage(id);

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"
        if (isNotFound(response)) return null

        const reservations = await response.json()

        if (reservations.length > 0) return "Эту книгу нельзя удалить, она забронирована"


        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getReservationsBySelectedBookOnStorage(bookID) {
    const params = new URLSearchParams(bookID).toString();
    return await fetchWithAuth(`${baseURL}/api/admin/reservations?${params}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function deleteSelectedBook(event) {
    event.preventDefault()

    const selectedBook = JSON.parse(sessionStorage.getItem('selectedBook'));

    if (!selectedBook) {
        document.getElementById('empty-book').innerHTML = '<h2>Книга не найдена.</h2>';
        return;
    }

    const res = await getReservationsBySelectedBook()
    if (res) return res

    try {
        let response = await deleteBookOnStorage(selectedBook.id);

        if (isBadRequest(response)) return "Ошибка запроса"
        if (isForbidden(response)) return "У вас нет прав для удаления этой книги"
        if (isNotFound(response)) return response.text()
        if (isInternalServerError(response)) return "Внутренняя ошибка сервера"

        deleteBookFromCurrPage(selectedBook.id)

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function deleteBookFromCurrPage(bookId) {
    const pageNumber = sessionStorage.getItem('currPageNum');
    if (!pageNumber) {
        return;
    }
    const books = JSON.parse(sessionStorage.getItem(pageNumber));

    if (!Array.isArray(books)) {
        return;
    }

    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        sessionStorage.setItem(pageNumber, JSON.stringify(books));
    }
}

async function deleteBookOnStorage(bookID) {
    return await fetchWithAuth(`${baseURL}/api/admin/books/${bookID}`, {
        method: httpMethodDelete,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function deleteBookWithMessage(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение отправки формы

    const message = await deleteSelectedBook(event)
    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Книга была успешно удалена!';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}

function addButtonReview() {
    const btnContainer = document.getElementById('book-btn');

    const reviewBookBtn = document.createElement('a');
    reviewBookBtn.href = '../templates/bookRatings.html';
    reviewBookBtn.id = 'reviewBookBtn';
    reviewBookBtn.className = 'btn btn-primary mt-3';
    reviewBookBtn.innerHTML = '<i class="fas fa-comments"></i> Посмотреть отзывы';

    btnContainer.appendChild(reviewBookBtn);

    reviewBookBtn.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = reviewBookBtn.href; // переход на другую страницу
    });
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', addButtonsIfAuthenticated);
document.addEventListener('DOMContentLoaded', addButtonDeleteBookIfAdmin);
document.addEventListener('DOMContentLoaded', addButtonReview);
document.addEventListener('DOMContentLoaded', displaySelectedBook);
