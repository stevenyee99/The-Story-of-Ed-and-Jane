PlatformPlusList = {};
PlatformPlus = function (platform,plus){
    var self = {
        platform : platform,
    }
    for(var i=0; i<plus.length;i++){
        self['plus' + i.toString()] = plus[i];
    }
    
    self.update = function() {
        for(var i=0; i<plus.length;i++){
            self.updatePlusPosition(plus[i]);
            self.drawRect(plus[i].x, plus[i].y, plus[i].width, plus[i].height, plus[i].color);
        }
    }
    self.drawRect = function(x, y, width, height, color) {
        ctx.save();
		ctx.fillStyle = color;
		ctx.fillRect(x,y,width,height); //x, y, width, height);
		ctx.restore();
    }
    self.updatePlusPosition = function(plus){
        plus.x = self.platform.x + plus.xAdjustor;
        plus.y = self.platform.y;
        plus.height = plus.topHeight - self.platform.yRelativeToMap;
    }
    
    PlatformPlusList[self.platform.id] = self;
    console.log('created platform plus');
    return self;
}

PlatformPlus.createLevelPlatformPlus = function() {
    let data = {
        course_change_function : function(self) {
            if((self.topRightCoord[1] === 40 || self.topRightCoord[1] === 60) && self.timeChangedYDirection < (cycleCounter - 5))
               self.changeYDirection();
        },
        delete_conditon_function : function(self){
            return false;
        }
    }
    let platformTest = new Platform('plus',[2,57],Img.platformCloud1,0,2,data);
    let craneRope1 = {
        x : platformTest.x,
        xAdjustor : 0,
        y : platformTest.y,  // 2 tiles above the platforms change y direction
        topHeight : 1500,
        width : 10, //Cause why not
        height : platformTest.yRelativeToMap,
        color : 'black'
    };
    let craneRope2 = {
        x : platformTest.x,
        xAdjustor : platformTest.width - 10, //Has to minus the width for effect
        y : platformTest.y, // 2 tiles above the platforms change y direction
        topHeight : 1500,
        width : 10, //Cause why not
        height : platformTest.yRelativeToMap,
        color : 'black'
    };
    console.log('platform: ', platformTest);
    console.log('rope1: ', craneRope1);
       
        
    let plus = [craneRope1,craneRope2];  
        
    var platformPlus = new PlatformPlus(platformTest,plus);
    
}