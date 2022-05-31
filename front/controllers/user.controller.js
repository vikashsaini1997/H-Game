const config = require("../../config/config.json");
const express = require("express");
const sequelize = require('sequelize');
const Op = sequelize.Op;
const jwt = require("jsonwebtoken");
const response = require("../../helper/response");
const db = require("../../models");
const user = require("../../models/user");
const state = require("../../models/state");
const categroy = require("../../models/category");
const contests = require("../../models/contests");
const user_setting = require("../../models/user_setting")
const join_contest = require("../../models/join_contest_details");
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const client = redis.createClient();
const firbase = require('../../service/firebase.service')

const { date } = require("joi");
const msg91 = new (require('msg91-v5'))("372052Apw7JNLDZ4c623873b4P1");
var nodemailer = require('nodemailer');
const { compareSync } = require("bcryptjs");


let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal passwor
    },

});

module.exports = {
    Login: async (req, res, next) => {
        try {
            const params = req.body;

            const user = await db.User.findOne({
                where: {
                    role_id: '3',
                    status: '1',
                    mob_no: params.mob_no,
                    username: params.username
                },
            });

            if (!user) {
                let message = "Account doesn't exist.";
                return res.status(400).json({ status: false, status_code: 400, message: message });

            } else if (params.plus18 == 0) {
                let message = "18 plus must be required.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            var otp = Math.floor(100000 + Math.random() * 900000);

            //OTP Trigger
            const Checkvalue = {
                template_id: "6241705da6cfa213936973d4",
                mobile: 91 + user.mob_no,
                authkey: "372052Apw7JNLDZ4c623873b4P1",
                otp: otp,
            }
            console.log(Checkvalue);


            msg91.sendOTP(Checkvalue).then((success) => {
                console.log("SUCCESS !!!", success)
            }).catch((error) => {
                console.log("ERROR!!!", error)
            })

            await db.User.update({
                user,
                otp: otp,
            }, {
                where: {
                    id: user.id
                }
            });

            let successMessage = "Please verify your otp."
            return res.send(response({}, successMessage));
        } catch (error) {
            next(error);
        }
    },

    sociallogin: async (req, res, next) => {

        try {
            const params = req.body;
            params.role_id = 3;
            params.status = 1;


            const users = await db.User.findOne({
                where: {
                    email: params.email
                },
                include: [db.user_setting]

            })


            if (users) {
                if (users.is_verify == null) {
                    mobilecheck = false

                    var usersetting = await db.user_setting.findOne({
                        where: {
                            user_id: users.id,
                        }
                    })

                    if (usersetting) {
                        var Usersettings = usersetting;
                    } else {
                        var Usersettings = null;
                    }
                    console.log('dfasfad', Usersettings);
                    let successMessage = "";

                    successMessage = "Please complete profile";
                    data = {
                        "is_mobile": mobilecheck, "user_setting": Usersettings, ...omitHash(users.get())
                    };
                    return res.send(response(data, successMessage));


                } else {
                    mobilecheck = true

                    const token = jwt.sign({
                        sub: users.id,
                        role_id: users.role_id
                    }, config.secret, {
                        expiresIn: "1d",
                    });
                    // console.log(token);

                    let successMessage = "";
                    console.log("test mid")

                    successMessage = "Successfully login";
                    data = {
                        "is_mobile": mobilecheck, ...omitHash(users.get()), token
                    };
                    return res.send(response(data, successMessage));


                }
            } else {
                mobilecheck = false
                params.bonus_amount = 50
                const userlogin = await db.User.create(params)

                const usernotification = await db.notifications.create({
                    user_id: userlogin.id,
                    notification_type: 2,
                    title: "Bonus amount",
                    notification: "congratulation you have got 50 rupess bonus amount",
                    extra_data: null,
                    status: 0
                });

                const detail = await db.User.findOne({
                    where: {
                        email: params.email
                    },
                })
                var usersetting = await db.user_setting.findOne({
                    where: {
                        user_id: detail.id,
                    }
                })

                if (usersetting) {
                    var Usersettings = usersetting;
                } else {
                    var Usersettings = null;
                }

                console.log("afasasdfasdf", usersetting);


                let successMessage = "";

                successMessage = "Please complete profile";
                data = {
                    "is_mobile": mobilecheck, "user_setting": Usersettings, ...omitHash(detail.get())
                };
                return res.send(response(data, successMessage));
            }
        } catch (error) {

            next(error);
        }

    },

    completeprofile: async (req, res, next) => {

        try {
            const params = req.body;
            console.log(params)

            const user = await db.User.findOne({
                where: {
                    mob_no: params.mob_no
                }
            })
            if (user) {
                throw "mob_no already used"
            }

            const user1 = await db.User.findOne({
                where: {
                    username: params.username
                }
            })
            if (user1) {
                throw "username already used"
            }

            var otp = Math.floor(100000 + Math.random() * 900000);
            //OTP Trigger
            const Checkvalue = {
                template_id: "6241705da6cfa213936973d4",
                mobile: "91" + params.mob_no,
                authkey: "372052Apw7JNLDZ4c623873b4P1",
                otp: otp,
            }

            msg91.sendOTP(Checkvalue).then((success) => {
                console.log("SUCCESS !!!", success)
            }).catch((error) => {
                console.log("ERROR!!!", error)
            })

            await db.User.update({
                mob_no: params.mob_no,
                username: params.username,
                otp: otp,
            }, {
                where: {
                    id: params.id
                }
            });

            let data = '';

            return res.send(response(data, "Please verify otp"));
        } catch (error) {
            next(error)
        }

    },

    userRegister: async (req, res, next) => {
        try {
            const params = req.body;
            params.role_id = 3;
            params.t_c = params.T_C;

            if (params.T_C == 0) {
                let message = "Terms & conditions are required.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            if (
                await db.User.findOne({
                    where: {
                        mob_no: params.mob_no,
                    },
                })
            ) {
                let message = "mobile number already registered";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            if (
                await db.User.findOne({
                    where: {
                        username: params.username,
                    },
                })
            ) {
                let message = "username already registered!";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            if (
                await db.User.findOne({
                    where: {
                        email: params.email,
                    },
                })
            ) {
                let message = "Email already registered!";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            var otp = Math.floor(100000 + Math.random() * 900000);
            params.otp = otp;

            //OTP Trigger
            const Checkvalue = {
                template_id: "6241705da6cfa213936973d4",
                mobile: 91 + params.mob_no,
                authkey: "372052Apw7JNLDZ4c623873b4P1",
                otp: otp,
            }
            console.log(Checkvalue);


            msg91.sendOTP(Checkvalue).then((success) => {
                console.log("SUCCESS !!!", success)
            }).catch((error) => {
                console.log("ERROR!!!", error)
            })

            console.log(params);
            await db.User.create(params);
            let successMessage = "Please verify your otp.";
            return res.send(response({}, successMessage))

        } catch (error) {
            next(error);
        }
    },

    verifyUser: async (req, res, next) => {
        try {
            const params = req.body;
            params.status = "1";
            params.is_verify = true;

            const user = await db.User.findOne({
                where: {
                    mob_no: params.mob_no,
                }
            });
            console.log(user)

            if (!user) {
                let message = "Account doesn't exsist.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            if (user.otp != params.otp) {
                let message = "Invalid otp. Please try again.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            params.otp = 0;
            if (params.isSignup) {
                params.bonus_amount = 50
                // Object.assign(user, params);
                // await user.save();
                const update = await db.User.update({
                    otp: 0,
                    bonus_amount: 50,
                    status: 1,
                    is_verify: true,
                }, {
                    where: {
                        mob_no: user.mob_no
                    },
                })


                const usernotification = await db.notifications.create({
                    user_id: user.id,
                    notification_type: 2,
                    title: "Bonus amount",
                    notification: "congratulation you have got 50 rupess bonus amount",
                    extra_data: null,
                    status: 0
                });

                 
                const adminnotification = await db.notifications.create({
                    user_id: user.id,
                    notification_type: 1,
                    title: "New User Signup",
                    notification: "New user signup in Housie game",
                    extra_data: null,
                    status: 0
                });
                if(user.device_token){
                var message = {
                    "token": user.device_token,
                    "notification": {
                      "title": "New User Signup",
                      "body": "New user signup in Housie game"
                    }
                  }
                 firbase().send(message)
                    .then((response) => {
                      // Response is a message ID string.
                      console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      console.log('Error sending message:', error);
                    });
                }
                //notification count emit by socket//

              
                let successMessage = "Your account is verified. Please login now.";
                return res.send(response({}, successMessage));
            } else {
                params.last_login = "1";

                Object.assign(user, params);
                await user.save();


                if (params.device_token) {
                    let post = {
                        device_token: params.device_token,
                    };

                    Object.assign(user, post);
                    await user.save();
                }

                // authentication successful
                const token = jwt.sign({
                    sub: user.id,
                    role_id: user.role_id
                }, config.secret, {
                    expiresIn: "1d",
                });

                const data1 = await db.User.findOne({
                    where: {
                        mob_no: params.mob_no
                    },
                    include: [db.user_setting]
                })



                let data = {};
                let successMessage = "";

                successMessage = "You are logged in successfully.";
                data = {
                    ...omitHash(data1.get()),
                    token,
                };

                return res.send(response(data, successMessage));
            }
        } catch (error) {
            next(error);
        }
    },

    otpSend: async (req, res, next) => {
        try {
            const params = req.body;

            console.log(params)

            const user = await db.User.findOne({
                where: {
                    mob_no: params.mob_no,
                }
            });

            if (!user) {
                throw "Account doesn't exsist."
            }

            var otp = Math.floor(100000 + Math.random() * 900000);
            params.otp = otp;

            //OTP Trigger
            const Checkvalue = {
                template_id: "6241705da6cfa213936973d4",
                mobile: "91" + params.mob_no,
                authkey: "372052Apw7JNLDZ4c623873b4P1",
                otp: otp,
            }
            console.log(Checkvalue);


            msg91.sendOTP(Checkvalue).then((success) => {
                console.log("SUCCESS !!!", success)
            }).catch((error) => {
                console.log("ERROR!!!", error)
            })


            await db.User.update({
                otp
            }, {
                where: {
                    id: user.id
                }
            });

            return res.send(response({}, "OTP has been resend successfully on your phone number."));
        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            const authHeader = req.headers["authorization"];
            jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
                if (logout) {
                    res.send({ msg: 'You have been Logged Out' });
                } else {
                    res.send({ msg: 'Error' });
                }
            });
        } catch (error) {
            next(error)
        }
    },

    getcategoy: async (req, res, next) => {
        try {
            const data = await db.category.findAll();

            return res.send(response(data));
        } catch (error) {
            next(error);
        }
    },

    state: async (req, res, next) => {
        try {
            const data = await db.state.findAll();

            return res.send(response(data));
        } catch (error) {
            next(error)
        }
    },

    showprofile: async (req, res, next) => {
        try {
            const id = req.user;


            var user = await db.User.findOne({
                where: {
                    id: id.id,
                },
                include: [db.state],
            });
            var totalticket = await db.join_contest_details.findAll({
                where: {
                    user_id: id.id,
                },
                attributes: {
                    include: [[sequelize.fn("COUNT", sequelize.col("join_contest_id")), "total_ticket"]]
                },
                include: [
                    {
                        model: db.player_team_contest,
                        attributes: [],
                    }
                ],
            });

            user = user.toJSON();
            const total_tickets = totalticket[0].dataValues.total_ticket;
            user.total_tickets = total_tickets;

            const notificationcount = await db.notifications.count({
                where: {
                    status: 0,
                    user_id: id.id,
                    notification_type: 2
                }
            })

            req.io.emit("user_notification_count", notificationcount);

            return res.send(response(user));

        } catch (error) {
            next(error);
        }
    },

    profile_edit: async (req, res, next) => {
        try {
            const params = req.body;
            const id = req.user
            let file = req.file

            var alreadyimage = await db.User.findOne({
                where: {
                    id: req.user.id
                }
            });

            let value = ""
            if (file) {
                value = file.path
            } else {
                value = alreadyimage.profile_image
            }

            let test = Object.assign(req.body, {
                profile_image: value
            });

            console.log(test)
            await db.User.update(test, {
                where: {
                    id: req.user.id
                }
            });

            var save = await db.User.findOne({
                where: {
                    id: req.user.id
                }
            });

            return res.send(
                response(save, "Profile updated successfully.")
            );
        } catch (error) {
            next(error);
        }
    },

    contest_list: async (req, res, next) => {
        try {
            const categroyId = req.params.categroy_id;

            const data = await db.contests.findAll({
                where: {
                    category_id: categroyId,
                    status:'1'
                },
                include: [db.category],
            });

            // data.forEach(function (item) {
            //     var timer_counter = item.waiting_time;

            //     var WinnerCountdown = setInterval(async function () {
            //         await db.contests.update({
            //             waiting_time: timer_counter
            //         },
            //             {
            //                 where: {
            //                     id: item.id,
            //                 }
            //             });
            //         timer_counter--
            //         if (timer_counter == "1") {
            //             socket.emit('counters', "Congratulations You WON!!");
            //             clearInterval(WinnerCountdown);
            //         }
            //     }, 1000);
            //     // socket.emit('contest_list_emit', db_content_data);
            // });

            // const contest_table_update = await db.contests.findAll({
            //     where: {
            //         category_id: categroyId,
            //     },
            // });
            // console.log("Teseter", contest_table_update)

            console.log('Hlelotest', req.io.emit("contest_list_emit", data));
            return res.send(response(data));
        } catch (error) {
            next(error);
        }
    },

    contest_detail: async (req, res, next) => {
        try {
            const id = req.params.id;

            const data = await db.contests.findOne({
                where: {
                    id: id,
                }
            });
            console.log('Testtt', data);
            return res.send(response(data));
        } catch (error) {
            next(error);
        }
    },

    cmspageview: async (req, res, next) => {
        try {
            const cmsId = req.params.id
            const data = await db.cms.findOne({
                where: {
                    id: cmsId,
                }
            });
            return res.send(response(data, "cms list view"));

        } catch (error) {
            next(error)
        }
    },

    usersetting: async (req, res, next) => {
        try {
            const params = req.body

            const user = await db.user_setting.findOne({
                where: {
                    user_id: params.user_id
                }
            })
            if (user) {
                await db.user_setting.update(params, {
                    where: {
                        user_id: params.user_id
                    }
                })
            } else {
                await db.user_setting.create(params, {
                })
            }
            let data = {}
            let successMessage = "updated successfully";
            return res.send(response(data, successMessage))

        } catch (error) {
            next(error)
        }

    },

    helpandsupport: async (req, res, next) => {
        try {
            const params = req.body

            const user = await db.User.findOne({
                where: {
                    id: params.user_id
                }
            })

            const test = await transporter.sendMail({
                from: 'housie.live@gmail.com', // sender address
                to: user.email, // list of receivers
                subject: "Housie Game | Thank you for getting in touch ",
                headers: user.firstName,
                text: " Hello We appreciate you contacting with us. One of our customer happiness members will be getting back to you shortly.While we do our best to answer your queries quickly, it may take about 24 hours to receive a response from us during peak hours.Thanks in advance for your patience.Have a great day!"
            })

            const data = await db.helpdesk.create(params, {
            })
            let successMessage = "message submitted successfully";
            return res.send(response(data, successMessage))

        } catch (error) {
            next(error)
        }

    },

    ticket_buy: async (req, res, next) => {
        try {

            var date = new Date();
            const params = req.body;

            const Userbalancecheck = await db.User.findOne({
                where: {
                    id: params.user_id
                }
            })
            var saveData = [];
            var deductbalance = [];
            if (Userbalancecheck) {
                var usableBonusAmount = parseInt(Userbalancecheck.bonus_amount) - 30;
                var usableCashAmount = parseInt(Userbalancecheck.cash_balance);
                var usableWinningAmount = parseInt(Userbalancecheck.winning_balance);

                if (usableBonusAmount && usableBonusAmount >= params.total_amount) {

                    saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - params.total_amount;
                    deductbalance['bonus_am'] = parseInt(Userbalancecheck.bonus_amount) - saveData['bonus_amount'];

                } else if ((usableCashAmount + usableBonusAmount) >= params.total_amount) {
                    saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - usableBonusAmount;
                    deductbalance['bonus_am'] = usableBonusAmount;

                    saveData['cash_balance'] = parseInt(Userbalancecheck.cash_balance) - (params.total_amount - usableBonusAmount);
                    deductbalance['cash_bal'] = Userbalancecheck.cash_balance - saveData['cash_balance'];

                } else if ((usableCashAmount + usableBonusAmount + usableWinningAmount) >= params.total_amount) {
                    saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - usableBonusAmount;
                    deductbalance['bonus_am'] = usableBonusAmount;

                    saveData['cash_balance'] = 0;
                    deductbalance['cash_bal'] = usableBonusAmount - usableCashAmount;

                    saveData['winning_balance'] = parseInt(Userbalancecheck.winning_balance) - (params.total_amount - usableBonusAmount - usableCashAmount);
                    deductbalance['winning_bal'] = usableWinningAmount - saveData['winning_balance'];

                } else {
                    var message = "You didn't have sufficient balance. Please add amount in your wallet.";
                    return res.status(400).json({ status: false, status_code: 400, message: message });
                }
            }


            await db.User.update(saveData, {
                where: {
                    id: params.user_id
                }
            });

            params.bonus_amount = deductbalance.bonus_am;
            params.cash_balance = deductbalance.cash_bal;
            params.winning_balance = deductbalance.winning_bal;


            var joinedContestDetails = await db.join_contest_details.create(params);


            for (let i = 0; i < params.ticket_details.length; i++) {
                let ticketDetails = {
                    "join_contest_id": joinedContestDetails.id,
                    "details": JSON.stringify(params.ticket_details[i])
                }

                await db.player_team_contest.create(ticketDetails);
            }

            let Usercount = await db.join_contest_details.count({
                where: {
                    contest_id: params.contest_id
                }
            })
            let adminComission = await db.join_contest_details.findAll({
                where: {
                    contest_id: params.contest_id
                },
                attributes: [[sequelize.fn('sum', sequelize.col('total_amount')), 'total']],
                raw: false,
            })

            let commission = [];
            adminComission.forEach(function (item) {
                commission.push(item.dataValues.total);
            });

            let AmdinComssionGet = commission * 10 / 100;
            let WinningAmount = commission - AmdinComssionGet;


            let updateContest = {
                "contest_size": Usercount,
                "admin_comission": AmdinComssionGet,
                "winning_amount": WinningAmount,
            }


            await db.contests.update(updateContest, {
                where: {
                    id: params.contest_id
                }
            })

            var data = {};

            const contest_list_data = await db.contests.findAll({
                where: {
                    category_id: params.category_id,
                },
                include: [db.category],
            });

            req.io.emit("contest_list_emit", contest_list_data);

            const contest_buy_details = await db.contests.findAll({
                where: {
                    id: params.contest_id,
                }
            });

            req.io.emit("game_buy_request", contest_buy_details);

            return res.send(response(data, 'thank you for purchase ticket'));

        } catch (error) {
            next(error);
        }
    },

    ticket_buy_details: async (req, res, next) => {
        try {

            const params = req.body;

            var data = await db.join_contest_details.findOne({
                where: {
                    contest_id: params.contest_id,
                    user_id: params.user_id
                }
            })

            var categroyIdGet = await db.contests.findOne({
                attributes: ['category_id', 'winning_amount', 'contest_size', 'waiting_time'],
                where: {
                    id: params.contest_id,
                }
            })


            var details = await db.player_team_contest.findAll({
                where: {
                    join_contest_id: data.id
                }
            })


            var gameticket = [];
            var PalyerId = '';
            details.forEach(function (item) {
                PalyerId = item.id;
                const details = JSON.parse(item.details)
                let finalData = {
                    details,
                    id: item.id,
                    join_contest_id: item.join_contest_id,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                }
                gameticket.push(finalData);
            });

            const contest_buy_details = await db.contests.findAll({
                attributes: ['winning_amount', 'contest_size', 'waiting_time'],
                where: {
                    id: params.contest_id,
                }
            });

            req.io.emit("game_buy_details", contest_buy_details);

            // Time update join contest//
            var vauess = await db.join_contest_details.update({
                time: new Date()
            }, {
                where: {
                    contest_id: params.contest_id,
                }
            })

            console.log('thisss', vauess);
            //Time update join contest end//

            //Anncoument number//
            /* var Checkweting = setInterval(async function () {
                var wetingtime = await db.contests.findOne({
                    where: {
                        id: params.contest_id,
                    }
                })
                if (wetingtime.waiting_time == 0) {
                    console.log('Hello sir');
                    clearInterval(Checkweting)
                    var gameAnnouncedFunction = setInterval(async function () {
                        var CheckData = await db.contests.findOne({
                            where: {
                                id: params.contest_id,
                            }
                        })
                        if (CheckData.dataValues.announced_numbers) {

                            // console.log('CheckA',test)
                            var Checkanncoment = CheckData.dataValues.announced_numbers.split(',').map(parseFloat);
                            if (Checkanncoment.length === 89) {
                                clearInterval(gameAnnouncedFunction)
                            }
                        }

                        const randomNum = ~~(Math.random() * (90 - 1 + 1) + 1);

                        if (CheckData.dataValues.announced_numbers != null) {
                            var nums = CheckData.dataValues.announced_numbers.split(",");
                            console.log('testete', nums);

                            //console.log(typeof(nums));

                            if (nums.indexOf(randomNum.toString()) != -1) {
                                // number exists for this contest
                                // do NOTHING
                                // continue
                                // console.log("CONTINUE");
                                return;
                            }
                        } else {
                            var nums = [];
                        }
                        nums.push(randomNum);
                        nums = nums.join(",");
                        console.log('Numbersss', nums);

                        await db.contests.update({
                            announced_numbers: nums
                        }, {
                            where: {
                                id: params.contest_id
                            }
                        })

                        let data = {
                            number: randomNum,
                            winner_status: "winner",
                        }
                        
                        req.io.join('room-',+params.contest_id)
                        /* req.io.to(params.contest_id).emit("ticket_announcement_number", data) 
                        req.io.in("room-"+params.contest_id).emit('ticket_announcement_number',data);

                    }, 2000);
                }
            }, 1000); */

            //Anncoument number ENd//


            var Getdatas = {
                categroy_id: categroyIdGet.category_id,
                winning_amount: categroyIdGet.winning_amount,
                contest_size: categroyIdGet.contest_size,
                waiting_time: categroyIdGet.waiting_time, gameticket
            }

            console.log('TicketBuy_user', Getdatas);

            return res.send(response(Getdatas));
        } catch (error) {
            next(error);
        }
    },

    my_match_list: async (req, res, next) => {
        try {
            const id = req.user;
            const checkmydata = await db.join_contest_details.findAll({
                attributes: {
                    include: [[sequelize.fn("COUNT", sequelize.col("join_contest_id")), "total_ticket"]]
                },
                where: {
                    user_id: id.id,
                    win_status: [1, 0]
                }, include: [
                    {
                        model: db.contests,
                        attributes: ['random_id', 'winning_amount', 'contest_size', 'entry_fee', 'createdAt'],
                        include: [
                            {
                                model: db.category,
                                attributes: ['category_name'],
                            }
                        ],
                    },
                    {
                        model: db.player_team_contest,
                        attributes: [],
                    }
                ],
                group: ["user_id", "join_contest_id"],
            })
            return res.send(response(checkmydata));

        } catch (error) {
            next(error);
        }
    },

    winner: async (req, res, next) => {
        try {
            client.connect();
            const params = req.body;

            var ticket = await db.player_team_contest.findOne({
                where: {
                    id: params.ticket_id
                },
                include: [
                    {
                        model: db.join_contest_details,
                        include: [
                            {
                                model: db.contests,
                                include: [
                                    {
                                        model: db.category,
                                    },
                                ],
                            },
                        ],
                    },
                ]
            })


            let userId = ticket.join_contest_detail.user_id;
            console.log('user_id->>>>>>', ticket.join_contest_detail.user_id)

            console.log('AllData----->>>>', ticket.join_contest_detail.contest.id)
            let contest_id = ticket.join_contest_detail.contest.id.toString();
            await client.set("eg" + contest_id, "1");
            const value = await client.get(contest_id);
            console.log('Arrraycehckkkk=>>>>>>', value);

            await client.set("userid_const_win" + contest_id, userId);

            await db.contests.update({
                announced_numbers: value
            }, {
                where: {
                    id: ticket.join_contest_detail.contest.id,
                }
            })

            console.log('TikcaetData', ticket)


            var ticketDetails = JSON.parse(ticket.details);


            var arrayValue = [];
            ticketDetails.numbers.map(item => {
                item.map(value => {
                    arrayValue.push(value.value)
                })
            })

            //console.log('asfasdf',arrayValue)

            var TicketData = params.details;
            console.log('Ticket', TicketData);

            var detaislarry = []
            TicketData.numbers.map(item => {
                item.map(value => {
                    detaislarry.push(value.value)
                })
            })

            console.log('adfasdfrtest', detaislarry);
            // console.log('adfasd',detaislarry)
            if (arrayValue.length == detaislarry.length
                && arrayValue.every(function (u, i) {
                    return u === detaislarry[i];
                })
            ) {
                var Checktrue = true;
            } else {
                var Checktrue = false;
            }



            var CategroyId = ticket.join_contest_detail.contest.category.dataValues;

            if (Checktrue == true) {
                if (CategroyId.id === 1) {
                    var anyvalue = params.x;
                    const iterator = TicketData.numbers[anyvalue];

                    var ticketArrMerge = iterator;
                    console.log('ticketArrMerge---->>>', ticketArrMerge)
                    var FullticketFilter = ticketArrMerge.filter(value => value.clickable === true)
                    console.log('FullticketFilter', FullticketFilter);
                    var Checkticket = [];
                    FullticketFilter.map(item => {
                        Checkticket.push(item.value);
                    })

                    let contest_id = ticket.join_contest_detail.contest.id.toString();
                    const value = await client.get(contest_id);
                    var Announced_numbers = value;
                    console.log('Announced_numbers=>>>>', Announced_numbers);
                    var arrayAnnounce = Announced_numbers.split(',').map(parseFloat);

                    var Checktrue = [];
                    for (var i in Checkticket) {
                        if (arrayAnnounce.indexOf(Checkticket[i]) !== -1)
                            Checktrue.push(Checkticket[i]);
                    }

                    if (Checktrue.length == 5) {

                        await db.join_contest_details.update({
                            win_status: "1",
                        }, {
                            where: {
                                contest_id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })
                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "numberttt Are not match";
                    }

                } else if (CategroyId.id === 2) {
                    var ticketArrMerge = TicketData.numbers.flat()
                    var FullticketFilter = ticketArrMerge.filter(value => value.clickable === true && value.value !== 0)

                    var Checkticket = [];
                    FullticketFilter.map(item => {
                        Checkticket.push(item.value);
                    })

                    console.log("Checkticket->>>>>>", Checkticket)

                    let contest_id = ticket.join_contest_detail.contest.id.toString();
                    const value = await client.get(contest_id);
                    var Announced_numbers = value;
                    var arrayAnnounce = Announced_numbers.split(',').map(parseFloat);

                    var Checktrue = [];
                    for (var i in Checkticket) {
                        if (arrayAnnounce.indexOf(Checkticket[i]) !== -1)
                            Checktrue.push(Checkticket[i]);
                    }

                    if (Checktrue.length == 15) {
                        await db.join_contest_details.update({
                            win_status: "1",
                        }, {
                            where: {
                                contest_id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })
                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "number Are not match";
                    }

                } else if (CategroyId.id === 3) {
                    var ticketArrMerge = TicketData.numbers.flat()
                    var EarlyticketFilter = ticketArrMerge.filter(value => value.clickable === true && value.value !== 0)

                    var ticketFilterValue = [];
                    EarlyticketFilter.map(item => {
                        ticketFilterValue.push(item.value);
                    })
                    console.log('ticketFilterValue->>>>>', ticketFilterValue);

                    let contest_id = ticket.join_contest_detail.contest.id.toString();
                    const value = await client.get(contest_id);
                    var Announced_numbers = value;
                    var arrayAnnounce = Announced_numbers.split(',').map(parseFloat);

                    var Checktrue = [];
                    for (var i in ticketFilterValue) {
                        if (arrayAnnounce.indexOf(ticketFilterValue[i]) !== -1)
                            Checktrue.push(ticketFilterValue[i]);
                    }

                    if (Checktrue.length == 13) {
                        await db.join_contest_details.update({
                            win_status: "1",
                        }, {
                            where: {
                                contest_id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })
                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "number Are not match";
                    }

                } else if (CategroyId.id === 4) {
                    var ticketArrMerge = TicketData.numbers.flat()
                    var FullticketFilter = ticketArrMerge.filter(value => value.value !== 0)
                    /*  var finalArray = FullticketFilter.length === 1 && FullticketFilter.length ===  */

                    var CornerArryX = []
                    var CornerArryY = []
                    var CornerArryZ = []
                    FullticketFilter.map(item => {
                        if (item.x === 0) {
                            CornerArryX.push(item)
                        } else if (item.x === 1) {
                            CornerArryY.push(item)
                        } else if (item.x === 2) {
                            CornerArryZ.push(item)
                        }
                    })

                    var cornerFinalArr = [];

                    if (CornerArryX[0].value) {
                        cornerFinalArr.push(CornerArryX[0].value);
                    }

                    if (CornerArryY[0].value) {
                        cornerFinalArr.push(CornerArryY[0].value);
                    }
                    if (CornerArryZ[0].value) {
                        cornerFinalArr.push(CornerArryZ[0].value);
                    }


                    cornerFinalArr.push(CornerArryX[(CornerArryX.length - 1)].value);
                    cornerFinalArr.push(CornerArryY[(CornerArryY.length - 1)].value);
                    cornerFinalArr.push(CornerArryZ[(CornerArryZ.length - 1)].value);


                    let contest_id = ticket.join_contest_detail.contest.id.toString();
                    const value = await client.get(contest_id);
                    var Announced_numbers = value;
                    var arrayAnnounce = Announced_numbers.split(',').map(parseFloat);

                    var Checktrue = [];
                    for (var i in cornerFinalArr) {
                        if (arrayAnnounce.indexOf(cornerFinalArr[i]) !== -1)
                            Checktrue.push(cornerFinalArr[i]);
                    }

                    if (Checktrue.length == 6) {
                        await db.join_contest_details.update({
                            win_status: "1",
                        }, {
                            where: {
                                contest_id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })
                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "number Are not match";
                    }

                }
            } else {
                message = "ticket number are not match";
            }

            return res.send(response(message));

        } catch (error) {
            next(error);
        }
    },

    socketChat: async (req, res, next) => {
        try {
            return res.sendFile(__dirname + '/index.html');
        } catch (error) {
            next(error);
        }
    },

    wallet: async (req, res, next) => {
        try {
            const userId = req.params.id
            const data = await db.User.findOne({
                where: {
                    id: userId,
                }
            });

            if (data.winning_balance == null) {
                data.winning_balance = 0;
            } else if (data.cash_balance == null) {
                data.cash_balance = 0;
            }

            var bonus_am = parseInt(data.bonus_amount);
            var cash_am = parseInt(data.cash_balance);
            var winning_am = parseInt(data.winning_balance);


            var walletamount = (bonus_am + cash_am + winning_am)
            const balance = { walletamount }

            return res.send(response(balance, "wallet balance"));

        } catch (error) {
            next(error)
        }
    },

    //privat game//

    category_roomview: async (req, res, next) => {
        try {

            const category = await db.category.findAll()

            const contest = await db.contests.findAll({

                attributes: ['entry_fee',],
                where: {
                    id: {
                        [Op.between]: [1, 10]
                    }
                },
            });

            data = { category, contest }

            return res.send(response(data,));

        } catch (error) {
            next(error)
        }
    },

    contest_create: async (req, res, next) => {
        try {
            const params = req.body

            params.invite_code = randomString(17)

            const contest = await db.contests.create({
                category_id: params.category_id,
                entry_fee: params.entry_fee,
                random_id: uuidv4(),
                admin_comission: 0,
                winning_amount: 0,
                contest_size: 0,
                waiting_time: 0,
                status: "1",
                contest_type: 1
            })

            const usercontest = await db.user_contests.create({
                user_id: params.user_id,
                contest_id: contest.id,
                host: true,
                contest_name: params.contest_name,
                invite_code: randomString(17)
            })

            const hostcontestjoin = await db.private_contest_join.create({
                user_id: params.user_id,
                contest_id: contest.id,
                user_contest_id: usercontest.id,
                host: true,

            })

            const data = { contest }
            return res.send(response(data, "Private contest successfully created"));

        } catch (error) {
            next(error)
        }
    },

    privatecontest_detail: async (req, res, next) => {
        try {
            const contestId = req.params.id
            const User_id = req.user.id;

            const checkhostuser = await db.user_contests.findOne({
                where: {
                    contest_id: contestId,
                    user_id: User_id
                }
            })


            if (checkhostuser) {
                var host = true;
            } else {
                var host = false;
            }

            const detail = await db.contests.findOne({
                where: {
                    id: contestId,
                },
                include: [{
                    model: db.user_contests
                },
                {
                    model: db.category
                }
                ],
            })

            const Usercheck = await db.private_contest_join.findAll({
                attributes: ['id', 'host'],
                where: {
                    contest_id: contestId,
                }, include: [{ model: db.User, attributes: ['firstName', 'lastName', 'profile_image'] }]
            })

            req.io.emit("private_user_details", Usercheck);



            var data = { host, detail }

            return res.send(response(data));

        } catch (error) {
            next(error)
        }
    },

    join_game: async (req, res, next) => {
        try {
            const params = req.body;

            const invitecode = await db.user_contests.findOne({
                where: {
                    invite_code: params.invite_code,
                },
            })
            if (!invitecode) {
                message = "Please Enter valid Invite code"
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }


            //total join contest count//

            const joincontest = await db.user_contests.count({
                where: {
                    invite_code: params.invite_code,

                },
                attributes: {
                    include: [[sequelize.fn("COUNT", sequelize.col("user_contest_id")), "total_join"]]
                },
                include: [
                    {
                        model: db.private_contest_join,
                        attributes: [],
                    }
                ],
            });
            // already join contest//
            var find = await db.private_contest_join.findOne({
                where: {
                    user_id: params.user_id,
                    contest_id: invitecode.contest_id
                }
            })

            if ((joincontest < 10) || (find)) {

                const alreadyjoined = await db.private_contest_join.findOne({
                    where: {
                        user_id: params.user_id,
                        contest_id: invitecode.contest_id
                    }
                })
                if (!alreadyjoined) {
                    const create = await db.private_contest_join.create({
                        contest_id: invitecode.contest_id,
                        user_contest_id: invitecode.id,
                        user_id: params.user_id,
                        host: false
                    })
                } else {
                    var detail = await db.contests.findOne({
                        where: {
                            id: invitecode.contest_id
                        },
                    })
                }
            } else {
                message = "contest is full please join new contest"
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            const contestdetail = await db.contests.findOne({
                where: {
                    id: invitecode.contest_id
                },
            })


            const Usercheck = await db.private_contest_join.findAll({
                attributes: ['id', 'host'],
                where: {
                    user_contest_id: invitecode.id,
                }, include: [{ model: db.User, attributes: ['firstName', 'lastName', 'profile_image'] }]
            })

            req.io.emit("private_user_details", Usercheck);


            message = "You are join game successfully"
            return res.send(response(contestdetail, message));

        } catch (error) {
            next(error)
        }
    },

    start_game: async (req, res, next) => {
        try {
            const params = req.body;

            const joinplayer = await db.private_contest_join.findAll({
                where: {
                    contest_id: params.contest_id,
                }
            })

            if (joinplayer.length >= 2) {

                var game = await db.contests.findOne({
                    attributes: ['id', 'random_id', 'category_id'],
                    where: {
                        id: params.contest_id,
                    }
                })

                const inviteupdate = await db.user_contests.update({
                    invite_code: 0
                },
                    {
                        where: {
                            contest_id: params.contest_id
                        }
                    })

                let game_data = {
                    'id': game.id,
                    'random_id': game.random_id,
                    'game_started': true,
                }
                req.io.emit('private_game_started', game_data);

            } else {
                throw "please join 2 players"
            }

            return res.send(response(game));

        } catch (error) {
            next(error)
            let game_data = {
                'game_started': false,
            }
            req.io.emit('private_game_started', game_data);
        }
    },
    //kyc//
    kyc_detail_add: async (req, res, next) => {
        try {
            
            const params = req.body;
            
            let file = req.file;
            params.is_verified = 1

            const user = await db.User.findOne({
                where: {
                    id:params.user_id
                }
            })
            
            //user check//
            const doc_check = await db.user_doc.findOne({
                where: {
                    user_id: params.user_id
                }
            })

            if (!doc_check) {
                let document_image = Object.assign(params, {
                    doc_image: file.path
                });
                const detail = await db.user_doc.create(document_image)
                //notification send to adming for kyc//
                const adminnotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 1,
                    title: "KYC Request",
                    notification: "user apply for kyc request please check",
                    extra_data: null,
                    status: 0
                });
                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "KYC Request",
                    notification: "Your Document successfully submited",
                    extra_data: null,
                    status: 0
                });
                var message = {
                    "token": user.device_token,
                    "notification": {
                      "title": "KYC Request",
                      "body": "Your Document successfully submited"
                    }
                  }
                  
                 firbase().send(message)
                    .then((response) => {
                      // Response is a message ID string.
                      console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      console.log('Error sending message:', error);
                    });
                message = "Your document is successfully submitted"
                return res.send(response({}, message));
            } else {
                let document_image = Object.assign(params, {
                    doc_image: file.path
                });

                const detailupdate = await db.user_doc.update(document_image, {
                    where: {
                        user_id: params.user_id
                    }
                })

                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "KYC Request",
                    notification: "Your Document successfully updated",
                    extra_data: null,
                    status: 0
                });
                var message = {
                    "token": user.device_token,
                    "notification": {
                      "title": "KYC Request",
                      "body": "Your Document successfully updated"
                    }
                  }
                  
                 firbase().send(message)
                    .then((response) => {
                      // Response is a message ID string.
                      console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      console.log('Error sending message:', error);
                    });
                message = "Your details is updated"
                return res.send(response({}, message));
            }
        } catch (error) {
            next(error)
        }
    },

    kyc_detail_verify: async (req, res, next) => {
        try {
            const id = req.user
            console.log('iddd=>>>>', id)
            const check = await db.user_doc.findOne({
                attributes: ["is_verified"],
                where: {
                    user_id: id.id,
                    // is_verified:1
                }
            })
            return res.send(response(check));
        } catch (error) {
            next(error)
        }
    },

    bankdetail_add: async (req, res, next) => {
        try {

            let params = req.body;
            const user = await db.User.findOne({
                where: {
                    id:params.user_id
                }
            })

            //user check//
            const doc_check = await db.bankdetails.findOne({
                where: {
                    user_id: params.user_id
                }
            })

            if (!doc_check) {
                if (params.account_number != params.re_account_number) {
                    throw 'account number and re-account number does not match'
                }
                const detail = await db.bankdetails.create(params)
                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "Bank Detail",
                    notification: "bank details are successfully submitted",
                    extra_data: null,
                    status: 0
                });
                var message = {
                    "token": user.device_token,
                    "notification": {
                      "title": "Bank Detail",
                      "body": "bank details are successfully submitted"
                    }
                  }
                  
                 firbase().send(message)
                    .then((response) => {
                      // Response is a message ID string.
                      console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      console.log('Error sending message:', error);
                    });
                message = "bank details are successfully submitted"
                return res.send(response(detail, message));
            } else {
                if (params.account_number != params.re_account_number) {
                    throw 'account number and re-account number does not match'
                }
                const detailupdate = await db.bankdetails.update(params, {
                    where: {
                        user_id: params.user_id
                    }
                })

                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "Bank Detail",
                    notification: "bank details are successfully updated",
                    extra_data: null,
                    status: 0
                });
                var message = {
                    "token": user.device_token,
                    "notification": {
                      "title": "Bank Detail",
                      "body": "bank details are successfully updated"
                    }
                  }
                  
                 firbase().send(message)
                    .then((response) => {
                      // Response is a message ID string.
                      console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                      console.log('Error sending message:', error);
                    });
                message = "your details is updated"
                return res.send(response(message));
            }

        } catch (error) {
            next(error)
        }
    },

    //Notification//
    user_notification: async (req, res, next) => {
        try {

            const params = req.body;

            const allnotification = await db.notifications.findAll({
                where: {
                    user_id: params.user_id
                }
            })

            const notificationseen = await db.notifications.update({
                status: 1
            }, {
                where: {
                    user_id: params.user_id
                }
            })

            return res.send(response(allnotification));

        } catch (error) {
            next(error)
        }
    }
}

function omitHash(user, token = "") {
    if (token) {
        user.token = token;
    }
    const {
        password,
        ...userWithoutHash
    } = user;
    return userWithoutHash;
}

var letters = 'abcdefghijklmnopqrstuvwxyz';
var numbers = '1234567890';
var charset = letters + letters.toUpperCase() + numbers;

function randomElement(array) {
    with (Math)
    return array[floor(random() * array.length)];
}
function randomString(length) {
    var R = '';
    for (var i = 0; i < length; i++)
        R += randomElement(charset);
    return R;
}
