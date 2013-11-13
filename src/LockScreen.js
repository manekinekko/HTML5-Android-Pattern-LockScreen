/*
 * The PatternLockScreen class.
 * @constructor
 * @public
 */
function PatternLockScreen(options){
    
    if( window.Kinetic === undefined ){
        throw "[PatternLockScreen] Kinetic.js was not detected!";
    }
    
    /*
     * Verify the config options.
     */
    this._config = {};
    this._config.width = options.width || 400;
    this._config.height = options.height || 400;
    this._config.container = options.container || null;
    this._config.onSuccess = options.onSuccess || null;
    this._config.onFailure = options.onFailure || null;
    this._config.pattern = options.pattern || null;
    
    if( this._config.container === null ){
        throw "[PatternLockScreen] You need to specify a container!";
    }
    
    /*
     * Define a Kinetic Stage object with the given config options.
     */
    this._stage = new Kinetic.Stage({
        container: this._config.container,
        width: this._config.width,
        height: this._config.height
    });
    
    /*
     * Define all needed Kinetic Layers.
     */
    this._dotsInnerLayer = new Kinetic.Layer();
    this._dotsOuterLayer = new Kinetic.Layer();
    this._lineLayer = new Kinetic.Layer();
    this._listenerLayer = new Kinetic.Layer();
    this._hintLayer = new Kinetic.Layer();
    this._hintLayer.setOpacity(0.1);
    this._stage.add(this._dotsInnerLayer);
    this._stage.add(this._dotsOuterLayer);
    this._stage.add(this._lineLayer);
    this._stage.add(this._hintLayer);
    this._stage.add(this._listenerLayer);
    
    /*
     * Define a new Pattern object.
     */
    this._pattern = new Pattern({
        patternLayer : this._dotsOuterLayer,
        lineLayer : this._lineLayer,
        hintLayer : this._hintLayer,
    });
    
    /*
     * Define a Dots array to keep track of the user's inputs.
     */
    this._dots = [];
    
    this._draw();
    
    if( this._config.pattern !== null ){
        this._parseAndSaveUserPattern(this._config.pattern);
    }
    
}

/*
 * This method initializes the saved pattern.
 * @todo this method need more tests!
 */
PatternLockScreen.prototype._parseAndSaveUserPattern = function(pattern){
    var patternArray = pattern.split(/[#\|_,; -]+/);
    var dotPosition;
    for(var i=0; i<patternArray.length; i+=1){
        dotPosition = (+patternArray[i])-1;
        if( dotPosition >= 0 && this._dots[dotPosition] ){
            var dot = this._dots[dotPosition];
            if( this._pattern.shouldDrawDot(dot) ){
                this._pattern.savePatternDot(dot);
            }
        }
    }
    this._pattern.buildHint();
};

/*
 * This method initializes and draws the container.
 * @return PatternLockScreen reference.
 */
PatternLockScreen.prototype._draw = function(){
    var i;
    var w = this._stage.getWidth();
    var h = this._stage.getHeight();
    var mW = Math.floor((w/2));
    var mH = Math.floor((h/2));
    var offsetW = Math.floor(w/3);
    var offsetH = Math.floor(h/3);
    var points = [
        { x: mW - offsetW,      y: mH - offsetH },
        { x: mW,                y: mH - offsetH },
        { x: mW + offsetW,      y: mH - offsetH },
        
        { x: mW - offsetW,      y: mH           },
        { x: mW,                y: mH           },
        { x: mW + offsetW,      y: mH           },
        
        { x: mW - offsetW,      y: mH + offsetH },
        { x: mW,                y: mH + offsetH },
        { x: mW + offsetW,      y: mH + offsetH },                      
    ];
    var options = {
        pattern :       this._pattern,
        innerLayer :    this._dotsInnerLayer,
        listenerLayer : this._listenerLayer
    };

    for( i = 0; i < points.length; i+=1 ){
        options.x = points[i].x; 
        options.y = points[i].y;
        this._dots.push(new Dot(i, options));
    }
    return this;
};

/*
 * This method  is convert user's drawed dots pattern coordedt to normalize point number.
 * @return  an array of result number.
 */
PatternLockScreen.prototype._convertToNum = function(dots){
    if(!dots.length){
        return ;
    }
    var i;
    var w = this._stage.getWidth();
    var h = this._stage.getHeight();
    var mW = Math.floor((w/2));
    var mH = Math.floor((h/2));
    var offsetW = Math.floor(w/3);
    var offsetH = Math.floor(h/3);
    var points = [
            [mW - offsetW, mH - offsetH].join('|'),
            [mW , mH - offsetH].join('|'),
            [mW + offsetW, mH - offsetH].join('|'),
        
            [mW - offsetW, mH].join('|'),
            [mW, mH].join('|'),
            [mW + offsetW, mH].join('|'),
        
            [mW - offsetW,mH + offsetH].join('|'),
            [mW, mH + offsetH].join('|'),
            [mW + offsetW, mH + offsetH].join('|')                     
    ];
    var result = [];
    for( i = 0; i < dots.length; i+=1 ){
        var p = [dots[i].x,dots[i].y].join('|');
        if(points.indexOf(p)  > -1){
            result.push(points.indexOf(p) + 1);
        }
    }
    return result;
}


/*
 * This method clears both the container and the user's inputs.
 */
PatternLockScreen.prototype.clear = function(){
    this._pattern.clear();
    for(var i=0; i<this._dots.length; i+=1){
        this._dots[i].clear();
    }
};

/*
 * This method clears the container, the user's inputs and saved pattern.
 */
PatternLockScreen.prototype.reset = function(){
    this.clear();
    this._pattern.clearSavedPattern();
};

/*
 * This method unlocks the pattern lock.
 * @return True if the pattern matches, False otherwise.
 */
PatternLockScreen.prototype.unlock = function(){
    if( this._pattern.isValid() ){
        this.validatePattern();
        (this._config.onSuccess && this._config.onSuccess.call(this));
        return true;
    }
    else {
        this.invalidatePattern();
        (this._config.onFailure && this._config.onFailure.call(this));
        return false;
    }
};

/*
 * This method is executed when the unlock process has succeded.
 */
PatternLockScreen.prototype.validatePattern = function(){
    // TODO 
};

/*
 * This method is executed when the unlock process has failed.
 */
PatternLockScreen.prototype.invalidatePattern = function(){
    var dots = this._dotsOuterLayer.getChildren();
    var line = this._lineLayer.getChildren();

    if(line.length > 0) {
        line[0].setFill("rgba(255,0,0,0.5)");
        var self = this;
        for(var i=0; i<dots.length; i+=1){
            var dot = dots[i];
            var radius = dot.getRadius();
            dot.setStroke("rgba(255,0,0,0.8)");
        }
        this._dotsOuterLayer.draw();
        this._lineLayer.draw();
        this._pattern.setToBeClearedOnNextUse(true);
    }

};

/*
 * This method is executed before recording a pattern.
 */
PatternLockScreen.prototype.startRecordPattern = function(){
    this.clear();
    this._pattern.clearSavedPattern();
    this._pattern.setRecording(true);
    this._pattern.setToBeClearedOnNextUse(false);
};

/*
 * This method is executed after a pattern has been recorded.
 */
PatternLockScreen.prototype.stopRecordPattern = function(){
    this.clear();
    this._pattern.setRecording(false);
    this._pattern.buildHint();
};

/*
 * This method draws a hint of the user's saved pattern.
 */
PatternLockScreen.prototype.showHint = function(show){
    if( show ){
        this._pattern.showHint();
    }
    else {
        this._pattern.hideHint();
    }
};

/*
* This method is to return user's draws pattern for save .
*
*/
PatternLockScreen.prototype.resultHint = function(){
    // return this._pattern._savedPattern;
    return this._convertToNum(this._pattern._savedPattern);
}

/*
*This method is to change init or user saved lock pattern 
*/
PatternLockScreen.prototype.setInitPattern  = function(dots){
    // this._dots = [];
    
    // this._draw();
    this.reset();
    this._parseAndSaveUserPattern(dots);
}
