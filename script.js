document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    burger.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Блокировка скролла при открытом меню
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
});