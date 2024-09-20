// Импорт библиотек и классов.
const {
    Telegraf,
    Markup
} = require('telegraf');
const fs = require('fs');
require('dotenv').config()

// Парсинг данных из JSON-файла.
const buttonData = JSON.parse(fs.readFileSync('product_db.json', 'utf8'));
const buttons_diapers = buttonData.diapers.map(but =>
    [Markup.button.callback(but.diapers_shark, but.id)]
);

// Хранение временных данных с корзины и айди чата
let cart = {};
let adminChat = '1234567890';

// Я незнаю как это описать.
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда для отправки сообщения с кнопками.
bot.command('start', async (ctx) => {
    const chatId = ctx.message.chat.id;
    const msg = ctx.message.text.toLowerCase();
    await ctx.telegram.sendMessage(chatId, 'Добро пожаловать в магазин! Выберите категорию ниже', Markup.inlineKeyboard([
        [Markup.button.callback('Подгузники', 'diapers')]
    ]));
});


// Просмотр корзины
bot.command('cart', async (ctx) => {
    const chatId = ctx.message.chat.id;
    if (!cart[chatId]) {
        ctx.reply('У вас нету товаров в корзине!');
    };
    const cartItems = cart[chatId].length > 0 ? cart[chatId].join(', ') : 'Корзина пуста.';
    await ctx.telegram.sendMessage(chatId, `Ваша корзина товаров:\n${cartItems}.`, Markup.inlineKeyboard([
        [Markup.button.callback('Купить товары с корзины', 'buy')],
        [Markup.button.callback('Обновить список корзины', 'update')],
        [Markup.button.callback('Вернуться назад', 'back')]
    ]));
});

// Обнаружение нажатии кнопок.
bot.on("callback_query", async (ctx) => {
    const chatId = ctx.callbackQuery.message.chat.id;
    const callId = ctx.update.callback_query.data;

    if (!cart[chatId]) {
        cart[chatId] = [];
    };

    try {
        if (callId == 'diapers') {
            await ctx.editMessageText('Выберите нужный подгузник:', Markup.inlineKeyboard(buttons_diapers));
        } else if (callId == 'diapers1') {
            cart[chatId].push('Подгузник 1');
            await ctx.editMessageText('Вы успешно положили Подгузник 1 в корзину!', Markup.inlineKeyboard([
                [Markup.button.callback('Вернуться назад', 'back')]
            ]));
        } else if (callId == 'diapers2') {
            cart[chatId].push('Подгузник 2');
            await ctx.editMessageText('Вы успешно положили Подгузник 2 в корзину!', Markup.inlineKeyboard([
                [Markup.button.callback('Вернуться назад', 'back')]
            ]));
        } else if (callId == 'back') {
            await ctx.editMessageText('Выберите нужный подгузник:', Markup.inlineKeyboard(buttons_diapers));
        } else if (callId == 'buy') {
            await ctx.editMessageText('Вы отправили заявку на покупку товара, ожидайте продавца.');
            ctx.telegram.sendMessage(adminChat, `Отправлена заявка на покупку товара. Свяжитесь с <a href="tg://user?id=${ctx.message.from?.id}">покупателем</a> для дальнейших действии`, {
                parse_mode: 'HTML'
            });
        } else if (callId == 'update') {
            await ctx.editMessageText(`Ваша корзина товаров:\n${cartItems}.`, Markup.inlineKeyboard([
                [Markup.button.callback('Купить товары с корзины', 'buy')],
                [Markup.button.callback('Обновить список корзины', 'update')],
                [Markup.button.callback('Вернуться назад', 'back')]
            ]));
        };
    } catch (e) {
        console.log(e);
    };
});

// Запуск бота и оповещение об этом.
bot.launch();
console.log('Бот запущен!');
