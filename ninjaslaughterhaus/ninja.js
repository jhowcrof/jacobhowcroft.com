/* 	
	Ninja Slaughterhaus
	by Jacob Howcroft
	2013
*/

// TODO: Add a melee weapon.
// TODO: Make game difficulty increase over time.
// TODO: Make blood more liquid.

// Initialize the canvas and drawing buffer
var canvas = document.getElementById('thecanvas');
var buffer = document.createElement('canvas');
buffer.height = canvas.height;
buffer.width = canvas.width;
var ctx = buffer.getContext('2d');
var final_ctx = canvas.getContext('2d');

// Draw a loading screen in case the client is ridic slow
final_ctx.fillStyle = '#000000';
final_ctx.fillRect(0, 0, canvas.width, canvas.height);
final_ctx.fillStyle = '#111111';
final_ctx.fillText('Loading', 0, 0, 300);

// Game classes
function Blood_particle(x, y, g, s) {
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
	this.animate_interval = 0;
	this.direction_interval = 0;
	this.frame = 0;
	this.health = 6;
	this.dying = 0;
	this.kill = function() {
		this.alive = false;
		window.clearInterval(this.animate_interval);
		window.clearInterval(this.direction_interval);
	};
}

// Variables
var stars = new Array();
var toads = new Array();
var background_position = 0;
var running = false;
var finished = false;
var splashSpin = 0;
var blink = false;
var pause = false;
var blood_particles = new Array();
var score = 0;
var mouse = {
	x: 0,
	y: 0
};

var intervals = {
	draw_start: 0,
	start_screen_blink: 0,
	no_throw: 0,
	draw_end: 0,
	toad_timer: 0,
	ninja_animate: 0,
	update: 0
};

// The player object
var player = {
	x: 0,
	y: 0,
	speed: 3,
	health: 5,
	moving_up: false,
	moving_down: false,
	moving_left: false,
	moving_right: false,
	can_throw: true,
	frame: 0
};

// Images
var images = {
	ninja: new Image(),
	background: new Image(),
	throwing_star: new Image(),
	toad1: new Image(),
	toad2: new Image(),
	splash: new Image(),
	splash_star: new Image(),
	cursor: new Image(),
	logo: new Image(),
	loadImage: function(img, filename) {
		var deferred = $.Deferred();
		img.onload = function() {
			deferred.resolve();
		};
		img.src = 'images/' + filename;
		return deferred.promise();
	},
	loadImages: function() {
		var img_deferreds = new Array();
		img_deferreds.push(this.loadImage(this.ninja, 'ninja.png'));
		img_deferreds.push(this.loadImage(this.background, 'city.png'));
		img_deferreds.push(this.loadImage(this.throwing_star, 'tstar.png'));
		img_deferreds.push(this.loadImage(this.toad1, 'toad1.png'));
		img_deferreds.push(this.loadImage(this.toad2, 'toad2.png'));
		img_deferreds.push(this.loadImage(this.splash, 'splash.png'));
		img_deferreds.push(this.loadImage(this.splash_star, 'splashstar.png'));
		img_deferreds.push(this.loadImage(this.cursor, 'cursor.png'));
		img_deferreds.push(this.loadImage(this.logo, 'dunbeer.png'));
		$.when.apply($, img_deferreds).then(
			startGame, 
			function() {
				// Loading images failed

			}
		);
	}
};

images.loadImages();

// Initialize the game window and display the logo
function startGame() {
	var logo_interval = setInterval('drawLogo()', 30);
	setTimeout(function() {
		canvas.addEventListener('click', onClick, false);
		canvas.addEventListener('mousemove', getMousePos, false);
		window.addEventListener('keypress', keyHandler, false);
		window.addEventListener('keydown', keyDownHandler, false);
		window.addEventListener('keyup', keyUpHandler, false);
		canvas.addEventListener('mouseout', function() {
			pause = true;
			ctx.fillStyle = '#000000';
			ctx.globalAlpha = 0.3;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalAlpha = 1.0;
		}, false);
		canvas.addEventListener('mouseover', function() {
			pause = false;
		}, false);
		clearInterval(logo_interval);
		startScreen();
	}, 3000);
}

// Draw the logo
function drawLogo() {
	final_ctx.drawImage(images.logo, -88, -48);
}

// Initialize the start-up screen
function startScreen() {
	ctx.fillStyle = '#111111';
	intervals.draw_start = setInterval('drawStart()', 25);
	intervals.start_screen_blink = setInterval(function() {
		blink = !blink;
	}, 500);
}

// Draw the start-up screen
function drawStart() {
	ctx.drawImage(images.splash, 0, 0);
	ctx.fillStyle = '#DDD';
	ctx.font = '28px Consolas';
	ctx.fillText('WASD to move.  Spacebar to throw star.  Don\'t get hit!', 15, canvas.height - 20);
	if (blink) {
		ctx.fillStyle = '#111';
		ctx.fillRect(250, 375, 475, 90);
	}
	ctx.save();
	ctx.translate(511, 108);
	ctx.rotate(splashSpin += 5 * Math.PI / 180);
	ctx.drawImage(images.splash_star, -images.splash_star.width / 2, -images.splash_star.height / 2);
	ctx.restore();
	ctx.drawImage(images.cursor, mouse.x - images.cursor.width / 2, mouse.y - images.cursor.height / 2);
	final_ctx.drawImage(buffer, 0, 0);
}

// Draw the game over screen
function drawEnd() {
	ctx.globalAlpha = 1.0;
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#FFF';
	ctx.fillText('You\'re dead!!', 100, 100);
	ctx.fillText('Your final score is ' + score, 200, 250);
	ctx.fillText('Click anywhere to continue.', 300, 400);
	final_ctx.drawImage(buffer, 0, 0);
}

function main() {
	intervals.update = setInterval('update()', 25);
	
	intervals.toad_timer = setInterval(function() {
		if (pause) {
			return;
		}

		var new_toad = new Toad(
			(161 - images.toad1.height) + ((canvas.height - 185) * Math.random())
		);
		
		new_toad.animate_interval = setInterval(function() {
			if (new_toad.frame == 1) {
				new_toad.frame = 0;
			} else {
				new_toad.frame = 1;
			}
		}, 166);
		
		new_toad.direction_interval = setInterval(function() {
			var rand = Math.random();
			if (rand < .33) {
				new_toad.dy = -2;
			} else if (rand > .66) {
				new_toad.dy = 2;
			} else {
				new_toad.dy = 0;
			}
		}, Math.random() * 600 + 400);
		
		toads.push(new_toad);
	}, 1250);
	
	intervals.ninja_animate = setInterval(function() {
		player.frame = (player.frame == 0 ? 1 : 0);
	}, 300);
}

// Called right when the game ends
function endGame() {
	window.clearInterval(intervals.update);
	window.clearInterval(intervals.ninja_animate);
	window.clearInterval(intervals.toad_timer);
	running = false;
	finished = true;
	while (toads.length > 0) {
		var t = toads.pop();
		t.kill();
	}
	while (blood_particles.length > 0) {
		blood_particles.pop();
	}
	while (stars.length > 0) {
		stars.pop();	
	} 
	player.x = 0;
	player.y = 0;
	player.health = 5;
	
	intervals.draw_end = setInterval('drawEnd()', 25);
}

// Main loop while game is running
function update() {
	if (pause) return;
	if (player.health <= 0) {
		endGame();
		return;
	}
	drawBackground();
	checkCollisions();
	drawBlood();
	drawStars();
	drawToads();
	drawNinja();
	ctx.font = '28px Consolas';
	ctx.fillStyle = '#FFFFFF';
	ctx.fillText('SCORE: ' + score, 0, 542);
	ctx.fillText('HEALTH: ' + player.health, 150, 542);
	final_ctx.drawImage(buffer, 0, 0);
}

// Checks all collisions
function checkCollisions() {
	// For each toad
	for (var i = 0; i < toads.length; i++) {
		if (!toads[i].alive) {
			continue;
		}
		// Check if the toad hits the player
		if (!(toads[i].x > player.x + images.ninja.width / 2 - 3
				|| toads[i].x + images.toad1.width / 2 < player.x
				|| toads[i].y > player.y + images.ninja.height / 2 
				|| toads[i].y + images.toad1.height < player.y - images.ninja.height / 2)) {
			
			// Flash the screen
			final_ctx.fillStyle = '#FFF';
			setTimeout(function() {
				final_ctx.fillRect(0, 0, canvas.width, canvas.height);
				setTimeout(function() {
					final_ctx.fillRect(0, 0, canvas.width, canvas.height);
				}, 10);
			}, 10);
			
			player.health--;
			
			// Splash some blood
			for (var k = 0; k < 10 + (Math.random() * 10); k++) {
				blood_particles.push(new Blood_particle(player.x, player.y - 7
						+ Math.random() * 14, player.y + images.ninja.height, -2
						+ Math.random() * 6));
			}

			// Kill the toad
			toads[i].kill();
			continue;
		}

		// Check if a star hit the toad
		for (var j = 0; j < stars.length; j++) {
			if (!stars[j].alive) {
				continue;
			}
			if (toads[i].x > stars[j].x
					&& toads[i].x < stars[j].x + images.throwing_star.width) {
				if (toads[i].y + images.toad1.height > stars[j].y
						&& toads[i].y < stars[j].y + images.throwing_star.height) {

					// Splash some blood
					for (var k = 0; k < 10 + (Math.random() * 10); k++) {
						blood_particles.push(new Blood_particle(toads[i].x,
								stars[j].y - 7 + Math.random() * 14, toads[i].y
										+ images.toad1.height, -2 + Math.random()
										* 6));
					}

					stars[j].alive = false;

					// Check if it's a headshot
					if (stars[j].y < toads[i].y + 41) {
						toads[i].health -= 2;
					} else {
						toads[i].health--;
					}

					if (toads[i].health <= 0) {
						toads[i].kill();
						score++;
					}

					break;
				}
			}
		}

		// Check if the toad walked off to the left
		// If the toad goes off to the left
		if (toads[i].x + 50 < 0) {
			toads[i].x = canvas.width;
		}
	}
	return;
}

function throwStar(ev) {
	getMousePos(ev);
	if (player.y < (images.ninja.height / 2) + 106) {
		player.y = (images.ninja.height / 2) + 106;
	} else if (player.y > canvas.height - 24 - images.ninja.height / 2) {
		player.y = canvas.height - 24 - images.ninja.height / 2;
	}
	
	if (player.can_throw) {
		player.can_throw = false;
		stars.push(new Star((player.y - 8) + (Math.random() * 16)));
		intervals.no_throw = setTimeout(function() {
			player.can_throw = true;
		}, 100);
	}
}

function drawBackground() {
	if (background_position < -1580)
		background_position = 0;
	background_position -= player.speed;
	ctx.drawImage(images.background, 0, 0, 1580, 544, background_position, 0, 1580,
			544);
	ctx.drawImage(images.background, background_position + 1580, 0);
}

function drawNinja() {
	// Move Ninja
	if (player.moving_up) {
		player.y -= 8;
	} else if (player.moving_down) {
		player.y += 8;
	}

	if (player.moving_left) {
		player.x -= 8;
	} else if (player.moving_right) {
		player.x += 8;
	}

	// Don't let Ninja go off the screen
	if (player.x < 0) {
		player.x = 0;
	} else if (player.x + images.ninja.width > canvas.width) {
		player.x = canvas.width - images.ninja.width;
	}

	if (player.y < (images.ninja.height / 2) + 106) {
		player.y = (images.ninja.height / 2) + 106;
	} else if (player.y > canvas.height - 24 - images.ninja.height / 2) {
		player.y = canvas.height - 24 - images.ninja.height / 2;
	}

	// Draw the Ninja
	ctx.drawImage(images.ninja, player.frame * 48, 0, images.ninja.width / 2, images.ninja.height,
			player.x, player.y - images.ninja.height / 2, images.ninja.width / 2, 
			images.ninja.height);
}

function drawStars() {
	for (var i = 0; i < stars.length; i++) {
		if (!stars[i].alive || stars[i].x > canvas.width) {
			stars.splice(i, 1);
			continue
		} else if (stars[i].alive) {
			stars[i].x += stars[i].dx;
			stars[i].rot += (10 + 5 * Math.random()) * Math.PI / 180;
			ctx.save();
			ctx.translate(stars[i].x + images.throwing_star.width / 2, stars[i].y + images.throwing_star.height / 2);
			ctx.rotate(stars[i].rot);
			ctx.drawImage(images.throwing_star, -images.throwing_star.width / 2, -images.throwing_star.height / 2);
			ctx.restore();
		}
	}
}

function drawToads() {
	for (var i = 0; i < toads.length; i++) {
		if (toads[i].alive) {
			// Randomly change direction
			if (toads[i].y < 161 - images.toad1.height) {
				toads[i].dy *= -1;
				toads[i].y = 161 - images.toad1.height;
			} else if (toads[i].y > canvas.height - images.toad1.height - 24) {
				toads[i].dy *= -1;
				toads[i].y = canvas.height - images.toad1.height - 24;
			}

			// Move toad
			toads[i].x += toads[i].dx;
			toads[i].y += toads[i].dy;

			// Draw toad
			ctx.drawImage(images.toad1, toads[i].frame * 29, 0, images.toad1.width / 2,
					images.toad1.height, toads[i].x, toads[i].y,
					images.toad1.width / 2, images.toad1.height);

			// Draw health
			ctx.strokeStyle = '#FFFFFF';
			ctx.strokeRect(toads[i].x, toads[i].y - 7, images.toad1.width / 2, 5);
			ctx.fillStyle = '#DD0000';
			ctx.fillRect(toads[i].x, toads[i].y - 7, (images.toad1.width / 2)
					* (toads[i].health / 6), 5);

		} else {
			// Rotate and draw dead toad
			toads[i].x -= player.speed;
			if (toads[i].dying < 1)
				toads[i].dying += .1;
			ctx.save();
			ctx.translate(toads[i].x + images.toad1.width, toads[i].y
					+ images.toad1.height);
			ctx.rotate((Math.PI / 2) * toads[i].dying);
			ctx.drawImage(images.toad2, -images.toad2.width, -images.toad2.height);
			ctx.restore();
		}
	}

	// Draw falling blood.  This is here so that falling blood is drawn in front,
	// and blood on the ground is drawn behind the characters.
	ctx.fillStyle = '#FF0000';
	for (i = 0; i < blood_particles.length; i++) {
		if (blood_particles[i].y < blood_particles[i].ground) {
			ctx.fillRect(blood_particles[i].x, blood_particles[i].y, 4, 4);
		}
	}
}

function drawBlood() {
	ctx.fillStyle = '#FF0000';
	// TODO: Try to make blood on the ground a puddle by filling in the spaces 
	// between close particles.
	for (var i = 0; i < blood_particles.length; i++) {
		if (blood_particles[i].x < 0) {
			blood_particles.splice(i, 1);
			i--;
			continue;
		}

		if (blood_particles[i].y >= blood_particles[i].ground) {
			blood_particles[i].dy = 0;
			blood_particles[i].dx = -player.speed;
			ctx.fillRect(blood_particles[i].x, blood_particles[i].y, 4, 4);
		}

		blood_particles[i].x += blood_particles[i].dx;
		blood_particles[i].y += blood_particles[i].dy;
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
	if (running) {
		throwStar(ev);
	} else if (finished) {
		score = 0;
		clearInterval(intervals.draw_end);
		finished = false;
		startScreen();
	} else {
		running = true;
		clearInterval(intervals.draw_start);
		clearInterval(intervals.start_screen_blink);
		main();
	}
}

function keyHandler(ev) {
	if (ev.keyCode == 32) {
		if (player.y < (images.ninja.height / 2) + 106) {
			player.y = (images.ninja.height / 2) + 106;
		} else if (player.y > canvas.height - 24 - images.ninja.height / 2) {
			player.y = canvas.height - 24 - images.ninja.height / 2;
		}

		if (player.can_throw) {
			player.can_throw = false;
			stars.push(new Star((player.y - 12) + (Math.random() * 8)));
			intervals.no_throw = setTimeout(function() {
				player.can_throw = true;
			}, 100);
		}
	}
}

function keyDownHandler(ev) {
	switch (ev.keyCode) {
		case 87:
		case 38:
			player.moving_up = true;
			break;
		case 83:
		case 40:
			player.moving_down = true;
			break;
		case 65:
		case 37:
			player.moving_left = true;
			break;
		case 68:
		case 39:
			player.moving_right = true;
			break;
	}
}

function keyUpHandler(ev) {
	switch (ev.keyCode) {
		case 87:
		case 38:
			player.moving_up = false;
			break;
		case 83:
		case 40:
			player.moving_down = false;
			break;
		case 65:
		case 37:
			player.moving_left = false;
			break;
		case 68:
		case 39:
			player.moving_right = false;
			break;
	}
}

