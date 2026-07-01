var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
	acc[i].addEventListener("click", function() {
		this.parentElement.classList.toggle("active");
		var panel = this.nextElementSibling;
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
		} else {
			panel.style.maxHeight = panel.scrollHeight + 46 + "px";
		} 
	});
}

$(".tab-benefit").on("click", function(){
	var dataTarget = $(this).attr("data-target");
	$(".tab-benefit").removeClass("active");
	$(this).addClass("active");
	$(".tab-content").removeClass("active");
	$(dataTarget).addClass("active");
});


$(window).scroll(function () {
	var currentScrollPos = window.pageYOffset;
	var headlineH = $(".section-headline").innerHeight() - 160;
	if (currentScrollPos < headlineH) {
		$(".nav").removeClass("scrolling");
	} else {
		$(".nav").addClass("scrolling");
	}
});

$(".card-cb-1").on("click", function(){
	var target = $(this).attr("data-target");
	$(".card-cb-1").removeClass("cb-active");
	$(this).addClass("cb-active");
	$(".cb-tab-content").css("display","none");
	$(target).css("display","block")
	// $(".cb-tab-content").not('#' + target).css("display","none");
	
	//reset filter
	$(".card-cb-2").css("display", "block"); 
	$('.cb-filter__btn :radio').prop("checked", false);
})

$(".faq-tab__btn").on("click", function(e){
	var target = $(this).attr("data-target");
	$(".faq-tab__btn").removeClass("faq-tab__btn--active");
	$(this).addClass("faq-tab__btn--active");
	$(".faq-tab-content").css("display","none");
	$(target).css("display","block")
	e.preventDefault();
})

$('.cb-filter__btn :radio').change(function(e) { 
	if (e.originalEvent) {
		var value = $(this).val();
		var id = $(this).attr('id'); 
		if (this.checked) {
				$(".card-cb-2").css("display", "none");
				$(".card-cb-2."+value).css("display", "block");
				// $(".card-cb-2").filter("'."+value+"'").css("display", "block");
				var filter = String(id).substr(id.length - 1, 1);
				if (filter == 'a') 
					$('#' + id.substr(0, id.length - 1) + 'b')[0].checked = false;
				else
					$('#' + id.substr(0, id.length - 1) + 'a')[0].checked = false;
		} 
		else {
			$(".card-cb-2").css("display", "block");	
		}
	}
});

function nextStep(target){
	$(".card-step-exam").removeClass("card-step-exam--active");
	$(target).addClass("card-step-exam--active");
	$(".stp").removeClass("exam-pagination--active");
	switch(target){
		case "#step2":
			$("#stp2").addClass("exam-pagination--active");
			break;
		case "#step3":
			$("#stp3").addClass("exam-pagination--active");
			break;
		default:
			$("#stp1").addClass("exam-pagination--active");
			break;
	}
}

$(".open-modal").on("click", function(){
	var target = $(this).attr("data-target") 
	$(target).addClass("sam-modal--active");
	$("body").css({
		"height":"100vh",
		"overflow": "hidden",
	})
})

$(".btn-close-modal").on("click", function(){
	$(".sam-modal").removeClass("sam-modal--active");
	if($(".card-step-exam")){
		$(".card-step-exam").addClass("card-step-exam--active");
		$("#step2").removeClass("card-step-exam--active");
		$("#step3").removeClass("card-step-exam--active");
	}
	$("body").css({
		"height":"auto",
		"overflow": "auto",
	})
})

$(".label-language").on("click", function(){
	$(".label-language").removeClass("label-language--active");
	$(this).addClass("label-language--active");
	$(".sam-select-language").removeClass("sam-select-language--active")
});

$(".sam-select-language").on("click", function(){
	$(this).toggleClass("sam-select-language--active");
})

function modalOpen(id) {	
	$('#' + id).addClass("sam-modal--active");
	$("body").css({
		"height":"100vh",
		"overflow": "hidden",
	})
}