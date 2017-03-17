function GreenCell(x, y) {
	this.posX = x;
	this.posY = y;
	this.alive = true;
	this.fat = 0;
	this.age = 0;
	this.state = 0;
}
GreenCell.prototype.sleep = function()
{
	if (Math.random()<this.age * this.age/160000) this.alive = false;
	return;
}
GreenCell.prototype.move = function()
{
	return;
}
GreenCell.prototype.rot = function()
{
	if (this.alive == false) removeGreenCell(this.posX, this.posY);
}
GreenCell.prototype.lookForGreenCell = function(direction)
{
	var something = searchGreenCell(getX(this.posX, direction), getY(this.posY, direction))
	if ( something != null) return something;
	return null;
}

GreenCell.prototype.eat = function()
{
	return;
}

GreenCell.prototype.breed = function()
{
	if (this.age == 0) return;
	var seed = [0,0,0,0,0,0,0,0];
	for (var direction=0; direction<=7; direction++)
	{
		if (this.lookForGreenCell(direction)==null && Math.random()>0.95)
		{
			spawnGreenCell(getX(this.posX, direction), getY(this.posY, direction));
		}
	}
}
GreenCell.prototype.grow = function()
{
	this.age++;
}
GreenCell.prototype.draw = function() {

	let color = 255 - this.age*5;
	if (color < 200) color = 200;
	context.fillStyle = "rgb(0," + color + ",0)";
	context.fillRect(
			this.posX * CELL_SIZE +1, 
			this.posY * CELL_SIZE +1, 
			CELL_SIZE -1,
			CELL_SIZE -1);

	let animalCell = searchAnimalCell(this.posX, this.posY);
	if (animalCell) animalCell.draw();
	let predatorCell = searchPredatorCell(this.posX, this.posY);
	if (predatorCell) predatorCell.draw();

};
GreenCell.prototype.program = function()
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

function searchGreenCell(x, y)
{
	for(var i = 0; i < cells.length; i++)
	{
		if (cells[i].posX == x && cells[i].posY == y && cells[i] instanceof GreenCell)
			return cells[i];
	}
	return null;
}
function spawnGreenCell(x,y)
{
	if (searchGreenCell(x, y) != null) return false;
	cells.push(new GreenCell(x, y));
}
function removeGreenCell(x,y)
{
	for(var i = 0; i < cells.length; i++)
	{
		if (cells[i].posX == x && cells[i].posY == y && cells[i] instanceof GreenCell) cells.splice(i, 1);
	}
}