function setActiveNavLink(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === activeId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}