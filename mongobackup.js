  	var url = "mongodb://"+ip+sudhanshu;
	MongoClient.connect(url, function(err, client) {
		if (err){
		  console.log("error");
		}
		  console.log("Putting data into "+sudhanshu);
		  sudhanshudatabase=client.db(sudhanshu);
		  const messageS=sudhanshudatabase.collection(roome);
  		  messageS.insertMany([{name:sudhanshu,msg:msg}],function(err,result){});
		  client.close();
	});
  	
  	url = "mongodb://"+ip+roome;

	MongoClient.connect(url, function(err, client) {
		if(err){
		  console.log("error");
		}
		  console.log("Putting data into "+roome);
		  friend=client.db(roome);
		  const messageF=friend.collection(sudhanshu);
  		  messageF.insertMany([{name:sudhanshu,msg:msg}],function(err,result){});
  		  client.close();
	});