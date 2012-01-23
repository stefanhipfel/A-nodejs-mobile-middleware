var Soap = require('soap');
var Step = require('step');
var MongoDB = require('./../../../models/mongoDB');
var mongoose = require('mongoose');

var soapConfig = require('./../../../soapConfig').client;
var catDomainStart = '<categoryDomainName>';
var catDomainEnd = '</categoryDomainName>';
var nameStart = '<categoryName>';
var nameEnd = '</categoryName>';

var mainCategoryList = []
  , subCategoryList = []
  , productList = []
  , tasks = []
  , completedTasks = 0;

var client = function(clientName, address) {
	this.name = clientName;
	this.address = address;
	this.Client = new MongoDB.clients({name: clientName});
}

client.prototype._initializeClients = function() {
	var self = this;
	Step(
		function createClients() {
			Soap.createClient(soapConfig.wsdl[1], this.parallel());
			Soap.createClient(soapConfig.wsdl[2], this.parallel());
		},		
		function defineClients(err, catClient, prodClient) {
			if(!catClient || !prodClient || err) {
				console.log('error creating Client');
			} else {				
				self.mainCatClient = catClient;
				self.mainCatClient.setRequestStructure('Browse');
				self.mainCatClient.setEndpoint(soapConfig.endpoint);			
			
				self.mainProdList = prodClient;
				self.mainProdList.setRequestStructure('GetProductList');
				self.mainProdList.setEndpoint('ProductListServiceHttpSoap11Endpoint');				
				self.fetchAllData();
			}
		}
	);	
};

function checkIfTasksComplete(finalTask, self){
	completedTasks++;
	if(completedTasks === tasks.length) {
		
		if(finalTask) {
			console.log(self.name, ' :Done fetching Data');
			mongoose.connect('mongodb://127.0.0.1/shopdatabase');
			for (var index in mainCategoryList ) {
				self.Client.items.push(mainCategoryList[index]);
			}
			self.Client.save(function(err) {
				console.log('------------>', self.name, ' :Data saved to MongoDB');
				mongoose.disconnect();
			});
		}
		return 'done';
	}
	
}

client.prototype.fetchAllData = function() {
	var self = this;
		self.getMainCategories(function(err, data) {
			self.getSubCategories(data, function(err, data) {
				self.getProducts(function(err, data) {
					//console.log(data);
				})
			})
		})
}

client.prototype._callSoapServices = function(client, data, callback) {
	var args;
	var self = this;
	if(!data == '') {
		args = catDomainStart + data.domainName + catDomainEnd + nameStart + data.name + nameEnd;
	} else {
		args = '';
	}
	if(client === 'categoryList') {
		self.mainCatClient.Browse(args, function(err, data) {
			if (err) throw err;
			callback(null, data);
		});
	}else if(client === 'productList') {
		self.mainProdList.GetProductList(args, function(err, data) {
			if (err) {throw err;};
			callback(null, data);
		});
	}else {
		self.mainCatClient.Browse(args, function(err, data){
			if (err) {throw err};
			callback(err, data);
		});
	}
};

client.prototype.getMainCategories = function(callback) {
	var self = this;
	self._callSoapServices('mainCategories', '', function(err, data) {
		if (err) throw err;
		
		var result = data.return.categoriesContainer.categories;
		var mainCategories = [];
		for (var categories in result) {
			mainCategoryList[result[categories].domainName] = new MongoDB.categories({name: result[categories].name, displayName: result[categories].displayName});
			mainCategories.push(result[categories].domainName);
		}
		callback(null, mainCategories);
	});	
}

client.prototype.getSubCategories = function(data, callback) {
		tasks = [];
	var self = this;
	for (var index in data) {
		
		var task = (function(args) {
			return function() {
				self._callSoapServices('categoryList', args, function(err, data) {
					if (err) throw err;
					if(!data.return.categoriesContainer.categories) {
						console.log('undefined subCat');
						
					} else {
						var categories = data.return.categoriesContainer.categories;
						if(categories.domainName) {
							console.log('categories.domainName: ', categories)
							mainCategoryList[categories.domainName].items.push(new MongoDB.subcategories({name:'', leaf: true}));
						} 
						
						for (var index in categories) {
							if(categories.name) {
								mainCategoryList[categories.domainName].items.push(new MongoDB.subcategories({name: categories.name}));
								break;
							}else {
								mainCategoryList[categories[index].domainName].items.push(new MongoDB.subcategories({name: categories[index].name}));
							}
						}
					}
					if (checkIfTasksComplete(false, self) === 'done') {
						callback(null, 'ok')
					};
				});
			}
		})({domainName: data[index], name: mainCategoryList[data[index]].name});
		tasks.push(task);
	}
	for(var task in tasks) {
    	tasks[task]();
  	}
}


client.prototype.getProducts = function(callback) {
	completedTasks = 0;
	tasks = [];
	var self = this;
	
	for(var index in mainCategoryList) {
		for(var subs = 0; subs < mainCategoryList[index].items.length; subs++) {
			var  task = (function(args) {
				return function() {
				//	console.log(mainCategoryList[args.domainName].subcategories)
					self._callSoapServices('productList', args, function(err, data) {
						if(!data) {
							console.log('!no Data', data)
							mainCategoryList[args.domainName].items[args.item].items.push(new MongoDB.products({name: '', text: '', price: ''}));
							
						}
						else if (!data.return.productsContainer.products) {
							console.log('NO products ', data);
							mainCategoryList[args.domainName].items[args.item].items.push(new MongoDB.products({name: '', text: '', price: ''}));
						}else {
							for (var products in data.return.productsContainer.products) {
								mainCategoryList[args.domainName].items[args.item].items.push(new MongoDB.products({name: data.return.productsContainer.products[products].name, text: data.return.productsContainer.products[products].name, price: data.return.productsContainer.products[products].price}));
							}
						}
						if (checkIfTasksComplete(true, self) === 'done') {
							callback(null, 'ok')
						};
					});
				}
			})({domainName: index, name: mainCategoryList[index].items[subs].name, item: subs});
			tasks.push(task);
		}
		
	}
	for(var task in tasks) {
		console.log(Date.now())
		tasks[task]();
	 }
}
	
module.exports = client;