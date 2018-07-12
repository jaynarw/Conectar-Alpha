var express=require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static("./public"));
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/chat', function(req, res){
  res.render('chat');
});
app.get('/',function(req,res){
	res.render('index2');
});

var MongoClient =require('mongodb').MongoClient;
const assert = require('assert');
var ip="localhost:27017/";
//var sudhanshu="group";
var sudhanshudatabase;
var friend;

var putIntoDatabase=function(databaseof,databaseabout,messageby,msg,date,time){
  	var url = "mongodb://"+ip+databaseof;
	MongoClient.connect(url, function(err, client) {
		if (err){
		  console.log("error");
		}
		  console.log("Putting data into "+databaseof);
		  sudhanshudatabase=client.db(databaseof);
		  const messageS=sudhanshudatabase.collection(databaseabout);
  		  messageS.insertMany([{name:messageby,msg:msg,date:date,time:time}],function(err,result){});
		  client.close();
	});
};
var retreveYourData=function(user,proome,roome,n)
{
  	var url = "mongodb://"+ip+user;
	MongoClient.connect(url, function(err, client) {
		if (err){
		  console.log("error");
		}
		  console.log("Retreving data from "+user);
		  sudhanshudatabase=client.db(user);
		  const messageS=sudhanshudatabase.collection(roome);
		  messageS.find({}).sort({ $natural: -1 }).limit(n).toArray(function(err,docs){
		  	assert.equal(err,null);
		  	var t=docs.length;
		  	console.log(t);
		  	io.sockets.in(user+roome).emit('empty messages');
		  	for(var x in docs)
		  	{
		  		//different bug in here
    			io.sockets.in(user+roome).emit('new chat message',docs[t-x-1].name, docs[t-x-1].msg,docs[t-x-1].date,docs[t-x-1].time);
   		  	}
		  });
		  const messageP=sudhanshudatabase.collection("love");
		  messageP.find({user:user}).toArray(function(err,docs){
		  	console.log(docs);
		  });

		  messageP.find({user:roome}).toArray(function(err,docs){
		  	if(docs.length)
		  	{
		  		io.sockets.in(user+roome).emit('loveit',true);
		  	}
		  	else
		  	{
		  		io.sockets.in(user+roome).emit('loveit',false);
		  	}
		  });
		  client.close();
	});	
}
///////////////////////////////////////

io.on('connection', function(socket){
  console.log('user connected');
	var n=50;
	var use;
	socket.on('about me',function(user){
		use=user;
		var url = "mongodb://"+ip+"usersonline";
		MongoClient.connect(url, function(err, client){
			if(err){};
			sudhanshudatabase=client.db("usersonline");
		  	const messageS=sudhanshudatabase.collection("users");
		  	messageS.insertMany([{user:user}]);
		  	client.close();
		});
	});
///////////////////////////////////////

/////////////////////////////////////
	socket.on('find him',function(roome){
		var url="mongodb://"+ip+"usersonline";
		MongoClient.connect(url,function(err,client){
			if(err){};
			sudhanshudatabase=client.db("usersonline");
			const messageS=sudhanshudatabase.collection("users");
			messageS.find({user:roome}).toArray(function(err,docs){
				io.sockets.in(use+roome).emit('status',docs.length);
				client.close();
			});
		});
	});
socket.on('increasen',function(){
	n+=50;
	console.log(n);
});
socket.on('setn',function(){
	n=50;
});
socket.on('loveit',function(user,roome,loveme){
	var url="mongodb://"+ip+user;
	MongoClient.connect(url,function(err,client){
		if(err){
			console.log("Error making love");
		}
		console.log("Putting love in "+user);
		sudhanshudatabase=client.db(user);
		const messageS = sudhanshudatabase.collection("love");
		console.log("Value of loveme is ",loveme);
		if(!loveme)
		{
			messageS.deleteMany({user:roome},function(err,obj){
			assert.equal(err,null);
			console.log("Doc deleted");
		});
		}
		else
		{
			messageS.insertMany([{user:roome}],function(err,result){});

		}
		client.close();
	});
	var url="mongodb://"+ip+roome;
	MongoClient.connect(url,function(err,client){
		if(err){
			console.log("Error changing love");
		}
		console.log("Increasing love in "+roome);
		sudhanshudatabase=client.db(roome);
		const messageA=sudhanshudatabase.collection("love");
		if(loveme)
		{
			messageA.insertMany([{user:roome,love:user}],function(err,result){});
		}
		else
		{
			messageA.deleteMany({user:roome,love:user});
		}
		client.close();
	});
});
/////////
  socket.on('join',function(roome,proome,user){
  	// socket.leave(user+proome);
  	socket.join(user+roome);
  	retreveYourData(user,proome,roome,n);

});
	socket.on('seetags',function(roome,user,whosetags){
		var sudhanshu=user;
  		var url = "mongodb://"+ip+sudhanshu;
		MongoClient.connect(url, function(err, client) {
			if(err){
				console.log("Error in seeing tags");
			}
			console.log("Seeing tags of "+whosetags);
			var mydatabase=client.db(user);
			const messageS=mydatabase.collection(roome+whosetags);
			messageS.find({}).toArray(function(err,docs){
				assert.equal(err,null);
				for(var x of docs)
				{
					io.sockets.in(user+roome).emit("chat message",x.name,x.msg);
				}

			});
		});
   });
  socket.on('chat message', function(msg,roome,user,date,time){
  	console.log(roome+"|||"+msg);
  	var sudhanshu=user;
  	putIntoDatabase(sudhanshu,roome,sudhanshu,msg,date,time);
  	putIntoDatabase(roome,sudhanshu,sudhanshu,msg,date,time);
	//bug over here
    io.sockets.in(user+roome).emit('chat message',sudhanshu, msg,date,time);
    io.sockets.in(roome+user).emit('chat message',sudhanshu, msg,date,time);
  });

  socket.on('group chat message',function(msg,roome,user,to,date,time){
  	console.log("Sending group a message "+msg+" Now feeding in "+to);
  	putIntoDatabase(to,roome,user,msg,date,time);
  	io.sockets.in(to+roome).emit('chat message',user,msg,date,time);
  });
  socket.on('tagMe',function(msg,roome,user,to,who,date,time){
  	for(var x of who)
  	{
	  	console.log(x.name+" will be tagged");
	  	putIntoDatabase(to,roome+x.name,user,msg,date,time);
	  	io.sockets.in(to+roome).emit('chat message',user,x.name+" was tagged in "+msg,date,time);	  		
  	}
  });
  socket.on('disconnect', function(){
  	var url = "mongodb://"+ip+"usersonline";
		MongoClient.connect(url, function(err, client){
			if(err){};
			sudhanshudatabase=client.db("usersonline");
		  	const messageS=sudhanshudatabase.collection("users");
		  	messageS.deleteMany({user:use});
		  	client.close();
		});
    console.log(use+ ' disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});