var admin = require("firebase-admin");
const {
  getMessaging
} = require("firebase-admin/messaging");

var serviceAccount = require("../service/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports=getMessaging 