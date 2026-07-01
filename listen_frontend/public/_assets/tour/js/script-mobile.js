$(document).on('click', '.popover-navigation [data-role=end]', function (e) {
        console.log('onEnd');
        base_path = location.pathname.slice(0, location.pathname.lastIndexOf('/'));
        window.location.replace(base_path + '/home');

    });
// $(document).on('click', '.popover-navigation [data-role=next],.popover-navigation [data-role=prev],.popover-navigation [data-role=end]', function (e) {
// 		e.stopPropagation();
//         $(".dropdown-toggle").dropdown();// this doesn't
// });



//function noscroll(event) {
//    //    window.scrollTo(0, 0);
//    event.preventDefault();
//    event.stopPropagation();
//    console.log('no scroll');
//}
//
//// add listener to disable scroll
//window.addEventListener('scroll', noscroll);

// Remove listener to disable scroll
//window.removeEventListener('scroll', noscroll);


function getParameterByName(name, url) {
     if (!url) url = window.location.href;
     name = name.replace(/[\[\]]/g, "\\$&");
     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
         results = regex.exec(url);
     if (!results) return null;
     if (!results[2]) return '';
     return decodeURIComponent(results[2].replace(/\+/g, " "));
 }


(function(){
	var tour = new Tour({
		storage : false
	});

base_path = location.pathname.slice(0, location.pathname.lastIndexOf('/'));
current_step = getParameterByName("step");
	
console.log('base_path:' + base_path);
console.log('current_step:' + current_step);

if(current_step == '6') // gallery
{

	tour.addSteps([
	  {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onPrev: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/home?step=5');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	  {
	    element: ".tour-gallery-content",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "See the excitement of Dialogue"; },
	    content : function(){ return "Move your cursor to any of these photos to see the captured moment of those who has done Dialogue session with Management Team. Join Dialogue and maybe you will find yourself in this gallery!"; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	    }
	  },	   
	   {
	    element: ".tour-gallery-content",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "You are all set!"; },
	    content: function () {
	        return "Congratulations, you have completed the web tour. We can’t wait to see you in your Dialogue session!";
	    },
	    onEnd: function (tour) {
	    	console.log('end');
	    	
	    }
	  }
	]);	
}
else if(current_step == '5') // home
{

	tour.addSteps([
		{
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onPrev: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/yawa?step=4');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	  {
	    element: ".tour-gallery",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "Now click this button to open the Gallery"; },
	    content : function(){ return ""; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	        window.location.replace(base_path + '/gallery?step=6');
	    }
	  },	   
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  }
	]);	
}
else if(current_step == '4') // yawa
{

	tour.addSteps([  
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onPrev: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/home?step=3');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	  {
	    element: ".initiate-yawa",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Submit your question, feedback, and suggestion"; },
	    content : function(){ return "Click this button to submit your question, feedback, and suggestion. You will also need to choose to whom this question are for.<br>You will remain <strong><u>anonymous.</u></strong>"; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	    }
	  },	
	  {
	    element: ".yawa-content",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "Featured questions"; },
	    content : function(){ return "You can see here are the lists of featured questions."; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	    }
	  },
	  {
	    element: "#lihome",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Let’s head back to homepage for the last time. Click this button."; },
	    content: function () {
	        return "";
	    },
	    onNext: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/home?step=5');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	   },  
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  }
	]);	
}
else if(current_step == '3') // home
{

	tour.addSteps([
	  {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onPrev: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/events?step=2');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	  {
	    element: ".tour-yawa",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "Now click this button to learn more about YAWA!"; },
	    content : function(){ return ""; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	        window.location.replace(base_path + '/yawa?step=4');
	    }
	  },	   
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  }
	]);	
}
else if(current_step == '2') // events
{

	tour.addSteps([
	  {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onPrev: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/home?step=1');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	  {
	    element: ".step2_web",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "Available Management Team list"; },
	    content : function(){ return "Here are lists of available Management Team along with their availability, venue, and quota of participants."; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	    }
	  },
	   {
	    element: "#step2_web",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Register your Dialogue session from available list"; },
	    content: function () {
	        return "Click this button to register yourself, or register other towards this schedule. If the quota met, we will confirm you separately via email";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	   {
	    element: ".initiate-dialogue-banner",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Initiate your own Dialogue session with the Management Team of your choice!"; },
	    content: function () {
	        return "The person you seek is not on the list? Click this button to propose your own session and choose with the Management Team you are willing to meet!";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	   {
	    element: "#lihome",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Let’s head back to homepage. Click this button."; },
	    content: function () {
	        return "";
	    },
	    onNext: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/home?step=3');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  }
	]);	
}
else  if(current_step == '1') // home
{
	//console.log('current_module:' + current_module);
	tour.addSteps([
	  {
	    element: ".jssorb05",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Welcome User to Time to Listen application!"; },
	    content : function(){ return "Here we demonstrate THRIVE energies especially inclusiveness by having a great Dialogue with Management Team."; },
	      //content: "What's your name? <br><input class='form-control' type='text' name='your_name'>",
	    onNext: function (tour) {
	        // console.log('mulai onNext');
	    }
	  },
	   {
	    element: ".tour-initiate",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Book your Dialogue session with management team"; },
	    content: function () {
	        return "Click this button and you can choose from the listed management schedule to book and have Dialogue session! You can also Initiate your request to have Dialogue session with management team of your choice!";
	    },
	    onNext: function (tour) {
	    
	    }
	  },
	   {
	    element: ".tour-yawa",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "Ask your question or give feedbacks and suggestion to management team"; },
	    content: function () {
	        return "Click this button to raise your question or give feedbacks and suggestion to the Management Team of your preference. You will stay anonymous. And featured questions and answer will be posted inside!";
	    },
	    onNext: function (tour) {
	    
	    }
	  },
	   {
	    element: ".tour-gallery",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return "See the excitement of many Dialogue’s events"; },
	    content: function () {
	        return "Click this button to check out the records of amazing Dialogue sessions. Do your Dialogue session and probably you will find yourself featured in here!";
	    },
	    onNext: function (tour) {
	    
	    }
	  },
	   {
	    element: "#liContact",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "Any question about Time to Listen applications and it features? Please contact us through HMS, Internal Communications";
	    },
	    onNext: function (tour) {
	    
	    }
	  },
	   {
	    element: ".tour-initiate",
	    placement: "bottom",
	    backdrop: true,
	    title: function(){ return "Now click this button to learn more about Dialogue!"; },
	    content: function () {
	        return "";
	    },
	    onNext: function (tour) {
	    	//console.log('go to next page');
	    	window.location.replace(base_path + '/events?step=2');
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  },
	   {
	    element: "trigger",
	    placement: "top",
	    backdrop: true,
	    title: function(){ return ""; },
	    content: function () {
	        return "";
	    },
	    onEnd: function (tour) {
	    	console.log('test');
	    }
	  }
	]);	
}

	



	// Initialize the tour
	tour.init();

	// Start the tour
    //tour.start();
    tour.restart();
}());

