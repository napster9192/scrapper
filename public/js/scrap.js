(function($){
	$(document).ready(function(e) {
		$('form#scrap-form .load').click(function(e) {
			e.preventDefault();
			var uri = $('form#scrap-form input[name="uri"]').val();
			if(uri == '') {
				return;
			}
			$('form#scrap-form iframe').attr('src', '/scrap/request?uri=' + encodeURIComponent(uri));
		});
	});
}(jQuery));