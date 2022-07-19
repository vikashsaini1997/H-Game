const jwt = require('jsonwebtoken');
const config = require("../../config/config.json");
const {
    secret
} = require('../../config/config.json');
const db = require('../../models');

module.exports = async (req, res, next) => {
    var authHeader = req.headers.authorization;
   

    const authorization = authHeader.split(' ')[1];
   
    const decode =jwt.verify(authorization, config.secret);
    
    var userId = decode.sub;
    
    const user = await db.User.findOne({
        where: {
          id: userId,
        }
      });

    if(authorization != user.auth_token){
        return res.status(400).json(
            { status: false, 
              status_code: 401,
              message:"Your session has been expired."
            }
        );
    }
     
    next();
}