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
Platform = function(id,coords,img, speedX, speedY, data){
	var self = {
		id : id,
        cycleCreated : cycleCounter,
		x : (coords[0] * TILE_SIZE) + map.x,
		y : ((coords[1] + 1) * TILE_SIZE) + map.y, //Not sure why the +1 is needed.
        xRelativeToMap : (coords[0] * TILE_SIZE),
        yRelativeToMap : ((coords[1] + 1) * TILE_SIZE),
        img : img,
		width : img.width,
		height : img.height,
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
        timeChangedXDirection : cycleCounter,
        timeChangedYDirection : cycleCounter,
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
            while(self.allCoords.length > 0){
                self.deleteKeyFromMapGrid(self.allCoords[0]);
            }
			delete PlatformList[self.id];

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
        ctx.drawImage(img,self.x,self.y - 7);
        /*
		ctx.save();
		ctx.fillStyle = 'red';
		ctx.fillRect(self.x, self.y, self.width, self.height);
		ctx.restore();
        */
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
        
        //  I changed how i keep track of coords a platforms occupies.
        //  It was originally only tracking a change of state (below)
        //  Now it brute forces it each cycle.
        
        var currentCoords = [];
        var coordsToDelete =[];
        for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
            for(k = self.currentLeftCoord; k < self.currentRightCoord + 1; k++){
                var key = (k.toString() + ',' + i.toString());
                currentCoords.push(key);             
            }
        }
        
        for(var p = 0; p < self.allCoords.length; p++){
            if(currentCoords.indexOf(self.allCoords[p]) == -1){ //This means that the platform moved off of the space
                coordsToDelete.push(self.allCoords[p]);
            }
        }
        for(var d = 0; d < coordsToDelete.length; d++){
            self.deleteKeyFromMapGrid(coordsToDelete[d]);
        }
        for(var l = 0; l < currentCoords.length;l++){
            if(self.allCoords.indexOf(currentCoords[l]) == -1) {  //THis means that the platform entered a new space
                self.addKeyToMapGrid(currentCoords[l]);
            }
        }   
	}
    
    //This takes incoords as a key "18,18"
    self.addKeyToMapGrid = function(key){
        var arrayCoords = key.split(",");
        try {
            self.priorMapGridValues[key] = map.grid[arrayCoords[1]][arrayCoords[0]];
            map.grid[arrayCoords[1]][arrayCoords[0]] = 2;
            self.allCoords.push(key);
        } catch(err){
            console.log("array coords:", arrayCoords);
            throw err
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
    
    self.changeXDirection = () => {
        self.speedX = (-1*self.speedX);
        finalXMove -= self.speedX*2;
        self.timeChangedXDirection = cycleCounter;
        logThis('collision-platform', 'changing block X direction');
    }    
    
    self.changeYDirection = () => {
        self.speedY = (-1*self.speedY);
        finalYMove -= self.speedY *2;
        self.timeChangedYDirection = cycleCounter;
        logThis('collision-platform', 'changing block Y direction');        
    }
	
//ON Start is here.
//Get map grid values of starting platform	
	self.currentLeftCoord = self.topLeftCoord[0];
	self.currentRightCoord = self.topRightCoord[0];
	self.currentTopCoord =  self.topLeftCoord[1];
	self.currentBottomCoord = self.bottomLeftCoord[1];
	
//	for(var k =self.currentTopCoord; k<self.currentBottomCoord + 1; k++){
//		self.addRowToMapGrid(k);
//		}
    var currentCoords = [];
    for(i = self.currentTopCoord; i < self.currentBottomCoord + 1; i++){
        for(k = self.currentLeftCoord; k < self.currentRightCoord + 1; k++){
            var key = (k.toString() + ',' + i.toString());
            currentCoords.push(key);             
        }
    }
    for(var l = 0; l < currentCoords.length;l++){
        console.log(key);
        if(self.allCoords.indexOf(currentCoords[l]) == -1) {  //THis means that the platform entered a new space
            self.addKeyToMapGrid(key);
        }
    }
        
    
	PlatformList[self.id] = self;
	return self;
}

Platform.createLevelPlatforms = function(){
    var data = {
        course_change_function : function(self) {
            if((self.topRightCoord[1] === 1 || self.topRightCoord[1] === 11) && self.timeChangedYDirection < (cycleCounter - 5))
               self.changeYDirection();
            if((self.topRightCoord[0] === 17 || self.topRightCoord[0] === 27) && self.timeChangedXDirection < (cycleCounter - 5))
                self.changeXDirection();     
            },
        delete_conditon_function : function(self){
            if(cycleCounter - self.cycleCreated > 600)
                return true;
            else
                return false;
        }
        
    }
    platform = new Platform('1',[18,10],Img.platformCloud1,2,-2,data);
    
}