const loaderEl = document.getElementsByClassName('fullpage-loader')[0];
document.addEventListener('readystatechange', (event) => {
	// const readyState = "interactive";
	const readyState = "complete";

	if (document.readyState == readyState) {
		// when document ready add lass to fadeout loader


		// when loader is invisible remove it from the DOM
		setTimeout(() => {
			loaderEl.classList.add('fullpage-loader--invisible');
			loaderEl.parentNode.removeChild(loaderEl);
		}, 2000)
	}
});

$(document).ready(function () {
	$('.menu li:has(ul)').click(function (e) {
		e.preventDefault();
		// console.log(this)
		if ($(this).hasClass('activado')) {
			// $(this).removeClass('activado');

			// $(this).children('ul').slideUp();
		} else {
			$('.menu li ul').slideUp();
			$('.menu li').removeClass('activado');
			$('.menu li').children('a').children('i').attr('class', 'fa fa-chevron-down')
			$(this).addClass('activado');
			$(this).children('a').children('i').attr('class', 'fa fa-chevron-up')
			$(this).children('ul').slideDown();
		}

		$('.menu li ul li a').click(function () {
			window.location.href = $(this).attr('href');
		})
	});
});

function openNav() {
	var myVideo = document.getElementById("video");
	myVideo.play()
	document.getElementById("myNav").style.width = "100%";
  }
  
  function closeNav() {
	var myVideo = document.getElementById("video");
	myVideo.pause()

	document.getElementById("myNav").style.width = "0%";
  }