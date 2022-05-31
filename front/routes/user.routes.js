const express = require("express");
const router = express.Router()
const Joi = require('joi');
const multer = require('multer')
const path = require('path')
const validateRequest = require("../../front/middleware/validate.middleware");
const validateAllFieldsRequest = require("../../front/middleware/validateAllFieldsRequest.middleware");
const authorize=require("../../front/middleware/authorize.middleware");
const activeMiddlware=require("../../front/middleware/activemiddleware");

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5702400
    },   
})

function registerSchema(req, res, next) {
const schema = Joi.object({
    firstName: Joi.string().required().messages({'string.empty':`"firstname" is required`}),
    lastName: Joi.string().required().messages({'string.empty':`"lastName" is required`}),
    email: Joi.string().required().email().messages({'string.empty':`"email" is required`}),
    username:Joi.string().required().messages({'string.empty':`"username" is required`}),
    mob_no: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({'string.empty':`"mobile number" is required`}),  
    T_C: Joi.number().required().messages({'number.base': `"term & conditions" must be required`}),

});
    validateAllFieldsRequest(res, req, next, schema);
}


function socialschema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        profile_image:Joi.string().optional().allow(""),
        google_id:Joi.string().optional().allow(""),
        fb_id:Joi.string().optional().allow(""),
    });
    validateAllFieldsRequest(res, req, next, schema);
}


function adddetailschema(req, res, next) {
    const schema = Joi.object({
        mob_no: Joi.number().required(),
        username: Joi.string().required(),
        id: Joi.number().required()
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function verifySchema(req, res, next) {
    const schema = Joi.object({
        mob_no:Joi.string().required(),
        otp: Joi.string().required(),
        isSignup:Joi.boolean().required(),
        is_verify:Joi.boolean(),
        device_type: Joi.string(),
        device_token: Joi.string(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function loginschema(req, res, next) {
const schema = Joi.object({
    mob_no: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({'string.empty':`"mobile number" is required`}),
    username:Joi.string().required().messages({'string.empty':`"username" is required`}),
    plus18: Joi.number().required().messages({'number.base': `"18 plus" must be required.`}),  device_token: Joi.string(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function otpschema(req, res, next) {
    const schema = Joi.object({
        mob_no: Joi.number().required(),
       
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function socialschema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        profile_image:Joi.string().optional(),
        google_id:Joi.string().optional(),
        fb_id:Joi.string().optional(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function adddetailschema(req, res, next) {
    const schema = Joi.object({
        mob_no: Joi.number().required(),
        username: Joi.string().required(),
        id: Joi.number().required()
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function logoutSchema(req, res, next) {
    next();
}

function migrate(req, res, next) {
    next();
}

// function contestscategroy(req, res, next){
    
//     const schema = Joi.object({
//         category_id: Joi.number().required(),
//     });
//     validateAllFieldsRequest(res, req, next, schema);
// }

function profileupdateschema( req,res, next) {
   next();
}

function helpdeskschema(req, res, next) {
    const schema = Joi.object({
        message: Joi.string().required(),
        user_id: Joi.number().required(),
        
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function ticketvalidation(req, res, next) {
    const schema = Joi.object({
        user_id: Joi.number().required(),
        contest_id: Joi.number().required(),
        category_id:Joi.number().required(),
        total_amount:Joi.number().required(),
        ticket_details:Joi.optional().allow("")
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function privateValidiation(req, res, next){
    const schema = Joi.object({
        user_id: Joi.number().required(),
        category_id: Joi.number().required(),
        entry_fee:Joi.number().required(),
        contest_name:Joi.string().required(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function kycaddschema(req, res, next) {
    const schema = Joi.object({
        user_id: Joi.number(),
        pan_card_no:Joi.string().optional().length(10),
        pan_card_name: Joi.string().optional(),
        dob: Joi.string().required(),
        state: Joi.string().required(),
        aadhar_card_name: Joi.string().optional(),
        doc_image: Joi.string(),
        aadhar_card_no: Joi.string().optional().length(12).pattern(/^[0-9]+$/),
        });
        validateAllFieldsRequest(res, req, next, schema);
    }

function bankdetailaddschema(req, res, next) {
    const schema = Joi.object({
        user_id: Joi.number(),
        account_holder_name:Joi.string().required(),
        bank_name: Joi.string().required(),
        account_number: Joi.string().required(),
        re_account_number: Joi.string().required(),
        ifsc_code: Joi.string().required().length(11)
        });
        validateAllFieldsRequest(res, req, next, schema);
    }
const userController = require('../../front/controllers/user.controller');
const { join } = require("path");

router.post('/register',registerSchema,userController.userRegister);
router.post('/login',loginschema,userController.Login);
router.post('/social-login',socialschema,userController.sociallogin);
router.post('/complete-profile',adddetailschema,userController.completeprofile);
router.post('/verify',verifySchema,userController.verifyUser);
router.post('/resend-otp',otpschema,userController.otpSend);
router.get('/soketchat',userController.socketChat);

//Authusercheck//
router.get('/list-category', authorize,activeMiddlware,userController.getcategoy);
router.get('/state', authorize,activeMiddlware,userController.state);
router.get('/show-profile',authorize,activeMiddlware,userController.showprofile);
router.post('/profile-edit',upload.single('profile_image'), authorize,activeMiddlware,profileupdateschema,  userController.profile_edit)
router.post('/logout',logoutSchema,userController.logout);
router.get('/contest-list/:categroy_id',authorize,activeMiddlware,userController.contest_list);
router.get('/contest-detail/:id',authorize,activeMiddlware,userController.contest_detail);
router.post('/ticket-buy',authorize,activeMiddlware,ticketvalidation, userController.ticket_buy);
router.get('/wallet-balance/:id',authorize,activeMiddlware,userController.wallet);
router.post('/ticket-buy-details',authorize,activeMiddlware,userController.ticket_buy_details);
router.get('/my-match-list',authorize,activeMiddlware,userController.my_match_list);
router.post('/winner-request',authorize,activeMiddlware,userController.winner);

router.post('/user-setting',authorize,activeMiddlware,userController.usersetting);
router.post('/helpdesk', authorize,activeMiddlware,helpdeskschema,userController.helpandsupport);
router.post('/cmspage-view/:id',authorize,userController.cmspageview)

//private game//
router.get('/list-category-room', authorize,activeMiddlware,userController.category_roomview);
router.post('/create-privatecontest',authorize,activeMiddlware,privateValidiation,userController.contest_create);
router.get('/privatecontest-detail/:id',authorize,activeMiddlware,userController.privatecontest_detail);
router.post('/join-game',authorize,activeMiddlware, userController.join_game);
router.post('/start-private-game',authorize,activeMiddlware, userController.start_game);

//user kyc//
router.post('/add-kyc-detail',upload.single('doc_image'),authorize,activeMiddlware,kycaddschema, userController.kyc_detail_add);
router.get('/kyc-verify-status',authorize,activeMiddlware, userController.kyc_detail_verify);

//bank detail//
router.post('/add-bankdetail',authorize,activeMiddlware,bankdetailaddschema, userController.bankdetail_add);

//notification//
router.post('/user-notification/',authorize,activeMiddlware, userController.user_notification)


module.exports = router;