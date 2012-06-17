##
# The Dot class.
# This is the base class for all the circles that are drawn in the container.
# There are three kinds of dots:
# - The inner dots, those are the gray ones that are initially drawn,
# - The outer dots, those are the user's ones.
# - The listener dots, those are the invisible ones that listen for user's event
#
# @constructor
# @private
#
##

class Dot 
	
	constructor: (id, o) ->
		
		# The uniq id of this dot.
		@_id = id

		# The x and y location of this dot.
		@_x = o.x
		@_y = o.y

		# The inner dots layer and the listener layer.
		@_dotInnerLayer = o.innerLayer
		@_listenerLayer = o.listenerLayer

		# The reference to the Pattern object.
		@_pattern = o.pattern

		# The inner dots default values.
		@_innerCircleRadius = 5
		@_innerCircleFill = "rgba(255,255,255,0)"
		@_innerCircleStroke = "#aaa"

		# The stroke width value of all dots.
		@_strokeWidth = 4

		stage = @_dotInnerLayer.getStage()
		minDotRadius = Math.min stage.getWidth(), stage.getHeight()

		# The user's dots default values.
		@_outerCircleConfig = {
			radius: minDotRadius/10,
			fill: "rgba(255,255,255,0)",
			stroke: "lime",
			strokeWidth: @_strokeWidth
		}

		# The inner dots reference.
		@_innerCircle = (=> new Kinetic.Circle {
					x: @_x,
					y: @_y,
					radius: @_innerCircleRadius,
					fill: @_innerCircleFill,
					stroke: @_innerCircleStroke,
					strokeWidth: @_strokeWidth
				})()

		# The listener dots reference.
		@_listenerCircle = (=> new Kinetic.Circle {
					x: @_x,
					y: @_y,
					radius: @_outerCircleConfig.radius,
					fill: 'transparent'
				})()

		# Define all needed listeners.
		@_listenerCircle.on "mousedown mousemove touchmove", @_showUserDot.bind @
		@_listenerCircle.on "mouseout", @_mouseout.bind @
		@_listenerCircle.on "mouseup touchend", @_isValid.bind @
		
		@_listenerLayer.add @_listenerCircle
		@_dotInnerLayer.add @_innerCircle

		@_dotInnerLayer.draw()


	# Get the x location of this dot.
	getX: -> @_x

	# Get the y location of this dot.
	getY: -> @_y

	# This method is fired up on a mouse up or touch end events. It checks if the pattern has matched.
	# @private
	_isValid: ->

		return false if @_pattern.isRecording
		
		event = (-> if document.createEvent
					event = document.createEvent "HTMLEvents"
					event.initEvent "click", true, true
					event	
				else
					event = document.createEventObject()
					event.eventType = "click"
					event
				)()

		btn = document.getElementById "unlock-button"
		if btn.dispatchEvent
			btn.dispatchEvent event
		else if btn.fireEvent
			btn.fireEvent "on"+event.eventType, event

		return true

	#	 This method shows the current user's input. Basically, it draws the a dot.
	# @private
	_showUserDot: ->

		document.body.style.cursor = "pointer"

		# hide the inner circle
		@_innerCircle.setStrokeWidth 2
		@_dotInnerLayer.draw()

		# add an outer circle if needed
		outerCircle = (=> new Kinetic.Circle {
					x: @_innerCircle.getX(),
					y: @_innerCircle.getY(),
					radius: 0,
					fill: @_outerCircleConfig.fill,
					stroke: @_outerCircleConfig.stroke,
					strokeWidth: @_outerCircleConfig.strokeWidth
				})()

		@_pattern.addDot outerCircle, @_outerCircleConfig

	# This method is fired when the cursor or the user's finger passes over a dot.
	# @private
	_mouseover: ->
		document.body.style.cursor = "pointer"
		return true	

	# This method is fired when the cursor or the user's finger leaves a dot.
	# @private
	_mouseout: ->
		document.body.style.cursor = "default"
		return true

	# This method clears the containers and set its dots to their initial state.
	clear: ->
		@_innerCircle.setFill @_innerCircleFill
		@_innerCircle.setRadius @_innerCircleRadius
		@_innerCircle.setStrokeWidth @_innerCircleRadius
		@_dotInnerLayer.draw()
		return true	

# end Dot.coffee
		



