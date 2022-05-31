const jwt = require('jsonwebtoken');
const config = require("../../config/config.json");
const {
    secret
} = require('../../config/config.json');
const db = require('../../models');

module.exports = async (req, res, next) => {
    var authHeader = req.headers.authorization;

    console.log(authHeader)
    const authorization = authHeader.split(' ')[1];
    const decode =jwt.verify(authorization, config.secret);
    var userId = decode.sub;


    const user = await db.User.findOne({
        where: {
          id: userId,
        }
      });
     
    if(user.status == "0"){
       return res.status(400).json({ status: false, status_code: 400,message:"This user is block by administrator"});
    }
    next();
}