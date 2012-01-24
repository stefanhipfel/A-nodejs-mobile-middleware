var request = require('request');
var dirtydb = require('./../../../models/dirtyDB').dirtyDb;
var MongoDB = require('./../../../models/mongoDB');
var mongoose = require('mongoose');

var fs = require('fs')
  , completedTasks = 0
  , completedCategories = 0
  , tasks = []
  , nbrCategories = ''
  , mainCategories = []
  , mainCategoryList = []
  , subCategoryList = []
  , shopDataList = [];

var client = function(clientName, address) {
	this.name = clientName;
	this.address = address;
	this.Client = new MongoDB.clients({name: clientName});
}

function checkTaskComplete(self){
	completedTasks++;
	if(completedTasks === tasks.length) {
		console.log(self.name +', :Done fetching Data');
		mongoose.connect('mongodb://127.0.0.1/shopdatabase');
		
		for (var index in shopDataList ) {
			self.Client.items.push(shopDataList[index]);
		}
		self.Client.save(function(err) {
			console.log('------------>', self.name, ':Data saved to MongoDB');
			mongoose.disconnect();
		});
		
	}
}

client.prototype.fetchAllData = function(callback) {
	var self = this;
	self.makeRequest('getNavigation', '', function(err, data) {

		for(var index in data) {
			shopDataList[data[index].name] = new MongoDB.categories({name: data[index].name});
			
			for(var products in data[index].sub_groups) {
				var args = [];
				args.push({name: data[index].name}, {name: data[index].sub_groups[products].name});
				var task = (function(_input) {
		    		return function() {
		        		self.makeRequest('search', _input, function(err, data) {
		          			if(!err) {
								createDbObjects(_input, data, self);
								checkTaskComplete(self);

							}
				  		}); 
					}	
		    	})(args);
		    	tasks.push(task);		
			}			
		}
		for(var task in tasks) {
	    	tasks[task]();
	  	}
	});
}

function createDbObjects(_cat, _prod, self) {
	var Subcategory = new MongoDB.subcategories({name: _cat[1].name});
		
	for (var index in _prod) {		
		for (var items in _prod[index]) {
			var images = [];
			for (var img in _prod[index][items].image_urls) {
					images.push(_prod[index][items].image_urls[img]);
			}
            if(_prod[index][items].copy_text) {
                var products = new MongoDB.products({//_id: _prod[index][items].pk
												  name: _prod[index][items].name
												, price: _prod[index][items].current_price
												, images: images
												, text: _prod[index][items].copy_text});
                Subcategory.items.push(products.toObject());
            }			
		}	
	}
	shopDataList[_cat[0].name].items.push(Subcategory);
	
}

client.prototype.makeRequest = function(method, input, callback) {

	if(method === 'search') {
		var jsonData = JSON.stringify(input);
		console.log('call', jsonData)
		var args = '[{"name":"CATEGORY_PATHROOT","filters":' + jsonData + '}]';
		request('http://www.elegance.de/mcommerce.html?method=search&start=1&length=30&text=*&filter=' + escape(args), function(err, response, body) {
			if(!err && response.statusCode === 200) {
				var JsonData = JSON.parse(body);

				callback(null, JsonData);
			}
		});
	} else if(method === 'getNavigation') {
		request('http://elegance.de/mcommerce.html?method=getNavigation', function(error, response, body) {
				if(!error && response.statusCode === 200) {
					var JsonData = JSON.parse(body);

					callback(null, JsonData);
				}
		});
	}
}

module.exports = client;