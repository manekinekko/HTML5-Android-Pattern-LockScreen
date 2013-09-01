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
 };