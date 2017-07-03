(function(){
	"use strict";

	angular
	.module('cmp.pageLeaveLock', [])
	.service('PageLeaveLockService', PageLeaveLockService);

	PageLeaveLockService.$inject = ['$window'];
	function PageLeaveLockService($window)
	{
		var self = this;
		var lockCounter = 0; 

		self.push = push;
		self.pop = pop;
		self.unlock = unlock;
		self.restore = check;

		function push(){
			lockCounter++;
			check();
		}

		function pop(){
			lockCounter && lockCounter--;
			check();
		}

		function unlock(){
			$window.onbeforeunload = null;
		}

		function check(){
			$window.onbeforeunload = lockCounter ? lock : null;
		}

		function lock(event){
			var message = 'Your changes will be lost. Proceed?';
    		if(event == null)
      			event = $window.event;
    		if(event) 
      			event.returnValue = message;
    		
    		return message;
		}


	}
})();