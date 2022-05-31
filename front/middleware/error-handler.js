module.exports = (err, req, res, next) => {
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ data: {}, message: err });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ status: false, status_code: 401,data: {}, message: 'Unauthorized' });
        default:
            return res.status(500).json({ status: false, status_code: 500,data: {}, message: err.message });
    }
	
};