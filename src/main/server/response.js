class Response {
    static send(responseData = {}) {
        return {
            type: "success",
            data: responseData
        };
    }
}

module.exports = Response;