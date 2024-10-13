const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config(); 

const token = process.env.BOT_TOKEN; 
const bot = new TelegramBot(token, { polling: true });

let userSessions = {}; 


bot.onText(/\/start|changeDate/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `
Hi, I am the ICPC Assiut University Bot.
I am here to help you with your requests.

If your request is accepted, you will receive a message from the bot shortly.

To start sending your request, please click the button below.

Thank you! <3 ;
        `, {
        reply_markup: {
            inline_keyboard: [[{ text: "Start now", callback_data: 'start' }]]
        }
    });
});

bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;

    if (callbackQuery.data === 'start') {
       
        bot.sendMessage(chatId, "Please enter your name (alphabetical, max 60 characters):");
        userSessions[chatId] = { step: 'name' }; 
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (userSessions[chatId]) {
        const userSession = userSessions[chatId];

        switch (userSession.step) {
            case 'name':
                if (/^[A-Za-z\s]{1,60}$/.test(text)) {

                    userSession.name = text;
                    userSession.step = 'batch';
                    bot.sendMessage(chatId, "Please enter your batch number (numbers only):");
                } else {

                    bot.sendMessage(chatId, "Invalid name. Please use alphabetical characters only, max 60 characters.");
                }
                break;

            case 'batch':
                if (/^\d+$/.test(text)) {

                    userSession.batchNumber = text;
                    userSession.step = 'reason';
                    bot.sendMessage(chatId, "Please enter your reason:");
                } else {

                    bot.sendMessage(chatId, "Invalid batch number. Please enter numbers only.");
                }
                break;

            case 'reason':

                userSession.reason = text;

       
                const userRequest = {
                    name: userSession.name,
                    batchNumber: userSession.batchNumber,
                    reason: userSession.reason,
                    timestamp: new Date().toLocaleString(),
                    chatId: chatId, // Include chatId
                };

                axios.post('http://localhost:3000/admin/log', userRequest)
                    .then(() => {
                        bot.sendMessage(chatId, 
                            `
Your request has been sent to the admin.
You will receive a message shortly.
                            `
                        );
                    })
                    .catch((err) => {
                        bot.sendMessage(chatId, "There was an error submitting your request. Please try again.");
                        console.error(err);
                    });

  
                delete userSessions[chatId];
                break;

            default:
                bot.sendMessage(chatId, "Please click 'Start now' to begin the process.");
        }
    }
});

module.exports = { bot }; 
