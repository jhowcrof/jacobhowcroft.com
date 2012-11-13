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

// Variables
var x = 0;
var y = 0;
var stars = new Array();
var toads = new Array();
pos = {
	x : 0,
	y : 0
};
var p = 0;
var ninjaspeed = 3;
var newtoad = true;
var r = true;
var running = false;
var s, sb, t;
var n = 0;
var splashSpin = 0;
var blink = false;
var pause = false;
var movingup = false, movingdown = false;
var movingleft = false, movingright = false;
var particles_blood = new Array();
var num_pb = 0;
var score = 0;
var health = 5;
var interval_toadTimer;
var interval_ninjaAnimate;
var interval_update;
mouse = {
	x : 0,
	y : 0
};

ssplash();

function ssplash() {
	var logo_interval = setInterval("drawLogo()", 30);
	setTimeout(function() {
		clearInterval(logo_interval);
		startScreen();
	}, 3000);
}

function drawLogo() {
	final_ctx.drawImage(logo, 0, 0);
}

function startScreen() {
	ctx.fillStyle = '#111111';
	canvas.addEventListener('click', onClick, false);
	canvas.addEventListener('mousemove', getMousePos, false);
	window.addEventListener('keypress', keyhandler, false);
	window.addEventListener('keydown', keydownhandler, false);
	window.addEventListener('keyup', keyuphandler, false);
	s = setInterval('drawStart()', 25);
	sb = setInterval(function() {
		blink = !blink;
	}, 500);
}

function drawStart() {
	ctx.drawImage(splash, 0, 0);
	if (blink)
		ctx.fillRect(250, 375, 475, 90);
	ctx.save();
	ctx.translate(511, 108);
	ctx.rotate(splashSpin += 5 * Math.PI / 180);
	ctx.drawImage(splashStar, -splashStar.width / 2, -splashStar.height / 2);
	ctx.restore();
	ctx.drawImage(cursor, mouse.x - cursor.width / 2, mouse.y - cursor.height
			/ 2);
	final_ctx.drawImage(buffer, 0, 0);
}

function Particle_blood(x, y, g, s) {
	this.x = x;
	this.y = y;
	this.dx = s;
	this.dy = 5;
	this.ground = g;
}

function Star(y) {
	this.x = pos.x + 20;
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

function main() {
	interval_update = setInterval("update()", 25);
	interval_toadTimer = setInterval(function() {
		if (pause)
			return;
		newtoad = true;
	}, 1250);
	interval_ninjaAnimate = setInterval(function() {
		if (n == 0)
			n = 1;
		else
			n = 0;
	}, 300);
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
}

function endgame() {
	clearInterval(interval_ninjaAnimate);
	clearInterval(interval_toadTimer);
	clearInterval(interval_update);
	while (toads.length > 0) {
		toads.pop();
	}
	while (particles_blood.length > 0) {
		particles_blood.pop();
	}
	startScreen();
}

function update() {
	if (pause)
		return;
	if (health <= 0) {
		endgame();
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
		if (!(pos.x > toads[i].x
				|| pos.x + ninja.width / 4 < toads[i].x + toadimg1.width / 2
				|| pos.y + ninja.height / 2 > toads[i].y + toadimg1.height || pos.y < toads[i].y)) {

			health--;
			for (k = 0; k < 10 + (Math.random() * 10); k++) {
				num_pb = particles_blood.push(new Particle_blood(pos.x, pos.y
						- 7 + Math.random() * 14, pos.y + ninja.height, -2
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
						num_pb = particles_blood.push(new Particle_blood(
								toads[i].x,
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
	if (p < -1580)
		p = 0;
	ctx.drawImage(background, 0, 0, 1580, 544, p -= ninjaspeed, 0, 1580, 544);
	ctx.drawImage(background, p + 1580, 0);
}

function drawNinja() {
	if (movingup)
		pos.y -= 8;
	else if (movingdown)
		pos.y += 8;

	if (movingleft)
		pos.x -= 8;
	else if (movingright)
		pos.x += 8;

	if (pos.x < 0)
		pos.x = 0;

	if (pos.y < (ninja.height / 2) + 106)
		pos.y = (ninja.height / 2) + 106;
	else if (pos.y > canvas.height - 24 - ninja.height / 2)
		pos.y = canvas.height - 24 - ninja.height / 2;
	ctx.drawImage(ninja, n * 48, 0, ninja.width / 2, ninja.height, pos.x, pos.y
			- ninja.height / 2, ninja.width / 2, ninja.height);
}

function drawStars() {
	var i;
	for (i = stars.length - 1; i >= 0; i--) {
		if (stars[i].alive) {
			stars[i].x += stars[i].dx;
			ctx.save();
			ctx.translate(stars[i].x + tstar.width / 2, stars[i].y
					+ tstar.height / 2);
			ctx.rotate((stars[i].rot += (10 + 5 * Math.random())) * Math.PI
					/ 180);
			ctx.drawImage(tstar, -tstar.width / 2, -tstar.height / 2);
			ctx.restore();
		} else {
			/*
			 * stars[i].x -= ninjaspeed; ctx.save();
			 * ctx.translate(stars[i].x+tstar.width/2,
			 * stars[i].y+tstar.height/2); ctx.rotate(stars[i].rot *
			 * Math.PI/180); ctx.drawImage(tstar, -tstar.width/2,
			 * -tstar.height/2); ctx.restore();
			 */
		}
		if (i == stars.length - 1 && stars[i].x > canvas.width) {
			stars.pop();
		}
	}
	return;
}

function drawToads() {
	if (newtoad) {
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
		newtoad = false;
	}
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

			// Move toad
			toads[i].x += toads[i].dx;
			toads[i].y += toads[i].dy;
		} else {
			// Rotate and draw dead toad
			ctx.save();
			ctx.translate(toads[i].x + toadimg1.width, toads[i].y
					+ toadimg1.height);
			if (toads[i].dying < 1)
				toads[i].dying += .1;
			ctx.rotate((Math.PI / 2) * toads[i].dying);
			ctx.drawImage(toadimg2, -toadimg2.width, -toadimg2.height);
			ctx.restore();
			toads[i].x -= ninjaspeed;
		}
	}
	if (toads[toads.length - 1].x < 0) {
		toads.pop();
	}
	ctx.fillStyle = "#FF0000";
	var j;
	for (j = 0; j < num_pb; j++) {
		if (particles_blood[j].y < particles_blood[j].ground) {
			ctx.fillRect(particles_blood[j].x, particles_blood[j].y, 4, 4);
		}
	}
	return;
}

function drawBlood() {
	ctx.fillStyle = "#FF0000";
	var i;
	for (i = 0; i < num_pb; i++) {
		particles_blood[i].x += particles_blood[i].dx;
		particles_blood[i].y += particles_blood[i].dy;
		if (particles_blood[i].y >= particles_blood[i].ground) {
			particles_blood[i].dy = 0;
			particles_blood[i].dx = -ninjaspeed;
			ctx.fillRect(particles_blood[i].x, particles_blood[i].y, 4, 4);
		}
	}
	if (num_pb > 0) {
		if (particles_blood[num_pb - 1].x < 0) {
			num_pb = particles_blood.pop();
		}
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
		clearInterval(s);
		clearInterval(sb);
		main();
	}
}

function throwStar(ev) {
	getMousePos(ev);
	if (pos.y < (ninja.height / 2) + 106)
		pos.y = (ninja.height / 2) + 106;
	else if (pos.y > canvas.height - 24 - ninja.height / 2)
		pos.y = canvas.height - 24 - ninja.height / 2;
	if (r) {
		r = false;
		stars.push(new Star((pos.y - 8) + (Math.random() * 16)));
		t = setTimeout(function() {
			r = true;
		}, 100);
	}
}

function keyhandler(ev) {
	if (!running) {
		running = true;
		clearInterval(s);
		clearInterval(sb);
		main();
	}
	if (ev.keyCode == 32) {
		if (pos.y < (ninja.height / 2) + 106)
			pos.y = (ninja.height / 2) + 106;
		else if (pos.y > canvas.height - 24 - ninja.height / 2)
			pos.y = canvas.height - 24 - ninja.height / 2;
		if (r) {
			r = false;
			stars.push(new Star((pos.y - 12) + (Math.random() * 8)));
			t = setTimeout(function() {
				r = true;
			}, 100);
		}
	}
}

function keydownhandler(ev) {
	if (!running) {
		running = true;
		clearInterval(s);
		clearInterval(sb);
		main();
	}
	if (ev.keyCode == 87 || ev.keyCode == 38) {
		movingup = true;
	} else if (ev.keyCode == 83 || ev.keyCode == 40) {
		movingdown = true;
	}

	if (ev.keyCode == 65 || ev.keyCode == 37) {
		movingleft = true;
	} else if (ev.keyCode == 68 || ev.keyCode == 39) {
		movingright = true;
	}
}

function keyuphandler(ev) {
	if (ev.keyCode == 87 || ev.keyCode == 38) {
		movingup = false;
	} else if (ev.keyCode == 83 || ev.keyCode == 40) {
		movingdown = false;
	}

	if (ev.keyCode == 65 || ev.keyCode == 37) {
		movingleft = false;
	} else if (ev.keyCode == 68 || ev.keyCode == 39) {
		movingright = false;
	}

}
