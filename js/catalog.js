import {isBadRequest, isInternalServerError, isNotFound} from "./errors.js";
import {baseURL, httpMethodGet} from "./settings.js";

async function getBooks(event) {
    event.preventDefault();

    cleanCatalog()

    const searchParams = parseParams();

    try {
        let response = await getBooksFromStorage(searchParams);

        if (isNotFound(response)) {
            document.getElementById("book-cards").innerHTML = '';
            return "Нет книг, удовлетворяющих условиям поиска";
        }
        if (isInternalServerError(response)) return response.text()
        if (isBadRequest(response)) return "Ошибка запроса"

        const books = await response.json();

        sessionStorage.setItem("searchParams", JSON.stringify(searchParams))
        sessionStorage.setItem('currPageNum', "1");
        sessionStorage.setItem("maxPageNum", "1");
        sessionStorage.setItem("1", JSON.stringify(books));
        displayBooks(books);
        updatePagination()

        return null;
    } catch (error) {
        document.getElementById("book-cards").innerHTML = '';
        return `Error: ${error.message}`;
    }
}

function parseParams() {
    const form = document.getElementById('paramsForm');
    let searchParams = {}
    const title = form.elements.title,
        author = form.elements.author,
        publisher = form.elements.publisher,
        copiesNumber = form.elements.copies_number,
        rarity = form.elements.rarity,
        genre = form.elements.genre,
        publishingYear = form.elements.publishing_year,
        language = form.elements.language,
        ageLimit = form.elements.age_limit;

    if (title) searchParams.title = title.value;
    if (author) searchParams.author = author.value;
    if (publisher) searchParams.publisher = publisher.value;
    if (copiesNumber) searchParams.copies_number = parseInt(copiesNumber.value);
    if (genre) searchParams.genre = genre.value;
    if (publishingYear) searchParams.publishing_year = parseInt(publishingYear.value);
    if (language) searchParams.language = language.value;
    if (ageLimit) searchParams.age_limit = parseInt(ageLimit.value);
    if (rarity) {
        if (rarity.value === 'Обычная') searchParams.rarity = 'Common';
        if (rarity.value === 'Редкая') searchParams.rarity = 'Rare';
        if (rarity.value === 'Уникальная') searchParams.rarity = 'Unique';
    }

    searchParams.limit = 10;
    searchParams.offset = 0;

    return searchParams;
}

function cleanCatalog() {
    const maxPage = parseInt(sessionStorage.getItem("maxPageNum"))

    for (let i = 1; i <= maxPage; i++) sessionStorage.removeItem(i.toString())

    sessionStorage.removeItem("currPageNum")
    sessionStorage.removeItem("maxPageNum")
    sessionStorage.removeItem("selectedBook")
}

async function nextPageBooks(event) {
    event.preventDefault();

    if (!sessionStorage.getItem('currPageNum')) {
        return
    }
    const currPageNum = parseInt(sessionStorage.getItem('currPageNum'));
    const newPageNum = currPageNum + 1;
    const message = await getPageBooks(newPageNum);
    updatePagination();

    sessionStorage.setItem("maxPageNum", newPageNum.toString())

    return message
}

async function prevPageBooks(event) {
    event.preventDefault();

    if (!sessionStorage.getItem('currPageNum')) {
        return
    }
    const currPageNum = parseInt(sessionStorage.getItem('currPageNum'));
    if (currPageNum === 1) {
        return
    }
    const newPageNum = currPageNum - 1;
    const message = await getPageBooks(newPageNum);
    updatePagination();

    return message
}

async function getPageBooks(newPageNum) {
    if (sessionStorage.getItem(newPageNum.toString())) {
        const books = JSON.parse(sessionStorage.getItem(newPageNum.toString()));
        sessionStorage.setItem('currPageNum', newPageNum.toString());
        displayBooks(books);
        return;
    }

    let searchParams;
    if (!sessionStorage.getItem("searchParams")) {
        searchParams = {'limit': 10, 'offset': 0}
    } else {
        searchParams = JSON.parse(sessionStorage.getItem("searchParams"));
    }
    searchParams['offset'] = (newPageNum - 1) * 10;

    try {
        let response = await getBooksFromStorage(searchParams);

        if (isNotFound(response)) return "Все книги, удовлетворяющие условиям поиска, отображены"; // ?
        if (isInternalServerError(response)) return response.text()
        if (isBadRequest(response)) return "Ошибка запроса"

        const books = await response.json();

        displayBooks(books);
        sessionStorage.setItem('currPageNum', newPageNum.toString());
        sessionStorage.setItem(newPageNum.toString(), JSON.stringify(books));
        sessionStorage.setItem("searchParams", JSON.stringify(searchParams));

        return null;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getBooksFromStorage(searchParams) {
    const params = new URLSearchParams(searchParams).toString();
    return await fetch(`${baseURL}/books?${params}`, {
        method: httpMethodGet,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function choiceBook(book) {
    sessionStorage.setItem('selectedBook', JSON.stringify(book));
    window.location.href = '../templates/book.html';
}

function displayBooks(books) {
    const bookCardsContainer = document.getElementById('book-cards');
    bookCardsContainer.innerHTML = '';

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';

        card.innerHTML = `
            <div class="card h-100" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h5 class="card-header">${book.title}</h5>
                <div class="card-body">
                    <h5 class="card-title">${book.author}</h5>
                    <a href="#" class="btn btn-primary" data-book='${JSON.stringify(book)}'>Подробнее</a>
                </div>
            </div> `;

        bookCardsContainer.appendChild(card);
    });

    bookCardsContainer.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const book = JSON.parse(button.getAttribute('data-book'));
            choiceBook(book);
        });
    });
}

async function getBooksWithMessage(event) {
    event.preventDefault();

    const message = await getBooks(event)

    const messageElement = document.getElementById('message');

    if (message) {
        messageElement.className = 'alert alert-danger'; // Ошибка
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}

async function getNextPageWithMessage(event) {
    event.preventDefault();

    const message = await nextPageBooks(event)

    const messageElement = document.getElementById('message');

    if (message) {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}

async function getPrevPageWithMessage(event) {
    event.preventDefault();

    const message = await prevPageBooks(event)

    const messageElement = document.getElementById('message');

    if (message) {
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = message;
        messageElement.classList.remove('d-none');
    } else messageElement.classList.add('d-none');
}

function displayPageBooks() {
    const pageNumber = sessionStorage.getItem('currPageNum');
    if (!pageNumber) {
        return;
    }

    const books = JSON.parse(sessionStorage.getItem(pageNumber));

    displayBooks(books);
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    let currentPage;
    if (!sessionStorage.getItem('currPageNum')) {
        currentPage = 1;
    } else {
        currentPage = parseInt(sessionStorage.getItem('currPageNum'));
    }
    const pageItems = Array.from(pagination.getElementsByClassName('page-item'));
    pageItems.slice(1, -1).forEach(item => item.remove());

    let startPage, endPage;
    // обработка начального случая
    if (currentPage === 1) {
        document.getElementById('prevPageBtn').disabled = true;
        startPage = 1;
        endPage = 3;
    } else {
        document.getElementById('prevPageBtn').disabled = false;
        startPage = currentPage - 1;
        endPage = currentPage + 1;
    }

    // Добавляем номера страниц
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');

        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;

        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, pagination.children[pagination.children.length - 1]);
    }

}

function setActiveNavLink(activeLinkId) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(activeLinkId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function setCatalogNavbar() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    document.getElementById('navbar-container').innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <a class="navbar-brand" href="#"><b>BookSmart</b></a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Переключатель навигации">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" id="nav-home" href="index.html">Главная</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="nav-catalog" href="catalog.html">Каталог</a>
                        </li>
                    </ul>
                </div>
                <div id="auth-links">
                    ${isAuthenticated
        ? '<a href="../templates/profile.html" class="btn btn-outline-primary ms-2">Личный кабинет</a>'
        : '<a href="../templates/login.html" class="btn btn-outline-primary ms-2">Войти</a>'}
                </div>
        </nav> `
    ;

    setActiveNavLink('nav-catalog');
}

function addButtonAddBookIfAdmin() {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) return

    const buttonContainer = document.getElementById('admin-button-container');
    const button = document.createElement('a');
    button.href = 'addBook.html';
    button.className = 'btn btn-success';
    button.innerText = 'Добавить новую книгу';
    buttonContainer.appendChild(button);
}


window.onload = setCatalogNavbar;

document.addEventListener("DOMContentLoaded", addButtonAddBookIfAdmin)
document.addEventListener("DOMContentLoaded", updatePagination)
document.addEventListener("DOMContentLoaded", displayPageBooks)


document.getElementById('search-btn').addEventListener("click", getBooksWithMessage);
document.getElementById('nextPageBtn').addEventListener("click", getNextPageWithMessage);
document.getElementById('prevPageBtn').addEventListener("click", getPrevPageWithMessage);