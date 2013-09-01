/*
 * The Pattern class.
 * @constructor
 * @private
 */
function Pattern(o){

    /*
     * The user's input dots.
     * NOTE: these dots are Kinetic.Circles objects!
     */
    this._userDots = [];
    
    /*
     * The user's saved pattern's dots.
     * NOTE: these dots are JavaScript objects!
     */
    this._savedPattern = [];
    
    /*
     * get the current mouse location.
     */
    var stage = o.patternLayer.getStage();
    var mousePos = stage.getMousePosition() || {x: stage.getWidth()/2, y: stage.getHeight()/2};
    
    /* 
     * the mouse start location.
     */
    this._x0 = mousePos.x;
    this._y0 = mousePos.y;
    
    /* 
     * the mouse end location.
     */
    this._x = this._x0 ;
    this._y = this._y0;
    
    /*
     * Define all needed layers.
     */ 
    this._patternLayer = o.patternLayer;
    this._lineLayer = o.lineLayer;
    this._hintLayer = o.hintLayer;
    
    /*
     * A flag that tracks to recording state.
     */
    this._isRecording = false;
    
    /*
     * A flag that specifies if the container should be cleared on next user's input.
     */
    this._toBeClearedOnNextUse = false;
}

/*
 * Set the "_isRecording" flag state.
 */
Pattern.prototype.setRecording = function(state){
    this._isRecording = state;
};

/*
 * Set the "_toBeClearedOnNextUse" flag state.
 */
Pattern.prototype.setToBeClearedOnNextUse = function(state){
    this._toBeClearedOnNextUse = state;
};

/*
 * Show the hint layer.
 */
Pattern.prototype.showHint = function(){
    this._hintLayer.show();
    this._hintLayer.draw();
};

/*
 * Hide the hint layer.
 */
Pattern.prototype.hideHint = function(){
    this._hintLayer.hide();
    this._hintLayer.draw();
};

/*
 * Construct the hint layer.
 */
Pattern.prototype.buildHint = function(){
    this._lineLayer.removeChildren();
    var line = this._newLine(this._savedPattern);
    this._hintLayer.add(line);
};

/*
 * Add a new dot to the container.
 */
Pattern.prototype.addDot = function(dot, config){
    if( this._toBeClearedOnNextUse ){
        this.clear();
        this._toBeClearedOnNextUse = false;
    }

    if( this.shouldDrawDot(dot) ){

        if( this._isRecording ){
            this.savePatternDot(dot);
        }
        else {
            if( this.shouldDrawDot(dot) ){
                this.addUserDot(dot);               
            }
        }
    
        this._patternLayer.add(dot);
        this.setTransition(dot, config);
        this._patternLayer.draw();      
    }

};

/*
 * Should the dot be drawn. This prevent adding duplicate dots.
 * @return True if the dot should be drawn, False otherwise.
 */
Pattern.prototype.shouldDrawDot = function(dot){
    var dots = this._isRecording ? this._savedPattern : this._userDots;
    for(var i=0; i<dots.length; i+=1){
        var o = dots[i];
        if( o.getX() === dot.getX() && o.getY() === dot.getY() ){
            return false;
        }
    }
    return true;
};

/*
 * Set a transition animation (on dots).
 */
Pattern.prototype.setTransition = function(dot, config){
    var self = this;
    var tween = new Kinetic.Tween({
        node: dot,
        radius: config.radius,
        duration: 0.1,
        onFinish: self.drawLine()
    });
    tween.play();
    
};

/*
 * Save a new dot to the user's inputs array.
 */
Pattern.prototype.addUserDot = function(dot){       
    this._userDots.push(dot);
};

/*
 * Draw a line that connect all drawn dots.
 */
Pattern.prototype.drawLine = function(){
    var line;
    var dots = this._isRecording ? this._savedPattern : this._userDots;
    var l = dots.length;
    if( l >= 2 ){
        line = this._newLine(dots);
        this._lineLayer.removeChildren();
        this._lineLayer.add(line);
        this._lineLayer.draw();
    }
};

/*
 * Build and return a new line.
 * @return A Kinetic.Shape() reference.
 * @private
 */
Pattern.prototype._newLine = function(dots){
    return new Kinetic.Shape({
        drawFunc: function() {
            var ctx = this.getContext();
            var dot1 = dots[0];
            var dot;
            ctx.beginPath();
            ctx.moveTo(dot1.getX(), dot1.getY());
            for(var i=1; i<dots.length; i+=1){
                dot = dots[i];
                ctx.lineTo(dot.getX(), dot.getY());             
            }
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        },
        stroke: "rgba(255,255,255,0.5)",
        strokeWidth: 5
    });
};

/*
 * Check if the user input mathes the saved pattern.
 * @return True if the patterns matched, False otherwise.
 */
Pattern.prototype.isValid = function(){
    if( this._savedPattern.length !== this._userDots.length ){
        return false;
    }
    for(var i=0; i<this._savedPattern.length; i++){
        var savedDot = this._savedPattern[i];
        var userDot = this._userDots[i];
        if( savedDot.getX() !== userDot.getX() || savedDot.getY() !== userDot.getY() ){
            return false;
        }
    }
    return true;
};

/*
 * Clear the user's input and the current layers.
 */
Pattern.prototype.clear = function(){
    this._clearUserDots();
    this._clearLayers();
    return this;
};

/*
 * Clear the user's input.
 * @private
 */
Pattern.prototype._clearUserDots = function(){
    this._userDots = [];
};

/*
 * Clear the current layers.
 * @private
 */
Pattern.prototype._clearLayers = function(){
    var self = this;
    var dots = this._patternLayer.getChildren();
    var l = dots.length;
    var tween;
    for(var i=0; i<l; i+=1){
        var dot = dots[i];
        tween = new Kinetic.Tween({
            node: dot,
            duration: 0.1,
            radius: 0,
            onFinish: function(){
                if( l-1 === i ){
                    self._patternLayer.clear();
                    self._patternLayer.removeChildren();
                    self._patternLayer.draw();
                }
            }
        });
        tween.play();
    }
    
    self._lineLayer.clear();
    self._lineLayer.removeChildren();
    self._lineLayer.draw();
    
};

/*
 * Add a dot to the savedPattern array (durring the recording proccess).
 */
Pattern.prototype.savePatternDot = function(dot){
    this._savedPattern.push({
        x: dot.getX(),
        y: dot.getY(),
        getX: function(){ return this.x; },
        getY: function(){ return this.y; }
    });
};

/*
 * Clear the user's saved pattern.
 */
Pattern.prototype.clearSavedPattern = function(){
    this._savedPattern = [];
    this._hintLayer.removeChildren();
    this._hintLayer.clear();
    this._hintLayer.draw();
};
