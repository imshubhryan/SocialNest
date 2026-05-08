class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        code = "GENERIC_ERROR",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.success = false
        this.code = code
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

module.exports = ApiError
