const express = require('express');
const bodyParser = require('body-parser');
const { userMessages, bot } = require('./bot'); 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');


let adminLogs = [];


app.get('/admin', (req, res) => {

    res.render('admin', { userMessages: adminLogs });
});

app.post('/admin/log', (req, res) => {
    const { name, batchNumber, reason, timestamp, chatId } = req.body; 

    
    adminLogs.push({ 
        name, 
        batchNumber, 
        reason, 
        timestamp, 
        chatId, 
        reply: null 
    });


    res.status(200).send({ status: 'success' });
});


app.post('/admin/reply', (req, res) => {
    const userId = req.body.userId; 
    const replyMessage = req.body.reply; 

  
    if (adminLogs[userId]) {
        const userRequest = adminLogs[userId];


        bot.sendMessage(userRequest.chatId, `Request Status: ${replyMessage}`)
            .then(() => {
                
                userRequest.reply = replyMessage; 

                res.redirect('/admin'); 
            })
            .catch((err) => {
                console.error('Error sending message to user:', err);
                res.redirect('/admin'); 
            });
    } else {
        res.status(404).send('User not found');
    }
});


const port = 3000;
app.listen(port, () => {
    console.log(`Admin panel running at http://localhost:${port}/admin`);
});
