
//TODO  My block isn't registering as hitting the player even though they have the same X:Y


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

	
	self.isHitOnBottom = function (entity){
		return self.x < entity.x + entity.width 
				&& self.x + self.width > entity.x 
				&& self.y + self.height > entity.y
				&& self.y + self.height < entity.y + entity.height;		
	}
	self.isHitOnTop = function (entity){
		return self.x < entity.x + entity.width 
				&& self.x + self.width > entity.x 
				&& self.y < entity.y + entity.height
				&& self.y + self.height > entity.y + entity.height;		
	}
	return self;
}
TouchableObject.collision = false;

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
	
	self.getCoordsTopRight = function () {
		var centerX = WIDTH/2 + self.width/2 - map.x;
		var centerY = HEIGHT/2 - self.height/2 - map.y;
		return [Math.floor((centerX)/TILE_SIZE),Math.floor((centerY)/TILE_SIZE)];
	}
	self.getCoordsBottomRight = function () {
		var centerX = WIDTH/2 + self.width/2 - map.x;
		var centerY = HEIGHT/2 + self.height/2 - map.y;
		return [Math.floor((centerX)/TILE_SIZE),Math.floor((centerY)/TILE_SIZE)];
	}
	
	self.getCoordsBottomLeft = function () {
		var centerX = WIDTH/2 - self.width/2 - map.x;
		var centerY = HEIGHT/2 + self.height/2 - map.y;
		return [Math.floor((centerX)/TILE_SIZE),Math.floor((centerY)/TILE_SIZE)];
	}
	self.getCoordsTopLeft = function () {
		var centerX = WIDTH/2 - self.width/2 - map.x;
		var centerY = HEIGHT/2 - self.height/2 - map.y;
		return [Math.floor((centerX)/TILE_SIZE),Math.floor((centerY)/TILE_SIZE)];
	}

	self.updatePosition = function(){
		self.x = WIDTH/2 - player.width/2 - map.x;
		self.y = HEIGHT/2 - player.height/2 - map.y;
		self.coordsTopRight = self.getCoordsTopRight();
		self.coordsTopLeft = self.getCoordsTopLeft();
		self.coordsBottomLeft = self.getCoordsBottomLeft();
		self.coordsBottomRight = self.getCoordsBottomRight();
	}
	
	return self;	
}
