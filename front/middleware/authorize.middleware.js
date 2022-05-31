const jwt = require('jsonwebtoken');
const {
    secret
} = require('../../config/config.json');
const db = require('../../models');

module.exports = async (req, res, next) => {
    var authHeader = req.headers.authorization;
    if(authHeader){
        authHeader = authHeader.replace('Bearer ', '')
        
        jwt.verify(authHeader, secret, (err, result) => {

            if (err) {
                return res.send({
                    data: {},
                    status: false,
                    status_code :401,
                    message: 'Unauthorized please login again!'
                });
            }

            db.User.findByPk(result.sub).then((data) => {
                if (!data)
                    return res.status(401).json({
                        data: {},
                        status: false,
                        status_code :401,
                        message: 'Unauthorized',
                    });
                req.user = data.get();
                // console.log(req)
                next();
            });
        });
    } else {
        return res.status(401).send({
            status: false,
            status_code :401,
            message: 'Unauthorized',
        });
    }
}