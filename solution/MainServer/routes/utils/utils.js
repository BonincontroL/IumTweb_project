///DI PROVA - TEST

function handleAxiosError(err, res) {
    if (err.response) {
        res.status(err.response.status).send({
            error: true,
            message: err.response.data.message || err.message || "An error occurred."
        });
    } else if (err.request) {
        res.status(504).send({
            error: true,
            message: "Gateway timeout: no response from server."
        });
    } else {
        res.status(500).send({
            error: true,
            message: "Internal server error."
        });
    }
}

module.exports = {
    handleAxiosError:handleAxiosError
};