
window.addEventListener "load", ->
	app = new LockScreen {
		container: "lock-screen",
		width: 400,
		height: 400,
		onSuccess: -> console.log "Pattern successed",
		onFailure: -> console.log "Pattern unmatched",
		pattern: "1-2-3-4-5-6-7-8-9"
	}

	unlockButton = document.getElementById "unlock-button"
	savePatternButton = document.getElementById "save-pattern-button"
	resetButton = document.getElementById "reset-button"
	toggleShowHint = true

	savePatternButton.addEventListener "click", (-> 
		span = @getElementsByClassName "gray"
		if span.className == "red"
			@innerHTML = "<span class='gray'></span>Record Pattern"
			span.className = "gray"
			app.stopRecordPattern()
			unlockButton.style.display = "inline"
			resetButton.style.display = "inline"
		else
			@innerHTML = "<span class='red'></span>Recording..."
			span.className = "red"
			app.startRecordPattern()
			unlockButton.style.display = "none"
			resetButton.style.display = "none"
		return true
	), false
	
	unlockButton.addEventListener "click", (->
		if app.unlock() != false
			@className = "button green"
			alert "Access Granted!"
		else
			@className = "button red"
			setTimeout (=> 
				@className = "button blue"
				app.clear()
				return true
			), 1000
		return true
	), false

	resetButton.addEventListener "click", (->
		app.reset()
		unlockButton.className = "button blue"
		return true
	), false

	document.addEventListener "keyup", ( (e)->
		(app.showHint toggleShowHint
		toggleShowHint = !toggleShowHint) if (e.keyCode || e.which) == 72 # h
		return true
	)

	return true