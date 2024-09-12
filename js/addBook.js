import {isBadRequest, isForbidden, isInternalServerError} from "./errors.js";
import {fetchWithAuth} from "./tokens.js";
import {baseURL, httpMethodPost} from "./settings.js";

async function addBook(event) {
    event.preventDefault();

    const book = parseBook();

    try {
        let response = await saveBookToStorage(book);
        if (isBadRequest(response)) return "Ошибка запроса"
        if (isForbidden(response)) return "У вас нет прав для добавления новой книги"
        if (isInternalServerError(response)) return response.text()

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function parseBook() {
    const form = document.getElementById('addBookForm');
    let book = {}
    const title = form.elements.title,
        author = form.elements.author,
        publisher = form.elements.publisher,
        copiesNumber = form.elements.copies_number,
        rarity = form.elements.rarity,
        genre = form.elements.genre,
        publishingYear = form.elements.publishing_year,
        language = form.elements.language,
        ageLimit = form.elements.age_limit;

    if (title) book.title = title.value;
    if (author) book.author = author.value;
    if (publisher) book.publisher = publisher.value;
    if (copiesNumber) book.copies_number = parseInt(copiesNumber.value);
    if (genre) book.genre = genre.value;
    if (publishingYear) book.publishing_year = parseInt(publishingYear.value);
    if (language) book.language = language.value;
    if (ageLimit) book.age_limit = parseInt(ageLimit.value);
    if (rarity) {
        if (rarity.value === 'Обычная') book.rarity = 'Common';
        if (rarity.value === 'Редкая') book.rarity = 'Rare';
        if (rarity.value === 'Уникальная') book.rarity = 'Unique';
    }

    return book
}

async function saveBookToStorage(book) {
    return await fetchWithAuth(baseURL + "/api/admin/books", {
        method: httpMethodPost,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
}

async function addBookWithMessage(event) {
    event.preventDefault();

    const message = await addBook(event)

    const messageElement = document.getElementById('message');
    if (message === null) {
        messageElement.className = 'alert alert-success'; // Успех
        messageElement.textContent = 'Новая книга была успешно добавлена!';
    } else {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
    }

    messageElement.classList.remove('d-none'); // Показываем сообщение
}

document.getElementById("addNewBook").addEventListener("click", addBookWithMessage)
