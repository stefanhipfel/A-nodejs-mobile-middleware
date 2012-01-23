/*MongoDB ORM
  data -> ram -> flashing to disk!s
*/
var mongoose = require('mongoose'),
 	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

/*
mongoDB Schema:
*/
var ProductSchema = new Schema({
	name: String,
	text: {type: String, default: 'no Text'},
	price: String,
	images: {type: [String], default: ['empty']},
	leaf: {type: Boolean, default: true}
});

var Products = mongoose.model('Products', ProductSchema);

var SubCategorySchema = new Schema({
	name: String,
	items: [Products.schema],
	leaf: {type: Boolean, default: false}
});
var SubCategories = mongoose.model('SubCategories', SubCategorySchema);

var CategorySchema = new Schema({
	name: String,
	info: String,
	items: [SubCategories.schema]
});
var Categories = mongoose.model('Categories', CategorySchema);

var ClientSchema = new Schema({
	name: {type: String, default: ''},
	items: [Categories.schema],
});




module.exports.clients = mongoose.model('Clients', ClientSchema);
module.exports.categories = Categories;
module.exports.subcategories = SubCategories;
module.exports.products = Products;