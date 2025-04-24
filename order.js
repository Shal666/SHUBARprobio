// Очистка старой корзины (если обновился ассортимент)
localStorage.removeItem('cart');

// Конфигурация Telegram бота
const BOT_TOKEN = '7439239371:AAG3S-Fszz36bbIp4ucijXyTc2LdTYeO_Dg';
const CHAT_ID = '658759796';

// Устанавливаем +7 в поле номера телефона по умолчанию
document.getElementById('clientPhone').value = '+7';

// Добавляем обработчик событий для телефонного поля, чтобы не было возможности стереть +7
document.getElementById('clientPhone').addEventListener('input', function(e) {
    if (this.value.startsWith('+7') && this.selectionStart === 2) {
        return; // Если пользователь не пытается удалить +7, не делать ничего
    }
    if (this.value.length > 0 && !this.value.startsWith('+7')) {
        this.value = '+7' + this.value.replace(/^\+7/, ''); // Добавляем +7, если оно отсутствует
    }
});

// Настройка placeholder и цвет текста для полей с подсказками
function setupField(fieldId, placeholderText) {
    const field = document.getElementById(fieldId);
    field.placeholder = placeholderText;
    field.style.color = '#999'; // Цвет текста подсказки

    field.addEventListener('focus', function() {
        if (this.value === placeholderText) {
            this.value = ''; // Очищаем поле при фокусе, если это placeholder
            this.style.color = '#000'; // Цвет текста при вводе
        }
    });

    field.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = placeholderText; // Восстанавливаем placeholder, если поле пустое
            this.style.color = '#999'; // Цвет подсказки
        }
    });
}

// Инициализация всех полей с подсказками
setupField('clientName', 'Иван Иванович'); // Имя клиента
setupField('clientAddress', 'Город, Улица, № дома, Квартира'); // Адрес клиента

// Открытие модального окна заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }
    document.getElementById('orderModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна заказа
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

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const comment = document.getElementById('clientComment').value.trim();

    if (name === '' || phone === '') {
        showNotification('Пожалуйста, заполните имя и номер телефона!');
        return;
    }

    // Валидация номера телефона на +7 и 11 цифр
    const phonePattern = /^\+7\d{10}$/;
    if (!phonePattern.test(phone)) {
        showNotification('Введите корректный номер телефона в формате +7XXXXXXXXXX');
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

// Закрытие при клике вне области
document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOrderModal();
    }
});

// Функция для показа уведомлений
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