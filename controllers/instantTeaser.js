var fs = require('fs');

exports.html = function(req,res){

	fs.readFile('./views/InstantTeaser.html', function(err, data) {
		if(err) {console.log(err);}
		res.send(data);
		
	});
		
}