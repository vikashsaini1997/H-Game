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
var jsSHA = require("jssha");
const axios = require('axios')
const { exec } = require('child_process');
const request = require('request');
const moment = require("moment")
const Razorpay = require("razorpay");
var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const crypto = require("crypto");
const shortid = require("shortid");
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const client = redis.createClient();
const firbase = require('../../service/firebase.service')

const { date } = require("joi");
const msg91 = new (require('msg91-v5'))("372052Apw7JNLDZ4c623873b4P1");
var nodemailer = require('nodemailer');
const { compareSync } = require("bcryptjs");
const Helper = require("../../helper/Helper");
const { constructOTPRequest } = require("msg91-v5/libs/sendOtp");


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
            console.log('testt', params)

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
                let message = "18 Plus must be required.";
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

            msg91.sendOTP(Checkvalue).then((success) => {
                console.log("SUCCESS !!!", success)
            }).catch((error) => {
                console.log("ERROR!!!", error)
            })

            await db.User.update({
                user,
                otp: otp,
                current_location: params.current_location
            }, {
                where: {
                    id: user.id
                }
            });

            let successMessage = "Please verify your OTP."
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

                    await db.User.update({
                        auth_token: token
                    }, {
                        where: {
                            email: params.email,
                        }
                    })

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
                    notification: "Congratulation you have got 50 rupess bonus amount",
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

            const user = await db.User.findOne({
                where: {
                    mob_no: params.mob_no,
                }
            })

            if (user) {
                let message = "Mobile Number already used";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            const user1 = await db.User.findOne({
                where: {
                    username: params.username
                }
            })
            if (user1) {
                let message = "Username already used";
                return res.status(400).json({ status: false, status_code: 400, message: message });
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


            //Contact Create Razorpay//

            const Username = await db.User.findOne({
                where: {
                    id: params.id
                }
            })

            var contactDetails = await axios.post(process.env.RAZORPAY_URL + '/contacts', { "name": Username.firstName, "email": Username.email }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET
                }
            })
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    return error;
                });

            //Contact Create Razorpay End//

            await db.User.update({
                mob_no: params.mob_no,
                username: params.username,
                otp: otp,
                contactId: contactDetails.id
            }, {
                where: {
                    id: params.id
                }
            });

            return res.send(response({}, "Please verify OTP"));
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

            const UserDetail = await db.User.findOne({
                where: {
                    mob_no: params.mob_no,
                    is_verify: null
                }
            })
            if (UserDetail) {
                var otp = Math.floor(100000 + Math.random() * 900000);
                params.otp = otp;

                //OTP Trigger
                const Checkvalue = {
                    template_id: "6241705da6cfa213936973d4",
                    mobile: 91 + params.mob_no,
                    authkey: "372052Apw7JNLDZ4c623873b4P1",
                    otp: otp,
                }

                msg91.sendOTP(Checkvalue).then((success) => {
                    console.log("SUCCESS !!!", success)
                }).catch((error) => {
                    console.log("ERROR!!!", error)
                })

                await db.User.update(params, {
                    where: {
                        mob_no: params.mob_no
                    }
                });
                let successMessage = "Please verify your OTP.";
                return res.send(response({}, successMessage))

            } else {

                if (
                    await db.User.findOne({
                        where: {
                            mob_no: params.mob_no,
                        },
                    })
                ) {
                    let message = "Mobile Number already registered";
                    return res.status(400).json({ status: false, status_code: 400, message: message });
                }

                if (
                    await db.User.findOne({
                        where: {
                            username: params.username,
                        },
                    })
                ) {
                    let message = "Username already registered!";
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

                msg91.sendOTP(Checkvalue).then((success) => {
                    console.log("SUCCESS !!!", success)
                }).catch((error) => {
                    console.log("ERROR!!!", error)
                })

                console.log(params);
                await db.User.create(params);
                let successMessage = "Please verify your OTP.";
                return res.send(response({}, successMessage))
            }
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

            if (!user) {
                let message = "Account doesn't exist.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            if (user.otp != params.otp) {
                let message = "Invalid OTP. Please try again.";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            params.otp = 0;
            if (params.isSignup) {
                params.bonus_amount = 50
                // Object.assign(user, params);
                // await user.save();

                const usernotification = await db.notifications.create({
                    user_id: user.id,
                    notification_type: 2,
                    title: "Bonus amount",
                    notification: "Congratulation you have got 50 rupess bonus amount",
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
                if (user.device_token) {
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

                var contactDetails = await axios.post(process.env.RAZORPAY_URL + '/contacts', { "name": user.firstName, "email": user.email }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: process.env.RAZORPAY_KEY_ID,
                        password: process.env.RAZORPAY_KEY_SECRET
                    }
                })
                    .then(function (response) {
                        return response.data;
                    })
                    .catch(function (error) {
                        return error;
                    });


                const update = await db.User.update({
                    otp: 0,
                    bonus_amount: 50,
                    status: 1,
                    is_verify: true,
                    contactId: contactDetails.id
                }, {
                    where: {
                        mob_no: user.mob_no
                    },
                })


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

                await db.User.update({
                    auth_token: data.token
                }, {
                    where: {
                        id: user.id,
                    }
                })

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
                throw "Account doesn't exist."
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

            return res.send(response({}, "OTP has been resend successfully on your mobile number."));
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
            const data = await db.state.findAll({
                where: {
                    status: 1
                }
            });

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
                    status: ['1', '0'],
                    contest_type: '0',
                },
                include: [db.category],
                order: [
                    ['entry_fee', 'ASC'],
                ]
            });
            var Storedata = [];
            data.forEach(function (item) {
                var Timervalue = item.end_time - Math.floor(new Date().getTime() / 1000);
                Storedata.push({
                    'id': item.id,
                    'category_id': item.category_id,
                    'random_id': item.random_id,
                    'contest_type': item.contest_type,
                    'admin_comission': item.admin_comission,
                    'winning_amount': item.winning_amount,
                    'contest_size': item.contest_size,
                    'entry_fee': item.entry_fee,
                    'waiting_time': Timervalue,
                    'status': item.status,
                    'waiting': Timervalue,
                    'end_time': item.end_time,
                });
            });
            return res.send(response(Storedata));
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

            const fetchNumber = Helper.Game_rule_data(data.entry_fee);

            await db.contests.update({
                game_rule_number: fetchNumber
            }, {
                where: {
                    id: id
                }
            })

            let contest_data = {
                waiting: data.end_time - Math.floor(new Date().getTime() / 1000),
                category_id: data.category_id,
                contest_size: data.contest_size,
                entry_fee: data.entry_fee,
                id: data.id,
                random_id: data.random_id,
                status: data.status,
                waiting_time: data.waiting_time,
                winning_amount: data.winning_amount
            }

            return res.send(response(contest_data));
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
            return res.send(response(data, "CMS list view"));

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
            let successMessage = "Updated successfully";
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
            let successMessage = "Message submitted successfully";
            return res.send(response(data, successMessage))

        } catch (error) {
            next(error)
        }

    },

    ticket_buy: async (req, res, next) => {
        try {

            // var date = new Date();
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
                    status: "1",
                },
                include: [db.category],
            });

            const contestListEmitKey = "contest_list_emit_" + params.category_id
            req.io.emit(contestListEmitKey, contest_list_data);

            console.log("contest_list_data", contest_list_data)

            const contest_buy_details = await db.contests.findAll({
                where: {
                    id: params.contest_id,
                }
            });

            const contestDetailUpdateKey = "game_buy_request_" + params.contest_id
            req.io.emit(contestDetailUpdateKey, contest_buy_details);

            //Ticket pruchased transction create // 

            var dateUTC = new Date();
            var dateUTC = dateUTC.getTime()
            var dateIST = new Date(dateUTC);
            //date shifting for IST timezone (+5 hours and 30 minutes)
            dateIST.setHours(dateIST.getHours() + 5);
            dateIST.setMinutes(dateIST.getMinutes() + 30);

            var time = dateIST.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            await db.transactions.create({
                txn_amount: params.total_amount,
                added_type: process.env.TICKET_BUY,
                status: process.env.SUCCESS,
                user_id: params.user_id,
                message_type: "ticket purchased",
                local_txn_id: 'TP' + new Date().valueOf() + params.user_id,
                gateway_name: "Wallet",
                txn_date: moment().format("DD MMM YYYY"),
                txn_time: time,
                payout_status: "",
            })

            //Ticket pruchased transction create end //

            return res.send(response(data, 'Thank you for purchase ticket'));

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
                attributes: ['category_id', 'winning_amount', 'contest_size', 'waiting_time', 'end_time', 'game_rule_number'],
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
                attributes: ['winning_amount', 'contest_size', 'waiting_time', 'game_rule_number'],
                where: {
                    id: params.contest_id,
                }
            });

            const gameBoardDetailKey = "game_buy_details_" + params.contest_id
            req.io.emit(gameBoardDetailKey, contest_buy_details);

            // Time update join contest//
            var vauess = await db.join_contest_details.update({
                time: new Date()
            }, {
                where: {
                    contest_id: params.contest_id,
                }
            })
            //Time update join contest end//

            // Game addition number and subtration number check
            var gameNumbercheck = categroyIdGet.game_rule_number.split("");;
            var addition = gameNumbercheck[0];
            var NumberValueGame = gameNumbercheck[1];

            var Getdatas = {
                categroy_id: categroyIdGet.category_id,
                winning_amount: categroyIdGet.winning_amount,
                contest_size: categroyIdGet.contest_size,
                //waiting_time: categroyIdGet.waiting_time,
                game_symbol: addition,
                game_number: NumberValueGame,
                waiting: categroyIdGet.end_time - Math.floor(new Date().getTime() / 1000),
                gameticket
            }
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

            let contest_id = ticket.join_contest_detail.contest.id.toString();
            await client.set("eg" + contest_id, "1");
            const value = await client.get(contest_id);

            await client.set("userid_const_win" + contest_id, userId);

            await db.contests.update({
                announced_numbers: value
            }, {
                where: {
                    id: ticket.join_contest_detail.contest.id,
                }
            })



            var ticketDetails = JSON.parse(ticket.details);


            var arrayValue = [];
            ticketDetails.numbers.map(item => {
                item.map(value => {
                    arrayValue.push(value.value)
                })
            })

            //console.log('asfasdf',arrayValue)

            var TicketData = params.details;

            var detaislarry = []
            TicketData.numbers.map(item => {
                item.map(value => {
                    detaislarry.push(value.value)
                })
            })

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

                    var FullticketFilter = ticketArrMerge.filter(value => value.clickable === true)

                    var Checkticket = [];
                    FullticketFilter.map(item => {
                        Checkticket.push(item.value);
                    })

                    let contest_id = ticket.join_contest_detail.contest.id.toString();
                    const value = await client.get(contest_id);
                    var Announced_numbers = value;

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
                                id: ticket.join_contest_id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.User.update({
                            winning_balance: ticket.join_contest_detail.contest.winning_amount
                        }, {
                            where: {
                                id: ticket.join_contest_detail.user_id,
                            }
                        })

                        //Winner Amount transction create // 

                        await db.transactions.create({
                            txn_amount: ticket.join_contest_detail.contest.winning_amount,
                            added_type: process.env.WINNER_AMOUNT,
                            status: process.env.SUCCESS,
                            user_id: ticket.join_contest_detail.user_id,
                            message_type: "Winner Amount",
                            local_txn_id: 'WA' + new Date().valueOf() + ticket.join_contest_detail.user_id,
                            gateway_name: "Houise",
                            txn_date: moment().format("DD MMM YYYY"),
                            txn_time: moment().format('LT'),
                            payout_status: "",
                        })

                        //Winner Amount transction create end //

                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "you are winner"
                        }
                    } else {
                        message = "Number Are not match";
                    }

                } else if (CategroyId.id === 2) {
                    var ticketArrMerge = TicketData.numbers.flat()
                    var FullticketFilter = ticketArrMerge.filter(value => value.clickable === true && value.value !== 0)

                    var Checkticket = [];
                    FullticketFilter.map(item => {
                        Checkticket.push(item.value);
                    })


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
                                id: ticket.join_contest_id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.User.update({
                            winning_balance: ticket.join_contest_detail.contest.winning_amount
                        }, {
                            where: {
                                id: ticket.join_contest_detail.user_id,
                            }
                        })

                        //Winner Amount transction create // 

                        await db.transactions.create({
                            txn_amount: ticket.join_contest_detail.contest.winning_amount,
                            added_type: process.env.WINNER_AMOUNT,
                            status: process.env.SUCCESS,
                            user_id: ticket.join_contest_detail.user_id,
                            message_type: "Winner Amount",
                            local_txn_id: 'WA' + new Date().valueOf() + ticket.join_contest_detail.user_id,
                            gateway_name: "Houise",
                            txn_date: moment().format("DD MMM YYYY"),
                            txn_time: moment().format('LT'),
                            payout_status: "",
                        })

                        //Winner Amount transction create end //

                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "Number Are not match";
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
                                id: ticket.join_contest_id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.User.update({
                            winning_balance: ticket.join_contest_detail.contest.winning_amount
                        }, {
                            where: {
                                id: ticket.join_contest_detail.user_id,
                            }
                        })
                        //Winner Amount transction create // 

                        await db.transactions.create({
                            txn_amount: ticket.join_contest_detail.contest.winning_amount,
                            added_type: process.env.WINNER_AMOUNT,
                            status: process.env.SUCCESS,
                            user_id: ticket.join_contest_detail.user_id,
                            message_type: "Winner Amount",
                            local_txn_id: 'WA' + new Date().valueOf() + ticket.join_contest_detail.user_id,
                            gateway_name: "Houise",
                            txn_date: moment().format("DD MMM YYYY"),
                            txn_time: moment().format('LT'),
                            payout_status: "",
                        })

                        //Winner Amount transction create end //

                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "Number Are not match";
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
                                id: ticket.join_contest_id,
                            }
                        })

                        await db.contests.update({
                            status: "3",
                        }, {
                            where: {
                                id: ticket.join_contest_detail.contest.id,
                            }
                        })

                        await db.User.update({
                            winning_balance: ticket.join_contest_detail.contest.winning_amount
                        }, {
                            where: {
                                id: ticket.join_contest_detail.user_id,
                            }
                        })

                        //Winner Amount transction create // 

                        var dateUTC = new Date();
                        var dateUTC = dateUTC.getTime()
                        var dateIST = new Date(dateUTC);
                        //date shifting for IST timezone (+5 hours and 30 minutes)
                        dateIST.setHours(dateIST.getHours() + 5);
                        dateIST.setMinutes(dateIST.getMinutes() + 30);

                        var time = dateIST.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

                        await db.transactions.create({
                            txn_amount: ticket.join_contest_detail.contest.winning_amount,
                            added_type: process.env.WINNER_AMOUNT,
                            status: process.env.SUCCESS,
                            user_id: ticket.join_contest_detail.user_id,
                            message_type: "Winner Amount",
                            local_txn_id: 'WA' + new Date().valueOf() + ticket.join_contest_detail.user_id,
                            gateway_name: "Houise",
                            txn_date: moment().format("DD MMM YYYY"),
                            txn_time: time,
                            payout_status: "",
                        })

                        //Winner Amount transction create end //

                        message = {
                            'ticket_id': params.ticket_id,
                            'id': ticketDetails.id,
                            'winner': "your are winner"
                        }
                    } else {
                        message = "Number Are not match";
                    }

                }
            } else {
                message = "Ticket number are not match";
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
            var id = req.user.id;
            const data = await db.User.findOne({
                where: {
                    id: id,
                }
            });

            if (data.winning_balance == null) {
                data.winning_balance = 0;
            }
            if (data.cash_balance == null) {
                data.cash_balance = 0;
            }



            var bonus_am = parseInt(data.bonus_amount);
            var cash_am = parseInt(data.cash_balance);
            var winning_am = parseInt(data.winning_balance);


            var walletamount = bonus_am + cash_am + winning_am;

            const balance = { walletamount }

            return res.send(response(balance, "Wallet balance"));

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
                    entry_fee: {
                        [Op.between]: [10, 1000]
                    }
                },
                group: 'entry_fee',

                order: [
                    ['entry_fee', 'ASC'],
                ]
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
                waiting_time: Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000) + 100,
                status: "1",
                contest_type: 1,
                end_time: (Math.floor(new Date().getTime() / 1000) + 100)
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

            const privateContestUserKey = "private_user_details_" + contestId
            req.io.emit(privateContestUserKey, Usercheck);



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
                message = "Contest is full please join new contest"
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
            const privateContestUserKey = "private_user_details_" + contestdetail.id
            req.io.emit(privateContestUserKey, Usercheck);


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

                const privateGameStartKey = "private_game_started_" + game.id
                req.io.emit(privateGameStartKey, game_data);

            } else {
                let message = "Please join 2 players"
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            return res.send(response(game));

        } catch (error) {
            next(error)
            let game_data = {
                'game_started': false,
            }
            const privateGameStartKey = "private_game_started" + game.id
            req.io.emit(privateGameStartKey, game_data);
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
                    id: params.user_id
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
                    notification: "User apply for kyc request please check",
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

                if (user.device_token) {
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
                }
                message = "Your document is successfully submitted"
                return res.send(response({}, message));
            } else {

                var deletealready_docs = await db.user_doc.destroy({
                    where: {
                        user_id: params.user_id
                    }
                })

                let document_image = Object.assign(params, {
                    doc_image: file.path
                });

                const detailupdate = await db.user_doc.create(document_image)


                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "KYC Request",
                    notification: "Your Document successfully updated",
                    extra_data: null,
                    status: 0
                });

                if (user.device_token) {
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
                }
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

            const check = await db.user_doc.findOne({
                attributes: ["is_verified"],
                where: {
                    user_id: id.id,
                    // is_verified:1
                },
                include: {
                    model: db.bankdetails,
                    attributes: ['bank_name']
                }
            })
            console.log(check)

            var data = {
                is_verified: check !== null ? check.is_verified : 0,
                bank_name: check !== null && check.bankdetail !== null ? check.bankdetail.bank_name : null
            }

            return res.send(response(data));
        } catch (error) {
            next(error)
        }
    },

    bankdetail_add: async (req, res, next) => {
        try {

            let params = req.body;
            const user = await db.User.findOne({
                where: {
                    id: params.user_id
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
                    throw 'Account number and re-account number does not match'
                }
                const detail = await db.bankdetails.create(params)
                const usernotification = await db.notifications.create({
                    user_id: params.user_id,
                    notification_type: 2,
                    title: "Bank Detail",
                    notification: "Bank details are successfully submitted",
                    extra_data: null,
                    status: 0
                });

                if (user.device_token) {
                    var message = {
                        "token": user.device_token,
                        "notification": {
                            "title": "Bank Detail",
                            "body": "Bank details are successfully submitted"
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
                var fundAccountDetails = await axios.post(process.env.RAZORPAY_URL + '/fund_accounts', { "contact_id": user.contactId, "account_type": "bank_account", "bank_account": { "name": params.account_holder_name, "ifsc": params.ifsc_code, "account_number": params.account_number } }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: process.env.RAZORPAY_KEY_ID,
                        password: process.env.RAZORPAY_KEY_SECRET
                    }
                })
                    .then(function (response) {
                        return response.data;
                    })
                    .catch(function (error) {
                        return error.data;
                    });

                await db.User.update({
                    fundaccountid: fundAccountDetails.id,
                },
                    {
                        where: {
                            id: params.user_id
                        }
                    })
                message = "Bank details are successfully submitted"
                return res.send(response(detail, message));
            } else {
                if (params.account_number != params.re_account_number) {
                    throw 'Account number and re-account number does not match'
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
                    notification: "Bank details are successfully updated",
                    extra_data: null,
                    status: 0
                });
                if (user.device_token) {
                    var message = {
                        "token": user.device_token,
                        "notification": {
                            "title": "Bank Detail",
                            "body": "Bank details are successfully updated"
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

                var fundAccountDetails = await axios.post(process.env.RAZORPAY_URL + '/fund_accounts', { "contact_id": user.contactId, "account_type": "bank_account", "bank_account": { "name": params.account_holder_name, "ifsc": params.ifsc_code, "account_number": params.account_number } }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: process.env.RAZORPAY_KEY_ID,
                        password: process.env.RAZORPAY_KEY_SECRET
                    }
                })
                    .then(function (response) {
                        console.log(response);
                        return response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        return error.data;
                    });

                await db.User.update({
                    fundaccountid: fundAccountDetails.id,
                },
                    {
                        where: {
                            id: params.user_id
                        }
                    })

                console.log('testdas', fundAccountDetails)
                message = "your details is updated"
                return res.send(response({}, message));
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
                    user_id: params.user_id,
                    notification_type: 2
                },
                order: [
                    ['updatedAt', 'DESC'],
                    ['createdAt', 'DESC']
                ]
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
    },

    paymentGetway: async (req, res, next) => {
        try {
            const params = req.body;
            const payment_capture = 1;
            const amount = params.amount * 100;
            const currency = "INR";

            const options = {
                amount,
                currency,
                receipt: shortid.generate(),
                payment_capture,
            };

            const paymentresponse = await razorpay.orders.create(options);
            console.log(paymentresponse)
            const AllData = {
                id: paymentresponse.id,
                currency: paymentresponse.currency,
                amount: paymentresponse.amount,
            }
            console.log('sfasfafasdf', AllData)
            return res.send(response(AllData));
            // res.status(200).json({
            //     id: response.id,
            //     currency: response.currency,
            //     amount: response.amount,
            // });


        } catch (error) {
            next(error)
        }
    },

    paymentSuccess: async (req, res, next) => {
        try {
            const params = req.body;
            const user_id = req.user.id;

            var generated_signature = params.txn_id + "|" + params.payment_id;

            const experted_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(generated_signature.toString()).digest('hex');

            var Message_type = "Cash Deposit";

            var dateUTC = new Date();
            var dateUTC = dateUTC.getTime()
            var dateIST = new Date(dateUTC);
            //date shifting for IST timezone (+5 hours and 30 minutes)
            dateIST.setHours(dateIST.getHours() + 5);
            dateIST.setMinutes(dateIST.getMinutes() + 30);

            var time = dateIST.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

            if (experted_signature == params.signature) {
                const check = await db.transactions.create({
                    user_id: user_id,
                    txn_id: params.txn_id,
                    txn_date: moment().format("DD MMM YYYY"),
                    txn_time: time,
                    txn_amount: params.txn_amount,
                    added_type: params.added_type,
                    status: params.status,
                    message_type: Message_type,
                    payout_status: "",
                    local_txn_id: 'CD' + new Date().valueOf() + user_id,
                })

                var cash_bal = await db.User.findOne({
                    where: {
                        id: user_id
                    }
                })
                if (cash_bal.cash_balance == null) {
                    cash_bal.cash_balance = 0;
                }
                var cash_bal_update = await db.User.update({
                    cash_balance: parseInt(cash_bal.cash_balance) + parseInt(params.txn_amount)
                }, {
                    where: {
                        id: user_id
                    }
                })

                var message = "Payment has been verified";
                return res.status(200).json({ status: true, status_code: 200, message: message });
            } else {
                var message = "Payment verification failed";
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }

            // return res.send(response(message));

        } catch (error) {
            next(error)
        }
    },

    payment_withdrawal: async (req, res, next) => {
        try {
            const params = req.body;
            const user_id = req.user.id;


            var Userbalancecheck = await db.User.findOne({
                where: {
                    id: user_id
                }
            })

            if (Userbalancecheck.winning_balance == null) {
                Userbalancecheck.winning_balance = 0;
            }
            if (Userbalancecheck.cash_balance == null) {
                Userbalancecheck.cash_balance = 0;
            }
            if (Userbalancecheck.bonus_amount == null) {
                Userbalancecheck.bonus_amount = 0;
            }

            var bonus_am = parseInt(Userbalancecheck.bonus_amount);
            var cash_am = parseInt(Userbalancecheck.cash_balance);
            var winning_am = parseInt(Userbalancecheck.winning_balance);

            var walletamount = bonus_am + cash_am + winning_am;

            var saveData = [];
            if (walletamount >= 100) {
                if (Userbalancecheck) {
                    var usableBonusAmount = parseInt(Userbalancecheck.bonus_amount) - 30;
                    var usableCashAmount = parseInt(Userbalancecheck.cash_balance);
                    var usableWinningAmount = parseInt(Userbalancecheck.winning_balance);

                    if (usableBonusAmount && usableBonusAmount >= params.amount) {
                        saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - params.amount;

                    } else if ((usableCashAmount + usableBonusAmount) >= params.amount) {
                        saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - usableBonusAmount;
                        saveData['cash_balance'] = parseInt(Userbalancecheck.cash_balance) - (params.amount - usableBonusAmount);

                    } else if ((usableCashAmount + usableBonusAmount + usableWinningAmount) >= params.amount) {
                        saveData['bonus_amount'] = parseInt(Userbalancecheck.bonus_amount) - usableBonusAmount;
                        saveData['cash_balance'] = 0;
                        saveData['winning_balance'] = parseInt(Userbalancecheck.winning_balance) - (params.amount - usableBonusAmount - usableCashAmount);

                    } else {
                        var message = "You didn't have sufficient balance for withdrawal.";
                        return res.status(400).json({ status: false, status_code: 400, message: message });
                    }
                }
                var dateUTC = new Date();
                var dateUTC = dateUTC.getTime()
                var dateIST = new Date(dateUTC);
                //date shifting for IST timezone (+5 hours and 30 minutes)
                dateIST.setHours(dateIST.getHours() + 5);
                dateIST.setMinutes(dateIST.getMinutes() + 30);

                var time = dateIST.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

                await db.transactions.create({
                    txn_amount: params.amount,
                    added_type: process.env.WITHDRAWL_REQUEST,
                    status: process.env.PENDING,
                    user_id: user_id,
                    message_type: "Cash Withdrawal",
                    txn_date: moment().format("DD MMM YYYY"),
                    txn_time: time,
                    local_txn_id: 'WD' + new Date().valueOf() + user_id,
                    payout_status: ""
                })

                await db.User.update(saveData, {
                    where: {
                        id: user_id
                    }
                })

                var message = "Withdrawal request send";
                return res.send(response({}, message));
            }
            else {
                let message = "Your Wallet balance is low minimum 100 rs wallet balance required. Excluding 30 rs minimum walet balance"
                return res.status(400).json({ status: false, status_code: 400, message: message });
            }
        } catch (error) {
            next(error)
        }
    },

    withdrawal_status: async (req, res, next) => {
        try {
            const params = req.body;
            console.log('ravi->>>>', params)

            //console.log('Paramsssss->>>>',params.payload.payout.entity)

            /* if(params.status == "processed"){
                var status=process.env.SUCCESS;
            }else if(params.status == "cancelled" || params.status == "rejected"){
               var status=process.env.CANCEL;
            }*/

            if (params.event == "payout.processed") {
                await db.transactions.update({
                    payout_response: JSON.stringify(params.payload.payout.entity)
                }, {
                    where: {
                        txn_id: params.payload.payout.entity.id,
                    }
                })

                await db.transactions.update({
                    payout_status: process.env.SUCCESS,
                }, {
                    where: {
                        txn_id: params.payload.payout.entity.id,
                    }
                })
            } else if (params.event == "payout.updated") {
                await db.transactions.update({
                    payout_response: JSON.stringify(params.payload.payout.entity)
                }, {
                    where: {
                        txn_id: params.payload.payout.entity.id,
                    }
                })

                await db.transactions.update({
                    payout_status: process.env.CANCEL,
                }, {
                    where: {
                        txn_id: params.payload.payout.entity.id,
                    }
                })
            }

            var message = "Successfully withdrawal status update";
            return res.send(response(message));

        } catch (error) {
            next(error)
        }
    },

    transaction_history: async (req, res, next) => {
        try {
            var id = req.user.id;

            var transaction_details = await db.transactions.findAll({
                where: {
                    user_id: id,
                },
                order: [
                    ['updatedAt', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });

            var walletbalance = await db.User.findOne({
                attributes: ['cash_balance', 'bonus_amount', 'winning_balance'],
                where: {
                    id: id
                },
            })

            if (walletbalance.winning_balance == null) {
                walletbalance.winning_balance = 0;
            }
            if (walletbalance.cash_balance == null) {
                walletbalance.cash_balance = 0;
            }
            if (walletbalance.bonus_amount == null) {
                walletbalance.bonus_amount = 0;
            }

            var bonus_am = parseInt(walletbalance.bonus_amount);
            var cash_am = parseInt(walletbalance.cash_balance);
            var winning_am = parseInt(walletbalance.winning_balance);

            var totalwallet_balance = bonus_am + cash_am + winning_am

            let data = { totalwallet_balance, transaction_details }
            return res.send(response(data));

        } catch (error) {
            next(error)
        }
    },
    refund: async (req, res, next) => {
        try {
            const params = req.body;

            var contactDetails = await axios.post(' https://api.razorpay.com/v1/payments/' + params.paymentId + '/refund', { "amount": params.amount }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: 'rzp_test_aow5hcPWoAgE9S',
                    password: 'CFIxT8oNIkL5QiihV8VBxs8C'
                }
            })
            return res.send(response(contactDetails.data));

        } catch (error) {
            console.error(error)
            next(error)
        }
    },

    //Migrate run//

    migrate_run: async (req, res, next) => {
        await new Promise((resolve, reject) => {
            exec('npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all', function (err, stdout, stderr) {
                if (!err) {
                    res.json({ 'Message': "Successfully Migrate run", 'results': stdout.split('\n') })
                }
            });

            /* const migrate = exec(
              'npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all',
              err => (err ? reject(err): resolve())
            );
            migrate.stdout.pipe(process.stdout);
            migrate.stderr.pipe(process.stderr);*/
        });

    },
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

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ampm;
    return strTime;
}

function changeTimezone(date, Asia) {

    // suppose the date is 12:00 UTC
    var invdate = new Date(date.toLocaleString('en-US', {
        timeZone: Asia
    }));

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime();

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff); // needs to substract

}
