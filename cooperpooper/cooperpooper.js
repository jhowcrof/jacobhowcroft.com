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
var logo = new Image();
logo.src = "images/introbear.png";
var logogradient = new Image();
logogradient.src = "images/dropdowngradient.png";
var tilesheet = new Image();
tilesheet.src = "images/tileset.png";
var p1img = new Image();
p1img.src = "images/dude_red.png";
var p2img = new Image();
p2img.src = "images/dude_yellow.png";

// Maps
var map = [
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	"--------\\XX/----------------------------",
	"        [XX]                            ",
	"        [XX]                            ",
	"        [XX]                            ",
	"        [XX]                            ",
	"        <-->                            ",
	"                                        ",
	"                                        ",
	"                            ,___________",
	"                            <----\\XXXXXX",
	"                                  \\XXXXX",
	"                                   \\XXXX",
	"                                    \\XXX",
	"                                     \\XX",
	"        ,_____.                      [XX",
	"        [XXXXX]                      [XX",
	"        [XXXXX]                      [XX",
	"        [XXXXX]                      [XX",
	"________(XXXXX)______________________(XX"
];

// Objects
function Tile(type){
	this.type = type;
	this.offx = type.x;
	this.offy = type.y;
	this.changeType = changeType;
	this.alpha = 1.0
	function changeType(type){
		this.type = type;
		this.offx = type.x;
		this.offy = type.y;
	}
}

// Variables
var tileTypes = {
	GROUND: {x:1, y:0},
	LWALL: {x:0, y:1},
	LCORNER: {x:0, y:0},
	RWALL: {x:2, y:1},
	RCORNER: {x:2, y:0},
	PLAIN: {x:1, y:1},
	NONE: {x:3, y:3}
};
var tiles = new Array();
var tileSize = 16;
var dropdown_position = 700 - canvas.height;
var running = false;
var interval_drawStart;
var pause = false;
var interval_update;
mouse = {
	x : 0,
	y : 0
};

player = {
	x : canvas.width/2,
	y : canvas.height - p1img.height,
	dx : 0,
	dy : 0,
	jumping: false,
	img: p1img
};

player2 = {
	x : canvas.width/2,
	y : canvas.height - p2img.height,
	dx : 0,
	dy : 0,
	jumping: false,
	img: p2img
};

loadTiles();
ssplash();

function loadTiles(){
	for(var i = 0; i < canvas.height/tileSize; i++){
		tiles.push(new Array());
		for(var j = 0; j < canvas.width/tileSize; j++){
			tiles[i].push(new Tile(tileTypes.NONE));
		}
	}
	for(var i = 0; i < canvas.width/tileSize; i++){
		tiles[tiles.length - 1][i].changeType(tileTypes.GROUND);
	}
}

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
		main();
	}, 5000);
}

function drawLogo() {
	if(dropdown_position >= 100) dropdown_position -= 3;
	final_ctx.fillStyle = '#FFF';
	final_ctx.fillRect(0, 0, canvas.width, canvas.height);
	console.log(dropdown_position);
	final_ctx.drawImage(logogradient, 0, dropdown_position, logogradient.width,
		canvas.height, 0, 0, canvas.width, canvas.height);
	//final_ctx.drawImage(logogradient, 0, 0);
	final_ctx.drawImage(logo, 0, 0);
}

function main() {
	interval_update = setInterval("update()", 25);
}

function update() {
	if(player.jumping){
		player.dy += 1;
		player.y += player.dy;
	}
	
	player.x += player.dx;
	
	if(player.y < 0) player.y = 0;
	else if(player.y > canvas.height - player.img.height){
		player.y = canvas.height - player.img.height;
		player.jumping = false;
		player.dy = 0;
	}
	
	if(player2.jumping){
		player2.dy += 1;
		player2.y += player2.dy;
	}
	
	player2.x += player2.dx;
	
	if(player2.y < 0) player2.y = 0;
	else if(player2.y > canvas.height - player2.img.height){
		player2.y = canvas.height - player2.img.height;
		player2.jumping = false;
		player2.dy = 0;
	}
	
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for(var i = 0; i < tiles.length; i++){
		for(var j = 0; j < tiles[i].length; j++){
			ctx.drawImage(tilesheet, tiles[i][j].offx * tileSize, tiles[i][j].offy * 
			tileSize, tileSize, tileSize, j * tileSize, i * tileSize, tileSize, tileSize);
		}
	}
	ctx.drawImage(player.img, player.x, player.y);
	ctx.drawImage(player2.img, player2.x, player2.y);
	final_ctx.drawImage(buffer, 0, 0);
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

function keydownhandler(ev) {
	if (ev.keyCode == 87) {
		if(!player.jumping){
			player.jumping = true;
			player.dy = -20;
		}
	} else if (ev.keyCode == 83) {
		
	}

	if (ev.keyCode == 65) {
		player.dx = -5;
	} else if (ev.keyCode == 68) {
		player.dx = 5;
	}
	
	if(ev.keyCode == 38){
		if(!player2.jumping){
			player2.jumping = true;
			player2.dy = -20;
		}
	}else if (ev.keyCode == 40){
	
	}
	
	if(ev.keyCode == 37) {
		player2.dx = -5;
	}else if(ev.keyCode == 39) {
		player2.dx = 5;
	}
}

function keyhandler(ev){}

function keyuphandler(ev) {
	if (ev.keyCode == 87 || ev.keyCode == 83) {
		
	}
	
	if (ev.keyCode == 65 || ev.keyCode == 68 ) {
		player.dx = 0;
	}
	
	if(ev.keyCode == 38 || ev.keyCode == 40){
		
	}
	
	if(ev.keyCode == 37|| ev.keyCode == 39){
		player2.dx = 0;
	}

}
