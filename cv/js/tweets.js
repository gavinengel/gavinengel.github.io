$(function(){
	
	$.ajax({
		url: 'http://www.gavinengel.com/scripts/twitter/get_tweets.php',
		type: 'GET',
		success: function(response) {

			if (typeof response.errors === 'undefined' || response.errors.length < 1) {
				
				var $tweets = $('<ul></ul>');
				$.each(response, function(i, obj) {
					$tweets.append('<li>' + obj.text + '</li>');
					
				});

				var $tweets2 = $('<div class="carousel-inner"></div>');
				var $active = '';
				$.each(response, function(i, obj) {
					console.log(obj)
				  $active = (i)? '' : 'active';
					$tweets2.append('<div class="item ' + $active + '"><p><a href="https://twitter.com/gavinengel/status/'+obj.id_str+'" target="_blank">' + obj.text + '</a></p></div>');
					
				});

				$('#slideshow1').html($tweets2);
				$('.tweets-container').html($tweets);

			} else {
				$('.tweets-container p:first').text('Response error');
			}
		},
		error: function(errors) {
			$('.tweets-container p:first').text('Request error');
		}
	});
	

});

