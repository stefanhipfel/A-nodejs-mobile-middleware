var express = require('express');
var app = express.createServer();
var productsController = require('./../../controllers/rest');
var jqueryShop = require('./../../controllers/jqueryMobile');
var instantTeaser = require('./../../controllers/instantTeaser');
var dirtydb = require('./../../models/dirtyDB').dirtyDb;
var nowjs = require('now');
var everyone = nowjs.initialize(app);

//exports.everyone = everyone;
//var nowjs = require('../controllers/nowjs_products');


everyone.now.loadMainCategories = function(client, service, callback) {
	var mainCat,
		categories;
		
	if(client === 'jqm') {
		if(service === 'intershop') {
			mainCat = dirtydb.mainCategories.get('MainCategories');
			for(var domain in mainCat) {
				mainCat[domain].subcategories = dirtydb.subCategories.get(mainCat[domain].domainName);
			}
			callback(null, mainCat);
		}
		else if(service === 'elegance') {
			mainCat = dirtydb.mainCategories.get(service);
			var list = [];
			
			for (var category in mainCat) {
				var subs = [];
				for(var subcategories in mainCat[category].sub_groups) {
					subs.push({displayName: mainCat[category].sub_groups[subcategories].name});
				}
				list.push({displayName : mainCat[category].name,
							subcategories: subs});
			}
			callback(null, list);
		}
		
	} else {
		//different clients
	}
	
	
}

everyone.now.distributeTeaser = function(message) {
	everyone.now.receieveTeaserData(message);
}


/*REST server Headers configuration
*/
var setHeaders = function(req, res, next) {
	res.statusCode = 200;
	
	res.header('Content-Type', 'text/html');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');

	if (req.xhr) {
		res.statusCode = 200;
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Content-Type', 'application/json');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
	} next();
};

/*method starting REST server
*/
function start(){
app.configure(function() {
	app.use(express.logger());
	app.use(setHeaders);
})

app.configure('development', function () {
	app.use(express.errorHandler({
		dumpException: true,
		showStack: true
	}));

});

app.configure('production', function () {
	app.use(express.errorHandler());
});

app.all('/jQuerym/Webshop', jqueryShop.jqmWebShop);
app.all('/InstantTeaser', instantTeaser.html);

/*
shop-clients
*/
app.all('/clients/ShowRessources');
/*
INTERSHOP
*/
app.all('/Intershop/cache/getMainCategories');
app.all('/Intershop/cache/getSubCategories');
app.all('/Intershop/cache/getProducts');
app.all('/Intershop/cache/getCompleteList?*', productsController.Intershop.completeList);

app.all('/Intershop/request/mainCategories');
/*
ELEGANCE
*/
app.all('/Elegance/cache/getMainCategories');
app.all('/Elegance/cache/getSubCategories');
app.all('/Elegance/cache/getProducts');
app.all('/Elegance/cache/getCompleteList?*', productsController.Elegance.completeList);

app.all('/Intershop/request/mainCategories');


app.listen(8000, '192.168.0.198');

};

exports.start = start;