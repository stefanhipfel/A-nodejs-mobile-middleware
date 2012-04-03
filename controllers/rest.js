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

Elegance.jQueryMobile = function(req,res) {
	var intershop = '';
	var returnData = [];
	mongoose.connect('mongodb://127.0.0.1/shopdatabase');
	mongoClient.find({name: 'elegance'}, function(err, docs){ 
		intershop = docs[0];
		for (var main=0; main < intershop.items.length; main++) {
			console.log(intershop.items[main].items);
			var subs = [];
			for (var sub=0; sub < intershop.items[main].items.length; sub++) {
				subs.push({name: intershop.items[main].items[sub].name, id: intershop.items[main].items[sub]._id});;
			}	
			returnData.push({name: intershop.items[main].name, subcategories: subs});
		}
			res.render ('mainPage', {
			        name: "jake",
					  title: 'jQuery mobile Jade',
					  items: returnData
			    });
	});
	mongoose.disconnect();

}
exports.Intershop = Intershop;
exports.Elegance = Elegance;

//es.send(JSON.stringify(dirtyDb.completeProducts.get('json'))) 