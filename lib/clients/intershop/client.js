var soap = require('soap');
var step = require('step');
var dirtydb = require('./../../../models/dirtyDB').dirtyDb;
var MongoDB = require('./../../../models/mongoDB');
var mongoose = require('mongoose');
var soapConfig = require('./../../../soapConfig').client;
var catDomainStart = '<categoryDomainName>';
var catDomainEnd = '</categoryDomainName>';
var nameStart = '<categoryName>';
var nameEnd = '</categoryName>';

var Client = function() {
	
	this._initializeClients();

};

Client.prototype._initializeClients = function() {
	var self = this;
	step(
		function createClients() {
			soap.createClient(soapConfig.wsdl[1], this.parallel());
			soap.createClient(soapConfig.wsdl[2], this.parallel());
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
						
			//	this();
			}
		},
		
		function getData() {
			//var JsonParser = require('./parser').JsonParser;
			self.loadData();
		}
	);	
};

Client.prototype._getSubCategories = function(client, data, callback) {
	var queue = [],
		cat,
		self = this,
		subcat = {},
		i = 1;
		
	for (var categories in data) {
		queue[categories] = data[categories];
	}
	(function iterate() {
		if(queue.length === 0) {
			console.log('Number of subCategories: ', i)
			callback(null, subcat);
			return;
		}
		cat = queue.splice(0, 1)[0];
		self._callSoapServices(client, cat, function(err, cat) {
			if (err) {throw err; }
			i++;
			if(!cat.return.categoriesContainer.categories) {
				console.log('undefined subCat');
				process.nextTick(iterate);
			} else {
				var _data = cat.return.categoriesContainer.categories;
				if(_data.domainName) {
					temp = _data.domainName;
					subcat[temp] = [];
				} else {
					var temp = _data[0].domainName;
					subcat[temp] = [];	
				}
				
				for (var categories in _data) {
					if(_data.name){
						subcat[_data.domainName].push(_data.name);
						break;
					} else {
						subcat[_data[categories].domainName].push(_data[categories].name);
					}
				}
				process.nextTick(iterate);
			}
		});
	})();
};

Client.prototype._getProductLists = function(client, data, callback) {
	var self = this,
		queue = [],
		categories = [],
		productList = [],
		prod,
		cat,
		i = 0;

	for (var products in data) {
		categories[i] = products;
		queue[i] = data[products];
		i++;
	};
	(function iterate() {
		if(queue.length === 0) {
			callback(null, productList);
			return;
		}
		prod = queue.splice(0, 1)[0];
		cat = categories.splice(0, 1)[0];
		
		(function iterate_list() {
			var queue=[];
			var data;
			if(prod.length === 0) {
				console.log('empty');
				process.nextTick(iterate);
				return;
			};
			queue = prod.splice(0, 1)[0];
			data = {domainName: cat,
					name: queue.replace(/\s{2,}/g, ' ')};
			self._callSoapServices(client, data, function(err, products) {
				if (err) {throw err; }
				
				if(!products) {
					console.log('!products', data)
					productList.push({return : {info: data, productsContainer: { leaf: true }}});
				}
				else if (!products.return.productsContainer.products) {
					console.log(data);
					productList.push({return : {info: data, productsContainer: { leaf: true }}});
				}else {
					productList.push({return: {info: data, productsContainer: products.return.productsContainer}});
				}
				process.nextTick(iterate_list);				
			});
			
		})();		
	})();
}

Client.prototype._callSoapServices = function(client, data, callback) {
	var self = this;
	var args;
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
			if (err) {console.log(err)};
			callback(null, data);
		});
	}else {
		self.mainCatClient.Browse(args, function(err, data){
			callback(null, data);
		});
	}
};

Client.prototype.routeCalls = function(requestObj, callback) {
	
}
/*Call main Categories
*/
Client.prototype.loadData = function() {
	var mainCat = [];
	var self = this;
	var productsContainer ={};
	productsContainer.products =[];
	console.log('Starting to load data from Intershop- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
	self._callSoapServices('mainCategories', '', function(err, data) {
		if (err) throw err;
		var result = data.return.categoriesContainer.categories;
		for (var categories in result) {
			mainCat.push({domainName: result[categories].domainName, name: result[categories].name, displayName: result[categories].displayName});
		}
		dirtydb.mainCategories.set('MainCategories', mainCat);
		dirtydb.mainCategories.on('drain', function() {
		console.log('Main categories saved to disk');
		});
		
		self._getSubCategories('categoryList', result, function(err, data) {
			console.log('Sub categories loaded');
			for(categories in data) {
				dirtydb.subCategories.set(categories, data[categories]);
			}
			
			dirtydb.subCategories.on('drain', function() {
				console.log('Sub categories saved to disk');
			});
			
			
			self._getProductLists('productList', data, function(err, data) {
				console.log('Prodcuts loaded');
				for(var prods in data) {
					productsContainer ={};
					productsContainer.products =[];
					var _data = data[prods].return.productsContainer.products;
					for(var item in _data) {
						console.log(item);
						productsContainer.products.push({'text': _data[item].name, 'price': _data[item].price, 'leaf': true});	
					}
					
					dirtydb.productList.set(data[prods].return.info.name, productsContainer.products);
				}
				dirtydb.productList.on('drain', function() {
					console.log('Products saved to disk');
					//var JsonParser = require('./parser').JsonParser;
				});
				
			});
		});	
		
	});
};


exports.Intershop = Client;