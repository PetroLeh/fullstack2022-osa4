const errorHandler = (error, request, response, next) => { 
    if (error.name === 'castError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
}

module.exports = {
    errorHandler
}