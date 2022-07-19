const jwt = require('jsonwebtoken');
const config = require("../../config/config.json");
const {
    secret
} = require('../../config/config.json');
const db = require('../../models');

module.exports = async (req, res, next) => {
    const params = req.body;

    var Current_location = params.current_location.split(",");

    const State = await db.state.findAll({
        where: {
            status: '1',
        }
    })
    var statecheck = []
    State.forEach(function (item) {
        statecheck.push(item.state_name);
    })

    const containAll = Current_location.every(item => {
        return statecheck.includes(item);
    });
    if (containAll != true) {
        return res.status(400).json(
            {
                status: false,
                status_code: 401,
                message: "This game is not yet lunched in" + " " + params.current_location + " " + "location.",
            }
        );
    }

    next();
}