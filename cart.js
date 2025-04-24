// Данные о товарах
const products = [
    { id: 1, name: 'КардиПро', price: 1500 },
    { id: 2, name: 'Гриппостоп', price: 2000 },
    { id: 3, name: 'ДермоКрем', price: 3500 },
    { id: 4, name: 'ИммуноФорте', price: 1800 },
    { id: 5, name: 'АльгоТаб', price: 1300 },
    { id: 6, name: 'ЛюксВита', price: 1300 } 
];

// Корзина из localStorage или пустой массив
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Проверяем, есть ли уже товар в корзине
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Если товар уже есть, можно увеличить количество (добавим это позже)
        alert('Этот товар уже в корзине!');
    } else {
        // Добавляем новый товар
        cart.push({...product, quantity: 1});
        saveCart();
        updateCartCount();
        showNotification(`${product.name} добавлен в корзину!`);
    }
}

// Удаление товара из корзины
function removeFromCart(index) {
    if (confirm('Удалить этот товар из корзины?')) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление счетчика товаров
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Открыть корзину
function openCart() {
    updateCartUI();
    document.getElementById('cartModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрыть корзину
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Обновление интерфейса корзины
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        totalPriceElement.textContent = '0 ₸';
        updateCartCount();
        return;
    }
    
    // Генерация HTML для каждого товара в корзине
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-info">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-controls">
                    <span class="item-price">${item.price} ₸</span>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity || 1}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    // Подсчет общей суммы
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    totalPriceElement.textContent = `${totalPrice} ₸`;
    updateCartCount();
}

// Изменение количества товара
function changeQuantity(index, change) {
    const item = cart[index];
    const newQuantity = (item.quantity || 1) + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }
    
    // Здесь может быть отправка данных на сервер
    console.log('Оформление заказа:', cart);
    
    // Очистка корзины после оформления
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
    
    showNotification('Заказ оформлен! Спасибо за покупку!');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Закрытие корзины при клике вне ее области
    document.getElementById('cartModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('cartModal')) {
            closeCart();
        }
    });
    
    // Можно добавить рендеринг товаров, если они динамические
    // renderProducts();
});