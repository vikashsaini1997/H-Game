const config = require("../../config/config.json");
const express = require("express");
const sequelize = require('sequelize');
const jwt = require("jsonwebtoken");
const response = require("../../helper/response");
const randtoken = require("rand-token");
var nodemailer = require('nodemailer')
const path = require('path')
const moment = require('moment');
const axios = require('axios');
const Op = require('sequelize').Op;
const excelJS = require('exceljs')


const firbase = require('../../service/firebase.service')


let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME, // generated ethereal user
    pass: process.env.MAIL_PASSWORD, // generated ethereal passwor
  },
});



const db = require("../../models");
const user = require("../../models/user");
const categroy = require("../../models/category");
const notification = require("../../models/notifications")
const helpdesk = require("../../models/helpdesk")
const bcrypt = require("bcryptjs");


const { where, DATE, and } = require("sequelize");
const { status, type } = require("express/lib/response");
const salt = bcrypt.genSalt(10);


module.exports = {
  Login: async (req, res, next) => {
    try {
      const params = req.body

      const user = await db.User.findOne({
        where: {
          email: params.email,
          status: "1"
        }
      });
      if (!user) {
        throw "Invalid email";
      }

      if (!user || !(await bcrypt.compare(params.password, user.password)))
        throw "Password is incorrect.";


      if (user.role_id == "1") {
        // authentication successful
        const token = jwt.sign({
          sub: user.id,
          role_id: user.id
        }, config.secret, {
          expiresIn: '1d'
        });

        message = "You are logged in successfully."
        let data = {
          ...omitHash(user.get()),
          token

        }
        return res.send(response(data, message));
      } else if (user.role_id == "2") {
        // authentication successful
        const token = jwt.sign({
          sub: user.id,
          role_id: user.id
        }, config.secret, {
          expiresIn: '1d'
        });

        message = "You are logged in successfully."
        let data = {
          ...omitHash(user.get()),
          token

        }
        return res.send(response(data, message));
      }
    } catch (error) {
      console.log(error)
      next(error);
    }
  },
  resetpassword: async (req, res, next) => {
    try {
      const params = req.body
      const user = await db.User.findOne({
        where: {
          email: params.email,
        }
      });
      if (!user)
        throw "Invalid email"

      var token = randtoken.generate(25);
      const test = await transporter.sendMail({
        from: 'housie.live@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: "Hello", // Subject line
        text: "Hello world", // plain text body
        html: '<a href="http://admin.housie.live/create-new-password?token=' + token + '">click on link for rest password</a>'
      })
      await db.User.update({
        token: token
      },
        {
          where: {
            email: params.email,
          }
        });

      var message = "Success";
      return res.send(response(token, message));
    } catch (error) {
      next(error)
    }
  },
  updatepassword: async (req, res, next) => {
    try {
      params = req.body
      token = req.body.token
      const user = await db.User.findOne({
        where: {
          token: req.body.token
        }
      })
      if (!user) {
        throw "Link expired resend again"
      }

      if (params.password != params.confirm_password) {
        throw 'Password and confirm password does not match'
      }

      params.password = await bcrypt.hash(params.password, 10);

      await db.User.update({
        password: params.password,
        token: ""
      }, {
        where: {
          token: token,
        }
      });
      var message = "Password updated"
      var data = ""
      return res.send(response(data, message));
    } catch (error) {
      next(error)
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const { id } = req.user;
      const params = req.body;



      const user = await db.User.findOne({
        where: {
          id: req.user.id
        }
      })
      if (!user)
        throw "Account doesn't exist.";

      if (!(await bcrypt.compare(params.current_password, user.password)))
        throw 'Current password is incorrect.';

      params.password = await bcrypt.hash(params.password, 10);

      Object.assign(user, params);
      await user.save();
      return res.send(response({}, "Password changed successfully."));
    } catch (error) {
      next(error)

    }
  },
  adminprofileshow: async (req, res, next) => {
    try {

      const id = req.user

      var data = await db.User.findOne({

        where: {
          id: req.user.id
        }
      })

      return res.send(response(data));

    } catch (error) {
      next(error)
    }

  },
  adminprofileupdate: async (req, res, next) => {
    try {

      const params = req.body;
      console.log(params);
      let file = req.file

      console.log(file)

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

      await db.User.update(params, {
        where: {
          id: params.id
        }
      });

      var save = await db.User.findOne({
        where: {
          id: req.user.id
        }
      });
      return res.send(response(save, "Profile updated successfully.")
      );

    } catch (error) {
      next(error)
    }

  },
  logout: async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
      if (logout) {
        res.send({ msg: 'You have been Logged Out' });
      } else {
        res.send({ msg: 'Error' });
      }
    });
  },
  dashboard: async (req, res, next) => {
    try {

      const TODAY_START = moment().format('YYYY-MM-DD 00:00');
      const NOW = moment().format('YYYY-MM-DD 23:59');
      const op = sequelize.Op;

      const detail = await db.User.findAll({
        where: {
          role_id: 3
        }
      })

      const cont = await db.contests.findAll({
        where: {
          createdAt: {
            [op.between]: [TODAY_START, NOW]
          }
        }
      })



      const today = await db.User.findAll({

        where: {
          status: 1,
          role_id: 3,
          createdAt: {
            [op.between]: [TODAY_START, NOW]
          }
        }
      });

      const activeuser = await db.User.findAll({
        where: {
          status: 1,
          last_login: 1,
          role_id: 3,
          createdAt: {
            [op.between]: [TODAY_START, NOW]
          }
        }
      });

      const winnercount = await db.join_contest_details.findAll({
        where: {
          win_status: 1,
          createdAt: {
            [op.between]: [TODAY_START, NOW]
          }
        }
      });

      count = {
        user: detail.length,
        contests: cont.length,
        newuser: today.length,
        activeuser: activeuser.length,
        totalwiner: winnercount.length,
      }
      return res.send(count)

    } catch (error) {
      console.log(error)
      next(error)
    }
  },
  //User//
  state: async (req, res, next) => {
    try {
      const data = await db.state.findAll();

      return res.send(response(data));
    } catch (error) {
      next(error)
    }
  },
  stateupdate: async (req, res, next) => {
    try {
      const params = req.body;

      const list = await db.state.findAll()
      
      list.forEach(async(dbvalue) => {
            await db.state.update({
              status: 0,
            }, {
              where: {
                id: dbvalue.dataValues.id
              }
            })
      });
   
      const states = await db.state.update({
        status: 1,
      }, {
        where: {
          id: params.id
        }
      })

      return res.send(response({}, "Your detail succesfully updated"));
    } catch (error) {
      next(error)
    }
  },
  userlist: async (req, res, next) => {
    try {
      const data = await db.User.findAll({
        where: {
          role_id: "3",
          is_verify: 1
        },
        include: db.user_doc
      });
      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },
  usershowedit: async (req, res, next) => {
    try {
      const userId = req.params.id
      const data = await db.User.findOne({
        where: {
          id: userId,
          role_id: "3"
        }, include: [db.state, db.user_doc, db.bankdetails],

      });
      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },

  usereditprofile: async (req, res, next) => {
    try {
      const params = req.body

      const data = Object.assign(params)
      const profile = await db.User.update(data,
        {
          where: {
            id: params.id
          }
        });
      return res.send(response("Profile updated successfully."));

    } catch (error) {
      next(error)
    }
  },
  blockuser: async (req, res, next) => {
    try {
      const params = req.body
      const id = req.user
      if (params.status == 1) {
        var status1 = 1;
      } else if (params.status == 0) {
        var status1 = 0;
      }
      const test = await db.User.update({
        status: status1
      },
        {
          where: {
            id: params.id
          }
        })

      return res.send(response("Updated"));
    } catch (error) {
      next(error)
    }
  },
  //Categroy///
  categroylist: async (req, res, next) => {
    try {
      const data = await db.category.findAll();

      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },
  categoryview: async (req, res, next) => {
    try {
      const categoryId = req.params.id
      const params = req.body


      var category = await db.category.findOne({
        where: {
          id: categoryId,
        }
      })

      if (req.body.edit == true) {

        return res.send(response(category));
      } else {
        // let groupcount = 10
        // let offset = 0 + (req.body.page_no - 1) * groupcount

        const { startedDate, endDate } = req.body;
        const Op = sequelize.Op;

        var public_contest = await db.contests.findAll({
          // groupcount: groupcount,
          // offset: offset,
          attributes: [
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("winning_amount"), 'integer')), "total_winning_amount"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
            [sequelize.fn("COUNT", sequelize.col("id")), "contest_count"], 'id', 'entry_fee', 'contest_type',
          ],
          where: {
            category_id: categoryId,
            contest_type: 0,
            createdAt: {
              [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
            }
          },
          group: ['entry_fee']
        });


        var private_contest = await db.contests.findAll({
          attributes: [
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("winning_amount"), 'integer')), "total_winning_amount"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
            [sequelize.fn("COUNT", sequelize.col("id")), "contest_count"], 'id', 'entry_fee', 'contest_type',
          ],
          where: {
            category_id: categoryId,
            contest_type: 1,
            createdAt: {
              [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
            }
          },
          group: ['entry_fee']
        });

        var total_commission_players = await db.contests.findAll({
          attributes: [
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
          ],
          where: {
            category_id: categoryId,
            createdAt: {
              [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
            }
          },
        });

        var data = { category, total_commission_players, public_contest, private_contest }

        return res.send(response(data));
      }
    } catch (error) {
      next(error);
    }
  },
  categoryupdate: async (req, res, next) => {
    try {
      const params = req.body
      const id = req.body
      const data = Object.assign(params)
      const data1 = await db.category.update(data, {
        where: {
          id: id.id,
        }
      });
      return res.send(response("Category list updated"));
    } catch (error) {
      next(error)
    }
  },
  //CMS page//
  cmslist: async (req, res, next) => {
    try {
      const data = await db.cms.findAll({
      });
      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },
  cmsview: async (req, res, next) => {
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
  cmsviewedit: async (req, res, next) => {
    try {
      const params = req.body
      const id = req.body
      const cmslist = Object.assign(params)
      const data1 = await db.cms.update(cmslist, {
        where: {
          id: id.id,
        }
      });
      return res.send(response(cmslist, "CMS list updated"));

    } catch (error) {
      next(error)
    }
  },
  //subadmin//
  createsubadmin: async (req, res, next) => {
    try {
      const params = req.body;
      params.firstName = params.firstName;
      params.lastName = params.lastName;
      params.email = params.email;
      params.mob_no = params.mob_no;
      params.dob = params.dob;
      params.state_id = params.state_id;
      params.role_id = "2";
      params.status = "1";
      params.dob = params.dob;
      params.state_id = params.state_id;
      params.password = await bcrypt.hash(params.password, 10);
      params.username = params.username;
      params.access_modules = JSON.stringify(params.access_modules);

      console.log(params.access_modules);
      if (await db.User.findOne({
        where: {
          email: params.email,


        }
      })) {
        throw "Email already registered"
      }


      const test = await db.User.create(params);
      return res.send(response(test, "Sub admin created please login "));
    } catch (error) {
      if (error.fields && error.fields.hasOwnProperty('email')) {
        return next("Email already registered!");
      }
      if (error.fields && error.fields.hasOwnProperty('mob_no')) {
        return next("Mobile no already registered!");
      }
      if (error.fields && error.fields.hasOwnProperty('username')) {
        return next("Username already registered!");
      }
      next(error)
    }
  },
  subadminlist: async (req, res, next) => {
    try {
      const data = await db.User.findAll({
        where: {
          role_id: "2"
        }
      });

      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },
  subadminview: async (req, res, next) => {
    try {
      const user_id = req.params.id

      const data = await db.User.findOne({
        where: {
          id: user_id,
          role_id: "2"
        }, include: [db.state],
      });
      return res.send(response(data));
    } catch (error) {
      next(error);
    }
  },
  subadminupdate: async (req, res, next) => {
    try {
      const params = req.body;
      params.firstName = params.firstName;
      params.lastName = params.lastName;
      params.access_modules = JSON.stringify(params.access_modules);

      const data = Object.assign(params)
      const profile = await db.User.update(data,
        {
          where: {
            id: params.id
          }
        });
      return res.send(response("Updated successfully."));

    } catch (error) {
      next(error)
    }
  },
  subadmindelete: async (req, res, next) => {
    try {
      const user_id = req.params.id

      await db.User.destroy({
        where: {
          id: user_id
        }
      });
      return res.send(response("Deleted successfully."));
    } catch (error) {
      next(error)

    }
  },

  //Notification//
  notificationcreate: async (req, res, next) => {
    try {
      const params = req.body;
      params.notification_type = 2;
      params.status = 0;

      params.user_id = 1;
      db.notifications.create({
        notification_type: 1,
        user_id: 1,
        status: 0,
        title: params.title,
        notification: params.notification
      });

      const users = await db.User.findAll({
        where: {
          role_id: 3,
          status: 1
        }
      })

      users.map((user) => {
        params.user_id = user.id;
        db.notifications.create(params)

        var message = {
          "token": user.device_token,
          "notification": {
            "title": params.title,
            "body": params.notification
          }
        }

        if (user.device_token) {
          firbase().send(message)
            .then((response) => {
              // Response is a message ID string.
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
            });
        }
      })

      return res.send(response("Success"));

    } catch (error) {
      next(error)

    }
  },
  notificationlist: async (req, res, next) => {
    try {
      const data = await db.notifications.findAll({
        where: {
          notification_type: 1
        },
        // group: ['title']
      });
      return res.send(response(data));
    } catch (error) {
      next(error)
    }
  },

  //help and support//
  messagelist: async (req, res, next) => {
    try {
      const data = await db.helpdesk.findAll({

      });
      return res.send(response(data));

    } catch (error) {
      next(error)
    }
  },
  message_reply: async (req, res, next) => {
    try {
      const params = req.body;
      params.status = params.status

      const user = await db.User.findOne({
        where: {
          id: params.user_id
        }
      })

      const test = await transporter.sendMail({
        from: 'housie.live@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: "Housie Game", // Subject line
        text: params.message, // plain text body 
      })

      await db.helpdesk.update({ status: params.status },
        {
          where: {
            user_id: params.user_id,
            id: params.id,
          }
        })

      successmessage = "Message sent"
      var data = ""
      return res.send(response(data, successmessage));
    } catch (error) {
      next(error)
    }
  },

  //kyc //
  user_kyc_list: async (req, res, next) => {
    try {

      const params = req.body;

      const kyclist = await db.user_doc.findAll({
        where: {
          is_verified: 1
        },
        include: [
          { model: db.User, attributes: ["firstName"] },
          { model: db.bankdetails }
        ]
      })

      list = []
      kyclist.map((item) => {
        if(item.dataValues.bankdetail){
          list.push(item)
        }
       
      })
      return res.send(response(list));
    } catch (error) {
      next(error)
    }
  },

  user_kyc_view: async (req, res, next) => {
    try {

      const userId = req.params.user_id;

      const user = await db.user_doc.findOne({
        where: {
          user_id: userId
        },
        include: [db.User, db.bankdetails]
      })

      if (!user) {
        return res.send(response({}, "Please enter valid detail"));
      }
      return res.send(response(user));

    } catch (error) {
      next(error)
    }
  },

  kyc_verify: async (req, res, next) => {
    try {

      const params = req.body;
      const user = await db.User.findOne({
        where: {
          id: params.user_id
        }
      })

      if (params.is_verified == 2) {

        const profile = await db.user_doc.update({
          is_verified: params.is_verified
        },
          {
            where: {
              user_id: params.user_id
            }
          });

        const kycaccept_notification = await db.notifications.create({
          user_id: params.user_id,
          notification_type: 2,
          title: "Kyc accepted",
          notification: "Your kyc is verified ",
          extra_data: null,
          status: 0
        });
        if (user.device_token) {
          var message = {
            "token": user.device_token,
            "notification": {
              "title": "Kyc accepted",
              "body": "Your kyc is verified "
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
        return res.send(response({}, "Kyc status sucessfully updated"));
      } else if (params.is_verified == 3) {
        const profile = await db.user_doc.update({
          is_verified: params.is_verified
        },
          {
            where: {
              user_id: params.user_id
            }
          });
        //kyc rejected case notification send to user//
        const kycreject_notification = await db.notifications.create({
          user_id: params.user_id,
          notification_type: 2,
          title: "kyc rejected",
          notification: params.notification,
          extra_data: null,
          status: 0
        });
        if (user.device_token) {
          var message = {
            "token": user.device_token,
            "notification": {
              "title": "kyc rejected",
              "body": params.notification
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
        message = "Kyc status sucessfully updated"
        return res.send(response({}, message));
      }

      return res.send(response({}));
    } catch (error) {
      next(error)
    }
  },

  category_graph: async (req, res, next) => {
    try {

      const params = req.body
      var date = new Date();

      if (params.duration == 0) {
        var DateFilter = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (params.duration == 1) {
        var DateFilter = new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000));
      } else if (params.duration == 2) {
        var DateFilter = new Date(date.getTime() - (365 * 24 * 60 * 60 * 1000));
      } else {
        throw "Please select valid date"
      }


      const categorydata = await db.contests.findAll({
        where: {
          category_id: params.category_id,
          createdAt: {
            [Op.gte]: DateFilter
          }
        },
        attributes: ["entry_fee", "id",
          [sequelize.fn("SUM", sequelize.cast(sequelize.col("winning_amount"), 'integer')), "total_winning_amount"],
          [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
          [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
        ],
        group: ["entry_fee"]
      })

      var data = { categorydata }
      return res.send(response(data));

    } catch (error) {
      next(error)
    }
  },

  withdrawl_request_list: async (req, res, next) => {
    try {
      let limit = 10
      let offset = 0 + (req.body.page_no - 1) * limit

      const { startedDate, endDate, excel, page_no } = req.body;
      const Op = sequelize.Op;


      var total_transaction = await db.transactions.findAll({
        order: [
          ['createdAt', 'DESC']
        ],
        where: {
          added_type: '1',
          createdAt: {
            [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
          }
        },
        include: [{
          model: db.User,
          attributes: ['firstName', 'mob_no']
        }]
      })

      const withdrawal_list = await db.transactions.findAll({
        limit: limit,
        offset: offset,
        order: [
          ['createdAt', 'DESC']
        ],
        where: {
          added_type: '1',
          createdAt: {
            [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
          }
        },
        include: [{
          model: db.User,
          attributes: ['firstName', 'mob_no']
        }]
      })

      if (excel == 1) {

        const workbook = new excelJS.Workbook();  // Create a new workbook  
        const worksheet = workbook.addWorksheet("WithdrawalList"); // New Worksheet  
        const path = "./uploads";  // Path to download excel 

        var tutorials = []
        total_transaction.map((user) => {

          if (user.dataValues.status == "0") {
            var txnstatus = "Pending"
          } else if (user.dataValues.status == "1") {
            var txnstatus = "Success"
          } else if (user.dataValues.status == "2") {
            var txnstatus = "Cancel"
          }

          if (user.dataValues.added_type == "1") {
            var type = "Withdrawal"
          }
          tutorials.push({
            firstName: user.User.dataValues.firstName,
            mob_no: user.User.dataValues.mob_no,
            txn_amount: user.dataValues.txn_amount,
            added_type: type,
            txn_date: user.dataValues.txn_date,
            txn_time: user.dataValues.txn_time,
            status: txnstatus
          });
        })

        worksheet.columns = [
          { header: "Name", key: "firstName", width: 10 },
          { header: "Mobile Number", key: "mob_no", width: 10 },
          { header: "Transaction Amount", key: "txn_amount", width: 10 },
          { header: "Transaction Type:", key: "added_type", width: 10 },
          { header: "Date:", key: "txn_date", width: 10 },
          { header: "Time:", key: "txn_time", width: 10 },
          { header: "Status:", key: "status", width: 10 },
        ];
        // Making first line in excel bold
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
        });
        worksheet.addRows(tutorials);
        try {
          const data = await workbook.xlsx.writeFile(`${path}/Withdrawal_Details.xlsx`)
            .then(() => {
              res.send(response({
                // message: "file successfully downloaded",
                path: `${path}/Withdrawal_Details.xlsx`,
              }));
            });
        } catch (err) {
          res.send({
            status: "error",
            message: "Something went wrong",
          });
        }

      }

      var data = { totalcount: total_transaction.length, page_request_count: withdrawal_list.length, withdrawal_list }
      return res.send(response(data));
    } catch (error) {
      next(error)
    }
  },

  withdrawl_request_approve: async (req, res, next) => {
    try {
      const params = req.body;


      if (params.approve == 1) {
        await db.transactions.update({
          status: process.env.SUCCESS
        }, {
          where: {
            id: params.id
          }
        })

        var Checkwithdrawl = await db.transactions.findOne({
          where: {
            id: params.id
          }
        })

        var amount = Checkwithdrawl.winning_balance * 100;

        var fundAccounId = await db.User.findOne({
          where: {
            id: Checkwithdrawl.user_id
          }
        })

        var createPayout = await axios.post(process.env.RAZORPAY_URL + '/payouts', { "account_number": "2323230074158322", "fund_account_id": fundAccounId.fundaccountid, "amount": amount, "currency": "INR", "mode": "IMPS", "purpose": "payout" }, {
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
            return error.response.data.error.description;
          });

        await db.transactions.update({
          txn_id: createPayout.id,
          payout_status: process.env.PENDING
        }, {
          where: {
            id: params.id
          }
        })


        console.log('createPayout->>>>', createPayout)
      } else if (params.approve == 0) {
        await db.transactions.update({
          status: process.env.CANCEL
        }, {
          where: {
            id: params.id
          }
        })
      }

      return res.send(response(Checkwithdrawl));
    } catch (error) {
      next(error)
    }
  },

  transaction_list: async (req, res, next) => {
    try {
      let limit = 10
      let offset = 0 + (req.body.page_no - 1) * limit

      const { startedDate, endDate, excel } = req.body;
      const Op = sequelize.Op;

      var transaction_list = await db.transactions.findAll({
        order: [
          ['createdAt', 'DESC']
        ],
        where: {
          createdAt: {
            [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
          }
        }
      })

      var transactions = await db.transactions.findAll({
        limit: limit,
        offset: offset,
        order: [
          ['createdAt', 'DESC']
        ],
        where: {
          createdAt: {
            [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
          }
        }
      })

      if (excel == 1) {
        const workbook = new excelJS.Workbook();  // Create a new workbook  
        const worksheet = workbook.addWorksheet("My Users"); // New Worksheet  
        const path = "./uploads";  // Path to download excel 

        var tutorials = []
        transaction_list.map((user) => {

          if (user.dataValues.status == "0") {
            var txnstatus = "Pending"
          } else if (user.dataValues.status == "1") {
            var txnstatus = "Success"
          } else if (user.dataValues.status == "2") {
            var txnstatus = "Cancel"
          }

          if (user.dataValues.added_type == "1") {
            var type = "Withdrawal"
          } else if (user.dataValues.added_type == "2") {
            var type = "Add Money"
          } else if (user.dataValues.added_type == "3") {
            var type = "Ticket purchase"
          } else if (user.dataValues.added_type == "4") {
            var type = "Winner Amount"
          }
          tutorials.push({
            txn_id: user.dataValues.txn_id,
            local_txn_id: user.dataValues.local_txn_id,
            added_type: type,
            txn_date: user.dataValues.txn_date,
            txn_time: user.dataValues.txn_time,
            txn_amount: user.dataValues.txn_amount,
            status: txnstatus
          });
        })

        worksheet.columns = [
          { header: "Transaction ID", key: "txn_id", width: 10 },
          { header: "Local Transaction ID", key: "local_txn_id", width: 10 },
          { header: "Transaction Type", key: "added_type", width: 10 },
          { header: "Date:", key: "txn_date", width: 10 },
          { header: "Time:", key: "txn_time", width: 10 },
          { header: "Amount:", key: "txn_amount", width: 10 },
          { header: "Status:", key: "status", width: 10 }
        ];
        // Making first line in excel bold
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
        });
        worksheet.addRows(tutorials);
        try {
          const data = await workbook.xlsx.writeFile(`${path}/Transaction_Detail.xlsx`)
            .then(() => {
              res.send(response({
                // message: "file successfully downloaded",
                path: `${path}/Transaction_Detail.xlsx`,
              }));
            });
        } catch (err) {
          res.send({
            status: "error",
            message: "Something went wrong",
          });
        }
      }

      return res.send(response({ pagecount: transactions.length, transaction_count: transaction_list.length, transactions }))

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

async function getUser(id) {
  try {

    const user = await db.User.findByPk(id);
    if (!user) throw 'User not founds.';
    return user

  } catch (error) {
    throw error
  }
}








