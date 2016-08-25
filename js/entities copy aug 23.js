
//TODO  My block isn't registering as hitting the player even though they have the same X:Y
PlatformList ={};

NoTouchObject = function(id,x,y,width,height){
	var self = {
		id : id,
		x : x,
		y : y,
		width : width,
		height : height,
		color : 'red',
		toDelete : false		
	}
	
	self.update = function() {
		self.updatePosition();
		self.draw();
	}
	
	self.draw = function () {
		ctx.save();
		ctx.fillStyle = self.color;
		ctx.fillRect(self.x, self.y, self.width, self.height);
		ctx.restore();
	}
	
	self.updatePosition = function() {
		if(keyPressed.right)
			self.x -= 10;
		if(keyPressed.left)
			self.x += 10;	
		if(keyPressed.down)
			self.y -= 10;	
		if(keyPressed.up)
			self.y += 10;	
	}
	
	return self;
}


TouchableObject =  function(id,x,y,width,height){
	var self = NoTouchObject(id,x ,y ,width,height);

	self.updatePosition = function() {
		self.x += finalXMove;
		self.y += finalYMove;
	}
	return self;
}
TouchableObject.collision = false;

Platform = function(id,coords,width,height, speedX, speedY){
    /*
    Architecture for Plaftorm coords.
    1.  Get coords for all edges (top, bottom, left, and right)
    2.  Compare against the prior frames edges
    3.  If there are any changes, that will trigger an action to write to the grid
    
    Writing to grid. 
    I have 2 functions for the following since im storing all current grid values as y[x] format.
    Add:  
        -Grab current grid values.  Add them to priorMapGridValues (key is coords concatenated)
        -Write new values as 2
    Delete:
        -Grab prior grid values from priorMapGridValues
        -Overwrite the mapGrid with prior values
        -Delete prior values
    
    */
	var self = {
		id : id,
		x : (coords[0] * TILE_SIZE) + map.x,
		y : ((coords[1] + 1) * TILE_SIZE) + map.y, //Not sure why the +1 is needed.
		width : width,
		height : height,
		speedX : speedX,
		speedY : speedY,
		toDelete : false,
		allCoords : {},
		currentBottomCoord : 0,
		currentTopCoord : 0,
		currentLeftCoord : 0,
		currentRightCoord : 0,
		priorLeftCoord : 0,
		priorRightCoord : 0,
		priorTopCoord : 0,
		priorBottomCoord : 0,
		priorMapGridValues : {}
	}
	self.topLeftCoord = coords;
	self.topRightCoord = [coords[0] + Math.floor(self.width/TILE_SIZE),coords[1]];
	self.bottomLeftCoord = [coords[0],coords[1] +Math.floor(self.width/TILE_SIZE)];
	self.bottomRightCoord = [coords[0] + Math.floor(self.width/TILE_SIZE),coords[1]+Math.floor(self.width/TILE_SIZE)];
	
	self.update = function() {
		if(self.toDelete)
			PlatformList[self].delete;
		else{
		  self.updatePosition();
		  self.draw();
		}
	}
	self.getPlatformCoordsFromPoint = function(x,y) {
		var holderX = x - map.x;
		var holderY = y - map.y;
		return [Math.floor((holderX)/TILE_SIZE),Math.floor((holderY)/TILE_SIZE)]
	}
	self.updatePosition = function(){
		self.x +=self.speedX + finalXMove;
		self.y +=self.speedY + finalYMove;
		self.getAllCoords();
	}
	
	self.draw = function () {
		ctx.save();
		ctx.fillStyle = 'red';
		ctx.fillRect(self.x, self.y, self.width, self.height);
		ctx.restore();
	}
	
	self.destroy = function() {
		
	}

	self.setEdgeCoords = function() {
        //Set prior
		self.priorBottomCoord = self.bottomRightCoord[1];
		self.priorTopCoord = self.topRightCoord[1];
		self.priorLeftCoord = self.bottomLeftCoord[0];
		self.priorRightCoord = self.bottomRightCoord[0];
		//Get new corners
		self.topLeftCoord = self.getPlatformCoordsFromPoint(self.x,self.y);
		self.topRightCoord = self.getPlatformCoordsFromPoint(self.x + self.width,self.y);
		self.bottomLeftCoord = self.getPlatformCoordsFromPoint(self.x,self.y + self.height);
		self.bottomRightCoord = self.getPlatformCoordsFromPoint(self.x + self.width,self.y + self.height);
        //Set current edges
        self.currentLeftCoord = self.topLeftCoord[0];
		self.currentRightCoord = self.topRightCoord[0];
		self.currentTopCoord =  self.topLeftCoord[1];
		self.currentBottomCoord = self.bottomLeftCoord[1];
	}
	
	self.handleUnoccupiedYCoords = function(yCoord) {
		var allXs = self.allCoords[yCoord];
		for(i = 0 ; i<self.allCoords[yCoord].length ; i++){
			var key = allXs[i].toString() + ',' + yCoord.toString();
			//There needs to be a function here to reset the map.
			//self.restoreMapGrid(allXs[i],yCoord, self.priorMapGridValues[key]);
			delete self.priorMapGridValues[key];
		}
		delete self.allCoords[yCoord];
	}
	
	self.handleUnoccupiedXCoords = function(xCoord, yCoord) {
		var key = xCoord.toString() + ',' + yCoord.toString();
		var xIndex = self.allCoords[yCoord].indexOf(xCoord);
		//self.restoreMapGrid(xCoord,yCoord,self.priorMapGridValues[key]);
		delete self.priorMapGridValues[key];
		delete self.allCoords[yCoord][xIndex];
	}
	
	self.restoreMapGrid = function(xCoord,yCoord, mapValue){
		map.grid[yCoord][xCoord] = mapValue;		
	}
	
	self.getMapGridValuesForY = function(xs, y){
		//Iterates through the list of Y and X[array]
		//Grabs map.grid value for each one.
		for(k = 0; k<xs.length; k++){
			var xCoord = xs[k];
			var key = (xCoord.toString() + ',' + y.toString())
			console.log('getting map values at: ',key);
			self.priorMapGridValues[key] = map.grid[y][xCoord];
		}
	}
	
	self.getAllCoords = function() {
		self.setEdgeCoords();  //Gets values for all edges
		
        //Checks to see if there are any changes in space
        /*
        if(self.priorBottomCoord > self.currentBottomCoord)
            deleteRowFromMapGrid(self.priorBottomCoord); //Moving up.  Delete bottom row
        if(self.priorBottomCoord < self.currentBottomCoord)
            addRowToMapGrid(self.currentBottomCoord)//Moving down.  Add bottom row
        if(self.priorTopCoord > self.currentTopCoord)
            deleteRowFromMapGrid(self.priorTopCoord) //Moving down.  Delete top row
        if(self.priorTopCoord < self.currentTopCoord)   
            addRowToMapGrid(self.currentTopCoord //Moving up.  Add top row
        if(self.priorLeftCoord > self.currentLeftCoord)  
            addColumnToMapGrid(self.currentLeftCoord) // Moving left.  Add leftmost column
        if(self.priorLeftCoord < self.currentLeftCoord)
            deleteColumnFromMapGrid(self.priorLeftCoord)// Moving right.  Delete leftmost column
        if(self.priorRightCoord > self.currentRightCoord)  
            deleteColumnFromMapGrid(self.priorRightCoord)// Moving left. Delete rightmost column
        if(self.priorRightCoord < self.currentRightCoord)  
            addColumnToMapGrid(self.currentRightCoord)//Moving right.  Add rightmost column
        */    
            
            
		//Checking to see if the previous row exists, if it does, delete it.
		if(self.allCoords[(self.currentTopCoord - 1)] !== undefined)
			self.handleUnoccupiedYCoords(self.currentTopCoord - 1);
		
		if(self.allCoords[(self.currentBottomCoord + 1)] !== undefined)
			self.handleUnoccupiedYCoords(self.currentBottomCoord + 1);
	
		for(i=self.currentTopCoord; i<self.currentBottomCoord + 1; i++){
			var horizontal_coords = [];
			for(j=self.currentLeftCoord; j< self.currentRightCoord + 1; j++) { //Top coord is lower because the top of the map is 0
				horizontal_coords.push(j);
			}
			if(self.allCoords[i] !== undefined){
				if(self.allCoords[i][0] !== horizontal_coords[0])
					self.handleUnoccupiedXCoords(self.allCoords[i][0],i);
				
			}
			self.allCoords[i] = horizontal_coords;
		}		
	
		self.handleNewSpace();
	}
	
	self.handleNewSpace = function(){
		if(self.currentTopCoord < self.priorTopCoord)
			self.getMapGridValuesForY(self.allCoords[self.currentTopCoord] ,self.currentTopCoord);
	}
	
    self.addRowToMapGrid = function(row){
        for(i = self.currentLeftCoord; i < self.currentRightCoord + 1; i++){
            var key = (i.toString() + ',' + row.toString());
            self.priorMapGridValues.key = map.grid[row][i];
            map.grid[row][i] = 2;
        }
    }
    
    self.addColumnToMapGrid = function(column){
        for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
            var key = (column.toString() + ',' + i.toString());
            self.priorMapGridValues.key = map.grid[i][column];
            map.grid[i][column] = 2;
        }
    }
    self.deleteRowFromMapGrid = function(row){
        for(i = self.currentLeftCoord; i < self.currentRightCoord + 1; i++){
            var key = (i.toString() + ',' + row.toString());
            map.grid[row][i] =  self.priorMapGridValues.key;
            delete self.priorMapGridValues.key;
            
        }
    }
    self.deleteColumnFromMapGrid = function(column){
        for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
            var key = (column.toString() + ',' + i.toString());
            map.grid[i][column] = self.priorMapGridValues.key;
            delete self.priorMapGridValues.key ;
        }
    }
    

	
//ON Start is here.
//Get map grid values of starting platform	
	self.currentLeftCoord = self.topLeftCoord[0];
	self.currentRightCoord = self.topRightCoord[0];
	self.currentTopCoord =  self.topLeftCoord[1];
	self.currentBottomCoord = self.bottomLeftCoord[1];
	
	for(var i =self.currentTopCoord; i<self.currentBottomCoord + 1; i++){
		var horizontal_coords = [];
		for(var j =self.currentLeftCoord; j< self.currentRightCoord + 1; j++) { //Top coord is lower because the top of the map is 0
			horizontal_coords.push(j);
		}
		self.getMapGridValuesForY(horizontal_coords, i);
	}
	PlatformList[self.id] = self;
	return self;
}

Player = function(){
	var self = NoTouchObject('player',WIDTH/2 ,HEIGHT/2, 20,20);
	self.color = 'blue';
	self.XTile = Math.floor((WIDTH/2)/TILE_SIZE);
	self.YTile = Math.floor((HEIGHT/2)/TILE_SIZE);
	self.touchingObject = false;
	self.standingOnObject = false;
	self.isJumping = false;
	self.coordsTopRight = [5,5];
	self.coordsTopLeft = [5,5];
	self.coordsBottomRight = [5,5];
	self.coordsBottomLeft = [5,5];
	
	
	self.draw = function() {
		ctx.save();
		ctx.fillStyle = self.color;
		ctx.fillRect(WIDTH/2 - self.width/2, HEIGHT/2 - self.height/2, self.width, self.height);
		ctx.restore();
	}
	


	self.updatePosition = function(){
		self.x = WIDTH/2 - player.width/2 - map.x;
		self.y = HEIGHT/2 - player.height/2 - map.y;

	}
	
	return self;	
}

var Map = function(id,img,grid){
	var startingX = (TILE_SIZE * (startingXCoord) * -1)  +  WIDTH/2 -  player.width/2; // Larger # makes you start at a lower coord
	var startingY = (TILE_SIZE *startingYCoord * -1) + HEIGHT/2 - player.height/2;
	var self = new TouchableObject(id,startingX,startingY,img.width,img.height);
	self.startingX = startingX;
	self.startingY = startingY;
	self.image = img;
	self.grid = grid;
	
	self.update = function() {
		self.updatePosition();
		self.draw();
	}
	
	
	
	self.draw = function(){
		ctx.drawImage(self.image,self.x,self.y);
	}
	return self;
}