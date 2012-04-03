var express = require('express');
var app = express.createServer();

var nowjs = require('now');
var everyone = nowjs.initialize(app);

var websocketController = require('./../../controllers/websocket').websockets;
var productsController = require('./../../controllers/rest');
var htmlController = require('./../../controllers/html');

var MongoDB = require('./../../models/mongoDB');
var mongoose = require('mongoose');
var mongoClient = MongoDB.clients;


/*
Websockets
*/
everyone.now.loadMainCategories = websocketController.loadMainCategories;
everyone.now.distributeTeaser = function(message) {
	everyone.now.receieveTeaserData(message);
}
everyone.now.loadProducts = websocketController.loadProducts;

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

app.set('view engine', 'jade');
//app.all('/jQuerym/Webshop', jqueryShop.jqmWebShop);
//app.all('/InstantTeaser', instantTeaser.html);

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


app.get('/Elegance/jade/jQueryMobile', productsController.Elegance.jQueryMobile);
/*
ELEGANCE
*/
app.all('/Elegance/cache/getMainCategories');
app.all('/Elegance/cache/getSubCategories');
app.all('/Elegance/cache/getProducts');
app.all('/Elegance/cache/getCompleteList?*', productsController.Elegance.completeList);

app.all('/Intershop/request/mainCategories');


app.all('/nowjs/websocket', htmlController.websocket);

app.listen(8000, '127.0.0.1');

};

exports.start = start;