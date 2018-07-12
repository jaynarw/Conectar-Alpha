var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) console.log("error recieved");
  var dbo = db.db("users");
  var userName = "username";
  dbo.collection("user").findOne({"username":userName}, function(err, result) {
    if (err) throw err;
    console.log(result);
    var phone = result.phone;
    var mail = result.mail;
    var designation = result.designation;
    var present = result.present;
    var tags = result.tags;
    console.log(tags[0]);
    db.close();
  });
});

function update_function(username,phone,mail,designation,present){
  MongoClient.connect(url, function(err, db) {
  if (err) console.log("error recieved");
  var dbo = db.db("users");
  var myquery = { "username": username };
  var newvalues = { $set: {"username": username, "phone": phone,"mail":mail,"designation":designation,"present":present,"tags":["web dev","app dev","ML","etc"] } };
  dbo.collection("user").updateMany(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
});
};

module.exports = router;