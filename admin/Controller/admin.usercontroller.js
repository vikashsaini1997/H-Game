const config = require("../../config/config.json");
const express = require("express");
const sequelize = require('sequelize');
const jwt = require("jsonwebtoken");
const response = require("../../helper/response");
const randtoken = require("rand-token");
var nodemailer = require('nodemailer')
const path = require('path')
const moment = require('moment');
const Op = require('sequelize').Op;

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
        throw "invalid email";
      }

      if (!user || !(await bcrypt.compare(params.password, user.password)))
        throw "password is incorrect.";


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
        throw "invalid email"

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

      var message = "success";
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
        throw "link expired resend again"
      }

      if (params.password != params.confirm_password) {
        throw 'password and confirm password does not match'
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
      var message = "password updated"
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
  userlist: async (req, res, next) => {
    try {
      const data = await db.User.findAll({
        where: {
          role_id: "3",
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

      return res.send(response("updated"));
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
          attributes:[
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("winning_amount"), 'integer')), "total_winning_amount"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
            [sequelize.fn("COUNT", sequelize.col("id")), "contest_count"],'id','entry_fee','contest_type',
          ],
          where: {
            category_id: categoryId,
            contest_type: 0,
            createdAt: {
              [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
            }
          },
          group:['entry_fee']
        });


        var private_contest = await db.contests.findAll({
          attributes:[
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("winning_amount"), 'integer')), "total_winning_amount"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("admin_comission"), 'integer')), "total_commission"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("contest_size"), 'integer')), "total_players"],
            [sequelize.fn("COUNT", sequelize.col("id")), "contest_count"],'id','entry_fee','contest_type',
          ],
          where: {
            category_id: categoryId,
            contest_type: 1,
            createdAt: {
              [Op.between]: [new Date(startedDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)]
            }
          },
          group:['entry_fee']
        });

        var total_commission_players = await db.contests.findAll({
          attributes:[
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
       
        var data = { category,total_commission_players, public_contest,private_contest}

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
      return res.send(response("categroy list updated"));
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
      return res.send(response(data, "cms list view"));

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
      return res.send(response(cmslist, "cms list updated"));

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
      return res.send(response(test, "sub admin created please login "));
    } catch (error) {
      if (error.fields && error.fields.hasOwnProperty('email')) {
        return next("Email already registered!");
      }
      if (error.fields && error.fields.hasOwnProperty('mob_no')) {
        return next("mobile no already registered!");
      }
      if (error.fields && error.fields.hasOwnProperty('username')) {
        return next("username already registered!");
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
      return res.send(response("updated successfully."));

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
      return res.send(response("deleted successfully."));
    } catch (error) {
      next(error)

    }
  },

  //Notification//
  notificationcreate: async (req, res, next) => {
    try {
      const params = req.body;
      params.notification_type = 1;
      params.status = 0;

      params.user_id = 1;
      db.notifications.create(params);

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

        if(user.device_token){
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

      return res.send(response("success"));

    } catch (error) {
      next(error)

    }
  },
  notificationlist: async (req, res, next) => {
    try {
      const data = await db.notifications.findAll({
        group: ['title']
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

      successmessage = "message sent"
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
          { model: db.User, attributes: ["firstName"] }
        ]
      })

      return res.send(response(kyclist));

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
        return res.send(response({}, "please enter valid detail"));
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
            id:params.user_id
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
          title: "kyc accepted",
          notification: "your kyc is verified ",
          extra_data: null,
          status: 0
        });

        var message = {
          "token": user.device_token,
          "notification": {
            "title": "kyc accepted",
            "body": "your kyc is verified "
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
        return res.send(response({}, "kyc status sucessfully updated"));
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
        message = "kyc status sucessfully updated"
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
        throw "please select valid date"
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








