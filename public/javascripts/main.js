$(function(){
 $('#search').on('keyup', function(e){
   if(e.keyCode === 13) {
     var parameters = { search: $(this).val() };
       $.get( '/searching',parameters, function(data) {
       $('#results').html(data);
     });
    };
 });
});

var app = (function(){
  
  var bindEvents = function(){},
      dispatcher = function(){},
  
      return {
    init: init
  }
}());


document.readyState('complete', function() {
  app.init();
});
