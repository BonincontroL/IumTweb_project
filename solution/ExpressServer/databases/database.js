const mongoose = require('mongoose');

/**
 * Stabilisce la connessione con il database MongoDB
 * Utilizza la libreria mongoose per gestire la connessione
 */
const mongoDB = 'mongodb://localhost:27017/MongoDB_project';
mongoose.Promise = global.Promise;
connection = mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    checkServerIdentity: false,
    family: 4
})
    .then(() => {
        console.log('connection to mongodb worked!');
    })
    .catch((error) => {
        console.log('connection to mongodb did not work! ' + JSON.stringify(error));
    });

