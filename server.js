#!/bin/env node

//initialize dependencies
var fs      = require('fs');
var express = require('express');
var mongodb = require('mongodb');

var App = function(){

  var self = this;

  //Setup mongodb server
  self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST,parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));
  self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true});
  self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
  self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

  self.ipaddr  = process.env.OPENSHIFT_NODEJS_IP;
  self.port    = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
  if (typeof self.ipaddr === "undefined") {
    console.warn('No OPENSHIFT_NODEJS_IP environment variable');
  };


  // Web app logic
  self.routes = {};

  //basic status check
  self.routes['health'] = function(req, res){ res.send('1'); };
  
 
  //returns all the trucks in the collection
  self.routes['viewAllTrucks'] = function(req, res){
    self.db.collection('truckpoints').find().toArray(function(err, names) {
        res.header("Content-Type:","application/json");
        res.end(JSON.stringify(names));
    });
  };

  //find a single truck using the mongoID (for database validation)
  self.routes['viewTruck'] = function(req, res){
      var BSON = mongodb.BSONPure;
      var truckObjectID = new BSON.ObjectID(req.params.id);
      self.db.collection('truckpoints').find({'_id':truckObjectID}).toArray(function(err, names){
              res.header("Content-Type:","application/json");
              res.end(JSON.stringify(names));
      });
  };

  //find trucks near a specified location
  self.routes['viewTrucksNear'] = function(req, res){
      var lat = parseFloat(req.query.lat);
      var lon = parseFloat(req.query.lon);

      self.db.collection('truckpoints').find( {'pos' : {$near: [lon,lat]}}).toArray(function(err,names){
          res.header("Content-Type:","application/json");
          res.end(JSON.stringify(names));
       });
  };

  //find trucks within a certain bounding box
  self.routes['viewTruckWithin'] = function(req, res){
      var lat1 = parseFloat(req.query.lat1);
      var lon1 = parseFloat(req.query.lon1);
      var lat2 = parseFloat(req.query.lat2);
      var lon2 = parseFloat(req.query.lon2);

      self.db.collection('truckpoints').find({"pos" : { $geoWithin : { $box: [[lon2,lat2], [lon1,lat1]]}}}).toArray(function(err,names){
          res.header("Content-Type:","application/json");
          res.end(JSON.stringify(names));
      });
  };


  //deal with the URLs
  self.app  = express();
  self.app.use(express.compress());
  
  // Serve up content from public directory
  self.app.use(express.static(__dirname + '/public'));


  //This uses the Connect frameworks body parser to parse the body of the post request
  self.app.configure(function () {
        self.app.use(express.bodyParser());
        self.app.use(express.methodOverride());
        self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  //define all the url mappings
  self.app.get('/health', self.routes['health']);
  self.app.get('/ws/trucks', self.routes['viewAllTrucks']);
  self.app.get('/ws/trucks/truck/:id', self.routes['viewTruck']);
  self.app.get('/ws/trucks/near', self.routes['viewTrucksNear']);
  self.app.get('/ws/trucks/within', self.routes['viewTruckWithin']);


  // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.
  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){ throw err };
      self.db.authenticate(self.dbUser, self.dbPass, {authdb: "admin"}, function(err, res){
        if(err){ throw err };
        callback();
      });
    });
  };
  
  
  //starting the nodejs server with express
  self.startServer = function(){
    self.app.listen(self.port, self.ipaddr, function(){
      console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr, self.port);
    });
  }

  // Terminate server
  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...', Date(Date.now()), sig);
      process.exit(1);
    };
    console.log('%s: Node server stopped.', Date(Date.now()) );
  };

  process.on('exit', function() { self.terminator(); });

  self.terminatorSetup = function(element, index, array) {
    process.on(element, function() { self.terminator(element); });
  };

  //deal with termination signals
  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);

};

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
