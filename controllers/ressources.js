exports.showRessources = function(req,res){
		res.send(JSON.stringify(database.call.completeProducts.get('json')))      
};