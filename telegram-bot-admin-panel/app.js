const express = require('express');
const bodyParser = require('body-parser');
const { userMessages, bot } = require('./bot'); 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

let adminLogs = [];

app.get('/admin', (req, res) => {
    console.log('GET /admin called');
    res.render('admin', { userMessages: adminLogs });
});

app.post('/admin/log', (req, res) => {
    const { name, batchNumber, reason, timestamp, chatId } = req.body; 

    console.log('POST /admin/log called with:', { name, batchNumber, reason, timestamp, chatId });
    
    adminLogs.push({ 
        name, 
        batchNumber, 
        reason, 
        timestamp, 
        chatId, 
        reply: null 
    });

    console.log('Admin log added:', adminLogs[adminLogs.length - 1]);

    res.status(200).send({ status: 'success' });
});

app.get("/", (req, res) => {
    console.log('GET / called');
    res.send("Welcome to the ICPC Training Management System!");
});

app.post('/admin/reply', (req, res) => {
    const userId = req.body.userId; 
    const replyMessage = req.body.reply; 

    console.log('POST /admin/reply called with:', { userId, replyMessage });

    if (adminLogs[userId]) {
        const userRequest = adminLogs[userId];

        bot.sendMessage(userRequest.chatId, `Request Status: ${replyMessage}`)
            .then(() => {
                userRequest.reply = replyMessage; 
                console.log(`Reply sent to user ${userId}: ${replyMessage}`);
                res.redirect('/admin'); 
            })
            .catch((err) => {
                console.error('Error sending message to user:', err);
                res.redirect('/admin'); 
            });
    } else {
        console.error(`User not found for userId: ${userId}`);
        res.status(404).send('User not found');
    }
});

const port = process.env.PORT || 3000; // Specify a default port if not set
app.listen(port, () => {
    console.log(`Admin panel running at http://localhost:${port}/admin`);
});
