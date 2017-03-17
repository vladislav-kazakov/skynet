// конструктор
function AnimalCell(x, y) {
	this.posX = x;
	this.posY = y;
	this.alive = true;
	this.fat = 2;
	this.age = 0;
	this.state = 0;
	this.FERTILE_MIN_AGE = 5;
	this.genPos = 0;
	this.gen = "01024034";
}
AnimalCell.prototype.GenomAsString = function ()
{
	this.genPos = 0;
	var code = "";
	try{
	while (seq = this.ReadGenSequence(false)) code += "<br>" + seq;
	}catch(e){}
	return code;	
}
AnimalCell.prototype.ReadNextGenItem = function()
{
	if (this.genPos >= this.gen.length) return null;
	var item = this.gen[this.genPos];
	this.genPos++;
	return item;
}
AnimalCell.prototype.MutateGen = function()
{
	//this.gen[0] = 9;
	var chance = Math.random();
	for(var i = 0; i< this.gen.length; i++)
	{
		chance = Math.random();
		while (chance > 0.95)
		{
			this.gen = [this.gen.slice(0, i), Math.floor(Math.random() * 10)%10, this.gen.slice(i)].join('');
			chance = Math.random();
		}
		if (Math.random()>0.95) 
		{
			this.gen = this.gen.substr(0, i) + Math.floor(Math.random() * 10)%10 + this.gen.substr(i + 1);
		}
		if (Math.random()>0.95) 
		{
			this.gen = this.gen.substr(0, i) + this.gen.substr(i + 1);
		}		
	}
	chance = Math.random();	
	while (chance > 0.95)
	{
		this.gen = this.gen + Math.floor(Math.random() * 10)%10;
		chance = Math.random();
	}
}
AnimalCell.prototype.ReadGenSequence = function(cycle)
{
	if (!cycle && this.genPos >= this.gen.length) return null;
	var program = "";
	switch (parseInt(this.ReadNextGenItem())%3){
	case 1: 
		program +="if(";
		switch (parseInt(this.ReadNextGenItem())%7){
		case 0:
			program += "this.lookForGreenCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;
		case 1:
			program += "this.lookForAnimalCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;
		case 2:
			program += "this.lookForPredatorCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;	
		case 3:
			program += "this.fat <= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;		
		case 4:
			program += "this.fat >= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;			
		case 5:
			program += "this.age <= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;		
		case 6:
			program += "this.age >= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;	
		}
		program += ")" + this.ReadGenSequence(cycle);
		break;
	case 2: 
		program +="if(!(";
		switch (parseInt(this.ReadNextGenItem())%7){
		case 0:
			program += "this.lookForGreenCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;
		case 1:
			program += "this.lookForAnimalCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;
		case 2:
			program += "this.lookForPredatorCell(" + (parseInt(this.ReadNextGenItem())*10 + parseInt(this.ReadNextGenItem()))*7/100 + "," + this.ReadNextGenItem() +")";
			break;	
		case 3:
			program += "this.fat <= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;		
		case 4:
			program += "this.fat >= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;			
		case 5:
			program += "this.age <= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;		
		case 6:
			program += "this.age >= " + this.ReadNextGenItem() + this.ReadNextGenItem();
			break;	
		}
		program += "))" + this.ReadGenSequence(cycle);
		break;
	case 0: 
		switch (parseInt(this.ReadNextGenItem()) %3){
		case 0:
			//program += "dobreed(" + (parseInt(gen[2])*10 + parseInt(gen[3]))*7/100 + ");";
			program += "this.breed();";
			break;
		case 1:
			//program += "doeat(" + (parseInt(gen[2])*10 + parseInt(gen[3]))*7/100 + ");";
			program += "this.eatSimple();";
			break;
		case 2:
			//program += "domove(" + (parseInt(gen[2])*10 + parseInt(gen[3]))*7/100 + ");";
			program += "this.moveSimple(" + Math.floor(parseInt(this.ReadNextGenItem())*8/10)%8 + ");";
			break;	
		}
		break;
	}
	if (cycle && this.genPos >= this.gen.length) this.genPos = 0;
	return program;
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
AnimalCell.prototype.moveSimple = function(direction)
{
	if (this.fat>=10) return;
	if (this.age == 0) return;
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
	return searchAnimalCell(getX(this.posX, direction), getY(this.posY, direction));
}
AnimalCell.prototype.lookRangedForAnimalCell = function(direction, range)
{
	return searchAnimalCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
AnimalCell.prototype.lookForGreenCell = function(direction)
{
	if (direction == -1) return searchGreenCell(this.posX, this.posY);
	return searchGreenCell(getX(this.posX, direction), getY(this.posY, direction));
}
AnimalCell.prototype.lookRangedForGreenCell = function(direction, range)
{
	return searchGreenCell(getRangedX(this.posX, direction, range), getRangedY(this.posY, direction,range));
}
AnimalCell.prototype.eat = function()
{//return;
	if (this.age == 0) return;
	let eaten = 0;
	var unsorted = unsortedDirections();
	for (var direction=0; direction<=7; direction++)
	{
		//if (eaten >= 3) return;
		if (this.fat>=6) return;
		if (this.lookForGreenCell(unsorted[direction]) != null)
		{
			eaten++;
			this.fat+=1;
			removeGreenCell(getX(this.posX, unsorted[direction]), getY(this.posY, unsorted[direction]));
		}
	}
}

AnimalCell.prototype.eatSimple = function(direction)
{//return;
	if (this.age == 0) return;
	if (this.fat>=6) return;
	if (this.lookForGreenCell(-1) != null)
	{
		this.fat+=2;
		removeGreenCell(this.posX, this.posY);
	}
}

AnimalCell.prototype.breed = function()
{
	//if (this.fat <= 3) return;
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
		if (seed[direction]>=1 && this.lookForAnimalCell(direction)==null && Math.random()>0.1){
			let newcell = spawnAnimalCell(getX(this.posX, direction), getY(this.posY, direction));
			newcell.gen = this.gen;
			this.fat-= 1;
		}
	}
}
AnimalCell.prototype.grow = function()
{
	if (this.age == 0){
		this.MutateGen();
		genomSpan.innerHTML = this.gen;
	}
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
	if (this.state == 0) this.grow();
	try{
		eval(this.ReadGenSequence(true));
	}
	catch(e){}
	this.state++;
	if (this.state == 6) 
	{
		this.state = 0;
		this.sleep();
		this.rot();
	}
}

function spawnAnimalCell(x,y)
{
	if (searchAnimalCell(x, y) != null) return false;
	var cell = new AnimalCell(x, y);
	cells.push(cell);
	return cell;
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