var context;
var gridCanvas;					
var counterSpan;
var controlLink;
var clearLink;
var minimumSelect;
var maximumSelect;
var spawnSelect;

var CELL_SIZE = 8;
var X = 576;
var Y = 320;
var WIDTH = X / CELL_SIZE;
var HEIGHT = Y / CELL_SIZE;
var DELAY = 100;
var STOPPED = 0;
var RUNNING = 1;

var gameState = STOPPED;
var gameInterval;
var counter = 0;
var greenPopulation = 0;
var animalPopulation = 0;
var predatorPopulation = 0;



var directions = [[-1,-1], [0,-1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1,0]];
function unsortedDirections()
{
	var array = [0, 1, 2, 3, 4, 5, 6, 7];
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
	//console.log(array);
    return array;
}
function getDirection(dx,dy)
{
	let left = dx==0 ? 0 : dx/Math.abs(dx);
	let top = dy==0 ? 0 : dy/Math.abs(dy);
	for (var i =0; i<8; i++)
	{
		if (directions[i][0] == left && directions[i][1] == top) {return i;}
	}
	return null;
}
function getX(x,direction)
{
	var _x = x;
	_x += directions[direction][0];
	if (_x < 0) _x+= WIDTH;
	if (_x >= WIDTH) _x-= WIDTH;
	return _x;
}
function getRangedX(x,direction,range)
{
	var _x;
	if (direction >= 0 && direction <= 2) _x = Math.round(x + direction * range - range);
	if (direction > 2 && direction < 4) _x = x +range;	
	if (direction >= 4 && direction <= 6) _x = Math.round(x - direction * range + 5*range);		
	if (direction > 6 && direction < 8) _x = x - range;
	
	if (_x < 0) _x+= WIDTH;
	if (_x >= WIDTH) _x-= WIDTH;
	return _x;
}
function getY(y,direction)
{
		y += directions[direction][1];
		if (y<0) y+= HEIGHT;
		if (y>=HEIGHT) y-= HEIGHT;
		return y;
}
function getRangedY(y,direction,range)
{
	var _y;
	if (direction >= 0 && direction <= 2) _y = y - range;
	if (direction > 2 && direction < 4)_y = Math.round(y + direction * range - 3*range);
	if (direction >= 4 && direction <= 6) _y = y + range;		
	if (direction > 6 && direction < 8) _y = Math.round(y - direction * range + 7*range);	
	
	if (_y < 0) _y+= HEIGHT;
	if (_y >= HEIGHT) _y-= HEIGHT;
	return _y;
}
function search(x, y)
{
	var foundCells = new Array();
	for(var i = 0; i < cells.length; i++)
	{
		if (cells[i].posX == x && cells[i].posY == y)
			foundCells.push(cells[i]);
	}
	return foundCells;
}

function newDay()
{
	LifeCycle();
	redraw();
}

var action = 0;
function LifeCycle()
{
	for(var i = 0; i < cells.length; i++) cells[i].program();
		
	action++;
	if (action == 6){
		action = 0;
		counter++;
		
		greenPopulation = 0;
		animalPopulation = 0;
		predatorPopulation = 0;
		for (var i = 0; i<cells.length; i++)
		{
			if (cells[i] instanceof GreenCell) greenPopulation++;
			if (cells[i] instanceof AnimalCell) animalPopulation++;
			if (cells[i] instanceof PredatorCell) predatorPopulation++;
		}
		
		counterSpan.innerHTML = counter;
		greenPopulationSpan.innerHTML = greenPopulation;
		animalPopulationSpan.innerHTML = animalPopulation;
		predatorPopulationSpan.innerHTML = predatorPopulation;
	}
}

var cells = new Array();

function redraw()
{
	for (var h = 0; h < HEIGHT; h++) {
		for (var w = 0; w < WIDTH; w++) {
			context.fillStyle = "#eee";
			context.fillRect(
					w * CELL_SIZE +1,
					h * CELL_SIZE +1,
					CELL_SIZE -1,
					CELL_SIZE -1);
		}
	}
	for(var i = 0; i < cells.length; i++)
	{
		if (cells[i].alive == true)	cells[i].draw();

	}
/*	for(var i = 0; i < cells.length; i++)
	{
		if (cells[i].alive == true && cells[i] instanceof AnimalCell)	cells[i].draw();
	}*/
}

function canvasOnClickHandler(event) {
	var positionX = getCursorPositionX(event);
	var positionY = getCursorPositionY(event);
	if (!event.ctrlKey){
		cell = searchAnimalCell(positionX, positionY);
		if (cell == null) spawnAnimalCell(positionX, positionY);
		else removeAnimalCell(positionX, positionY);
	}
	else{
		cell = searchPredatorCell(positionX, positionY);
		if (cell == null) spawnPredatorCell(positionX, positionY);
		else removePredatorCell(positionX, positionY);	
	}
	redraw();
};

function canvasOnRightClickHandler(event) {
	var positionX = getCursorPositionX(event);
	var positionY = getCursorPositionY(event);
	cell = searchGreenCell(positionX, positionY);
	if (cell == null) spawnGreenCell(positionX, positionY);
	else removeGreenCell(positionX, positionY);
	redraw();
	return false;
};
function canvasOnMouseOverHandler(event) {
	var positionX = getCursorPositionX(event);
	var positionY = getCursorPositionY(event);
	cell = searchAnimalCell(positionX, positionY);
	if (cell != null) genomCodeSpan.innerHTML = cell.GenomAsString();
	else genomCodeSpan.innerHTML = "";
	return false;
};

function getCursorPositionX(event) {
	var x;
	if (event.pageX) {
		x = event.pageX;
	} else {
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	}
	x -= gridCanvas.offsetLeft;
	var positionX = Math.floor((x - 2) / CELL_SIZE);
	return positionX;
};
function getCursorPositionY(event) {
	var y;
	if (event.pageY) {
		y = event.pageY;
	} else {
		y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	y -= gridCanvas.offsetTop;
	var positionY = Math.floor((y - 4) / CELL_SIZE);
	return positionY;
};


					
document.addEventListener("DOMContentLoaded", function() {
	gridCanvas = document.getElementById('grid');					
	counterSpan = document.getElementById("counter");
	greenPopulationSpan = document.getElementById("greenPopulation");
	animalPopulationSpan = document.getElementById("animalPopulation");
	predatorPopulationSpan = document.getElementById("predatorPopulation");
	genomCodeSpan = document.getElementById("genomCode");
	genomSpan = document.getElementById("genom");
	controlLink = document.getElementById("controlLink");
	speedLink = document.getElementById("speedLink");
	clearLink = document.getElementById("clearLink");
	createGrassLink = document.getElementById("createGrassLink");
	minimumSelect = document.getElementById("minimumSelect");
	maximumSelect = document.getElementById("maximumSelect");
	spawnSelect = document.getElementById("spawnSelect");	

	gridCanvas.addEventListener("click", canvasOnClickHandler, false);
	gridCanvas.oncontextmenu = function(e){canvasOnRightClickHandler(e); return false;};
	gridCanvas.addEventListener("mousemove", canvasOnMouseOverHandler, false);
	
	controlLink.onclick = function() {
		switch (gameState) {
		case STOPPED:
			gameInterval = setInterval(function() {
				newDay();
			}, DELAY);
			gameState = RUNNING;
			break;
		default:
			clearInterval(gameInterval);
			gameState = STOPPED;
		}
	}
	speedLink.onclick = function() {
		if (DELAY == 0) DELAY = 100;
		else DELAY = 0;
		clearInterval(gameInterval);
		gameInterval = setInterval(function() {
				newDay();
			}, DELAY);
	}
			
	clearLink.onclick = function() {
		cells = new Array();
		redraw();
	}	

	createGrassLink.onclick = function() {
		cells = new Array();
		for (var i = 0; i < WIDTH; i++){
			for (var j = 0; j < HEIGHT; j++){
				spawnGreenCell(i, j);
			}	
		}
		redraw();
	}	
		

	if (gridCanvas.getContext) {
		context = gridCanvas.getContext('2d');
		var offset = CELL_SIZE;

		for (var x = 0; x <= X; x += CELL_SIZE) {
			context.moveTo(0.5 + x, 0);
			context.lineTo(0.5 + x, Y);
		}
		for (var y = 0; y <= Y; y += CELL_SIZE) {
			context.moveTo(0, 0.5 + y);
			context.lineTo(X, 0.5 + y);
		}
		context.strokeStyle = "#fff";
		context.stroke();
		redraw();
		

	} else {
		alert("Canvas is unsupported in your browser.");
	}
					
});