
/* app.js
   this file now only sets configuration and defines routes
*/ 

var rest_server = require('./lib/server/rest_server');
var Clients = require('./lib/clients/clients');

var eleganceClient = new Clients.elegance('elegance', 'address');
var intershopClient = new Clients.intershop('intershop', 'address');

//eleganceClient.fetchAllData();
//intershopClient._initializeClients();
rest_server.start();


//allClients (intershopClient, eleganceClient)