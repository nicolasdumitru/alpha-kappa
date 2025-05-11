document.querySelector('.toggleButton_gllP').addEventListener('click', function () {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }
});

// 
document.querySelector('.navbar-toggle').addEventListener('click', function () {
    const navbarCollapse = document.getElementById('responsive-navbar-nav');
    
    // Verifică dacă meniul este deja afișat
    if (navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show'); // ascunde
    } else {
        navbarCollapse.classList.add('show'); // afiseaza
    }
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.getElementById('theme-toggle').setAttribute('aria-pressed', isDark.toString());

    // Toggle dark mode for all relevant components
    document.querySelectorAll('.text-section, .card').forEach(el => {
        el.classList.toggle('dark-mode', isDark);
    });
});

document.getElementById("conductivityDropdownToggle").addEventListener("click", function () {
    const menu = document.getElementById("conductivityDropdownMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
});
