var ws = {};
(function( $ ) {
	var methods = {
		initMainPage : function() {
			alert('loading');
			var page = $('#mainPage');
			var categories = $('#main_categories');
			page.bind('pagecreate', function(event, ui){
				now.loadMainCategories('jqm', function(err, data) {
					for (var cat in data) {
						console.log(cat);
					}
				});
			});
		},
		
		initProductsPage : function() {
			//TODO: load specific products
			var page = $('#');
			page.bind("pageshow", function(event, ui) {
				
			})
		},
		
		initProductDetailPage : function() {
			//TODO: load productView
			//		progress bar
			var page = $('#');
			page.bind("pageshow", function(event, ui) {
				
			})
		},
		
		initAccountPage : function() {
		},
		
		initAll : function() {
			$().initApp("initMainPage");
			$().initApp("initProductsPage");
			$().initApp("initProductDetailPage");
			$().initApp("initAccountPage");
		}
	};
	
	$.fn.initApp = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, 
			Array.prototype.slice.call( arguments, 1));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.initAll.apply( this, arguments );
		}else {
			$.error( 'Method ' + method + ' does not exist');
		}
	};
})(jQuery);

ws.getData = function() {
	//private property
	var config = {
		server: ''
	};
	
	//public method: fetching JSON
	var init = function (method) {
		$.ajax({
			url: config.server,
			dataType: 'json',
			success: function( data ) {
				
			},
			error: function( status ) {
				
			}
		})
	};
	
	return {
		init: init		
	}
}

ws.parseCatList = function() {
	//private property
	var config = {
		server: ''
	};
	
	//public method: fetching JSON
	var init = function (method) {
		
	};
	
	return {
		init: init		
	}
}

ws.parseProdList = function() {
	//private property
	var config = {
		server: ''
	};
	
	//public method: fetching JSON
	var init = function (method) {
		
	};
	
	return {
		init: init		
	}
}

