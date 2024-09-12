function setHomeNavbar() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'; // Проверка статуса аутентификации

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

    // Устанавливаем активную ссылку
    setActiveNavLink('nav-home'); // Замените 'nav-catalog' на нужный ID, если требуется
}


document.addEventListener("DOMContentLoaded", setHomeNavbar);