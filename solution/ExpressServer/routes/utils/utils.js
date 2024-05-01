/*********
    This file contains utility functions that are used in the routes.
    isDataEmpty: This function checks if the data is empty or not.
*********/
function isDataEmpty(data) {
    return !data || (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'object' && Object.keys(data).length === 0 && data.constructor === Object) ||
        (data instanceof Set && data.size === 0) ||
        (data instanceof Map && data.size === 0);
}


module.exports = {
    isDataEmpty: isDataEmpty
}