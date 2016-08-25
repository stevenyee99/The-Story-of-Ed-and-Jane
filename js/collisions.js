//  How Collisions work!
/*
1.  Based on the key pressed and movement factors, get how much the player
 Will move (both X and Y).  THis is the deltaX and deltaY!
2.  For each corner of the player, get the grid space based off
  the new proposed position it will be in (current + delta)
3.  Check to see if this position is in a "collision" space
	a.  I do it this way because other 'collision' objects may enter the space
4.  If its in a collision space, get the 'block' of whats occupying it
	a.  Currently its just blocks, but I will add other objects which arent
	all 32x32
5.  Check to see if there's actually a collision
	a.  For all blocks, this will always be true.
6.  Get how deep te player is in the block.  Set that as the adjustor.
7.  Set how much the player should actually move
	a.  Proposed - adjustor

Note:  All x/ys are based on the position from the top left corner of the map, not canvas.
        Sorry future steven!
*/

var deltaX = 0;
var deltaY = 0;
var proposedX = 0;
var proposedY = 0;
var finalXMove = 0;
var finalYMove = 0;

//THis function sets the final X and Y movements (px) of the player.
var getPlayerMovement = function(){
	resetCollisions();		
	calculateProposedCoords();
	isTouchingPlayer();
	calculateFinalMoveCoords();
}

var resetCollisions = function() {
		collision.bottom = false;
		collision.top = false;
		collision.left = false;
		collision.right = false;
		collision.bottomAdjustor = 0;
		collision.topAdjustor = 0;
		collision.leftAdjustor = 0;
		collision.rightAdjustor = 0;
		deltaX = 0;
		deltaY = 0;
		proposedX = 0;
		proposedY = 0;
		finalYMove = 0;
		finalXMove = 0;
	}

var calculateProposedCoords = function(){
	if(keyPressed.right){
			deltaX -= moveSpeed;
			finalXMove -= moveSpeed;
	}
	if(keyPressed.left){
		deltaX += moveSpeed;	
		finalXMove += moveSpeed;
	}
	if(keyPressed.up){
		if(!gravity.isJumping){
			gravity.jumpStrength = gravity.baseJumpStrength;
			gravity.isJumping = true;
		}
	}
	if(gravity.jumpStrength > -19 ) //player height is the limit.
		gravity.jumpStrength -= gravity.currentStrength;
	deltaY -= gravity.jumpStrength;
	finalYMove += gravity.jumpStrength;
	gravity.isJumping = true;			
}	

//Check to see if theres a collision
var isHitOnTop = function (block){ 
	if (player.x + player.width > block.x + 2
	&& player.x < block.x + block.width - 2
	&& proposedY <= block.y + block.height
	&& proposedY + player.height >= block.y + block.height)
		return true;
	else 
		return false;
};

var isHitOnBottom = function (block){
	if(player.x + player.width > block.x + 2
	&& player.x < block.x + block.width - 2
	&& proposedY - player.height < block.y
	&& proposedY >= block.y)
		return true;
	else 
		return false;
};

var isHitOnRight = function (block){
	if(proposedX + player.width >= block.x
	&& proposedX + player.width <= block.x + block.width
	&& player.y < block.y + block.height  - 2  //The +/- 2 gives the block the ability to slide on top of a surface
	&& player.y + player.height > block.y + 2  //1 doesn't work for some reason.
	)
		return true;
	else
		return false;
};

var isHitOnLeft = function (block){
	if(proposedX  <= block.x + block.width
	&& proposedX + player.width >= block.x + block.width
	&& player.y < block.y + block.height - 2
	&& player.y + player.height > block.y + 2
	)
		return true;
	else
		return false;
};

//Handle collisions
var handleLeftCollision = function(block) {
	if (isHitOnLeft(block)){
		if(!collision.left)
			collision.leftAdjustor = block.x + block.width - proposedX;
		collision.left = true;
	}
}

var handleRightCollision = function(block) {
	if (isHitOnRight(block)){
		if(!collision.right){
			collision.rightAdjustor = block.x - proposedX;
		}
		collision.right = true;
	}
}

var handleTopCollision = function(block) {
	if(isHitOnTop(block)){
		if(!collision.top){
			collision.topAdjustor = block.y + block.height - proposedY;
			}
		collision.top = true;
	}
}
var handleBottomCollision = function(block) {
	if(isHitOnBottom(block)){	
		gravity.isJumping = false;
		if(!collision.bottom){
			collision.bottomAdjustor = block.y - proposedY;
		}
		collision.bottom = true;
	}	
}

var getCorrectPlatform = function(xCoord,yCoord){
    var key = (xCoord.toString() + ',' + yCoord.toString());
    var occupiedPlatform = [];
    for(platform in PlatformList){
        if(PlatformList[platform].allCoords.indexOf(key) !== -1)
           occupiedPlatform.push(PlatformList[platform]);
    }
    return occupiedPlatform;
    
}
var getBlock = function(xCoord,yCoord,gridValue){
    if(gridValue === 1){
        var block = {
			x : xCoord * TILE_SIZE,
			y : yCoord * TILE_SIZE,
			width : TILE_SIZE,
			height : TILE_SIZE
		}
        return block;
    }
    else if (gridValue === 2){
        logThis('collision-platform',"about to start colliding with a platform");
        var allBlocks = getCorrectPlatform(xCoord,yCoord);
        //Error handling
        if(allBlocks.length === 0 || allBlocks.length === undefined)
            alert("The map grid says you hit a platform but no platforms are in that space");
    
        else if (allBlocks.length > 1)
            alert("There is more than 1 platform in this space.");
        else {
            var thisBlock = allBlocks[0];
            var block = {
                x : thisBlock.xRelativeToMap,
                y : thisBlock.yRelativeToMap,
                width : thisBlock.width,
                height : thisBlock.height  
            }
            logThis('collision-platform', block);
            logThis('collision-platform', player.x);
            return block;
        }
    }
}

//This function takes a coordinate and updates all
//Collisions with the player
var updateAllHits = function (coord){
	var xCoord = coord[0];
	var yCoord = coord[1];
	if(yCoord < 0 || yCoord > map.grid.length)
		console.log("Player is out of bound Vertically.");
	//This tests to see if the player is entering a collision space
	else if(map.grid[yCoord][xCoord] > 0){
		var block = getBlock(xCoord,yCoord,map.grid[yCoord][xCoord]);
		
        //TODO  Add condition where bottom and right (or any corner combo)
		//      Doesn't cause a spaz.
		
        //TODO:  Im getting the platform, but its not registering any hits.
        
		if(isHitOnBottom(block)){
			handleBottomCollision(block);
			handleLeftCollision(block);
			handleRightCollision(block);
		}
		else if(isHitOnTop(block)){
			handleTopCollision(block);
			if(!collision.top){
				handleLeftCollision(block);
				handleRightCollision(block);
			}
		}
		else {
			handleLeftCollision(block);
			handleRightCollision(block);
			handleBottomCollision(block);
			handleTopCollision(block);
		}
	}
}

//Get Proposed coords for each corner

var getProposedCoordsTopRight = function () {
	proposedX = WIDTH/2 + player.width/2 - map.x - deltaX;
	proposedY = HEIGHT/2 - player.height/2 - map.y + deltaY;
		return [Math.floor((proposedX)/TILE_SIZE),Math.floor((proposedY)/TILE_SIZE)];
	}
var getProposedCoordsBottomRight = function () {
	proposedX = WIDTH/2 + player.width/2 - map.x - deltaX;
	proposedY = HEIGHT/2 + player.height/2 - map.y + deltaY;
	return [Math.floor((proposedX)/TILE_SIZE),Math.floor((proposedY)/TILE_SIZE)];
}

var getProposedCoordsBottomLeft = function () {
	proposedX = WIDTH/2 - player.width/2 - map.x - deltaX;
	proposedY = HEIGHT/2 + player.height/2 - map.y + deltaY;
	return [Math.floor((proposedX)/TILE_SIZE),Math.floor((proposedY)/TILE_SIZE)];
}
var getProposedCoordsTopLeft = function () {
	proposedX = WIDTH/2 - player.width/2 - map.x - deltaX;
	proposedY = HEIGHT/2 - player.height/2 - map.y + deltaY;
	return [Math.floor((proposedX)/TILE_SIZE),Math.floor((proposedY)/TILE_SIZE)];
}
// check to see if there are any collisions
var isTouchingPlayer = function() {

	updateAllHits(getProposedCoordsBottomRight());
	updateAllHits(getProposedCoordsBottomLeft());
	updateAllHits(getProposedCoordsTopLeft());
	updateAllHits(getProposedCoordsTopRight());
	}
	
var calculateFinalMoveCoords = function(){
	if(collision.left && keyPressed.left){
		finalXMove -= collision.leftAdjustor;
		}
	if(collision.right && keyPressed.right){
		finalXMove -= collision.rightAdjustor;
		}
		
	if(collision.top){
		//finalYMove -= gravity.jumpStrength;
		finalYMove -= collision.topAdjustor;  
		gravity.jumpStrength = 0;
		}
	if(collision.bottom){
		finalYMove -= collision.bottomAdjustor; //Not sure why the 1 is necessary.
	}
	
}

/* HOW TO HANDLE JUMPS
	1.  If you press up and are able to jump, then turn jumping flag on
		a.  Able to jump is defined as bottom collision is true (on a platform)
	2.  If the jumping flag is on, add to all objects y coord
		a.  adjustment = to jump strength minus gravity
		b.  Every cycle jump strength decreases by gravity
		c.  This step needs to happen before the proposed coords check in collisions
	3.  When you land, jump strength returns to set value and jumping is set to off
*/