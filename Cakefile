{exec} = require 'child_process'
task 'build', 'Build project from coffee/*.coffee to coffee-js/*.js', ->
  
  # step 1
  exec 'coffee --bare --lint --compile --output coffee-js/ coffee/', (err, stdout, stderr) ->
    
    # step 2
    exec 'coffee --tokens --bare --lint --compile --join coffee-js/android-pattern-lock-screen.js --output coffee-js/ coffee/', (err, stdout, stderr) ->

	    # step 3
	    exec 'uglifyjs --output coffee-js/android-pattern-lock-screen.min.js coffee-js/android-pattern-lock-screen.js', (err, stdout, stderr) ->
	    	throw err if err
	    	console.log stdout + stderr
	
	
  
  
