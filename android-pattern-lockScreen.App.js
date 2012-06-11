window.addEventListener('load', function() {
	var app = (new PatternLockScreen("lock-screen")).start();
	var unlockButton = document.getElementById('unlock-button');
	var savePatternButton = document.getElementById('save-pattern-button');
	var resetButton = document.getElementById('reset-button');
	var showHint = true;
	
	savePatternButton.addEventListener('click', function(){
		var span = this.getElementsByClassName('gray');
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
	document.addEventListener('keyup', function(e){
		app.showHint(showHint);
		var code = e.keyCode || e.which;
		if( code === 72 ){
			showHint = !showHint;
		}
	});
	
}, false);