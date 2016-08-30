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
    
    //BUG:  If the speed isn't a roundish number, the platform will hit a float error and break.
    

PlatformList ={};
Platform = function(id,coords,width,height, speedX, speedY, data){
	var self = {
		id : id,
        cycleCreated : cycleCounter,
		x : (coords[0] * TILE_SIZE) + map.x,
		y : ((coords[1] + 1) * TILE_SIZE) + map.y, //Not sure why the +1 is needed.
        xRelativeToMap : (coords[0] * TILE_SIZE) + map.x,
        yRelativeToMap : ((coords[1] + 1) * TILE_SIZE) + map.y,
		width : width,
		height : height,
		speedX : speedX,
		speedY : speedY,
		toDelete : false,
		allCoords : [],
		currentBottomCoord : 0,
		currentTopCoord : 0,
		currentLeftCoord : 0,
		currentRightCoord : 0,
		priorLeftCoord : 0,
		priorRightCoord : 0,
		priorTopCoord : 0,
		priorBottomCoord : 0,
		priorMapGridValues : {},
        data : data
	}
	self.topLeftCoord = coords;
	self.topRightCoord = [coords[0] + Math.floor(self.width/TILE_SIZE),coords[1]];
	self.bottomLeftCoord = [coords[0],coords[1] +Math.floor(self.width/TILE_SIZE)];
	self.bottomRightCoord = [coords[0] + Math.floor(self.width/TILE_SIZE),coords[1]+Math.floor(self.width/TILE_SIZE)];
    
    if(data.course_change_function !== undefined)
        self.change_course_function = data.course_change_function;
    if(data.delete_conditon_function !== undefined)
        self.delete_conditon_function = data.delete_conditon_function;
	
	self.update = function() {
		if(self.delete_conditon_function(self)){
            console.log('about to delete a platform');
            console.log("prioir values",self.priorMapGridValues);
            console.log("current map 2s: ");
            for(var y= 0; y<map.grid.length; y++){
                for(var x= 0; x<map.grid[y].length; x++){
                    if(map.grid[y][x] ===2)
                        console.log(x,y);
                }
            }
            while(self.allCoords.length > 0){
                self.deleteKeyFromMapGrid(self.allCoords[0]);
            }
			delete PlatformList[self.id];
            console.log("console deleted.  Map 2s");
            for(var y= 0; y<map.grid.length; y++){
                for(var x= 0; x<map.grid[y].length; x++){
                    if(map.grid[y][x] ===2)
                        console.log(x,y);
                }
            }
            console.log(PlatformList);
        }
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
        self.change_course_function(self);
		self.x +=self.speedX + finalXMove;
		self.y +=self.speedY + finalYMove;
        self.xRelativeToMap = self.x - map.x;
        self.yRelativeToMap = self.y - map.y;
		self.updateMapGrid();
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
	

	self.updateMapGrid = function() {
		self.setEdgeCoords();  //Gets values for all edges
        //Checks to see if there are any changes in space
        if(self.priorBottomCoord > self.currentBottomCoord)
            self.deleteRowFromMapGrid(self.priorBottomCoord); //Moving up.  Delete bottom row
        if(self.priorBottomCoord < self.currentBottomCoord)
            self.addRowToMapGrid(self.currentBottomCoord)//Moving down.  Add bottom row
        if(self.priorTopCoord < self.currentTopCoord)
            self.deleteRowFromMapGrid(self.priorTopCoord) //Moving down.  Delete top row
        if(self.priorTopCoord > self.currentTopCoord)   
            self.addRowToMapGrid(self.currentTopCoord) //Moving up.  Add top row
        //Left and right.
        if(self.priorLeftCoord > self.currentLeftCoord)  
            self.addColumnToMapGrid(self.currentLeftCoord) // Moving left.  Add leftmost column
        if(self.priorLeftCoord < self.currentLeftCoord)
            self.deleteColumnFromMapGrid(self.priorLeftCoord)// Moving right.  Delete leftmost column
        if(self.priorRightCoord > self.currentRightCoord)  
            self.deleteColumnFromMapGrid(self.priorRightCoord)// Moving left. Delete rightmost column
        if(self.priorRightCoord < self.currentRightCoord)  
            self.addColumnToMapGrid(self.currentRightCoord)//Moving right.  Add rightmost column  
            
	}
	
    self.addRowToMapGrid = function(row){
        for(i = self.currentLeftCoord; i < self.currentRightCoord + 1; i++){
            var key = (i.toString() + ',' + row.toString());
            self.priorMapGridValues[key] = map.grid[row][i];
            map.grid[row][i] = 2;
            self.allCoords.push(key);
        }
    }
    
    self.addColumnToMapGrid = function(column){
        for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
            var key = (column.toString() + ',' + i.toString());
            self.priorMapGridValues[key] = map.grid[i][column];
            map.grid[i][column] = 2;
            self.allCoords.push(key);
        }
    }
    self.deleteRowFromMapGrid = function(row){
        for(i = self.currentLeftCoord; i < self.currentRightCoord + 1; i++){
            var key = (i.toString() + ',' + row.toString());
            map.grid[row][i] =  self.priorMapGridValues[key];
            delete self.priorMapGridValues[key];
            self.allCoords.splice(self.allCoords.indexOf(key), 1);
            
        }
    }
    self.deleteColumnFromMapGrid = function(column){
        for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
            var key = (column.toString() + ',' + i.toString());
            map.grid[i][column] = self.priorMapGridValues[key];
            delete self.priorMapGridValues[key];
            self.allCoords.splice(self.allCoords.indexOf(key), 1);
        }
    }
    
    //This takes incoords as a key "18,18"
    self.deleteKeyFromMapGrid = function(key){
        var arrayCoords = key.split(",");
        try {
            map.grid[arrayCoords[1]][arrayCoords[0]] = self.priorMapGridValues[key];
            delete self.priorMapGridValues[key];
            self.allCoords.splice(self.allCoords.indexOf(key), 1);
        } catch(err){
            throw err
        }   
    }
	
//ON Start is here.
//Get map grid values of starting platform	
	self.currentLeftCoord = self.topLeftCoord[0];
	self.currentRightCoord = self.topRightCoord[0];
	self.currentTopCoord =  self.topLeftCoord[1];
	self.currentBottomCoord = self.bottomLeftCoord[1];
	
	for(var k =self.currentTopCoord; k<self.currentBottomCoord + 1; k++){
		self.addRowToMapGrid(k);
		}
	PlatformList[self.id] = self;
	return self;
}

Platform.createLevelPlatforms = function(){
    var data = {
        course_change_function : function(self) {
            if(self.topRightCoord[1] === 1 || self.topRightCoord[1] === 11){
                self.speedY = (-1*self.speedY);
                logThis('collision-platform', 'changing block course');
            }
            if(self.topRightCoord[0] === 17 || self.topRightCoord[0] === 27){
                self.speedX = (-1*self.speedX);
                logThis('collision-platform', 'changing block course');
            }
            },
        delete_conditon_function : function(self){
            if(cycleCounter - self.cycleCreated > 300)
                return true;
            else
                return false;
        }
        
    }
    platform = new Platform('1',[18,10],50,40,2,-2,data);
    
}