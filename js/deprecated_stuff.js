//This is the deprecated code store.  I might want to bring some of these back later, maybe not.

1.  Platforms:  Keeping track of which grid spaces the platform occupies.
    a.  Currently recalculating every space every frame rather than doing state change (the below doesn't quite work)
    
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
        */
        
 //Also removed these deprecated functions.  Will probably want when I refactor this part.
    
    
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
    