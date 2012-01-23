var fs = require('fs');

exports.jqmWebShop = function(req,res){

	fs.readFile('./Webshop_jQm/index.html', function(err, data) {
		if(err) {console.log(err);}
		res.send(data);
		
	});
		
}   