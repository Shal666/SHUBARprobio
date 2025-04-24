// Очистка старой корзины (если обновился ассортимент)
localStorage.removeItem('cart');

// Конфигурация Telegram бота
const BOT_TOKEN = '7439239371:AAG3S-Fszz36bbIp4ucijXyTc2LdTYeO_Dg';
const CHAT_ID = '658759796';

// Устанавливаем +7 в поле номера телефона по умолчанию
document.getElementById('clientPhone').value = '+7';

// Добавляем обработчик событий для телефонного поля
document.getElementById('clientPhone').addEventListener('input', function(e) {
    let digits = this.value.replace(/\D/g, '');
    if (digits.startsWith('7')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    this.value = '+7' + digits;
});

// Настройка placeholder и цвет текста
function setupField(fieldId, placeholderText) {
    const field = document.getElementById(fieldId);
    field.placeholder = placeholderText;
    field.style.color = '#999';

    field.addEventListener('focus', function() {
        if (this.value === placeholderText) {
            this.value = '';
            this.style.color = '#000';
        }
    });

    field.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = placeholderText;
            this.style.color = '#999';
        }
    });
}

// Инициализация подсказок
setupField('clientName', 'Иван Иванович');
setupField('clientAddress', 'Город, Улица, № дома, Квартира');

// Открытие модального окна
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }
    document.getElementById('orderModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Отправка заказа в Telegram
async function sendOrderToTelegram(orderData) {
    const itemsText = cart.map(item =>
        `▫ ${item.name} - ${item.quantity || 1} × ${item.price} ₸`
    ).join('\n');

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    const text = `📦 *Новый заказ!*

👤 *Клиент:* ${orderData.name}
📞 *Телефон:* ${orderData.phone}
🏠 *Адрес:* ${orderData.address || 'Не указан'}
💬 *Комментарий:* ${orderData.comment || 'Нет комментария'}

🛒 *Состав заказа:*
${itemsText}

💰 *Итого:* ${total} ₸`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;

    try {
        await fetch(url);
        showNotification('Заказ отправлен! Мы с вами свяжемся.');
        cart = [];
        saveCart();
        updateCartUI();
        closeOrderModal();
        closeCart();
    } catch (error) {
        showNotification('Ошибка отправки заказа. Попробуйте позже.');
        console.error('Ошибка:', error);
    }
}

// Обработка формы заказа с валидацией
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nameField = document.getElementById('clientName');
    const phoneField = document.getElementById('clientPhone');
    const addressField = document.getElementById('clientAddress');
    const comment = document.getElementById('clientComment').value.trim();

    const name = nameField.value.trim();
    const phone = phoneField.value.trim();
    const address = addressField.value.trim();

    // Функция сброса стилей
    [nameField, phoneField, addressField].forEach(f => f.style.border = '');

    if (name === '' || phone === '') {
        showNotification('Пожалуйста, заполните имя и номер телефона!');
        if (name === '') {
            nameField.style.border = '2px solid red';
            nameField.focus();
        } else {
            phoneField.style.border = '2px solid red';
            phoneField.focus();
        }
        return;
    }

    if (name.length < 3) {
        showNotification('Введите полное имя ');
        nameField.style.border = '2px solid red';
        nameField.focus();
        return;
    }

    if (address.length > 0 && address.length < 5) {
        showNotification('Введите корректный адрес ');
        addressField.style.border = '2px solid red';
        addressField.focus();
        return;
    }

    const phonePattern = /^\+7\d{10}$/;
    if (!phonePattern.test(phone)) {
        showNotification('Введите корректный номер телефона в формате +7XXXXXXXXXX');
        phoneField.style.border = '2px solid red';
        phoneField.focus();
        return;
    }

    const orderData = {
        name,
        phone,
        address,
        comment
    };

    sendOrderToTelegram(orderData);
});

// Закрытие модального окна по клику вне области
document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOrderModal();
    }
});

// Показ уведомлений
function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.backgroundColor = '#2a7f62';
    notif.style.color = 'white';
    notif.style.padding = '12px 20px';
    notif.style.borderRadius = '10px';
    notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notif.style.zIndex = 9999;
    notif.style.fontSize = '15px';
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 3000);
}