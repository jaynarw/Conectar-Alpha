var MongoClient =require('mongodb').MongoClient;
const assert = require('assert');
var url = "mongodb://localhost:27017/mydb";

// const insertDocuments = function(db, callback) {
//   // Get the documents collection
//   const collection = db.collection('documents');
//   // Insert some documents
//   collection.insertMany([
//     {a : 1}, {a : 2}, {a : 3}
//   ], function(err, result) {
//     assert.equal(err, null);
//     assert.equal(3, result.result.n);
//     assert.equal(3, result.ops.length);
//     console.log("Inserted 3 documents into the collection");
//     callback(result);
//   });
// }

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}
var db;
var re;
// MongoClient.connect(url, function(err, client) {
//   if (err){
//   console.log("error");
// }
//   console.log("Database created!");
//     db = client.db("mydb");
//     console.log(client);
//   //     insertDocuments(db, function() {
//   //   client.close();
//   // });
//     //       findDocuments(db, function() {
//     //   client.close();
//     // });
// });
MongoClient.connect(url, function(err, client) {
  if (err){
  console.log("error");
}
  console.log("Database created!");
    const db = client.db("mydb");
  //     insertDocuments(db, function() {
  //   client.close();
  // });
          findDocuments(db, function() {
      client.close();
    });
});