var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
const nodemailer = require('nodemailer');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();
app.set('port', (process.env.PORT || 3000));

var server=app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

// var http = require('http').Server(app);
var io = require('socket.io')(server);
// var fs=require('fs');
// var file=require('./routes/index')(io);
app.use(express.static("./public"));
// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// app.get('/',function(req,res){});
// var server = http.createServer(app);
// var io = require('socket.io').listen(server);
// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


const MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
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
  socket.on('get tags',function(username){
    var url = "mongodb://"+ip+username;
    socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(username);
      const messageS=mydatabase.collection(username);
      messageS.find({username:username}).toArray(function(err,docs){
        assert.equal(err,null);
        console.log(docs[0].tags);
        console.log(docs.length);
        io.sockets.in(username).emit("the tags",docs[0].tags);
        socket.leave(username);
        client.close();
      });
    })

  });
  socket.on('add to friends',function(username,friend){
    var url = "mongodb://"+ip+username;
    socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(username);
      const messageS=mydatabase.collection(username);
      messageS.update({username:username},{$push:{friends:friend}});
    socket.leave(username);
    client.close();
    });
    var url = "mongodb://"+ip+friend;
    socket.join(friend);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(friend);
      const messageS=mydatabase.collection(friend);
      messageS.update({username:friend},{$push:{friends:username}});
          socket.leave(friend);
          client.close();
    });

  });
  socket.on('friend request',function(username,friend){
    var url = "mongodb://"+ip+friend;
    socket.join(friend);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(friend);
      const messageS=mydatabase.collection(friend);
      messageS.insertMany({type:"friendrequest",people:username});
      socket.emit('got new friend requests',username);
    socket.leave(friend);
    client.close();
    });
  });
  socket.on('getfriends',function(username){
    var url = "mongodb://"+ip+username;
    socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(username);
      const messageS=mydatabase.collection(username);
      messageS.find({username:username}).toArray(function(err,docs){
        assert.equal(err,null);
        io.sockets.in(username).emit("the friends",docs[0].friends);

    socket.leave(username);
    client.close();
      });
    })
  });
  socket.on('tag',function(username,tag,like){
    var url = "mongodb://"+ip+"tagsldifjjs";
    // socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db("tagsldifjjs");
      const messageS=mydatabase.collection(tag);
      messageS.insertMany({people:username,like:like});
    client.close();
    });
  });
  socket.on('available friend request',function(username){
    var url = "mongodb://"+ip+username;
    socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db(username);
      const messageS=mydatabase.collection(username);
      messageS.find({type:"friendrequest"}).toArray(function(err,docs){
        assert.equal(err,null);
        for(var x of docs)
        io.sockets.in(username).emit("my friend request",x.people);

    socket.leave(username);
    client.close();
      });
    })
  });
  socket.on('search for people',function(tag,username){
    var url = "mongodb://"+ip+"tagsldifjjs";
    socket.join(username);
    MongoClient.connect(url, function(err, client) {
      if(err){
        console.log("Error in seeing tags");
      }
      // console.log("Seeing tags of "+whosetags);  
      var mydatabase=client.db("tagsldifjjs");
      const messageS=mydatabase.collection("tag");
      messageS.find({}).toArray(function(err,docs){
        assert.equal(err,null);
        for(var x of docs)
        io.sockets.in(username).emit("searched people",x.people);

    socket.leave(username);
    client.close();
      });
    })
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


app.use('/', routes);
app.use('/users', users);
module.exports=app;
// Set Port
