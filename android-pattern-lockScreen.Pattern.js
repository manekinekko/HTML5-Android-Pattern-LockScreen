function Pattern(o){
	this.userDots = [];
	this.savedPattern = [];
	var stage = o.patternLayer.getStage();
	var mousePos = stage.getMousePosition() || {x: stage.getWidth()/2, y: stage.getHeight()/2};
	this._x0 = mousePos.x;
	this._y0 = mousePos.y;
	this._x = this._x0 ;
	this._y = this._y0;
	this.patternLayer = o.patternLayer;
	this.lineLayer = o.lineLayer;
	this.hintLayer = o.hintLayer;
	this.isRecording = false;
	this.toBeClearedOnNextUse = false;
};
Pattern.prototype.setRecording = function(state){
	this.isRecording = state;
};
Pattern.prototype.setToBeClearedOnNextUse = function(state){
	this.toBeClearedOnNextUse = state;
};
Pattern.prototype.show = function(){
	this.hintLayer.show();
	this.hintLayer.draw();
};
Pattern.prototype.hide = function(){
	this.hintLayer.hide();
	this.hintLayer.draw();
};
Pattern.prototype.buildHint = function(){
	line = this.getLine(this.savedPattern);
	this.lineLayer.removeChildren();
	this.hintLayer.add(line);
};
Pattern.prototype.addDot = function(dot, config){
	if( this.toBeClearedOnNextUse ){
		this.clear();
		this.toBeClearedOnNextUse = false;
	}

	if( this.shouldDrawDot(dot) ){

		if( this.isRecording ){
			this.savePatternDot(dot);
		}
		else {
			if( this.shouldDrawDot(dot) ){
				this.saveUserDot(dot);				
			}
		}
	
		this.patternLayer.add(dot);
		this.setTransition(dot, config);
		this.patternLayer.draw();		
	}

};
Pattern.prototype.shouldDrawDot = function(dot){
	var dots = this.isRecording ? this.savedPattern : this.userDots;
	for(var i=0; i<dots.length; i+=1){
		var o = dots[i];
		if( o.getX() === dot.getX() && o.getY() === dot.getY() ){
			return false;
		}
	};
	return true;
};
Pattern.prototype.setTransition = function(dot, config){
	var self = this;
	dot.transitionTo({
		radius: config.radius,
		duration: 0.1,
		callback: self.drawLine()
	});	
};
Pattern.prototype.saveUserDot = function(dot){		
	this.userDots.push(dot);
};
Pattern.prototype.drawLine = function(){
	var line;
	var dot1;
	var dot2;
	var dots = this.isRecording ? this.savedPattern : this.userDots;
	var l = dots.length;
	if( l >= 2 ){
		line = this.getLine(dots);
		this.lineLayer.removeChildren();
		this.lineLayer.add(line);
		this.lineLayer.draw();
	}
};
Pattern.prototype.getLine = function(dots){
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
Pattern.prototype.isValid = function(){
	if( this.savedPattern.length !== this.userDots.length ){
		return false;
	};
	for(var i=0; i<this.savedPattern.length; i++){
		var savedDot = this.savedPattern[i];
		var userDot = this.userDots[i];
		if( savedDot.getX() !== userDot.getX() || savedDot.getY() !== userDot.getY() ){
			return false;
		}
	};
	return true;
};
Pattern.prototype.getDots = function(){
	return this.userDots;
};
Pattern.prototype.clear = function(){
	this.clearUserDots();
	this.clearLayers();
	return this;
};
Pattern.prototype.clearUserDots = function(){
	this.userDots = [];
};
Pattern.prototype.clearLayers = function(){
	var self = this;
	var dots = this.patternLayer.getChildren();
	var l = dots.length;
	for(var i=0; i<l; i+=1){
		var dot = dots[i];
		dot.transitionTo({
			radius: 0,
			duration: 0.1,
			callback: function(){
				if( l-1 === i ){
					self.patternLayer.clear();
					self.patternLayer.removeChildren();
					self.patternLayer.draw();
				}
			}
		});
	};
	
	self.lineLayer.clear();
	self.lineLayer.removeChildren();
	self.lineLayer.draw();
	
};
Pattern.prototype.savePatternDot = function(dot){
	this.savedPattern.push({
		x: dot.getX(),
		y: dot.getY(),
		getX: function(){ return this.x; },
		getY: function(){ return this.y; }
	});
};
Pattern.prototype.clearSavedPattern = function(){
	this.savedPattern = [];
	this.hintLayer.removeChildren();
	this.hintLayer.clear();
	this.hintLayer.draw();
};
