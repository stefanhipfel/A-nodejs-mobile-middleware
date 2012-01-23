//dirty key-value store, for >= 1 million records
var dirtyDb = {
	mainCategories: require('dirty')('./database/mainCategories.db'),
	productList: require('dirty')('./database/productList.db'),
	subCategories: require('dirty')('./database/subCategories.db'),
	completeProducts: require('dirty')('./database/completeProducts')
};



console.log('database files loaded');
exports.dirtyDb = dirtyDb;



