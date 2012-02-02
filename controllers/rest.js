var dirtyDb = require('../models/dirtyDB').dirtyDb;
var MongoDB = require('../models/mongoDB');
var mongoose = require('mongoose');
var mongoClient = MongoDB.clients;
var Intershop = {},
	Elegance = {};
	
var cache = [];
mongoose.connect('mongodb://127.0.0.1/shopdatabase');
mongoClient.find({}, function(err, docs){ 
	cache 
});
mongoose.disconnect();

Intershop.completeList = function(req,res){
		
		mongoose.connect('mongodb://127.0.0.1/shopdatabase');
		mongoClient.find({name: 'intershop'}, function(err, docs){ 
			res.send(JSON.stringify(docs[0])) 
		});
		mongoose.disconnect();    
};

Elegance.completeList = function(req,res) {

		mongoose.connect('mongodb://127.0.0.1/shopdatabase');
		mongoClient.find({name: 'elegance'}, function(err, docs){ 
			res.send(JSON.stringify(docs[0])) 
		});
		mongoose.disconnect();
}

exports.Intershop = Intershop;
exports.Elegance = Elegance;

//es.send(JSON.stringify(dirtyDb.completeProducts.get('json'))) 