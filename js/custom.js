$(document).ready(function() {
	$('.menu li:has(ul)').click(function(e) {
		e.preventDefault();
		// console.log(this)
		if($(this).hasClass('activado')) {
			// $(this).removeClass('activado');
			
			// $(this).children('ul').slideUp();
		} else {
			$('.menu li ul').slideUp();
			$('.menu li').removeClass('activado');
			$('.menu li').children('a').children('i').attr('class','fa fa-chevron-down')
			$(this).addClass('activado');
			$(this).children('a').children('i').attr('class','fa fa-chevron-up')
			$(this).children('ul').slideDown();
		}

		$('.menu li ul li a').click(function() {
			window.location.href = $(this).attr('href');
		})
	});
});