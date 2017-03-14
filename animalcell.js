// конструктор
function AnimalCell(x, y) {
	this.posX = x;
	this.posY = y;
	this.alive = true;
	this.fat = 2;
	this.age = 0;
	this.state = 0;
	this.FERTILE_MIN_AGE = 5;
}
AnimalCell.ParseGen(gen)
{
	var program = "";
	switch (gen[0]%2){
	case '0': 
		program +="if(";
		switch (gen[1]%7){
		case "0":
			program += "lookForGreenCell(" + gen[2] + gen[3] + "," + gen[4]+")";
			break;
		case "1":
			program += "lookForAnimalCell(" + gen[2] + gen[3] + "," + gen[4]+")";
			break;
		case "2":
			program += "lookForPredatorCell(" + gen[2] + gen[3] + "," + gen[4]+")";
			break;	
		case "3":
			program += "this.fat <= " + gen[2] + gen[3] + gen[4];
			break;		
		case "4":
			program += "this.fat >= " + gen[2] + gen[3] + gen[4];
			break;			
		case "5":
			program += "this.age <= " + gen[2] + gen[3] + gen[4];
			break;		
		case "6":
			program += "this.age >= " + gen[2] + gen[3] + gen[4];
			break;	
		}
		program += ")";
		break;
	case '1': 
		switch (gen[1]%3){
		case "0":
			program += "breed(" + gen[2] + gen[3] ");";
			break;
		case "1":
			program += "eat(" + gen[2] + gen[3] ");";
			break;
		case "2":
			program += "move(" + gen[2] + gen[3] ");";
			break;	
		}
		break;
	}
}
AnimalCell.prototype.sleep = function()
{
	if (this.age == 0) return;
	if (this.fat>=1) this.fat -= 0;
	else this.alive = false;
	if (Math.random()<this.age * this.age/40000) this.alive = false;
}
AnimalCell.prototype.move = function()
{
	if (this.fat>=10) return;
	if (this.age == 0) return;
	//var direction = Math.round(Math.random() * 9)-1;
	let left = 0, top = 0; 
	
	let _range = 2;
	for (var r = 1; r<=_range; r++){
		for(var i = 0; i<r*8; i++){
			if (this.lookRangedForGreenCell(i/r, r)!= null){
				let dir = Math.round(i/r);
				if (dir == 8) dir = 0;
				left += directions[dir][0];
				top += directions[dir][1];
			}
		}		
	}
	var direction = getDirection(left, top);
	if (direction == null) direction = Math.round(Math.random() * 9)-1;
	if (direction<0 || direction>7) return;
	if (this.lookForAnimalCell(direction)!= null) return;
	this.posX = getX(this.posX, direction);
	this.posY = getY(this.posY, direction);	
	this.fat-= 1;
}
AnimalCell.prototype.moveBreed = function()
{
	if (this.fat>=10) return;
	if (this.fat < 3) return;
	if (this.age <= this.FERTILE_MIN_AGE) return;
	let left = 0, top = 0; 
	
	let _range = 2;
	for (var r = 1; r<=_range; r++){
		for(var i = 0; i<r*8; i++){
			let something = this.lookRangedForAnimalCell(i/r, r);
			if (something!= null && something.age > 10){
				let dir = Math.round(i/r);
				if (dir == 8) dir = 0;
				left += directions[dir][0];
				top += directions[dir][1];
			}
		}		
	}

	var direction = getDirection(left, top);
	if (direction == null) direction = Math.round(Math.random() * 9)-1;
	if (direction<0 || direction>7) return;
	if (this.lookForAnimalCell(direction)!= null) return;
	this.posX = getX(this.posX, direction);
	this.posY = getY(this.posY, direction);	
	this.fat-= 1;
}
AnimalCell.prototype.rot = function()
{
	if (this.alive == false) removeAnimalCell(this.posX, this.posY);
}
AnimalCell.prototype.lookForAnimalCell = function(direction)
{
	return something = searchAnimalCell(getX(this.posX, direction), getY(this.posY, direction));
}
AnimalCell.prototype.lookRangedForAnimalCell = function(direction, range)
{
	return something = searchAnimalCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
AnimalCell.prototype.lookForGreenCell = function(direction)
{
	return something = searchGreenCell(getX(this.posX, direction), getY(this.posY, direction));
}
AnimalCell.prototype.lookRangedForGreenCell = function(direction, range)
{
	return something = searchGreenCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
AnimalCell.prototype.eat = function()
{//return;
	if (this.age == 0) return;
	let eaten = 0;
	var unsorted = unsortedDirections();
	for (var direction=0; direction<=7; direction++)
	{
		if (eaten >= 3) return;
		if (this.fat>=6) return;
		if (this.lookForGreenCell(unsorted[direction]) != null)
		{
			eaten++;
			this.fat+=2;
			removeGreenCell(getX(this.posX, unsorted[direction]), getY(this.posY, unsorted[direction]));
		}
	}
}

AnimalCell.prototype.breed = function()
{
	if (this.fat <= 3) return;
	if (this.age <= 10) return;	
	var seed = [0,0,0,0,0,0,0,0];
	for (var direction=0; direction<=7; direction++)
	{
		let something = this.lookForAnimalCell(direction);
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
		if (seed[direction]>=1 && this.lookForAnimalCell(direction)==null && Math.random()>0.95){
			spawnAnimalCell(getX(this.posX, direction), getY(this.posY, direction));
			this.fat-= 1;
		}
	}
}
AnimalCell.prototype.grow = function()
{
	this.age++;
	this.fat-= 1;
}
AnimalCell.prototype.draw = function() {
		let color = 255 - this.age*5;
		if (color < 200) color = 200;
		context.fillStyle = "rgb(" + color + ", 0, 0)";
		context.fillRect(
			this.posX * CELL_SIZE +1 +2, 
			this.posY * CELL_SIZE +1 +2, 
			CELL_SIZE -1 -3,
			CELL_SIZE -1 -3);
};

AnimalCell.prototype.program = function()
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

function spawnAnimalCell(x,y)
{
	if (searchAnimalCell(x, y) != null) return false;
	cells.push(new AnimalCell(x, y));
}
function removeAnimalCell(x,y)
{
	for(var i = 0; i < cells.length; i++)
	{
		let cell = cells[i];
		if (cell.posX == x && cell.posY == y && cell instanceof AnimalCell) cells.splice(i, 1);
	}
}
function searchAnimalCell(x, y)
{
	for(var i = 0; i < cells.length; i++)
	{
		let cell = cells[i];
		if (cell.posX == x && cell.posY == y && cell instanceof AnimalCell)
			return cell;
	}
	return null;
}