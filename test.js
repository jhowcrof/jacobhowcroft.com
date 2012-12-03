$('#paragraph').click(function(){
	$('#paragraph').hide();
});

$('document').ready(function(){
	$('body').fadeIn('fast');
});

$('#homelink').click(function(){
	$('#main').siblings().hide();
	$('#main').fadeIn('fast');
});

$('#gameslink').click(function(){
	$('#games').siblings().hide();
	$('#games').fadeIn('fast');
});

$('#resumelink').click(function(){
	$('#resume').siblings().hide();
	$('#resume').fadeIn('fast');
});

$('.nav_el').mousedown(function(){
	$(this).addClass("nav_el_clicked");
});

$('.nav_el').mouseup(function(){
	$(this).removeClass("nav_el_clicked");
});

