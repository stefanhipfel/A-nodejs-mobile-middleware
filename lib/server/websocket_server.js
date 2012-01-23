var everyone = require('../lib/server').everyone;
var dirtyDb = require('../models/products').dirtydb;


/*client: 'jqm/titanium etc'
*/
everyone.now.loadMainCategories = function(client, callback) {
	var mainCat,
		categories;
	if(client === 'jqm') {
		mainCat = dirtyDb.mainCategories.get('MainCategories');
	
		
	} else {
		//different clients
	}
	callback(null, JSON.stringify(mainCat));
	
};