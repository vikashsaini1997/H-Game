const express = require("express");
const router = express.Router()
const Joi = require('joi');
const multer = require('multer')
const path = require('path')
const validateRequest = require("../../front/middleware/validate.middleware");
const validateAllFieldsRequest = require("../../admin/middleware/validatefieldsrequest");
const authorize=require("../../front/middleware/authorize.middleware");

const userController = require('../../admin/Controller/admin.usercontroller');

//Profile image storage//
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




function loginschema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function logoutSchema(req, res, next) {
    next();
}


function blockuserschema(req, res, next) {
    const schema = Joi.object({
        id: Joi.number().required(),
        status: Joi.number().required()
       
    });
    validateRequest(req, next, schema);
}

function subadminloginschema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}
function useraddschema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required().email(),
        username:Joi.string().required(),
        mob_no: Joi.string().length(10).pattern(/^[0-9]+$/).required(),     
        T_C: Joi.number().required()
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function addsubadminschema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username:Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),

    });
    validateAllFieldsRequest(res, req, next, schema);
}

function reset(req, res, next){
    const schema = Joi.object({
        email: Joi.string().required()
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function updatepassword(req, res, next){
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().min(6).required(),
        token: Joi.string().optional()
    });
    validateAllFieldsRequest(res, req, next, schema);
}


function usereditupdate(req, res, next){
    next()
}

function updatepassword(req, res, next){
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().min(6).required(),
        token: Joi.string().optional()
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function changepasswordschema(req, res, next){
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        current_password: Joi.string().min(6).required(),
        
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function adminprofileschema( req,res, next) {
    next();
 }
 


function cmseditschema(req, res, next){
    const schema = Joi.object({
        id: Joi.number().required(),
        name:Joi.string().optional(),
        text:Joi.string().optional(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function categroyupdateschema(req, res, next){
    const schema = Joi.object({
        id: Joi.number().required(),
        //category_name:Joi.string().optional(),
        title_name:Joi.string().optional(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

function subadminvalidtion (req, res, next){
    const schema = Joi.object({
        firstName:Joi.string().required(),
        email:Joi.string().required(),
        lastName:Joi.string().required(),
        password:Joi.string().required(),
        username:Joi.string().required(),
        mob_no:Joi.string().required(),
        dob:Joi.string().required(),
        state_id :Joi.number().required().messages({'number.base': `"state is required`}),
        access_modules:Joi.object().required(),
    });
    validateAllFieldsRequest(res, req, next, schema);
}

router.post('/login', loginschema, userController.Login);
router.post('/logout',logoutSchema,userController.logout);
router.get('/dashboard',authorize,userController.dashboard);
router.post('/forgot-password',reset,userController.resetpassword);
router.post('/update-password',updatepassword,userController.updatepassword);
router.post('/change-password',authorize,changepasswordschema,userController.changePassword);
router.get('/adminprofile-show',authorize,userController.adminprofileshow);
router.post('/adminprofile-update',upload.single('profile_image'),authorize,adminprofileschema,userController.adminprofileupdate);
//user//
router.get('/list-user',authorize ,userController.userlist);
router.get('/state', authorize, userController.state);
router.post('/state-update', authorize, userController.stateupdate);
router.get('/user-id/:id',authorize,userController.usershowedit);
router.put('/user-update',authorize ,usereditupdate,userController.usereditprofile);
router.post('/block-user',authorize,blockuserschema,userController.blockuser);
//categroy//
router.get('/category-list',authorize ,userController.categroylist);
router.post('/category-view/:id', authorize, userController.categoryview);
router.put('/category-update',authorize,categroyupdateschema,userController.categoryupdate);
router.post('/category-graph', authorize, userController.category_graph);
//cms page//
router.get('/cms-list',authorize,userController.cmslist)
router.post('/cms-view/:id',authorize,userController.cmsview)
router.put('/cms-viewedit',authorize,cmseditschema,userController.cmsviewedit)
//Subadmin//
router.post('/create-subadmin',authorize,subadminvalidtion,userController.createsubadmin);
router.get('/subadmin-list',authorize,userController.subadminlist);
router.post('/subadmin-view/:id',authorize,userController.subadminview);
router.put('/subadmin-update',authorize,userController.subadminupdate);
router.delete('/subadmin-delete/:id',authorize,userController.subadmindelete);

//Notification//
router.post('/create-notification',authorize,userController.notificationcreate);
router.get('/notification',authorize,userController.notificationlist);

//help and support//
router.get('/helpdesk-messagelist',authorize,userController.messagelist);
router.put('/message-reply', authorize, userController.message_reply);

//user kyc//
router.get('/kyc-list',authorize,userController.user_kyc_list);
router.get('/kyc-userview/:user_id',authorize,userController.user_kyc_view);
router.post('/kyc-verify',authorize,userController.kyc_verify);

//Payout Request Approve//
router.post('/user-withdrawal-list',authorize,userController.withdrawl_request_list)
router.post('/withdrawl-request-approve',authorize,userController.withdrawl_request_approve);
router.post('/all-transaction-list',authorize,userController.transaction_list)


module.exports = router;  