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

Player = function(){
	var self = NoTouchObject('player',WIDTH/2 ,HEIGHT/2, 20,80); //Starts slipping platforms at 29.  Width doesn't affect the slip.
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
	
    self.image = Img.player;
    self.width =self.image.width;
    self.height =self.image.height;
	
    self.direction = 'right';
    
	self.draw = function() {
        self.getDrawDirection();
        ctx.save();
        if(self.direction === 'left') {
            ctx.scale(-1,1);
            ctx.drawImage(self.image, WIDTH/2 *-1 + self.width/2 * -1, HEIGHT/2 - self.height/2);
        }
        else {
           ctx.drawImage(self.image, WIDTH/2 - self.width/2, HEIGHT/2 - self.height/2); 
        }
        ctx.restore();

	}

    
    self.getDrawDirection = function() {
        if(keyPressed.left || keyPressed.a) 
            self.direction = 'left';
        if(keyPressed.right || keyPressed.d) 
            self.direction = 'right';
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