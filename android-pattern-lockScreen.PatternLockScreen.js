function PatternLockScreen(container){
	var config = {
		width: 400,
		height: 400
	};
	this.stage = new Kinetic.Stage({
		container: container,
		width: config.width,
		height: config.height
	});
	this.dots = [];
	this.dotsInnerLayer = new Kinetic.Layer();
	this.dotsOuterLayer = new Kinetic.Layer();
	this.lineLayer = new Kinetic.Layer();
	this.hintLayer = new Kinetic.Layer();
	this.listenerLayer = new Kinetic.Layer();
	this.hintLayer.setAlpha(0.1);
	this.stage.add(this.dotsInnerLayer);
	this.stage.add(this.dotsOuterLayer);
	this.stage.add(this.lineLayer);
	this.stage.add(this.hintLayer);
	this.stage.add(this.listenerLayer);
	
	this.pattern = new Pattern({
		patternLayer : this.dotsOuterLayer,
		lineLayer : this.lineLayer,
		hintLayer : this.hintLayer,
	});
};
PatternLockScreen.prototype.start = function(){
	var i;
	var w = this.stage.getWidth();
	var h = this.stage.getHeight();
	var mW = Math.floor((w/2));
	var mH = Math.floor((h/2));
	var offsetW = Math.floor(w/3);
	var offsetH = Math.floor(h/3);
	var points = [
		{ x: mW - offsetW, 		y: mH - offsetH },
		{ x: mW, 							y: mH - offsetH },
		{ x: mW + offsetW, 		y: mH - offsetH },
		
		{ x: mW - offsetW, 		y: mH },
		{ x: mW, 							y: mH },
		{ x: mW + offsetW, 		y: mH },
		
		{ x: mW - offsetW, 		y: mH + offsetH },
		{ x: mW, 							y: mH + offsetH },
		{ x: mW + offsetW, 		y: mH + offsetH },						
	];
	for( i = 0; i < points.length; i+=1 ){
		var options = {
			pattern : 			this.pattern,
			innerLayer : 		this.dotsInnerLayer,
			listenerLayer : this.listenerLayer,
			x : 						points[i].x, 
			y : 						points[i].y
		}
		this.dots.push(new Dot(options));
	};
	return this;
};
PatternLockScreen.prototype.getPattern = function(){
	return this.pattern;
};
PatternLockScreen.prototype.clear = function(){
	this.pattern.clear();
	for(var i=0; i<this.dots.length; i+=1){
		this.dots[i].clear();
	};
};
PatternLockScreen.prototype.reset = function(){
	this.clear();
	this.pattern.clearSavedPattern();
};
PatternLockScreen.prototype.unlock = function(){
	if( this.pattern.isValid() ){
		this.validatePattern();
		return true;
	}
	else {
		this.invalidatePattern();
		return false;
	}
};
PatternLockScreen.prototype.validatePattern = function(){
	
};
PatternLockScreen.prototype.invalidatePattern = function(){
	var dots = this.dotsOuterLayer.getChildren();
	var line = this.lineLayer.getChildren();
	line[0].setFill("rgba(255,0,0,0.5)");
	var self = this;
	for(var i=0; i<dots.length; i+=1){
		var dot = dots[i];
		var radius = dot.getRadius();
		dot.setStroke("rgba(255,0,0,0.8)");
	};
	this.dotsOuterLayer.draw();
	this.lineLayer.draw();
	this.pattern.setToBeClearedOnNextUse(true);
};
PatternLockScreen.prototype.startRecordPattern = function(){
	this.clear();
	this.pattern.clearSavedPattern();
	this.pattern.setRecording(true);
	this.pattern.setToBeClearedOnNextUse(false);
};
PatternLockScreen.prototype.stopRecordPattern = function(){
	this.clear();
	this.pattern.setRecording(false);
	this.pattern.buildHint();
};
PatternLockScreen.prototype.showHint = function(show){
	if( show ){
		this.pattern.show();
	}
	else {
		this.pattern.hide();
	}
};