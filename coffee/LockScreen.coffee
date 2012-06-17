###

Android Pattern Lock Screen 
http://cheghamwassim.com/apps/js/android-lock-screen/

Copyright 2012, Wassim Chegham
Licensed under the MIT or GPL Version 2 licenses.

The PatternLockScreen class.
@constructor
@public

###

class LockScreen

	constructor: (options) ->
		@_name = "LockScreen"

		try 
			window.Kinetic 
		catch error
			throw "["+@_name+"] Kinetic.js was not detected!"
		
		try
		  options.container
		catch error
		  throw "["+@_name+"] A container must be specified!"

		# Verify the config options.
		@_config = {}
		@_config.width = options.width || 400
		@_config.height = options.height || 400
		@_config.container = options.container || null
		@_config.onSuccess = options.onSuccess || null
		@_config.onFailure = options.onFailure || null
		@_config.pattern = options.pattern || null

		# Define a Kinetic Stage object with the given config options.
		@_stage = (=> new Kinetic.Stage {
					container: @_config.container,
					width: @_config.width,
					height: @_config.height
				})()

		# Define all needed Kinetic Layers.
		@_dotsInnerLayer = new Kinetic.Layer()
		@_dotsOuterLayer = new Kinetic.Layer()
		@_lineLayer = new Kinetic.Layer()
		@_listenerLayer = new Kinetic.Layer()
		@_hintLayer = new Kinetic.Layer()
		@_hintLayer.setAlpha 0.1
		@_stage.add @_dotsInnerLayer
		@_stage.add @_dotsOuterLayer
		@_stage.add @_lineLayer
		@_stage.add @_hintLayer
		@_stage.add @_listenerLayer

		# Define a new Pattern object.
		@_pattern = (=> new Pattern {
					patternLayer: @_dotsOuterLayer,
					lineLayer: @_lineLayer,
					hintLayer: @_hintLayer
				})()
				
		# Define a Dots array to keep track of the user's inputs.
		@_dots = []

		@_draw()
		@_parseAndSaveUserPattern @_config.pattern if @_config.pattern?
		return @
		
	# This method initializes the saved pattern.
	# @todo this method need more tests!
	_parseAndSaveUserPattern: (pattern) ->
		patternArray = pattern.split /[#\|_,; -]+/
		(dotPosition = +patternNumber-1
		dot = @_dots[ dotPosition ]
		@_pattern.savePatternDot dot if @_pattern.shouldDrawDot dot
		) for patternNumber in patternArray
		
		@_pattern.buildHint()

		return true
		
	# This method initializes and draws the container.
	# @return PatternLockScreen reference.
	_draw: ->
		w = @_stage.getWidth()
		h = @_stage.getHeight()
		mW = Math.floor w/2
		mH = Math.floor h/2
		offsetW = Math.floor w/3
		offsetH = Math.floor h/3
		points = [
			{ x: mW - offsetW,		y: mH - offsetH }
			{ x: mW,							y: mH - offsetH }
			{ x: mW + offsetW,		y: mH - offsetH }
			{ x: mW - offsetW,		y: mH					}
			{ x: mW,							y: mH					}
			{ x: mW + offsetW,		y: mH					}
			{ x: mW - offsetW,		y: mH + offsetH }
			{ x: mW,							y: mH + offsetH }
			{ x: mW + offsetW,		y: mH + offsetH }]
		(options = {
			pattern: @_pattern,
			innerLayer: @_dotsInnerLayer,
			listenerLayer: @_listenerLayer,
			x: point.x
			y: point.y
		}
		@_dots.push new Dot i, options) for point, i in points
		return @
	
	# This method clears both the container and the user's inputs.
	clear: ->
		@_pattern.clear()
		dot.clear() for dot in @_dots
		return @

	# This method clears the container, the user's inputs and saved pattern.
	reset: ->
		@clear()
		@_pattern.clearSavedPattern()
		return @

	# This method unlocks the pattern lock.
	# @return True if the pattern matches, False otherwise.
	unlock: ->
		if @_pattern.isValid()
			@validatePattern()
			@_config.onSuccess?.call @
			return true
		else 
			@invalidatePattern()
			@_config.onFailure?.call @
			return false
	
	# This method is executed when the unlock process has succeded.
	validatePattern: ->
		return @

	# This method is executed when the unlock process has failed.
	invalidatePattern: ->
		dots = @_dotsOuterLayer.getChildren()
		line = @_lineLayer.getChildren()
		line[0].setFill "rgba(255,0,0,0.5)" if line[0]?
		dot.setStroke "rgba(255,0,0,0.8)" for dot in dots
		@_dotsOuterLayer.draw()
		@_lineLayer.draw()
		@_pattern.setToBeClearedOnNextUse true
		return @

	# This method is executed before recording a pattern.
	startRecordPattern: ->
		@clear()
		@_pattern.clearSavedPattern()
		@_pattern.setRecording true
		@_pattern.setToBeClearedOnNextUse false
		return @

	# This method is executed after a pattern has been recorded.
	stopRecordPattern: ->
		@clear()
		@_pattern.setRecording false
		@_pattern.buildHint()
		return @

	# This method draws a hint of the user's saved pattern.
	showHint: (canShow) ->
		if canShow then @_pattern.showHint() else @_pattern.hideHint()
		return @













