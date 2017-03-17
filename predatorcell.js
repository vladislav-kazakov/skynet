// конструктор
function PredatorCell(x, y) {
	this.posX = x;
	this.posY = y;
	this.alive = true;
	this.fat = 10;
	this.age = 0;
	this.state = 0;
	this.FERTILE_MIN_AGE = 5;
}
PredatorCell.prototype.sleep = function()
{
	if (this.age == 0) return;
	if (this.fat>=1) this.fat -= 0;
	else this.alive = false;
	if (Math.random()<this.age * this.age/160000) this.alive = false;
}
PredatorCell.prototype.move = function()
{
	if (this.fat>=40) return;
	//if (this.fat>=10) return;
	if (this.age == 0) return;
	//var direction = Math.round(Math.random() * 9)-1;
	let left = 0, top = 0; 
	let _range = 5;
	label:
	for (var r = 1; r<=_range; r++){
		for(var i = 0; i<r*8; i++){
			if (this.lookRangedForAnimalCell(i/r, r)!= null){
				//console.log(i/r + "O " + getRangedX(this.posX, i/r, r) + "x" + getRangedY(this.posY, i/r, r));
				let dir = Math.round(i/r);
				if (dir == 8) dir = 0;
				left += directions[dir][0];
				top += directions[dir][1];
				break label;
				
			}
		}		
	}
	
	var direction = getDirection(left, top);
	if (direction == null) direction = Math.round(Math.random() * 9)-1;
	if (direction<0 || direction>7) return;
	if (this.lookForPredatorCell(direction)!= null) return;
	this.posX = getX(this.posX, direction);
	this.posY = getY(this.posY, direction);	
	this.fat-= 1;
}
PredatorCell.prototype.moveBreed = function()
{
	//if (this.fat>=10) return;
	if (this.fat < 20) return;
	if (this.age <= this.FERTILE_MIN_AGE) return;
	let left = 0, top = 0; 
	
	let _range = 2;
	label:
	for (var r = 1; r<=_range; r++){
		for(var i = 0; i<r*8; i++){
			let something = this.lookRangedForAnimalCell(i/r, r);
			if (something!= null && something.age > 20){
				let dir = Math.round(i/r);
				if (dir == 8) dir = 0;
				left += directions[dir][0];
				top += directions[dir][1];
				break label;
			}
		}		
	}

	var direction = getDirection(left, top);
	if (direction == null) direction = Math.round(Math.random() * 9)-1;
	if (direction<0 || direction>7) return;
	if (this.lookForPredatorCell(direction)!= null) return;
	this.posX = getX(this.posX, direction);
	this.posY = getY(this.posY, direction);	
	this.fat-= 1;
}
PredatorCell.prototype.rot = function()
{
	if (this.alive == false) removePredatorCell(this.posX, this.posY);
}
PredatorCell.prototype.lookForPredatorCell = function(direction)
{
	return something = searchPredatorCell(getX(this.posX, direction), getY(this.posY, direction));
}
PredatorCell.prototype.lookRangedForPredatorCell = function(direction, range)
{
	return something = searchPredatorCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
PredatorCell.prototype.lookForAnimalCell = function(direction)
{
	return something = searchAnimalCell(getX(this.posX, direction), getY(this.posY, direction));
}
PredatorCell.prototype.lookRangedForAnimalCell = function(direction, range)
{
	return something = searchAnimalCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
PredatorCell.prototype.eat = function()
{
	if (this.age == 0) return;
	let eaten = 0;
	var unsorted = unsortedDirections();
	for (var direction=0; direction<=7; direction++)
	{
		if (eaten >= 1) return;
		if (this.fat>=40) return;
		if (this.lookForAnimalCell(unsorted[direction]) != null)
		{
			eaten++;
			this.fat+=20;
			removeAnimalCell(getX(this.posX, unsorted[direction]), getY(this.posY, unsorted[direction]));
		}
	}
}

PredatorCell.prototype.breed = function()
{
	if (this.fat < 20) return;
	if (this.age <= this.FERTILE_MIN_AGE) return;
	var seed = [0,0,0,0,0,0,0,0];
	for (var direction=0; direction<=7; direction++)
	{
		let something = this.lookForPredatorCell(direction);
		if (something != null && something.age > something.FERTILE_MIN_AGE)
		{
			var place = direction+1; if (place>7)place-=8; seed[place]++;
			var place = direction+2; if (place>7)place-=8; seed[place]++;
			var place = direction-1; if (place<0)place+=8; seed[place]++;
			var place = direction-2; if (place<0)place+=8; seed[place]++;
		}
	}
	for (var direction=0; direction<=7; direction++)
	{
		if (seed[direction]>=1 && this.lookForPredatorCell(direction)==null && Math.random()>0.95){
			spawnPredatorCell(getX(this.posX, direction), getY(this.posY, direction));
			this.fat-= 10;
		}
	}
}
PredatorCell.prototype.grow = function()
{
	this.age++;
	this.fat-= 1;
}
PredatorCell.prototype.draw = function() {
	let color = 255 - this.age*5;
	if (color < 200) color = 200;
	context.fillStyle = "rgb(0, 0, " + color + ")";
	context.fillRect(
		this.posX * CELL_SIZE +1 +1, 
		this.posY * CELL_SIZE +1 +1, 
		CELL_SIZE -1 -3,
		CELL_SIZE -1 -3);
};

PredatorCell.prototype.program = function()
{
	switch (this.state)
	{
	case 0:
		this.grow();
		break;
	case 1:
		this.eat();
		break;
	case 2:
		this.moveBreed();
		this.breed();
		break;
	case 3:
		this.sleep();
		break;
	case 4:
		this.rot();
		break;	
	case 5:
		this.move();
		break;			
	}
	this.state++;
	if (this.state == 6) this.state = 0;
}

function searchPredatorCell(x, y)
{
	for(var i = 0; i < cells.length; i++)
	{
		let cell = cells[i];
		if (cell.posX == x && cell.posY == y && cell instanceof PredatorCell)
			return cell;
	}
	return null;
}
function spawnPredatorCell(x,y)
{
	if (searchPredatorCell(x, y) != null) return false;
	cells.push(new PredatorCell(x, y));
}
function removePredatorCell(x,y)
{
	for(var i = 0; i < cells.length; i++)
	{
		let cell = cells[i];
		if (cell.posX == x && cell.posY == y && cell instanceof PredatorCell) cells.splice(i, 1);
	}
}