
/*
    This file contains utility functions that are used in the routes.
    isDataEmpty: This function checks if the data is empty or not.

    Dopo che ottengo i dati dal db,controlla che non siano vuoti.
*/
function isDataEmpty(data) {
    return !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0 && data.constructor === Object);

}

module.exports = {
    isDataEmpty: isDataEmpty
}