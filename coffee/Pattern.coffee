###

Android Pattern Lock Screen 
http://cheghamwassim.com/apps/js/android-lock-screen/

Copyright 2012, Wassim Chegham
Licensed under the MIT or GPL Version 2 licenses.

The Pattern class.
@constructor
@private

###

class Pattern

	constructor: (o) ->
		
		# The user's input dots.
		# NOTE: these dots are Kinetic.Circles objects!
		@_userDots = []

		# The user's saved pattern's dots.
		# NOTE: these dots are JavaScript objects!
		@_savedPattern = []

		# get the current mouse location.
		stage = o.patternLayer.getStage()
		mousePos = stage.getMousePosition() || {
			x: stage.getWidth()/2, y: stage.getHeight()/2
		}

		# The mouse start location.
		@_x0 = mousePos.x
		@_y0 = mousePos.y

		# The mouse end location.
		@_x = @_x0
		@_y = @_y0

		# Define all needed layers.
		@_patternLayer = o.patternLayer
		@_lineLayer = o.lineLayer
		@_hintLayer = o.hintLayer

		# A flag that tracks to recording state.
		@_isRecording = false

		# A flag that specifies if the container should be cleared on next user's input.
		@_toBeClearedOnNextUse = false
		
	# Set the "_isRecording" flag state.
	setRecording: (state) ->
		@_isRecording = state
		return true
	
	# Set the "_toBeClearedOnNextUse" flag state.
	setToBeClearedOnNextUse: (state) ->
		@_toBeClearedOnNextUse = state
		return true

	#Construct the hint layer.
	buildHint: ->
		@_hintLayer.removeChildren()
		line = @_newLine @_savedPattern
		@_hintLayer.add line
		return true

	# Show the hint layer.
	showHint: ->
		@_hintLayer.show()
		@_hintLayer.draw()
		return true

	# Hide the hint layer.
	hideHint: ->
		@_hintLayer.hide()
		@_hintLayer.draw()
		return true
	
	# Add a new dot to the container.
	addDot: (dot, config) ->
		
		if @_toBeClearedOnNextUse
			@clear()
			@_toBeClearedOnNextUse = false
		
		shouldDrawDot = @shouldDrawDot dot

		if shouldDrawDot
			
			if @_isRecording
				@savePatternDot dot
				
			else if shouldDrawDot
				@addUserDot dot
			
			@_patternLayer.add dot
			@setTransition dot, config
			@_patternLayer.draw()

		return true


	# Should the dot be drawn. This prevent adding duplicate dots.
	# @return True if the dot should be drawn, False otherwise.
	shouldDrawDot: (dot) ->

		dots = if @_isRecording then @_savedPattern else @_userDots

		return false for d in dots when (dot.getX() == d.getX() and dot.getY() == d.getY() )

		return true

	# Set a transition animation (on dots).
	setTransition: (dot, config) ->

		(=> dot.transitionTo {
					radius: config.radius,
					duration: 0.1,
					callback: @drawLine.bind @
				})()

		return true
	
	# Save a new dot to the user's inputs array.
	addUserDot: (dot) ->
		@_userDots.push dot
		return true
	
	# Draw a line that connect all drawn dots.
	drawLine: ->

		dots = if @_isRecording then @_savedPattern else @_userDots

		if dots.length >= 2
			line = @_newLine dots
			@_lineLayer.removeChildren()
			@_lineLayer.add line
			@_lineLayer.draw()

		return true
	
	# Build and return a new line.
	# @return A Kinetic.Shape() reference.
	# @private
	_newLine: (dots) ->

		new Kinetic.Shape {
			drawFunc: ->
				dot1 = dots[0]
				ctx = @getContext()
				ctx.beginPath()
				ctx.moveTo dot1.getX(), dot1.getY()
				for i in [1..dots.length-1]
					dot = dots[i]
					ctx.lineTo dot.getX(), dot.getY()
					 
				ctx.lineJoin = "round"
				ctx.lineCap = "round"
				ctx.strokeStyle = "rgba(255,255,255,0.5)"
				ctx.lineWidth = 5
				ctx.stroke()
				ctx.closePath()
				return true
			
			stroke: "rgba(255,255,255,0.5)"
			strokeWidth: 5
		}
	
	# Check if the user input mathes the saved pattern.
	# @return True if the patterns matched, False otherwise.
	isValid: ->
		if @_savedPattern.length != @_userDots.length
			return false;
		
		(return false) for savedPattern, i in @_savedPattern when (savedPattern.getX() != @_userDots[i].getX() || savedPattern.getY() != @_userDots[i].getY())
		 
		return true;

	# Check if the user input mathes the saved pattern.
	# @return True if the patterns matched, False otherwise.	
	clear: ->
		@_clearUserDots()
		@_clearLayers()
		return @
	
	# Clear the user's input.
	# @private
	_clearUserDots: ->
		@_userDots = []
	
	# Clear the current layers.
	# @private
	_clearLayers: ->
		dots = @_patternLayer.getChildren()
		l = dots.length
		
		( (=> dot.transitionTo {
					radius: 0,
					duration: 0.1,
					callback: =>
						(@_patternLayer.clear()
						@_patternLayer.removeChildren()
						@_patternLayer.draw()
						return true) if l-1 == i
						return false
				})() 
		) for dot, i in dots

		@_lineLayer.clear()
		@_lineLayer.removeChildren()
		@_lineLayer.draw()
		return true
	
	# Add a dot to the savedPattern array (durring the recording proccess).
	savePatternDot: (dot) ->
		@_savedPattern.push {
			x: dot.getX(),
			y: dot.getY(),
			getX: -> @x,
			getY: -> @y
		}
		return true
	
	# Clear the user's saved pattern.
	clearSavedPattern: ->
		@_savedPattern = []
		@_hintLayer.removeChildren()
		@_hintLayer.clear()
		@_hintLayer.draw()
		return true
	
	







