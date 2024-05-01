const mongoose = require('mongoose');


/**
 * Establishes a connection with the MongoDB database.
 * Utilizes the mongoose library to manage the connection.
 * @constant {string} mongoDB - The connection string for the MongoDB database.
 * @returns {Promise} - A promise representing the connection process.
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

