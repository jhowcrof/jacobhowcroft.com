/**
 * temperature.js
 */

// Canvas
var canvas = document.getElementById("thecanvas");
var buffer = document.createElement('canvas');
var background = document.getElementById("bg");
buffer.height = canvas.height;
buffer.width = canvas.width;
var bg_ctx = background.getContext("2d");
var ctx = buffer.getContext("2d");
var final_ctx = canvas.getContext("2d");

// Audio
var snow_sounds = new Array(new Audio("audio/cold.mp3"), new Audio(
		"audio/cold.mp3"), new Audio("audio/cold.mp3"), new Audio(
		"audio/cold.mp3"));
var fire_sounds = new Array(new Audio("audio/hot.mp3"), new Audio(
		"audio/hot.mp3"), new Audio("audio/hot.mp3"),
		new Audio("audio/hot.mp3"));

// Images
var logo = new Image();
logo.src = "images/dunbeer.png";
var snow = new Image();
snow.src = "images/so_cold.png";
var fire = new Image();
fire.src = "images/so_hot.png";
var bg = new Image();
bg.src = "images/backdrop.png";
var bucket_top = new Image();
bucket_top.src = "images/pipe_t.png";
var bucket_bottom = new Image();
bucket_bottom.src = "images/pipe_b.png";
var clock = new Image();
clock.src = "images/ticktock.png";

// Variables
var mouse = {
	x : 0,
	y : 0
};
var frame_drawLogo = 0;
var rotation = 0;
var fireballs = new Array();
var snowballs = new Array();
var fireparticles = new Array();
var snowparticles = new Array();
var bucket = 0;
var temp = 70;
var gravity = -1;
var particles = 20;
var clock_rotation = 0;
var frame_count = 0;
var start = 0;
var end = 0;
var framerate = 0;
var score = 0;
var time = 0;

ssplash();

function fireball(pos) {
	this.x = pos;
	this.y = -fire.height;
	this.dy = Math.round(Math.random() * 10 + 5);
	this.rot = 0;
}

function snowball(pos) {
	this.x = pos;
	this.y = -snow.height;
	this.dy = Math.round(Math.random() * 10 + 5);
	this.rot = 0;
}

function snowparticle(x, y) {
	this.x = x;
	this.y = y;
	this.dx = -5 + Math.random() * 10;
	this.dy = Math.random() * -5 - 5;
}

function fireparticle(x, y) {
	this.x = x;
	this.y = y;
	this.dx = -5 + Math.random() * 10;
	this.dy = Math.random() * -5 - 5;
}

function snowparticle2() {
	this.x = bucket;
	this.y = canvas.height;
	this.dx = -3 + Math.random() * 5;
	this.dy = Math.random() * -10 - 10;
}

function fireparticle2() {
	this.x = bucket;
	this.y = canvas.height;
	this.dx = -3 + Math.random() * 5;
	this.dy = Math.random() * -10 - 10;
}

function main() {
	canvas.addEventListener('mousemove', getMousePos, false);
	bg_ctx.drawImage(bg, 0, 0);
	ctx.font = "24pt Monospace";
	var main_interval = setInterval("update()", 30);
	var makeballs = setInterval(
			function() {
				if (document.hasFocus()) {
					// console.log("new ball @ " + (new Date()).getTime());
					snowballs.push(new snowball(Math.round(Math.random()
							* (814 - 45))));
					fireballs.push(new fireball(Math.round(Math.random()
							* (814 - 45))));
				}
			}, 750);
}

function ssplash() {
	window.focus();
	var logo_interval = setInterval("drawLogo()", 30);
	setTimeout(function() {
		clearInterval(logo_interval);
		main();
	}, 3000);
}

function drawLogo() {
	final_ctx.drawImage(logo, 0, 0);
}

function update() {
	if (document.hasFocus()) {
		// Measure FPS
		if (frame_count++ == 0) {
			var d = new Date();
			start = d.getTime();
		}
		if (frame_count == 9) {
			var d = new Date();
			end = d.getTime();
			frame_count = 0;
			framerate = 1000 / ((end - start) / 10);
		}

		if ((time++) % 5 == 0) {
			score++;
		}
		// Update
		updateSnow();
		updateFire();
		updateBucket();
		updateParticles();
		checkCollisions();
		clock_rotation += 0.05;

		// Draw
		// ctx.drawImage(bg, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBucketTop();
		drawSnow();
		drawFire();
		drawParticles();
		drawBucketBottom();
		drawClock();
		ctx.fillStyle = "#000";
		ctx.fillText(temp, 920, 100);
		// ctx.fillText(framerate, 950, 300);
		ctx.fillStyle = "#FFF";
		ctx.fillText(score, 1000, canvas.height - 25 - clock.height / 2);
		final_ctx.clearRect(0, 0, canvas.width, canvas.height);
		final_ctx.drawImage(buffer, 0, 0);
	}
}

function drawClock() {
	ctx.save();
	ctx.translate(900 + clock.width / 2, canvas.height - 25 - clock.height / 2);
	ctx.rotate(clock_rotation);
	ctx.drawImage(clock, -clock.width / 2, -clock.height / 2);
	ctx.restore();
}

function updateParticles() {
	for ( var i = 0; i < snowparticles.length; i++) {
		var p = snowparticles.shift();
		if (p.y > canvas.height || p.x < 0 || p.x > canvas.width)
			continue;
		p.x += p.dx;
		p.y += p.dy;
		p.dy -= gravity;
		snowparticles.push(p);
	}
	for ( var i = 0; i < fireparticles.length; i++) {
		var p = fireparticles.shift();
		if (p.y > canvas.height || p.x < 0 || p.x > canvas.width)
			continue;
		p.x += p.dx;
		p.y += p.dy;
		p.dy -= gravity;
		fireparticles.push(p);
	}
}

function drawParticles() {
	ctx.fillStyle = "#57BDEB";
	for ( var i = 0; i < snowparticles.length; i++) {
		ctx.fillRect(snowparticles[i].x, snowparticles[i].y, 5, 5);
	}
	ctx.fillStyle = "#FFBD00";
	for ( var i = 0; i < fireparticles.length; i++) {
		ctx.fillRect(fireparticles[i].x, fireparticles[i].y, 5, 5);
	}
}

function checkCollisions() {
	for ( var i = 0; i < snowballs.length; i++) {
		var ball = snowballs.shift();
		// Hit edge
		if (ball.y + fire.height > canvas.height - 81
				&& ball.x + 5 < bucket - bucket_bottom.width / 2
				&& (ball.x + fire.width) > bucket - bucket_bottom.width / 2) {
			// break ball
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y + fire.height > canvas.height - 81
				&& (ball.x) < bucket + bucket_bottom.width / 2
				&& (ball.x + fire.width - 5) > bucket + bucket_bottom.width / 2) {
			// break ball
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y > canvas.height - 73
				&& ball.x + 5 > bucket - bucket_bottom.width / 2
				&& ball.x - 5 < bucket + bucket_bottom.width / 2) {
			// catch ball
			temp--;
			var s = snow_sounds.shift(); 
			s.play();
			snow_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle2());
			}
			continue;
		}
		snowballs.push(ball);

	}

	for ( var i = 0; i < fireballs.length; i++) {
		var ball = fireballs.shift();
		// Hit edge
		if (ball.y + fire.height > canvas.height - bucket_bottom.height
				&& ball.x + 5 < bucket - bucket_bottom.width / 2
				&& (ball.x + fire.width) > bucket - bucket_bottom.width / 2) {
			// break ball
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y + fire.height > canvas.height - bucket_bottom.height
				&& (ball.x) < bucket + bucket_bottom.width / 2
				&& (ball.x + fire.width - 5) > bucket + bucket_bottom.width / 2) {
			// break ball
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y > canvas.height - 73
				&& ball.x + 5 > bucket - bucket_bottom.width / 2
				&& ball.x - 5 < bucket + bucket_bottom.width / 2) {
			// catch ball
			temp++;
			var s = fire_sounds.shift(); 
			s.play();
			fire_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle2());
			}
			continue;
		}
		fireballs.push(ball);
	}
}

function updateBucket() {
	bucket = mouse.x;
}

function drawBucketTop() {
	ctx.drawImage(bucket_top, bucket - bucket_top.width / 2, canvas.height
			- bucket_top.height);
}

function drawBucketBottom() {
	ctx.drawImage(bucket_bottom, bucket - bucket_top.width / 2, canvas.height
			- bucket_top.height);
}

function updateSnow() {
	for ( var i = 0; i < snowballs.length; i++) {
		var ball = snowballs.shift();
		if (ball.y > canvas.height + 100)
			continue;
		ball.y += ball.dy;
		// ball.rot += 0.1;
		snowballs.push(ball);
	}
}

function updateFire() {
	for ( var i = 0; i < fireballs.length; i++) {
		var ball = fireballs.shift();
		if (ball.y > canvas.height + 100)
			continue;
		ball.y += ball.dy;
		// ball.rot += 0.1;
		fireballs.push(ball);
	}
}

function drawSnow() {
	for ( var i = 0; i < snowballs.length; i++) {
		var ball = snowballs.shift();
		ctx.drawImage(snow, ball.x, ball.y);
		snowballs.push(ball);
	}
}

function drawFire() {
	for ( var i = 0; i < fireballs.length; i++) {
		var ball = fireballs.shift();
		ctx.drawImage(fire, ball.x, ball.y);
		fireballs.push(ball);
	}
}

function getMousePos(ev) {
	// get canvas position
	var element = canvas;
	var top = 0;
	var left = 0;
	while (element && element.tagName != 'BODY') {
		top += element.offsetTop;
		left += element.offsetLeft;
		element = element.offsetParent;
	}

	// return relative mouse position
	mouse.x = ev.clientX - left + window.pageXOffset;
	mouse.y = ev.clientY - top + window.pageYOffset;
}