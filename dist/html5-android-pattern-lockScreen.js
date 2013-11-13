/*
 * The Dot class.
 * This is the base class for all the circles that are drawn in the container.
 * There are three kinds of dots:
 * - The inner dots, those are the gray ones that are initially drawn,
 * - The outer dots, those are the user's ones.
 * - The listener dots, those are the invisible ones that listen for user's event
 *
 * @constructor
 * @private
 */
 function Dot(id, o){

    var self = this;

    /*
     * The uniq id of this dot.
     */
    this._id = id;
    
    /*
    * The x and y location of this dot.
    */
    this._x = o.x;
    this._y = o.y;
    
    /*
    * The inner dots layer and the listener layer.
    */
    this._dotInnerLayer = o.innerLayer;
    this._listenerLayer = o.listenerLayer;
    
    /*
    * The reference to the Pattern object.
    */
    this._pattern = o.pattern;
    
    /*
    * The inner dots default values.
    */
    this._innerCircleRadius = 5;
    this._innerCircleFill = "rgba(255,255,255,0)";
    this._innerCircleStroke = "#aaa";
    
    /*
    * The stroke width value of all dots.
    */
    this._strokeWidth = 4;
    
    var stage = this._dotInnerLayer.getStage();
    var minDotRadius = Math.min(
        stage.getWidth(), 
        stage.getHeight()
        );
    
    /*
    * The user's dots default values.
    */
    this._outerCircleConfig = {
        radius : minDotRadius/10,
        fill : "rgba(255,255,255,0)",
        stroke : "lime",
        strokeWidth : self.strokeWidth,
    };

    /*
    * The inner dots reference.
    */
    this._innerCircle = new Kinetic.Circle({
        x:              self._x,
        y:              self._y,
        radius:         self._innerCircleRadius,
        fill:           self._innerCircleFill,
        stroke:         self._innerCircleStroke,
        strokeWidth:    self.strokeWidth
    });
     
    /*
     * The listener dots reference.
     */
     this._listenerCircle = new Kinetic.Circle({
        x:              self._x,
        y:              self._y,
        radius:         self._outerCircleConfig.radius,
        fill:           'transparent',
        listening:      true 
     });
     
    /*
     * Define all needed listeners.
     */

     this._listenerCircle.on("mousedown mousemove touchmove", this._showUserDot.bind(this));
     this._listenerCircle.on("mouseout", this._mouseout.bind(this));
     this._listenerCircle.on("mouseup touchend", this._isValid.bind(this));
     this._dotInnerLayer.add(this._innerCircle);
     this._listenerLayer.add(this._listenerCircle);
     this._dotInnerLayer.draw();
     this._listenerLayer.draw();

 }

/*
 * Get the x location of this dot.
 */
 Dot.prototype.getX = function(){
    return this._x;
 };

/*
 * Get the y location of this dot.
 */
 Dot.prototype.getY = function(){
    return this._y;
 };

/*
 * This method is fired up on a mouse up or touch end events. It checks if the pattern has matched.
 * @private
 */
 Dot.prototype._isValid = function(){
    if( this._pattern.isRecording ){
        return;
    }

    var event = (function createEvent(){
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("click", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "click";
        }
        return event;
    })();

    var btn = document.getElementById('unlock-button');
    if( btn.dispatchEvent ){
        btn.dispatchEvent(event);
    }
    else if( btn.fireEvent ){
        btn.fireEvent('on'+event.eventTye, event);
    }
 };

/*
 * This method shows the current user's input. Basically, it draws the a dot.
 * @private
 */
 Dot.prototype._showUserDot = function(e) {

    document.body.style.cursor = 'pointer';

    // hide the inner circle
    this._innerCircle.setStrokeWidth(2);
    this._dotInnerLayer.draw();
    
    // add an outer circle if needed
    var self = this;
    var outerCircle = new Kinetic.Circle({
        x:              self._innerCircle.getX(),
        y:              self._innerCircle.getY(),
        radius:         0,
        fill:           self._outerCircleConfig.fill,
        stroke:         self._outerCircleConfig.stroke,
        strokeWidth:    self._outerCircleConfig.strokeWidth
    });
    this._pattern.addDot(outerCircle, this._outerCircleConfig);
    
 };

/*
 * This method is fired when the cursor or the user's finger passes over a dot.
 * @private
 */
 Dot.prototype._mouseover = function() {
    document.body.style.cursor = 'pointer';
 };

/*
 * This method is fired when the cursor or the user's finger leaves a dot.
 * @private
 */
 Dot.prototype._mouseout = function() {
    document.body.style.cursor = 'default';
 };

/*
 * This method clears the containers and set its dots to their initial state.
 */
 Dot.prototype.clear = function(){
    this._innerCircle.setFill(this._innerCircleFill);
    this._innerCircle.setRadius(this._innerCircleRadius);
    this._dotInnerLayer.draw();
 };;/*
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
;/*
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
;
(function(){
    window.addEventListener('load', function() {
        var app = new PatternLockScreen({
            container: "lock-screen",
            width: 400,
            height: 400,
            onSuccess: function(){
                console.log('success');
            },
            onFailure: function(){
                console.log('failure');
            },
            // pattern: '1-2-3-4-5-6-7-8-9'
            pattern : '8-5-2'
        });

        

        var unlockButton = document.getElementById('unlock-button');
        var savePatternButton = document.getElementById('save-pattern-button');
        var resetButton = document.getElementById('reset-button');
        var showHint = true;

        savePatternButton.addEventListener('click', function(){
            var span = this.getElementsByClassName('gray');
            console.log(app.resultHint());
            if( span.className==='red' ){
                this.innerHTML = '<span class="gray"></span>Record Pattern';
                span.className = 'gray';
                app.stopRecordPattern();
                unlockButton.style.display = 'inline';
            }
            else {
                this.innerHTML = '<span class="red"></span>Recording...';
                span.className = 'red';
                app.startRecordPattern();
                unlockButton.style.display = 'none';
            }
        }, false);
        unlockButton.addEventListener('click', function(){
            var btn = this;
            if( !app.unlock() ){
                this.className = "button red";
                setTimeout(function(){
                    btn.className = "button blue";
                }, 1000);
            }
            else {
                btn.className = "button green";
                alert('Access Granted!');
            }
        }, false);
        resetButton.addEventListener('click', function(){
            app.reset();
        });

        document.getElementById('setOrg').addEventListener('click',function(){
            var newVal = document.getElementById('testLock').value;
            app.setInitPattern(newVal);
        },false);

        document.addEventListener('keyup', function(e){
            var code = e.keyCode || e.which;
            if( code === 72 ){      
                app.showHint(showHint);
                showHint = !showHint;
            }
        });

    }, false);
}());