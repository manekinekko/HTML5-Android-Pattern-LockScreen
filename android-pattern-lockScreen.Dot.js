function Dot(o){
	var self = this;
	this.x = o.x;
	this.y = o.y;
	this.dotInnerLayer = o.innerLayer;
	this.listenerLayer = o.listenerLayer;
	this.pattern = o.pattern;
	
	this.innerCircleRadius = 5;
	this.strokeWidth = 4;
	this.innerCircleFill = "rgba(255,255,255,0)";
	this.innerCircleStroke = "#aaa";
	
	var stage = this.dotInnerLayer.getStage();
	var m = Math.min(
		stage.getWidth(), 
		stage.getHeight()
	);
	this.outerCircleConfig = {
		radius : m/10,
		fill : "rgba(255,255,255,0)",
		stroke : "lime",
		strokeWidth : self.strokeWidth,
	};

	this.innerCircle = new Kinetic.Circle({
		x: 						self.x,
		y: 						self.y,
		radius: 			self.innerCircleRadius,
		fill: 				self.innerCircleFill,
		stroke: 			self.innerCircleStroke,
		strokeWidth: 	self.strokeWidth
	});
	this.listenerCircle = new Kinetic.Circle({
		x: 						self.x,
		y: 						self.y,
		radius: 			self.outerCircleConfig.radius,
		fill: 				'transparent'
	});
	this.listenerCircle.on("mousedown mousemove touchmove", this.addOuterCircle.bind(this));
	this.listenerCircle.on("mouseout", this.mouseout.bind(this));
	this.listenerCircle.on("mouseup touchend", this.isValid.bind(this));
	this.listenerLayer.add(this.listenerCircle);
	this.dotInnerLayer.add(this.innerCircle);
	this.dotInnerLayer.draw();
	
	return this;
};
Dot.prototype.isValid = function(){
	if( this.pattern.isRecording ){
		return;
	}
	
	var event;
	if (document.createEvent) {
		event = document.createEvent("HTMLEvents");
		event.initEvent("click", true, true);
	} else {
		event = document.createEventObject();
		event.eventType = "click";
	};

	var btn = document.getElementById('unlock-button');
	if( btn.dispatchEvent ){
		btn.dispatchEvent(event);
	}
	else if( btn.fireEvent ){
		btn.fireEvent('on'+event.eventTye, event);
	}
};
Dot.prototype.addOuterCircle = function(e) {

	document.body.style.cursor = 'pointer';

	// hide the inner circle
	this.innerCircle.setStrokeWidth(2);
	this.dotInnerLayer.draw();
	
	// add an outer circle if needed
	var self = this;
	var outerCircle = new Kinetic.Circle({
		x: 						self.innerCircle.getX(),
		y: 						self.innerCircle.getY(),
		radius: 			0,
		fill: 				self.outerCircleConfig.fill,
		stroke: 			self.outerCircleConfig.stroke,
		strokeWidth: 	self.outerCircleConfig.strokeWidth
	});
	this.pattern.addDot(outerCircle, this.outerCircleConfig);
		
};
Dot.prototype.mouseover = function() {
	document.body.style.cursor = 'pointer';
};
Dot.prototype.mouseout = function() {
	document.body.style.cursor = 'default';
};
Dot.prototype.clear = function(){
	this.innerCircle.setFill(this.innerCircleFill);
	this.innerCircle.setRadius(this.innerCircleRadius);
	this.dotInnerLayer.draw();
};