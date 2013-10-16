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

var crash_sounds = new Array(new Audio("audio/pop.mp3"), new Audio(
		"audio/pop.mp3"), new Audio("audio/pop.mp3"),
		new Audio("audio/pop.mp3"));

console.log("Audio files loaded");

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
var thermometer = new Image();
thermometer.src = "images/meter.png";
var greenlight = new Image();
greenlight.src = "images/greenlight.png";
var yellowlight = new Image();
yellowlight.src = "images/yellowlight.png";
var redlight = new Image();
redlight.src = "images/redlight.png";
var glare = new Image();
glare.src = "images/tubeglare.png";

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
var gravity = -1;
var particles = 20;
var clock_rotation = 0;
var frame_count = 0;
var start = 0;
var end = 0;
var framerate = 0;
var dropHealth = true;
var drawHealth = true;

var gameintervals = {
	logo_interval : 0,
	main_interval : 0,
	makeballs_interval : 0,
	danger_interval : 0,
	clear : function() {
		clearInterval(this.logo_interval);
		clearInterval(this.main_interval);
		clearInterval(this.makeballs_interval);
		clearInterval(this.danger_interval);
	}
};

var gamedata = {
	time : 0,
	score : 0,
	health : 241,
	target : 70,
	temp : 70,
	state : 0,
	difficulty : 750,
	flashtext : false,
	reset : function() {
		this.time = 0;
		this.score = 0;
		this.health = 241;
		this.target = 70;
		this.temp = 70;
		this.state = 0;
		this.difficulty = 750;
		this.flashtext = false;
	}
};

canvas.addEventListener('mousemove', getMousePos, false);
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
	this.alpha = 1.0;
}

function fireparticle(x, y) {
	this.x = x;
	this.y = y;
	this.dx = -5 + Math.random() * 10;
	this.dy = Math.random() * -5 - 5;
	this.alpha = 1.0;
}

function snowparticle2(x) {
	this.x = x;
	this.y = canvas.height;
	this.dx = -3 + Math.random() * 5;
	this.dy = Math.random() * -10 - 10;
	this.alpha = 1.0;
}

function fireparticle2(x) {
	this.x = x;
	this.y = canvas.height;
	this.dx = -3 + Math.random() * 5;
	this.dy = Math.random() * -10 - 10;
	this.alpha = 1.0;
}

function main() {
	bg_ctx.drawImage(bg, 0, 0);
	bg_ctx.drawImage(bg, 0, 0);
	bg_ctx.drawImage(bg, 0, 0);
	ctx.font = "30pt Monospace";
	gameintervals.main_interval = setInterval("update()", 30);
	gameintervals.makeballs_interval = setInterval("makeballs()",
			gamedata.difficulty);
	setTimeout("changetarget()", 10000);
}

function changetarget() {
	var r = Math.random();
	var timeout = Math.random() * 10000 + 3000;
	if (r < 0.4) {
		gamedata.target--;
		flashText();
		setTimeout("changetarget()", timeout);
	} else if (r >= 0.4 && r < 0.5) {
		gamedata.target--;
		setTimeout(function() {
			gamedata.target--;
			flashText();
			setTimeout("changetarget()", timeout);
		}, 1000);
	} else if (r >= 0.5 && r < 0.6) {
		gamedata.target++;
		setTimeout(function() {
			gamedata.target++;
			flashText();
			setTimeout("changetarget()", timeout);
		}, 1000);
	} else if (r >= 0.6) {
		gamedata.target++;
		flashText();
		setTimeout("changetarget()", timeout);
	}
}

function flashText() {
	gamedata.flashtext = true;
	setTimeout(function() {
		gamedata.flashtext = false;
		setTimeout(function() {
			gamedata.flashtext = true;
			setTimeout(function() {
				gamedata.flashtext = false;
			}, 500);
		}, 500);
	}, 500);

}

function makeballs() {
	if (document.hasFocus()) {
		// console.log("new ball @ " + (new Date()).getTime());
		snowballs.push(new snowball(Math.round(Math.random() * (814 - 45))));
		fireballs.push(new fireball(Math.round(Math.random() * (814 - 45))));
	}
}

function endgame() {
	gamedata.reset();
	gameintervals.clear();
	drawHealth = true;
	dropHealth = true;
	while (snowballs.length > 0) {
		snowballs.pop();
	}
	while (fireballs.length > 0) {
		fireballs.pop();
	}
	ssplash();
}

function ssplash() {
	window.focus();
	gameintervals.logo_interval = setInterval("drawLogo()", 30);
	setTimeout(function() {
		clearInterval(gameintervals.logo_interval);
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

		if ((gamedata.time++) % 5 == 0) {
			gamedata.score++;
		}

		if (dropHealth
				&& (gamedata.temp > gamedata.target + 1 || gamedata.temp < gamedata.target - 1)) {
			gamedata.health--;
			if (gamedata.health == 60) {
				console.log("setting danger interval");
				gameintervals.danger_interval = setInterval(function() {
					drawHealth = !drawHealth;
				}, 250);

			}
			dropHealth = false;
			setTimeout(function() {
				dropHealth = true;
			}, 500 / (2 * Math.abs(gamedata.temp - gamedata.target)));
		}

		if (Math.abs(gamedata.temp - gamedata.target) > 1)
			gamedata.state = 2;
		else if (Math.abs(gamedata.temp - gamedata.target) > 0)
			gamedata.state = 1;
		else
			gamedata.state = 0;
		if (gamedata.health <= 0) {
			endgame();
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
		if (drawHealth)
			drawLight();
		drawHealthBar();
		drawText();

		final_ctx.clearRect(0, 0, canvas.width, canvas.height);
		final_ctx.drawImage(buffer, 0, 0);
	}
}

function drawLight() {
	switch (gamedata.state) {
	case 0:
		ctx.drawImage(greenlight, 1049, 143);
		break;
	case 1:
		ctx.drawImage(yellowlight, 1064, 143);
		break;
	case 2:
		ctx.drawImage(redlight, 1079, 143);
		break;
	}
}

function drawText() {
	ctx.save();
	ctx.shadowColor = "#FFF";
	ctx.shadowBlur = 10;
	ctx.fillStyle = "#000";
	ctx.fillText(gamedata.temp, 930, 97);
	if (gamedata.flashtext) {
		ctx.fillStyle = "#FFF";
	}
	ctx.fillText(gamedata.target, 1030, 97);
	// ctx.fillText(framerate, 950, 300);
	ctx.fillStyle = "#FFF";
	ctx.fillText(gamedata.score, 1000, canvas.height - 25 - clock.height / 2);
	ctx.restore();
}

function drawClock() {
	ctx.save();
	ctx.translate(900 + clock.width / 2, canvas.height - 25 - clock.height / 2);
	ctx.rotate(clock_rotation);
	ctx.drawImage(clock, -clock.width / 2, -clock.height / 2);
	ctx.restore();
}

function drawHealthBar() {
	ctx.drawImage(thermometer, 965, 200);
	ctx.fillStyle = "#F20000";
	ctx.fillRect(965 + 19, 200 + 11 + (241 - gamedata.health), 26,
			250 - (241 - gamedata.health));
	ctx.drawImage(glare, 965, 200);
}

function updateParticles() {
	for ( var i = 0; i < snowparticles.length; i++) {
		var p = snowparticles.shift();
		if (p.y > canvas.height || p.x < 0 || p.x > canvas.width)
			continue;
		p.alpha -= (Math.random() * .05 + .001);
		if (p.alpha <= 0.0)
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
		p.alpha -= (Math.random() * .05 + .001);
		if (p.alpha <= 0.0)
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
		ctx.globalAlpha = snowparticles[i].alpha;
		ctx.fillRect(snowparticles[i].x, snowparticles[i].y, 5, 5);
	}
	ctx.fillStyle = "#FFBD00";
	for ( var i = 0; i < fireparticles.length; i++) {
		ctx.globalAlpha = fireparticles[i].alpha;
		ctx.fillRect(fireparticles[i].x, fireparticles[i].y, 5, 5);
	}
	ctx.globalAlpha = 1;
}

function checkCollisions() {
	for ( var i = 0; i < snowballs.length; i++) {
		var ball = snowballs.shift();
		// Hit edge
		if (ball.y + fire.height > canvas.height - bucket_bottom.height/2 + 5
				&& ball.x + 5 < bucket - bucket_bottom.width / 2
				&& (ball.x + fire.width) > bucket - bucket_bottom.width / 2) {
			// break ball
			var s = crash_sounds.shift();
			s.play();
			crash_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y + fire.height > canvas.height - bucket_bottom.height/2 + 5
				&& (ball.x) < bucket + bucket_bottom.width / 2
				&& (ball.x + fire.width - 5) > bucket + bucket_bottom.width / 2) {
			// break ball
			var s = crash_sounds.shift();
			s.play();
			crash_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y > canvas.height - bucket_bottom.height/2
				&& ball.x + 5 > bucket - bucket_bottom.width / 2
				&& ball.x - 5 < bucket + bucket_bottom.width / 2) {
			// catch ball
			gamedata.temp--;
			var s = snow_sounds.shift();
			s.play();
			snow_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				snowparticles.push(new snowparticle2(ball.x + fire.width / 2));
			}
			continue;
		}
		snowballs.push(ball);

	}

	for ( var i = 0; i < fireballs.length; i++) {
		var ball = fireballs.shift();
		// Hit edge
		if (ball.y + fire.height > canvas.height - bucket_bottom.height/2 + 5
				&& ball.x + 5 < bucket - bucket_bottom.width / 2
				&& (ball.x + fire.width) > bucket - bucket_bottom.width / 2) {
			// break ball
			var s = crash_sounds.shift();
			s.play();
			crash_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y + fire.height > canvas.height - bucket_bottom.height/2 + 5
				&& (ball.x) < bucket + bucket_bottom.width / 2
				&& (ball.x + fire.width - 5) > bucket + bucket_bottom.width / 2) {
			// break ball
			var s = crash_sounds.shift();
			s.play();
			crash_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle(ball.x + fire.width / 2,
						ball.y + fire.height / 2));
			}
			continue;
		} else if (ball.y > canvas.height - bucket_bottom.height/2
				&& ball.x + 5 > bucket - bucket_bottom.width / 2
				&& ball.x - 5 < bucket + bucket_bottom.width / 2) {
			// catch ball
			gamedata.temp++;
			var s = fire_sounds.shift();
			s.play();
			fire_sounds.push(s);
			for ( var j = 0; j < particles; j++) {
				fireparticles.push(new fireparticle2(ball.x + fire.width / 2));
			}
			continue;
		}
		fireballs.push(ball);
	}
}

function updateBucket() {
	bucket = mouse.x;
	if(bucket + bucket_bottom.width/2 > 864) bucket = 864 - bucket_bottom.width/2;
	else if(bucket - bucket_bottom.width/2 < 0) bucket = 0 + bucket_bottom.width/2;
	
}

function drawBucketTop() {
	ctx.drawImage(bucket_top, bucket - bucket_top.width / 2, canvas.height
			- bucket_top.height/2);
}

function drawBucketBottom() {
	ctx.drawImage(bucket_bottom, bucket - bucket_top.width / 2, canvas.height
			- bucket_top.height/2);
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