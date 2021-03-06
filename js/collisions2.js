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
var collisionSpaceValue = 0;
var onThisPlatform; //THis is the platform that the player is currently on.
var maxJumpStrengthBeforeError = 19;  //player height is the limit for still objects

//This function sets the final X and Y movements (px) of the player.
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
        collisionSpaceValue = 0;
        onThisPlatform = null;
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
	if(gravity.jumpStrength > -maxJumpStrengthBeforeError ) //player height is the limit for still objects
		gravity.jumpStrength -= gravity.currentStrength;
	deltaY -= gravity.jumpStrength;
	finalYMove += gravity.jumpStrength;
	gravity.isJumping = true;			
}	


//Get 


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



//Check to see if theres a collision

var isHit = function (block){
	if(proposedX  <= block.x + block.width + block.speedX
	&& proposedX  >= block.x + block.speedX
	&& proposedY < block.y + block.height + block.speedY
	&& proposedY > block.y + block.speedY
	)
		return true;
	else
		return false;
};


var isHitOnSide = function (block){
	if(proposedX >= block.x + block.speedX
	&& proposedX <= block.x + block.width + block.speedX
	&& player.y < block.y + block.height 
	&& player.y + player.height > block.y
	)
		return true;
	else
		return false;
};

var isHitVertical = function (block){ 
	if (player.x + player.width > block.x + 2
	&& player.x < block.x + block.width - 2
	&& proposedY <= block.y + block.height + block.speedY
	&& proposedY >= block.y +  block.speedY)
		return true;
	else 
		return false;
};


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
			height : TILE_SIZE,
            speedY : 0,
            speedX : 0
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
            onThisPlatform = thisBlock;
            var block = {
                x : thisBlock.xRelativeToMap,
                y : thisBlock.yRelativeToMap,
                width : thisBlock.width,
                height : thisBlock.height ,
                speedY : thisBlock.speedY,
                speedX :  thisBlock.speedX
            }
            logThis('collision-platform', ('proposed Y: ' + proposedY.toString()));
            logThis('collision-platform', ('block: ',onThisPlatform));
            if(block === undefined){
                console.log('Error!  Block is not defined.');
            }
            return block;
        }
    }
}

//This function takes a coordinate and updates all
//Collisions with the player
var updateAllHits = function (coord, point){
	var xCoord = coord[0];
	var yCoord = coord[1];
	if(yCoord < 0 || yCoord > map.grid.length)
		console.log("Player is out of bound Vertically.");
	//This tests to see if the player is entering a collision space
	else if(map.grid[yCoord][xCoord] > 0){
        collisionSpaceValue = map.grid[yCoord][xCoord];
		var block = getBlock(xCoord,yCoord,collisionSpaceValue);
        if(block === undefined){
                console.log('Error2!  Block is not defined.');
                console.log("here are the coords: ", xCoord,yCoord);
                console.log("here is the map value: ", map.grid[yCoord][xCoord]);
                console.log(PlatformList);
            }
		
            
        if(point === 'top-right') {
            console.log('Collision point: ', point);
            if(!collision.right) {
                collision.right = true;
                collision.rightAdjustor = block.x - proposedX;
            }
            if(!collision.top && !collision.bottom && isHitVertical(block)) {
                collision.topAdjustor = block.y + block.height - proposedY;
                collision.top = true;
            }
        }
        
        if(point === 'top-left') {
            console.log('Collision point: ', point);
            if(!collision.left) {
                collision.leftAdjustor = block.x + block.width - proposedX;
                collision.left = true;
            }
            if(!collision.top && !collision.bottom && isHitVertical(block)) {
                collision.topAdjustor = block.y + block.height - proposedY;
                collision.top = true;
            } 
            
        }
        if(point === 'bottom-right') {
            console.log('Collision point: ', point);
            if(isHitOnSide(block)) {
                collision.rightAdjustor = block.x - proposedX;
                collision.right = true;
            }
            if(isHitVertical(block) && gravity.jumpStrength <1) {
                collision.bottomAdjustor = block.y - proposedY;
                gravity.jumpStrength = 0;
                collision.bottom = true;
                gravity.isJumping = false;
            }
            if(!collision.bottom && !collision.right) {
                collision.rightAdjustor = block.x - proposedX;
                //collision.bottomAdjustor = block.y - proposedY;
                collision.right = true;
            }
        }
        if(point === 'bottom-left') {
            console.log('Collision point: ', point);
            if(isHitOnSide(block)) {
                collision.leftAdjustor = block.x + block.width - proposedX;
                collision.left = true;
            }
            //TODO.  Try removing jumpStrength condition. Should work without it
            if(isHitVertical(block) && gravity.jumpStrength <1) {
                collision.bottomAdjustor = block.y - proposedY;
                gravity.jumpStrength = 0;
                collision.bottom = true;
                gravity.isJumping = false;
            } 

            if(!collision.bottom && !collision.left) {
                collision.leftAdjustor = block.x + block.width - proposedX;
                //collision.bottomAdjustor = block.y - proposedY;
                collision.left = true;
            }
                
        }
	}
}

var isTouchingPlayer = function() {

	updateAllHits(getProposedCoordsBottomRight(), 'bottom-right');
	updateAllHits(getProposedCoordsBottomLeft(), 'bottom-left');
	updateAllHits(getProposedCoordsTopLeft(), 'top-left');
	updateAllHits(getProposedCoordsTopRight(), 'top-right');
	}
	
var calculateFinalMoveCoords = function(){
    //logThis('collision-platform', ('bottom collision: ' + collision.bottom.toString()));
	if(collision.left && keyPressed.left){
		finalXMove -= collision.leftAdjustor;
        logThis('collision-platform', 'left adjustor: ' + collision.leftAdjustor.toString());
		}
	if(collision.right && keyPressed.right){
		finalXMove -= collision.rightAdjustor;
        logThis('collision-platform', 'right adjustor: ' + collision.rightAdjustor.toString());
		}
		
	if(collision.top){
		finalYMove -= collision.topAdjustor;  
		gravity.jumpStrength = 0;
        //logThis('collision-platform', 'top adjustor: ' + collision.topAdjustor.toString());
		}
	if(collision.bottom){
		finalYMove -= collision.bottomAdjustor;
        logThis('collision-platform', 'bottom adjustor: ' + collision.bottomAdjustor.toString());
	    if(onThisPlatform !== undefined && onThisPlatform !== null){
            try {
                finalXMove -= onThisPlatform.speedX;  //must be minus.  Plus will go in reverse!
                finalYMove -= onThisPlatform.speedY;
            }
            catch(err){
                throw "There is a platform, but it has no speed!"
                }
            }
    }
    console.log('bottom collision: ',collision.bottom, ' Top collision: ', collision.top, ' Left collision: ', collision.left, ' Right collision: ', collision.right);
    
	
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