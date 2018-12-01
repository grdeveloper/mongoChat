const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(5000).sockets;

mongo.connect('mongodb://127.0.0.1/mongochat', function (err, db) {
    if (err) {
        throw err;
    }

    client.on('connection', function (socket) {
        const chat = db.db().collection('chats');
        const sendStatus = function (s) {
            socket.emit('status', s);
        };

        chat
            .find()
            .limit(100)
            .sort({_id: 1})
            .toArray(function (err, res) {
                if (err) {
                    throw err;
                }

                socket.emit('output', res);
            });

        socket.on('input', function (data) {
            const name = data.name;
            const message = data.message;

            if (!name || !message) {
                return sendStatus('please enter a name and message');
            }

            chat.insert({
                name,
                message,
            }, function () {
                client.emit('output', [data]);

                sendStatus({
                    message: 'Message sent',
                    clear: true,
                });
            });
        });

        socket.on('clear', function (data) {
            chat.remove({}, function () {
                socket.emit('cleared');
            });
        });

        socket.on('cleared', function () {
            message.textContent = '';
        });
    });
});