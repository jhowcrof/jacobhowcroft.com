//Canvas
var canvas = document.getElementById("thecanvas");
var buffer = document.createElement('canvas');
buffer.height = canvas.height;
buffer.width = canvas.width;
var ctx = buffer.getContext("2d");
var final_ctx = canvas.getContext("2d");

final_ctx.fillStyle = '#000000';
final_ctx.fillRect(0, 0, canvas.width, canvas.height);
final_ctx.fillStyle = '#111111';
final_ctx.fillText("Loading", 0, 0, 300);

// Images
var ninja = new Image();
ninja.src = "images/ninja.png";
var background = new Image();
background.src = "images/city.png";
var tstar = new Image();
tstar.src = "images/tstar.png";
var toadimg1 = new Image();
toadimg1.src = "images/toad1.png";
var toadimg2 = new Image();
toadimg2.src = "images/toad2.png";
var splash = new Image();
splash.src = "images/splash.png";
var splashStar = new Image();
splashStar.src = "images/splashstar.png";
var cursor = new Image();
cursor.src = "images/cursor.png";
var logo = new Image();
logo.src = "images/dunbeer.png";

// Objects
function Particle_blood(x, y, g, s) {
	this.x = x;
	this.y = y;
	this.dx = s;
	this.dy = 5;
	this.ground = g;
}

function Star(y) {
	this.x = player.x + 20;
	this.y = y;
	this.dx = 10;
	this.rot = 0;
	this.alive = true;
}

function Toad(y) {
	this.x = canvas.width;
	this.y = y;
	this.dy = 0;
	this.dx = -5;
	this.alive = true;
	this.interval;
	this.interval2;
	this.frame = 0;
	this.health = 6;
	this.dying = 0;
}

// Variables
var x = 0;
var y = 0;
var stars = new Array();
var toads = new Array();
var background_position = 0;
var running = false;
var interval_drawStart, interval_startScreenBlink, interval_noThrow, interval_drawEnd;
var splashSpin = 0;
var blink = false;
var pause = false;
var particles_blood = new Array();
var score = 0;
var interval_toadTimer, interval_ninjaAnimate, interval_update;
mouse = {
	x : 0,
	y : 0
};

player = {
	x : 0,
	y : 0,
	speed : 3,
	health : 5,
	movingup : false,
	movingdown : false,
	movingleft : false,
	movingright : false,
	canThrow : true,
	frame : 0
}

ssplash();

function ssplash() {
	var logo_interval = setInterval("drawLogo()", 30);
	setTimeout(function() {
		canvas.addEventListener('click', onClick, false);
		canvas.addEventListener('mousemove', getMousePos, false);
		window.addEventListener('keypress', keyhandler, false);
		window.addEventListener('keydown', keydownhandler, false);
		window.addEventListener('keyup', keyuphandler, false);
		canvas.addEventListener("mouseout", function() {
			pause = true;
			ctx.fillStyle = "#000000";
			ctx.globalAlpha = 0.3;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalAlpha = 1.0;
		}, false);
		canvas.addEventListener("mouseover", function() {
			pause = false;
		}, false);
		clearInterval(logo_interval);
		startScreen();
	}, 3000);
}

function drawLogo() {
	final_ctx.drawImage(logo, 0, 0);
}

function startScreen() {
	ctx.fillStyle = '#111111';
	interval_drawStart = setInterval('drawStart()', 25);
	interval_startScreenBlink = setInterval(function() {
		blink = !blink;
	}, 500);
}

function endScreen() {
	interval_drawEnd = setInterval('drawEnd()', 25);
}

function drawStart() {
	ctx.drawImage(splash, 0, 0);
	if (blink) {
	ctx.fillStyle = '#111111';
		ctx.fillRect(250, 375, 475, 90);
	}
	ctx.save();
	ctx.translate(511, 108);
	ctx.rotate(splashSpin += 5 * Math.PI / 180);
	ctx.drawImage(splashStar, -splashStar.width / 2, -splashStar.height / 2);
	ctx.restore();
	ctx.drawImage(cursor, mouse.x - cursor.width / 2, mouse.y - cursor.height
			/ 2);
	final_ctx.drawImage(buffer, 0, 0);
}

function drawEnd() {

}

function main() {
	interval_update = setInterval("update()", 25);
	interval_toadTimer = setInterval(function() {
		if (pause)
			return;
		var toood = new Toad((161 - toadimg1.height)
				+ ((canvas.height - 185) * Math.random()));
		toood.interval = setInterval(function() {
			if (toood.frame == 1)
				toood.frame = 0;
			else
				toood.frame = 1;
		}, 166);
		toood.interval2 = setInterval(function() {
			var rand = Math.random();
			if (rand < .33)
				toood.dy = -2;
			else if (rand > .66)
				toood.dy = 2;
			else
				toood.dy = 0;
		}, Math.random() * 600 + 400);
		toads.push(toood);
	}, 1250);
	interval_ninjaAnimate = setInterval(function() {
		if (player.frame == 0)
			player.frame = 1;
		else
			player.frame = 0;
	}, 300);
}

function endgame() {
	clearInterval(interval_update);
	clearInterval(interval_ninjaAnimate);
	clearInterval(interval_toadTimer);
	running = false;
	while (toads.length > 0) {
		var t = toads.pop();
		clearInterval(t.interval);
		clearInterval(t.interval2);
	}
	while (particles_blood.length > 0) {
		particles_blood.pop();
	}
	while (stars.length > 0) {
		stars.pop();	
	} 
	player.x = 0;
	player.y = 0;
	score = 0;
	player.health = 5;
	endScreen();
	startScreen();
}

function update() {
	if (pause)
		return;
	if (player.health <= 0) {
		endgame();
		return;
	}
	drawBackground();
	checkCollisions();
	drawBlood();
	drawStars();
	drawToads();
	drawNinja();
	ctx.font = "28px Consolas";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText("SCORE: " + score, 0, 542);
	final_ctx.drawImage(buffer, 0, 0);
}

function checkCollisions() {
	var i;
	for (i = 0; i < toads.length; i++) {
		if (!toads[i].alive) {
			continue;
		}
		if (!(toads[i].x > player.x + ninja.width / 2 - 3
				|| toads[i].x + toadimg1.width / 2 < player.x
				|| toads[i].y > player.y + ninja.height / 2 || toads[i].y
				+ toadimg1.height < player.y - ninja.height / 2)) {

			player.health--;
			for (k = 0; k < 10 + (Math.random() * 10); k++) {
				particles_blood.push(new Particle_blood(player.x, player.y - 7
						+ Math.random() * 14, player.y + ninja.height, -2
						+ Math.random() * 6));
			}
			toads[i].alive = false;
			window.clearInterval(toads[i].interval);
			continue;
		}
		var j;
		for (j = 0; j < stars.length; j++) {
			if (!stars[j].alive)
				continue;
			if (toads[i].x > stars[j].x
					&& toads[i].x < stars[j].x + tstar.width) {
				if (toads[i].y + toadimg1.height > stars[j].y
						&& toads[i].y < stars[j].y + tstar.height) {
					var k;
					for (k = 0; k < 10 + (Math.random() * 10); k++) {
						particles_blood.push(new Particle_blood(toads[i].x,
								stars[j].y - 7 + Math.random() * 14, toads[i].y
										+ toadimg1.height, -2 + Math.random()
										* 6));
					}
					stars[j].alive = false;
					if (stars[j].y < toads[i].y + 41)
						toads[i].health -= 2;
					else
						toads[i].health--;
					if (toads[i].health <= 0) {
						toads[i].alive = false;
						score++;
						window.clearInterval(toads[i].interval);
					}
				}
			}
		}
	}
	return;
}

function drawBackground() {
	if (background_position < -1580)
		background_position = 0;
	background_position -= player.speed;
	ctx.drawImage(background, 0, 0, 1580, 544, background_position, 0, 1580,
			544);
	ctx.drawImage(background, background_position + 1580, 0);
}

function drawNinja() {
	if (player.movingup)
		player.y -= 8;
	else if (player.movingdown)
		player.y += 8;

	if (player.movingleft)
		player.x -= 8;
	else if (player.movingright)
		player.x += 8;

	if (player.x < 0)
		player.x = 0;

	if (player.y < (ninja.height / 2) + 106)
		player.y = (ninja.height / 2) + 106;
	else if (player.y > canvas.height - 24 - ninja.height / 2)
		player.y = canvas.height - 24 - ninja.height / 2;
	ctx.drawImage(ninja, player.frame * 48, 0, ninja.width / 2, ninja.height,
			player.x, player.y - ninja.height / 2, ninja.width / 2,
			ninja.height);
}

function drawStars() {
	var i;
	for (i = 0; i < stars.length; i++) {
		var star = stars.pop();
		if (!star.alive || star.x > canvas.width)
			continue;
		else if (star.alive) {
			star.x += star.dx;
			star.rot += (10 + 5 * Math.random()) * Math.PI / 180;
			ctx.save();
			ctx.translate(star.x + tstar.width / 2, star.y + tstar.height / 2);
			ctx.rotate(star.rot);
			ctx.drawImage(tstar, -tstar.width / 2, -tstar.height / 2);
			ctx.restore();
		}
		stars.unshift(star);
	}
	return;
}

function drawToads() {
	var i;
	for (i = 0; i < toads.length; i++) {
		if (toads[i].alive) {
			// Randomly change direction
			if (toads[i].y < 161 - toadimg1.height) {
				toads[i].dy *= -1;
				toads[i].y = 161 - toadimg1.height;
			} else if (toads[i].y > canvas.height - toadimg1.height - 24) {
				toads[i].dy *= -1;
				toads[i].y = canvas.height - toadimg1.height - 24;
			}

			// Move toad
			toads[i].x += toads[i].dx;
			toads[i].y += toads[i].dy;

			// Draw toad
			ctx.drawImage(toadimg1, toads[i].frame * 29, 0, toadimg1.width / 2,
					toadimg1.height, toads[i].x, toads[i].y,
					toadimg1.width / 2, toadimg1.height);

			// Draw health
			ctx.strokeStyle = "#FFFFFF";
			ctx.strokeRect(toads[i].x, toads[i].y - 7, toadimg1.width / 2, 5);
			ctx.fillStyle = "#DD0000";
			ctx.fillRect(toads[i].x, toads[i].y - 7, (toadimg1.width / 2)
					* (toads[i].health / 6), 5);

		} else {
			// Rotate and draw dead toad
			toads[i].x -= player.speed;
			if (toads[i].dying < 1)
				toads[i].dying += .1;
			ctx.save();
			ctx.translate(toads[i].x + toadimg1.width, toads[i].y
					+ toadimg1.height);
			ctx.rotate((Math.PI / 2) * toads[i].dying);
			ctx.drawImage(toadimg2, -toadimg2.width, -toadimg2.height);
			ctx.restore();
		}
	}
	if (toads.length > 0 && toads[toads.length - 1].x < 0) {
		var t = toads.pop();
		clearInverval(interval);
		clearInverval(interval2);
	}

	ctx.fillStyle = "#FF0000";
	for (i = 0; i < particles_blood.length; i++) {
		if (particles_blood[i].y < particles_blood[i].ground) {
			ctx.fillRect(particles_blood[i].x, particles_blood[i].y, 4, 4);
		}
	}

	return;
}

function drawBlood() {
	ctx.fillStyle = "#FF0000";
	var i;
	for (i = 0; i < particles_blood.length; i++) {
		particles_blood[i].x += particles_blood[i].dx;
		particles_blood[i].y += particles_blood[i].dy;
		if (particles_blood[i].y >= particles_blood[i].ground) {
			particles_blood[i].dy = 0;
			particles_blood[i].dx = -player.speed;
			ctx.fillRect(particles_blood[i].x, particles_blood[i].y, 4, 4);
		}
	}
	if (particles_blood.length > 0
			&& particles_blood[particles_blood.length - 1].x < 0) {
		particles_blood.pop();
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

function onClick(ev) {
	if (running)
		throwStar(ev);
	else {
		running = true;
		clearInterval(interval_drawStart);
		clearInterval(interval_startScreenBlink);
		main();
	}
}

function throwStar(ev) {
	getMousePos(ev);
	if (player.y < (ninja.height / 2) + 106)
		player.y = (ninja.height / 2) + 106;
	else if (player.y > canvas.height - 24 - ninja.height / 2)
		player.y = canvas.height - 24 - ninja.height / 2;
	if (player.canThrow) {
		player.canThrow = false;
		stars.push(new Star((player.y - 8) + (Math.random() * 16)));
		interval_noThrow = setTimeout(function() {
			player.canThrow = true;
		}, 100);
	}
}

function keyhandler(ev) {
	if (ev.keyCode == 32) {
		if (player.y < (ninja.height / 2) + 106)
			player.y = (ninja.height / 2) + 106;
		else if (player.y > canvas.height - 24 - ninja.height / 2)
			player.y = canvas.height - 24 - ninja.height / 2;
		if (player.canThrow) {
			player.canThrow = false;
			stars.push(new Star((player.y - 12) + (Math.random() * 8)));
			interval_noThrow = setTimeout(function() {
				player.canThrow = true;
			}, 100);
		}
	}
}

function keydownhandler(ev) {
	if (ev.keyCode == 87 || ev.keyCode == 38) {
		player.movingup = true;
	} else if (ev.keyCode == 83 || ev.keyCode == 40) {
		player.movingdown = true;
	}

	if (ev.keyCode == 65 || ev.keyCode == 37) {
		player.movingleft = true;
	} else if (ev.keyCode == 68 || ev.keyCode == 39) {
		player.movingright = true;
	}
}

function keyuphandler(ev) {
	if (ev.keyCode == 87 || ev.keyCode == 38) {
		player.movingup = false;
	} else if (ev.keyCode == 83 || ev.keyCode == 40) {
		player.movingdown = false;
	}

	if (ev.keyCode == 65 || ev.keyCode == 37) {
		player.movingleft = false;
	} else if (ev.keyCode == 68 || ev.keyCode == 39) {
		player.movingright = false;
	}

}
