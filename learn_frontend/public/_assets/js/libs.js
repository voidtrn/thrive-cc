function _classCallCheck(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}var Sticky=function(){function t(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};_classCallCheck(this,t),this.selector=i,this.elements=[],this.version="1.2.0",this.vp=this.getViewportSize(),this.body=document.querySelector("body"),this.options={wrap:e.wrap||!1,marginTop:e.marginTop||0,stickyFor:e.stickyFor||0,stickyClass:e.stickyClass||null,stickyContainer:e.stickyContainer||"body"},this.updateScrollTopPosition=this.updateScrollTopPosition.bind(this),this.updateScrollTopPosition(),window.addEventListener("load",this.updateScrollTopPosition),window.addEventListener("scroll",this.updateScrollTopPosition),this.run()}return t.prototype.run=function(){var t=this,i=setInterval(function(){if("complete"===document.readyState){clearInterval(i);var e=document.querySelectorAll(t.selector);t.forEach(e,function(i){return t.renderElement(i)})}},10)},t.prototype.renderElement=function(t){var i=this;t.sticky={},t.sticky.active=!1,t.sticky.marginTop=parseInt(t.getAttribute("data-margin-top"))||this.options.marginTop,t.sticky.stickyFor=parseInt(t.getAttribute("data-sticky-for"))||this.options.stickyFor,t.sticky.stickyClass=t.getAttribute("data-sticky-class")||this.options.stickyClass,t.sticky.wrap=!!t.hasAttribute("data-sticky-wrap")||this.options.wrap,t.sticky.stickyContainer=this.options.stickyContainer,t.sticky.container=this.getStickyContainer(t),t.sticky.container.rect=this.getRectangle(t.sticky.container),t.sticky.rect=this.getRectangle(t),"img"===t.tagName.toLowerCase()&&(t.onload=function(){return t.sticky.rect=i.getRectangle(t)}),t.sticky.wrap&&this.wrapElement(t),this.activate(t)},t.prototype.wrapElement=function(t){t.insertAdjacentHTML("beforebegin","<span></span>"),t.previousSibling.appendChild(t)},t.prototype.activate=function(t){t.sticky.rect.top+t.sticky.rect.height<t.sticky.container.rect.top+t.sticky.container.rect.height&&t.sticky.stickyFor<this.vp.width&&!t.sticky.active&&(t.sticky.active=!0),this.elements.indexOf(t)<0&&this.elements.push(t),t.sticky.resizeEvent||(this.initResizeEvents(t),t.sticky.resizeEvent=!0),t.sticky.scrollEvent||(this.initScrollEvents(t),t.sticky.scrollEvent=!0),this.setPosition(t)},t.prototype.initResizeEvents=function(t){var i=this;t.sticky.resizeListener=function(){return i.onResizeEvents(t)},window.addEventListener("resize",t.sticky.resizeListener)},t.prototype.destroyResizeEvents=function(t){window.removeEventListener("resize",t.sticky.resizeListener)},t.prototype.onResizeEvents=function(t){this.vp=this.getViewportSize(),t.sticky.rect=this.getRectangle(t),t.sticky.container.rect=this.getRectangle(t.sticky.container),t.sticky.rect.top+t.sticky.rect.height<t.sticky.container.rect.top+t.sticky.container.rect.height&&t.sticky.stickyFor<this.vp.width&&!t.sticky.active?t.sticky.active=!0:(t.sticky.rect.top+t.sticky.rect.height>=t.sticky.container.rect.top+t.sticky.container.rect.height||t.sticky.stickyFor>=this.vp.width&&t.sticky.active)&&(t.sticky.active=!1),this.setPosition(t)},t.prototype.initScrollEvents=function(t){var i=this;t.sticky.scrollListener=function(){return i.onScrollEvents(t)},window.addEventListener("scroll",t.sticky.scrollListener)},t.prototype.destroyScrollEvents=function(t){window.removeEventListener("scroll",t.sticky.scrollListener)},t.prototype.onScrollEvents=function(t){t.sticky.active&&this.setPosition(t)},t.prototype.setPosition=function(t){this.css(t,{position:"",width:"",top:"",left:""}),this.vp.height<t.sticky.rect.height||!t.sticky.active||(t.sticky.rect.width||(t.sticky.rect=this.getRectangle(t)),t.sticky.wrap&&this.css(t.parentNode,{display:"block",width:t.sticky.rect.width+"px",height:t.sticky.rect.height+"px"}),0===t.sticky.rect.top&&t.sticky.container===this.body?this.css(t,{position:"fixed",top:t.sticky.rect.top+"px",left:t.sticky.rect.left+"px",width:t.sticky.rect.width+"px"}):this.scrollTop>t.sticky.rect.top-t.sticky.marginTop?(this.css(t,{position:"fixed",width:t.sticky.rect.width+"px",left:t.sticky.rect.left+"px"}),this.scrollTop+t.sticky.rect.height+t.sticky.marginTop>t.sticky.container.rect.top+t.sticky.container.offsetHeight?(t.sticky.stickyClass&&t.classList.remove(t.sticky.stickyClass),this.css(t,{top:t.sticky.container.rect.top+t.sticky.container.offsetHeight-(this.scrollTop+t.sticky.rect.height)+"px"})):(t.sticky.stickyClass&&t.classList.add(t.sticky.stickyClass),this.css(t,{top:t.sticky.marginTop+"px"}))):(t.sticky.stickyClass&&t.classList.remove(t.sticky.stickyClass),this.css(t,{position:"",width:"",top:"",left:""}),t.sticky.wrap&&this.css(t.parentNode,{display:"",width:"",height:""})))},t.prototype.update=function(){var t=this;this.forEach(this.elements,function(i){i.sticky.rect=t.getRectangle(i),i.sticky.container.rect=t.getRectangle(i.sticky.container),t.activate(i),t.setPosition(i)})},t.prototype.destroy=function(){var t=this;this.forEach(this.elements,function(i){t.destroyResizeEvents(i),t.destroyScrollEvents(i),delete i.sticky})},t.prototype.getStickyContainer=function(t){for(var i=t.parentNode;!i.hasAttribute("data-sticky-container")&&!i.parentNode.querySelector(t.sticky.stickyContainer)&&i!==this.body;)i=i.parentNode;return i},t.prototype.getRectangle=function(t){this.css(t,{position:"",width:"",top:"",left:""});var i=Math.max(t.offsetWidth,t.clientWidth,t.scrollWidth),e=Math.max(t.offsetHeight,t.clientHeight,t.scrollHeight),s=0,o=0;do s+=t.offsetTop||0,o+=t.offsetLeft||0,t=t.offsetParent;while(t);return{top:s,left:o,width:i,height:e}},t.prototype.getViewportSize=function(){return{width:Math.max(document.documentElement.clientWidth,window.innerWidth||0),height:Math.max(document.documentElement.clientHeight,window.innerHeight||0)}},t.prototype.updateScrollTopPosition=function(){this.scrollTop=(window.pageYOffset||document.scrollTop)-(document.clientTop||0)||0},t.prototype.forEach=function(t,i){for(var e=0,s=t.length;e<s;e++)i(t[e])},t.prototype.css=function(t,i){for(var e in i)i.hasOwnProperty(e)&&(t.style[e]=i[e])},t}();!function(t,i){"undefined"!=typeof exports?module.exports=i:"function"==typeof define&&define.amd?define([],i):t.Sticky=i}(this,Sticky);
/*!
  * Bootstrap v4.5.0 (https://getbootstrap.com/)
  * Copyright 2011-2020 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("jquery")):"function"==typeof define&&define.amd?define(["exports","jquery"],e):e((t=t||self).bootstrap={},t.jQuery)}(this,(function(t,e){"use strict";function n(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function i(t,e,i){return e&&n(t.prototype,e),i&&n(t,i),t}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function r(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,i)}return n}function s(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?r(Object(n),!0).forEach((function(e){o(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}e=e&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e;function a(t){var n=this,i=!1;return e(this).one(l.TRANSITION_END,(function(){i=!0})),setTimeout((function(){i||l.triggerTransitionEnd(n)}),t),this}var l={TRANSITION_END:"bsTransitionEnd",getUID:function(t){do{t+=~~(1e6*Math.random())}while(document.getElementById(t));return t},getSelectorFromElement:function(t){var e=t.getAttribute("data-target");if(!e||"#"===e){var n=t.getAttribute("href");e=n&&"#"!==n?n.trim():""}try{return document.querySelector(e)?e:null}catch(t){return null}},getTransitionDurationFromElement:function(t){if(!t)return 0;var n=e(t).css("transition-duration"),i=e(t).css("transition-delay"),o=parseFloat(n),r=parseFloat(i);return o||r?(n=n.split(",")[0],i=i.split(",")[0],1e3*(parseFloat(n)+parseFloat(i))):0},reflow:function(t){return t.offsetHeight},triggerTransitionEnd:function(t){e(t).trigger("transitionend")},supportsTransitionEnd:function(){return Boolean("transitionend")},isElement:function(t){return(t[0]||t).nodeType},typeCheckConfig:function(t,e,n){for(var i in n)if(Object.prototype.hasOwnProperty.call(n,i)){var o=n[i],r=e[i],s=r&&l.isElement(r)?"element":null===(a=r)||"undefined"==typeof a?""+a:{}.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase();if(!new RegExp(o).test(s))throw new Error(t.toUpperCase()+': Option "'+i+'" provided type "'+s+'" but expected type "'+o+'".')}var a},findShadowRoot:function(t){if(!document.documentElement.attachShadow)return null;if("function"==typeof t.getRootNode){var e=t.getRootNode();return e instanceof ShadowRoot?e:null}return t instanceof ShadowRoot?t:t.parentNode?l.findShadowRoot(t.parentNode):null},jQueryDetection:function(){if("undefined"==typeof e)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=e.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||t[0]>=4)throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}};l.jQueryDetection(),e.fn.emulateTransitionEnd=a,e.event.special[l.TRANSITION_END]={bindType:"transitionend",delegateType:"transitionend",handle:function(t){if(e(t.target).is(this))return t.handleObj.handler.apply(this,arguments)}};var c="alert",u=e.fn[c],h=function(){function t(t){this._element=t}var n=t.prototype;return n.close=function(t){var e=this._element;t&&(e=this._getRootElement(t)),this._triggerCloseEvent(e).isDefaultPrevented()||this._removeElement(e)},n.dispose=function(){e.removeData(this._element,"bs.alert"),this._element=null},n._getRootElement=function(t){var n=l.getSelectorFromElement(t),i=!1;return n&&(i=document.querySelector(n)),i||(i=e(t).closest(".alert")[0]),i},n._triggerCloseEvent=function(t){var n=e.Event("close.bs.alert");return e(t).trigger(n),n},n._removeElement=function(t){var n=this;if(e(t).removeClass("show"),e(t).hasClass("fade")){var i=l.getTransitionDurationFromElement(t);e(t).one(l.TRANSITION_END,(function(e){return n._destroyElement(t,e)})).emulateTransitionEnd(i)}else this._destroyElement(t)},n._destroyElement=function(t){e(t).detach().trigger("closed.bs.alert").remove()},t._jQueryInterface=function(n){return this.each((function(){var i=e(this),o=i.data("bs.alert");o||(o=new t(this),i.data("bs.alert",o)),"close"===n&&o[n](this)}))},t._handleDismiss=function(t){return function(e){e&&e.preventDefault(),t.close(this)}},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}}]),t}();e(document).on("click.bs.alert.data-api",'[data-dismiss="alert"]',h._handleDismiss(new h)),e.fn[c]=h._jQueryInterface,e.fn[c].Constructor=h,e.fn[c].noConflict=function(){return e.fn[c]=u,h._jQueryInterface};var f=e.fn.button,d=function(){function t(t){this._element=t}var n=t.prototype;return n.toggle=function(){var t=!0,n=!0,i=e(this._element).closest('[data-toggle="buttons"]')[0];if(i){var o=this._element.querySelector('input:not([type="hidden"])');if(o){if("radio"===o.type)if(o.checked&&this._element.classList.contains("active"))t=!1;else{var r=i.querySelector(".active");r&&e(r).removeClass("active")}t&&("checkbox"!==o.type&&"radio"!==o.type||(o.checked=!this._element.classList.contains("active")),e(o).trigger("change")),o.focus(),n=!1}}this._element.hasAttribute("disabled")||this._element.classList.contains("disabled")||(n&&this._element.setAttribute("aria-pressed",!this._element.classList.contains("active")),t&&e(this._element).toggleClass("active"))},n.dispose=function(){e.removeData(this._element,"bs.button"),this._element=null},t._jQueryInterface=function(n){return this.each((function(){var i=e(this).data("bs.button");i||(i=new t(this),e(this).data("bs.button",i)),"toggle"===n&&i[n]()}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}}]),t}();e(document).on("click.bs.button.data-api",'[data-toggle^="button"]',(function(t){var n=t.target,i=n;if(e(n).hasClass("btn")||(n=e(n).closest(".btn")[0]),!n||n.hasAttribute("disabled")||n.classList.contains("disabled"))t.preventDefault();else{var o=n.querySelector('input:not([type="hidden"])');if(o&&(o.hasAttribute("disabled")||o.classList.contains("disabled")))return void t.preventDefault();"LABEL"===i.tagName&&o&&"checkbox"===o.type&&t.preventDefault(),d._jQueryInterface.call(e(n),"toggle")}})).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',(function(t){var n=e(t.target).closest(".btn")[0];e(n).toggleClass("focus",/^focus(in)?$/.test(t.type))})),e(window).on("load.bs.button.data-api",(function(){for(var t=[].slice.call(document.querySelectorAll('[data-toggle="buttons"] .btn')),e=0,n=t.length;e<n;e++){var i=t[e],o=i.querySelector('input:not([type="hidden"])');o.checked||o.hasAttribute("checked")?i.classList.add("active"):i.classList.remove("active")}for(var r=0,s=(t=[].slice.call(document.querySelectorAll('[data-toggle="button"]'))).length;r<s;r++){var a=t[r];"true"===a.getAttribute("aria-pressed")?a.classList.add("active"):a.classList.remove("active")}})),e.fn.button=d._jQueryInterface,e.fn.button.Constructor=d,e.fn.button.noConflict=function(){return e.fn.button=f,d._jQueryInterface};var p="carousel",m=".bs.carousel",g=e.fn[p],v={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0,touch:!0},_={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean",touch:"boolean"},b={TOUCH:"touch",PEN:"pen"},y=function(){function t(t,e){this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this.touchTimeout=null,this.touchStartX=0,this.touchDeltaX=0,this._config=this._getConfig(e),this._element=t,this._indicatorsElement=this._element.querySelector(".carousel-indicators"),this._touchSupported="ontouchstart"in document.documentElement||navigator.maxTouchPoints>0,this._pointerEvent=Boolean(window.PointerEvent||window.MSPointerEvent),this._addEventListeners()}var n=t.prototype;return n.next=function(){this._isSliding||this._slide("next")},n.nextWhenVisible=function(){!document.hidden&&e(this._element).is(":visible")&&"hidden"!==e(this._element).css("visibility")&&this.next()},n.prev=function(){this._isSliding||this._slide("prev")},n.pause=function(t){t||(this._isPaused=!0),this._element.querySelector(".carousel-item-next, .carousel-item-prev")&&(l.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null},n.cycle=function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval))},n.to=function(t){var n=this;this._activeElement=this._element.querySelector(".active.carousel-item");var i=this._getItemIndex(this._activeElement);if(!(t>this._items.length-1||t<0))if(this._isSliding)e(this._element).one("slid.bs.carousel",(function(){return n.to(t)}));else{if(i===t)return this.pause(),void this.cycle();var o=t>i?"next":"prev";this._slide(o,this._items[t])}},n.dispose=function(){e(this._element).off(m),e.removeData(this._element,"bs.carousel"),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null},n._getConfig=function(t){return t=s(s({},v),t),l.typeCheckConfig(p,t,_),t},n._handleSwipe=function(){var t=Math.abs(this.touchDeltaX);if(!(t<=40)){var e=t/this.touchDeltaX;this.touchDeltaX=0,e>0&&this.prev(),e<0&&this.next()}},n._addEventListeners=function(){var t=this;this._config.keyboard&&e(this._element).on("keydown.bs.carousel",(function(e){return t._keydown(e)})),"hover"===this._config.pause&&e(this._element).on("mouseenter.bs.carousel",(function(e){return t.pause(e)})).on("mouseleave.bs.carousel",(function(e){return t.cycle(e)})),this._config.touch&&this._addTouchEventListeners()},n._addTouchEventListeners=function(){var t=this;if(this._touchSupported){var n=function(e){t._pointerEvent&&b[e.originalEvent.pointerType.toUpperCase()]?t.touchStartX=e.originalEvent.clientX:t._pointerEvent||(t.touchStartX=e.originalEvent.touches[0].clientX)},i=function(e){t._pointerEvent&&b[e.originalEvent.pointerType.toUpperCase()]&&(t.touchDeltaX=e.originalEvent.clientX-t.touchStartX),t._handleSwipe(),"hover"===t._config.pause&&(t.pause(),t.touchTimeout&&clearTimeout(t.touchTimeout),t.touchTimeout=setTimeout((function(e){return t.cycle(e)}),500+t._config.interval))};e(this._element.querySelectorAll(".carousel-item img")).on("dragstart.bs.carousel",(function(t){return t.preventDefault()})),this._pointerEvent?(e(this._element).on("pointerdown.bs.carousel",(function(t){return n(t)})),e(this._element).on("pointerup.bs.carousel",(function(t){return i(t)})),this._element.classList.add("pointer-event")):(e(this._element).on("touchstart.bs.carousel",(function(t){return n(t)})),e(this._element).on("touchmove.bs.carousel",(function(e){return function(e){e.originalEvent.touches&&e.originalEvent.touches.length>1?t.touchDeltaX=0:t.touchDeltaX=e.originalEvent.touches[0].clientX-t.touchStartX}(e)})),e(this._element).on("touchend.bs.carousel",(function(t){return i(t)})))}},n._keydown=function(t){if(!/input|textarea/i.test(t.target.tagName))switch(t.which){case 37:t.preventDefault(),this.prev();break;case 39:t.preventDefault(),this.next()}},n._getItemIndex=function(t){return this._items=t&&t.parentNode?[].slice.call(t.parentNode.querySelectorAll(".carousel-item")):[],this._items.indexOf(t)},n._getItemByDirection=function(t,e){var n="next"===t,i="prev"===t,o=this._getItemIndex(e),r=this._items.length-1;if((i&&0===o||n&&o===r)&&!this._config.wrap)return e;var s=(o+("prev"===t?-1:1))%this._items.length;return-1===s?this._items[this._items.length-1]:this._items[s]},n._triggerSlideEvent=function(t,n){var i=this._getItemIndex(t),o=this._getItemIndex(this._element.querySelector(".active.carousel-item")),r=e.Event("slide.bs.carousel",{relatedTarget:t,direction:n,from:o,to:i});return e(this._element).trigger(r),r},n._setActiveIndicatorElement=function(t){if(this._indicatorsElement){var n=[].slice.call(this._indicatorsElement.querySelectorAll(".active"));e(n).removeClass("active");var i=this._indicatorsElement.children[this._getItemIndex(t)];i&&e(i).addClass("active")}},n._slide=function(t,n){var i,o,r,s=this,a=this._element.querySelector(".active.carousel-item"),c=this._getItemIndex(a),u=n||a&&this._getItemByDirection(t,a),h=this._getItemIndex(u),f=Boolean(this._interval);if("next"===t?(i="carousel-item-left",o="carousel-item-next",r="left"):(i="carousel-item-right",o="carousel-item-prev",r="right"),u&&e(u).hasClass("active"))this._isSliding=!1;else if(!this._triggerSlideEvent(u,r).isDefaultPrevented()&&a&&u){this._isSliding=!0,f&&this.pause(),this._setActiveIndicatorElement(u);var d=e.Event("slid.bs.carousel",{relatedTarget:u,direction:r,from:c,to:h});if(e(this._element).hasClass("slide")){e(u).addClass(o),l.reflow(u),e(a).addClass(i),e(u).addClass(i);var p=parseInt(u.getAttribute("data-interval"),10);p?(this._config.defaultInterval=this._config.defaultInterval||this._config.interval,this._config.interval=p):this._config.interval=this._config.defaultInterval||this._config.interval;var m=l.getTransitionDurationFromElement(a);e(a).one(l.TRANSITION_END,(function(){e(u).removeClass(i+" "+o).addClass("active"),e(a).removeClass("active "+o+" "+i),s._isSliding=!1,setTimeout((function(){return e(s._element).trigger(d)}),0)})).emulateTransitionEnd(m)}else e(a).removeClass("active"),e(u).addClass("active"),this._isSliding=!1,e(this._element).trigger(d);f&&this.cycle()}},t._jQueryInterface=function(n){return this.each((function(){var i=e(this).data("bs.carousel"),o=s(s({},v),e(this).data());"object"==typeof n&&(o=s(s({},o),n));var r="string"==typeof n?n:o.slide;if(i||(i=new t(this,o),e(this).data("bs.carousel",i)),"number"==typeof n)i.to(n);else if("string"==typeof r){if("undefined"==typeof i[r])throw new TypeError('No method named "'+r+'"');i[r]()}else o.interval&&o.ride&&(i.pause(),i.cycle())}))},t._dataApiClickHandler=function(n){var i=l.getSelectorFromElement(this);if(i){var o=e(i)[0];if(o&&e(o).hasClass("carousel")){var r=s(s({},e(o).data()),e(this).data()),a=this.getAttribute("data-slide-to");a&&(r.interval=!1),t._jQueryInterface.call(e(o),r),a&&e(o).data("bs.carousel").to(a),n.preventDefault()}}},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return v}}]),t}();e(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",y._dataApiClickHandler),e(window).on("load.bs.carousel.data-api",(function(){for(var t=[].slice.call(document.querySelectorAll('[data-ride="carousel"]')),n=0,i=t.length;n<i;n++){var o=e(t[n]);y._jQueryInterface.call(o,o.data())}})),e.fn[p]=y._jQueryInterface,e.fn[p].Constructor=y,e.fn[p].noConflict=function(){return e.fn[p]=g,y._jQueryInterface};var w="collapse",E=e.fn[w],T={toggle:!0,parent:""},C={toggle:"boolean",parent:"(string|element)"},S=function(){function t(t,e){this._isTransitioning=!1,this._element=t,this._config=this._getConfig(e),this._triggerArray=[].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#'+t.id+'"],[data-toggle="collapse"][data-target="#'+t.id+'"]'));for(var n=[].slice.call(document.querySelectorAll('[data-toggle="collapse"]')),i=0,o=n.length;i<o;i++){var r=n[i],s=l.getSelectorFromElement(r),a=[].slice.call(document.querySelectorAll(s)).filter((function(e){return e===t}));null!==s&&a.length>0&&(this._selector=s,this._triggerArray.push(r))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var n=t.prototype;return n.toggle=function(){e(this._element).hasClass("show")?this.hide():this.show()},n.show=function(){var n,i,o=this;if(!this._isTransitioning&&!e(this._element).hasClass("show")&&(this._parent&&0===(n=[].slice.call(this._parent.querySelectorAll(".show, .collapsing")).filter((function(t){return"string"==typeof o._config.parent?t.getAttribute("data-parent")===o._config.parent:t.classList.contains("collapse")}))).length&&(n=null),!(n&&(i=e(n).not(this._selector).data("bs.collapse"))&&i._isTransitioning))){var r=e.Event("show.bs.collapse");if(e(this._element).trigger(r),!r.isDefaultPrevented()){n&&(t._jQueryInterface.call(e(n).not(this._selector),"hide"),i||e(n).data("bs.collapse",null));var s=this._getDimension();e(this._element).removeClass("collapse").addClass("collapsing"),this._element.style[s]=0,this._triggerArray.length&&e(this._triggerArray).removeClass("collapsed").attr("aria-expanded",!0),this.setTransitioning(!0);var a="scroll"+(s[0].toUpperCase()+s.slice(1)),c=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,(function(){e(o._element).removeClass("collapsing").addClass("collapse show"),o._element.style[s]="",o.setTransitioning(!1),e(o._element).trigger("shown.bs.collapse")})).emulateTransitionEnd(c),this._element.style[s]=this._element[a]+"px"}}},n.hide=function(){var t=this;if(!this._isTransitioning&&e(this._element).hasClass("show")){var n=e.Event("hide.bs.collapse");if(e(this._element).trigger(n),!n.isDefaultPrevented()){var i=this._getDimension();this._element.style[i]=this._element.getBoundingClientRect()[i]+"px",l.reflow(this._element),e(this._element).addClass("collapsing").removeClass("collapse show");var o=this._triggerArray.length;if(o>0)for(var r=0;r<o;r++){var s=this._triggerArray[r],a=l.getSelectorFromElement(s);if(null!==a)e([].slice.call(document.querySelectorAll(a))).hasClass("show")||e(s).addClass("collapsed").attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[i]="";var c=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,(function(){t.setTransitioning(!1),e(t._element).removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")})).emulateTransitionEnd(c)}}},n.setTransitioning=function(t){this._isTransitioning=t},n.dispose=function(){e.removeData(this._element,"bs.collapse"),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},n._getConfig=function(t){return(t=s(s({},T),t)).toggle=Boolean(t.toggle),l.typeCheckConfig(w,t,C),t},n._getDimension=function(){return e(this._element).hasClass("width")?"width":"height"},n._getParent=function(){var n,i=this;l.isElement(this._config.parent)?(n=this._config.parent,"undefined"!=typeof this._config.parent.jquery&&(n=this._config.parent[0])):n=document.querySelector(this._config.parent);var o='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',r=[].slice.call(n.querySelectorAll(o));return e(r).each((function(e,n){i._addAriaAndCollapsedClass(t._getTargetFromElement(n),[n])})),n},n._addAriaAndCollapsedClass=function(t,n){var i=e(t).hasClass("show");n.length&&e(n).toggleClass("collapsed",!i).attr("aria-expanded",i)},t._getTargetFromElement=function(t){var e=l.getSelectorFromElement(t);return e?document.querySelector(e):null},t._jQueryInterface=function(n){return this.each((function(){var i=e(this),o=i.data("bs.collapse"),r=s(s(s({},T),i.data()),"object"==typeof n&&n?n:{});if(!o&&r.toggle&&"string"==typeof n&&/show|hide/.test(n)&&(r.toggle=!1),o||(o=new t(this,r),i.data("bs.collapse",o)),"string"==typeof n){if("undefined"==typeof o[n])throw new TypeError('No method named "'+n+'"');o[n]()}}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return T}}]),t}();e(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',(function(t){"A"===t.currentTarget.tagName&&t.preventDefault();var n=e(this),i=l.getSelectorFromElement(this),o=[].slice.call(document.querySelectorAll(i));e(o).each((function(){var t=e(this),i=t.data("bs.collapse")?"toggle":n.data();S._jQueryInterface.call(t,i)}))})),e.fn[w]=S._jQueryInterface,e.fn[w].Constructor=S,e.fn[w].noConflict=function(){return e.fn[w]=E,S._jQueryInterface};var D="undefined"!=typeof window&&"undefined"!=typeof document&&"undefined"!=typeof navigator,k=function(){for(var t=["Edge","Trident","Firefox"],e=0;e<t.length;e+=1)if(D&&navigator.userAgent.indexOf(t[e])>=0)return 1;return 0}();var N=D&&window.Promise?function(t){var e=!1;return function(){e||(e=!0,window.Promise.resolve().then((function(){e=!1,t()})))}}:function(t){var e=!1;return function(){e||(e=!0,setTimeout((function(){e=!1,t()}),k))}};function O(t){return t&&"[object Function]"==={}.toString.call(t)}function A(t,e){if(1!==t.nodeType)return[];var n=t.ownerDocument.defaultView.getComputedStyle(t,null);return e?n[e]:n}function I(t){return"HTML"===t.nodeName?t:t.parentNode||t.host}function x(t){if(!t)return document.body;switch(t.nodeName){case"HTML":case"BODY":return t.ownerDocument.body;case"#document":return t.body}var e=A(t),n=e.overflow,i=e.overflowX,o=e.overflowY;return/(auto|scroll|overlay)/.test(n+o+i)?t:x(I(t))}function j(t){return t&&t.referenceNode?t.referenceNode:t}var L=D&&!(!window.MSInputMethodContext||!document.documentMode),P=D&&/MSIE 10/.test(navigator.userAgent);function F(t){return 11===t?L:10===t?P:L||P}function R(t){if(!t)return document.documentElement;for(var e=F(10)?document.body:null,n=t.offsetParent||null;n===e&&t.nextElementSibling;)n=(t=t.nextElementSibling).offsetParent;var i=n&&n.nodeName;return i&&"BODY"!==i&&"HTML"!==i?-1!==["TH","TD","TABLE"].indexOf(n.nodeName)&&"static"===A(n,"position")?R(n):n:t?t.ownerDocument.documentElement:document.documentElement}function M(t){return null!==t.parentNode?M(t.parentNode):t}function B(t,e){if(!(t&&t.nodeType&&e&&e.nodeType))return document.documentElement;var n=t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING,i=n?t:e,o=n?e:t,r=document.createRange();r.setStart(i,0),r.setEnd(o,0);var s,a,l=r.commonAncestorContainer;if(t!==l&&e!==l||i.contains(o))return"BODY"===(a=(s=l).nodeName)||"HTML"!==a&&R(s.firstElementChild)!==s?R(l):l;var c=M(t);return c.host?B(c.host,e):B(t,M(e).host)}function q(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"top",n="top"===e?"scrollTop":"scrollLeft",i=t.nodeName;if("BODY"===i||"HTML"===i){var o=t.ownerDocument.documentElement,r=t.ownerDocument.scrollingElement||o;return r[n]}return t[n]}function H(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=q(e,"top"),o=q(e,"left"),r=n?-1:1;return t.top+=i*r,t.bottom+=i*r,t.left+=o*r,t.right+=o*r,t}function Q(t,e){var n="x"===e?"Left":"Top",i="Left"===n?"Right":"Bottom";return parseFloat(t["border"+n+"Width"],10)+parseFloat(t["border"+i+"Width"],10)}function W(t,e,n,i){return Math.max(e["offset"+t],e["scroll"+t],n["client"+t],n["offset"+t],n["scroll"+t],F(10)?parseInt(n["offset"+t])+parseInt(i["margin"+("Height"===t?"Top":"Left")])+parseInt(i["margin"+("Height"===t?"Bottom":"Right")]):0)}function U(t){var e=t.body,n=t.documentElement,i=F(10)&&getComputedStyle(n);return{height:W("Height",e,n,i),width:W("Width",e,n,i)}}var V=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},Y=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),z=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t},X=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(t[i]=n[i])}return t};function K(t){return X({},t,{right:t.left+t.width,bottom:t.top+t.height})}function G(t){var e={};try{if(F(10)){e=t.getBoundingClientRect();var n=q(t,"top"),i=q(t,"left");e.top+=n,e.left+=i,e.bottom+=n,e.right+=i}else e=t.getBoundingClientRect()}catch(t){}var o={left:e.left,top:e.top,width:e.right-e.left,height:e.bottom-e.top},r="HTML"===t.nodeName?U(t.ownerDocument):{},s=r.width||t.clientWidth||o.width,a=r.height||t.clientHeight||o.height,l=t.offsetWidth-s,c=t.offsetHeight-a;if(l||c){var u=A(t);l-=Q(u,"x"),c-=Q(u,"y"),o.width-=l,o.height-=c}return K(o)}function $(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=F(10),o="HTML"===e.nodeName,r=G(t),s=G(e),a=x(t),l=A(e),c=parseFloat(l.borderTopWidth,10),u=parseFloat(l.borderLeftWidth,10);n&&o&&(s.top=Math.max(s.top,0),s.left=Math.max(s.left,0));var h=K({top:r.top-s.top-c,left:r.left-s.left-u,width:r.width,height:r.height});if(h.marginTop=0,h.marginLeft=0,!i&&o){var f=parseFloat(l.marginTop,10),d=parseFloat(l.marginLeft,10);h.top-=c-f,h.bottom-=c-f,h.left-=u-d,h.right-=u-d,h.marginTop=f,h.marginLeft=d}return(i&&!n?e.contains(a):e===a&&"BODY"!==a.nodeName)&&(h=H(h,e)),h}function J(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=t.ownerDocument.documentElement,i=$(t,n),o=Math.max(n.clientWidth,window.innerWidth||0),r=Math.max(n.clientHeight,window.innerHeight||0),s=e?0:q(n),a=e?0:q(n,"left"),l={top:s-i.top+i.marginTop,left:a-i.left+i.marginLeft,width:o,height:r};return K(l)}function Z(t){var e=t.nodeName;if("BODY"===e||"HTML"===e)return!1;if("fixed"===A(t,"position"))return!0;var n=I(t);return!!n&&Z(n)}function tt(t){if(!t||!t.parentElement||F())return document.documentElement;for(var e=t.parentElement;e&&"none"===A(e,"transform");)e=e.parentElement;return e||document.documentElement}function et(t,e,n,i){var o=arguments.length>4&&void 0!==arguments[4]&&arguments[4],r={top:0,left:0},s=o?tt(t):B(t,j(e));if("viewport"===i)r=J(s,o);else{var a=void 0;"scrollParent"===i?"BODY"===(a=x(I(e))).nodeName&&(a=t.ownerDocument.documentElement):a="window"===i?t.ownerDocument.documentElement:i;var l=$(a,s,o);if("HTML"!==a.nodeName||Z(s))r=l;else{var c=U(t.ownerDocument),u=c.height,h=c.width;r.top+=l.top-l.marginTop,r.bottom=u+l.top,r.left+=l.left-l.marginLeft,r.right=h+l.left}}var f="number"==typeof(n=n||0);return r.left+=f?n:n.left||0,r.top+=f?n:n.top||0,r.right-=f?n:n.right||0,r.bottom-=f?n:n.bottom||0,r}function nt(t){return t.width*t.height}function it(t,e,n,i,o){var r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0;if(-1===t.indexOf("auto"))return t;var s=et(n,i,r,o),a={top:{width:s.width,height:e.top-s.top},right:{width:s.right-e.right,height:s.height},bottom:{width:s.width,height:s.bottom-e.bottom},left:{width:e.left-s.left,height:s.height}},l=Object.keys(a).map((function(t){return X({key:t},a[t],{area:nt(a[t])})})).sort((function(t,e){return e.area-t.area})),c=l.filter((function(t){var e=t.width,i=t.height;return e>=n.clientWidth&&i>=n.clientHeight})),u=c.length>0?c[0].key:l[0].key,h=t.split("-")[1];return u+(h?"-"+h:"")}function ot(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,o=i?tt(e):B(e,j(n));return $(n,o,i)}function rt(t){var e=t.ownerDocument.defaultView.getComputedStyle(t),n=parseFloat(e.marginTop||0)+parseFloat(e.marginBottom||0),i=parseFloat(e.marginLeft||0)+parseFloat(e.marginRight||0);return{width:t.offsetWidth+i,height:t.offsetHeight+n}}function st(t){var e={left:"right",right:"left",bottom:"top",top:"bottom"};return t.replace(/left|right|bottom|top/g,(function(t){return e[t]}))}function at(t,e,n){n=n.split("-")[0];var i=rt(t),o={width:i.width,height:i.height},r=-1!==["right","left"].indexOf(n),s=r?"top":"left",a=r?"left":"top",l=r?"height":"width",c=r?"width":"height";return o[s]=e[s]+e[l]/2-i[l]/2,o[a]=n===a?e[a]-i[c]:e[st(a)],o}function lt(t,e){return Array.prototype.find?t.find(e):t.filter(e)[0]}function ct(t,e,n){return(void 0===n?t:t.slice(0,function(t,e,n){if(Array.prototype.findIndex)return t.findIndex((function(t){return t[e]===n}));var i=lt(t,(function(t){return t[e]===n}));return t.indexOf(i)}(t,"name",n))).forEach((function(t){t.function&&console.warn("`modifier.function` is deprecated, use `modifier.fn`!");var n=t.function||t.fn;t.enabled&&O(n)&&(e.offsets.popper=K(e.offsets.popper),e.offsets.reference=K(e.offsets.reference),e=n(e,t))})),e}function ut(){if(!this.state.isDestroyed){var t={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};t.offsets.reference=ot(this.state,this.popper,this.reference,this.options.positionFixed),t.placement=it(this.options.placement,t.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),t.originalPlacement=t.placement,t.positionFixed=this.options.positionFixed,t.offsets.popper=at(this.popper,t.offsets.reference,t.placement),t.offsets.popper.position=this.options.positionFixed?"fixed":"absolute",t=ct(this.modifiers,t),this.state.isCreated?this.options.onUpdate(t):(this.state.isCreated=!0,this.options.onCreate(t))}}function ht(t,e){return t.some((function(t){var n=t.name;return t.enabled&&n===e}))}function ft(t){for(var e=[!1,"ms","Webkit","Moz","O"],n=t.charAt(0).toUpperCase()+t.slice(1),i=0;i<e.length;i++){var o=e[i],r=o?""+o+n:t;if("undefined"!=typeof document.body.style[r])return r}return null}function dt(){return this.state.isDestroyed=!0,ht(this.modifiers,"applyStyle")&&(this.popper.removeAttribute("x-placement"),this.popper.style.position="",this.popper.style.top="",this.popper.style.left="",this.popper.style.right="",this.popper.style.bottom="",this.popper.style.willChange="",this.popper.style[ft("transform")]=""),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function pt(t){var e=t.ownerDocument;return e?e.defaultView:window}function mt(t,e,n,i){n.updateBound=i,pt(t).addEventListener("resize",n.updateBound,{passive:!0});var o=x(t);return function t(e,n,i,o){var r="BODY"===e.nodeName,s=r?e.ownerDocument.defaultView:e;s.addEventListener(n,i,{passive:!0}),r||t(x(s.parentNode),n,i,o),o.push(s)}(o,"scroll",n.updateBound,n.scrollParents),n.scrollElement=o,n.eventsEnabled=!0,n}function gt(){this.state.eventsEnabled||(this.state=mt(this.reference,this.options,this.state,this.scheduleUpdate))}function vt(){var t,e;this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=(t=this.reference,e=this.state,pt(t).removeEventListener("resize",e.updateBound),e.scrollParents.forEach((function(t){t.removeEventListener("scroll",e.updateBound)})),e.updateBound=null,e.scrollParents=[],e.scrollElement=null,e.eventsEnabled=!1,e))}function _t(t){return""!==t&&!isNaN(parseFloat(t))&&isFinite(t)}function bt(t,e){Object.keys(e).forEach((function(n){var i="";-1!==["width","height","top","right","bottom","left"].indexOf(n)&&_t(e[n])&&(i="px"),t.style[n]=e[n]+i}))}var yt=D&&/Firefox/i.test(navigator.userAgent);function wt(t,e,n){var i=lt(t,(function(t){return t.name===e})),o=!!i&&t.some((function(t){return t.name===n&&t.enabled&&t.order<i.order}));if(!o){var r="`"+e+"`",s="`"+n+"`";console.warn(s+" modifier is required by "+r+" modifier in order to work, be sure to include it before "+r+"!")}return o}var Et=["auto-start","auto","auto-end","top-start","top","top-end","right-start","right","right-end","bottom-end","bottom","bottom-start","left-end","left","left-start"],Tt=Et.slice(3);function Ct(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=Tt.indexOf(t),i=Tt.slice(n+1).concat(Tt.slice(0,n));return e?i.reverse():i}var St="flip",Dt="clockwise",kt="counterclockwise";function Nt(t,e,n,i){var o=[0,0],r=-1!==["right","left"].indexOf(i),s=t.split(/(\+|\-)/).map((function(t){return t.trim()})),a=s.indexOf(lt(s,(function(t){return-1!==t.search(/,|\s/)})));s[a]&&-1===s[a].indexOf(",")&&console.warn("Offsets separated by white space(s) are deprecated, use a comma (,) instead.");var l=/\s*,\s*|\s+/,c=-1!==a?[s.slice(0,a).concat([s[a].split(l)[0]]),[s[a].split(l)[1]].concat(s.slice(a+1))]:[s];return(c=c.map((function(t,i){var o=(1===i?!r:r)?"height":"width",s=!1;return t.reduce((function(t,e){return""===t[t.length-1]&&-1!==["+","-"].indexOf(e)?(t[t.length-1]=e,s=!0,t):s?(t[t.length-1]+=e,s=!1,t):t.concat(e)}),[]).map((function(t){return function(t,e,n,i){var o=t.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),r=+o[1],s=o[2];if(!r)return t;if(0===s.indexOf("%")){var a=void 0;switch(s){case"%p":a=n;break;case"%":case"%r":default:a=i}return K(a)[e]/100*r}if("vh"===s||"vw"===s){return("vh"===s?Math.max(document.documentElement.clientHeight,window.innerHeight||0):Math.max(document.documentElement.clientWidth,window.innerWidth||0))/100*r}return r}(t,o,e,n)}))}))).forEach((function(t,e){t.forEach((function(n,i){_t(n)&&(o[e]+=n*("-"===t[i-1]?-1:1))}))})),o}var Ot={placement:"bottom",positionFixed:!1,eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:{shift:{order:100,enabled:!0,fn:function(t){var e=t.placement,n=e.split("-")[0],i=e.split("-")[1];if(i){var o=t.offsets,r=o.reference,s=o.popper,a=-1!==["bottom","top"].indexOf(n),l=a?"left":"top",c=a?"width":"height",u={start:z({},l,r[l]),end:z({},l,r[l]+r[c]-s[c])};t.offsets.popper=X({},s,u[i])}return t}},offset:{order:200,enabled:!0,fn:function(t,e){var n=e.offset,i=t.placement,o=t.offsets,r=o.popper,s=o.reference,a=i.split("-")[0],l=void 0;return l=_t(+n)?[+n,0]:Nt(n,r,s,a),"left"===a?(r.top+=l[0],r.left-=l[1]):"right"===a?(r.top+=l[0],r.left+=l[1]):"top"===a?(r.left+=l[0],r.top-=l[1]):"bottom"===a&&(r.left+=l[0],r.top+=l[1]),t.popper=r,t},offset:0},preventOverflow:{order:300,enabled:!0,fn:function(t,e){var n=e.boundariesElement||R(t.instance.popper);t.instance.reference===n&&(n=R(n));var i=ft("transform"),o=t.instance.popper.style,r=o.top,s=o.left,a=o[i];o.top="",o.left="",o[i]="";var l=et(t.instance.popper,t.instance.reference,e.padding,n,t.positionFixed);o.top=r,o.left=s,o[i]=a,e.boundaries=l;var c=e.priority,u=t.offsets.popper,h={primary:function(t){var n=u[t];return u[t]<l[t]&&!e.escapeWithReference&&(n=Math.max(u[t],l[t])),z({},t,n)},secondary:function(t){var n="right"===t?"left":"top",i=u[n];return u[t]>l[t]&&!e.escapeWithReference&&(i=Math.min(u[n],l[t]-("right"===t?u.width:u.height))),z({},n,i)}};return c.forEach((function(t){var e=-1!==["left","top"].indexOf(t)?"primary":"secondary";u=X({},u,h[e](t))})),t.offsets.popper=u,t},priority:["left","right","top","bottom"],padding:5,boundariesElement:"scrollParent"},keepTogether:{order:400,enabled:!0,fn:function(t){var e=t.offsets,n=e.popper,i=e.reference,o=t.placement.split("-")[0],r=Math.floor,s=-1!==["top","bottom"].indexOf(o),a=s?"right":"bottom",l=s?"left":"top",c=s?"width":"height";return n[a]<r(i[l])&&(t.offsets.popper[l]=r(i[l])-n[c]),n[l]>r(i[a])&&(t.offsets.popper[l]=r(i[a])),t}},arrow:{order:500,enabled:!0,fn:function(t,e){var n;if(!wt(t.instance.modifiers,"arrow","keepTogether"))return t;var i=e.element;if("string"==typeof i){if(!(i=t.instance.popper.querySelector(i)))return t}else if(!t.instance.popper.contains(i))return console.warn("WARNING: `arrow.element` must be child of its popper element!"),t;var o=t.placement.split("-")[0],r=t.offsets,s=r.popper,a=r.reference,l=-1!==["left","right"].indexOf(o),c=l?"height":"width",u=l?"Top":"Left",h=u.toLowerCase(),f=l?"left":"top",d=l?"bottom":"right",p=rt(i)[c];a[d]-p<s[h]&&(t.offsets.popper[h]-=s[h]-(a[d]-p)),a[h]+p>s[d]&&(t.offsets.popper[h]+=a[h]+p-s[d]),t.offsets.popper=K(t.offsets.popper);var m=a[h]+a[c]/2-p/2,g=A(t.instance.popper),v=parseFloat(g["margin"+u],10),_=parseFloat(g["border"+u+"Width"],10),b=m-t.offsets.popper[h]-v-_;return b=Math.max(Math.min(s[c]-p,b),0),t.arrowElement=i,t.offsets.arrow=(z(n={},h,Math.round(b)),z(n,f,""),n),t},element:"[x-arrow]"},flip:{order:600,enabled:!0,fn:function(t,e){if(ht(t.instance.modifiers,"inner"))return t;if(t.flipped&&t.placement===t.originalPlacement)return t;var n=et(t.instance.popper,t.instance.reference,e.padding,e.boundariesElement,t.positionFixed),i=t.placement.split("-")[0],o=st(i),r=t.placement.split("-")[1]||"",s=[];switch(e.behavior){case St:s=[i,o];break;case Dt:s=Ct(i);break;case kt:s=Ct(i,!0);break;default:s=e.behavior}return s.forEach((function(a,l){if(i!==a||s.length===l+1)return t;i=t.placement.split("-")[0],o=st(i);var c=t.offsets.popper,u=t.offsets.reference,h=Math.floor,f="left"===i&&h(c.right)>h(u.left)||"right"===i&&h(c.left)<h(u.right)||"top"===i&&h(c.bottom)>h(u.top)||"bottom"===i&&h(c.top)<h(u.bottom),d=h(c.left)<h(n.left),p=h(c.right)>h(n.right),m=h(c.top)<h(n.top),g=h(c.bottom)>h(n.bottom),v="left"===i&&d||"right"===i&&p||"top"===i&&m||"bottom"===i&&g,_=-1!==["top","bottom"].indexOf(i),b=!!e.flipVariations&&(_&&"start"===r&&d||_&&"end"===r&&p||!_&&"start"===r&&m||!_&&"end"===r&&g),y=!!e.flipVariationsByContent&&(_&&"start"===r&&p||_&&"end"===r&&d||!_&&"start"===r&&g||!_&&"end"===r&&m),w=b||y;(f||v||w)&&(t.flipped=!0,(f||v)&&(i=s[l+1]),w&&(r=function(t){return"end"===t?"start":"start"===t?"end":t}(r)),t.placement=i+(r?"-"+r:""),t.offsets.popper=X({},t.offsets.popper,at(t.instance.popper,t.offsets.reference,t.placement)),t=ct(t.instance.modifiers,t,"flip"))})),t},behavior:"flip",padding:5,boundariesElement:"viewport",flipVariations:!1,flipVariationsByContent:!1},inner:{order:700,enabled:!1,fn:function(t){var e=t.placement,n=e.split("-")[0],i=t.offsets,o=i.popper,r=i.reference,s=-1!==["left","right"].indexOf(n),a=-1===["top","left"].indexOf(n);return o[s?"left":"top"]=r[n]-(a?o[s?"width":"height"]:0),t.placement=st(e),t.offsets.popper=K(o),t}},hide:{order:800,enabled:!0,fn:function(t){if(!wt(t.instance.modifiers,"hide","preventOverflow"))return t;var e=t.offsets.reference,n=lt(t.instance.modifiers,(function(t){return"preventOverflow"===t.name})).boundaries;if(e.bottom<n.top||e.left>n.right||e.top>n.bottom||e.right<n.left){if(!0===t.hide)return t;t.hide=!0,t.attributes["x-out-of-boundaries"]=""}else{if(!1===t.hide)return t;t.hide=!1,t.attributes["x-out-of-boundaries"]=!1}return t}},computeStyle:{order:850,enabled:!0,fn:function(t,e){var n=e.x,i=e.y,o=t.offsets.popper,r=lt(t.instance.modifiers,(function(t){return"applyStyle"===t.name})).gpuAcceleration;void 0!==r&&console.warn("WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!");var s=void 0!==r?r:e.gpuAcceleration,a=R(t.instance.popper),l=G(a),c={position:o.position},u=function(t,e){var n=t.offsets,i=n.popper,o=n.reference,r=Math.round,s=Math.floor,a=function(t){return t},l=r(o.width),c=r(i.width),u=-1!==["left","right"].indexOf(t.placement),h=-1!==t.placement.indexOf("-"),f=e?u||h||l%2==c%2?r:s:a,d=e?r:a;return{left:f(l%2==1&&c%2==1&&!h&&e?i.left-1:i.left),top:d(i.top),bottom:d(i.bottom),right:f(i.right)}}(t,window.devicePixelRatio<2||!yt),h="bottom"===n?"top":"bottom",f="right"===i?"left":"right",d=ft("transform"),p=void 0,m=void 0;if(m="bottom"===h?"HTML"===a.nodeName?-a.clientHeight+u.bottom:-l.height+u.bottom:u.top,p="right"===f?"HTML"===a.nodeName?-a.clientWidth+u.right:-l.width+u.right:u.left,s&&d)c[d]="translate3d("+p+"px, "+m+"px, 0)",c[h]=0,c[f]=0,c.willChange="transform";else{var g="bottom"===h?-1:1,v="right"===f?-1:1;c[h]=m*g,c[f]=p*v,c.willChange=h+", "+f}var _={"x-placement":t.placement};return t.attributes=X({},_,t.attributes),t.styles=X({},c,t.styles),t.arrowStyles=X({},t.offsets.arrow,t.arrowStyles),t},gpuAcceleration:!0,x:"bottom",y:"right"},applyStyle:{order:900,enabled:!0,fn:function(t){var e,n;return bt(t.instance.popper,t.styles),e=t.instance.popper,n=t.attributes,Object.keys(n).forEach((function(t){!1!==n[t]?e.setAttribute(t,n[t]):e.removeAttribute(t)})),t.arrowElement&&Object.keys(t.arrowStyles).length&&bt(t.arrowElement,t.arrowStyles),t},onLoad:function(t,e,n,i,o){var r=ot(o,e,t,n.positionFixed),s=it(n.placement,r,e,t,n.modifiers.flip.boundariesElement,n.modifiers.flip.padding);return e.setAttribute("x-placement",s),bt(e,{position:n.positionFixed?"fixed":"absolute"}),n},gpuAcceleration:void 0}}},At=function(){function t(e,n){var i=this,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};V(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(i.update)},this.update=N(this.update.bind(this)),this.options=X({},t.Defaults,o),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=e&&e.jquery?e[0]:e,this.popper=n&&n.jquery?n[0]:n,this.options.modifiers={},Object.keys(X({},t.Defaults.modifiers,o.modifiers)).forEach((function(e){i.options.modifiers[e]=X({},t.Defaults.modifiers[e]||{},o.modifiers?o.modifiers[e]:{})})),this.modifiers=Object.keys(this.options.modifiers).map((function(t){return X({name:t},i.options.modifiers[t])})).sort((function(t,e){return t.order-e.order})),this.modifiers.forEach((function(t){t.enabled&&O(t.onLoad)&&t.onLoad(i.reference,i.popper,i.options,t,i.state)})),this.update();var r=this.options.eventsEnabled;r&&this.enableEventListeners(),this.state.eventsEnabled=r}return Y(t,[{key:"update",value:function(){return ut.call(this)}},{key:"destroy",value:function(){return dt.call(this)}},{key:"enableEventListeners",value:function(){return gt.call(this)}},{key:"disableEventListeners",value:function(){return vt.call(this)}}]),t}();At.Utils=("undefined"!=typeof window?window:global).PopperUtils,At.placements=Et,At.Defaults=Ot;var It="dropdown",xt=e.fn[It],jt=new RegExp("38|40|27"),Lt={offset:0,flip:!0,boundary:"scrollParent",reference:"toggle",display:"dynamic",popperConfig:null},Pt={offset:"(number|string|function)",flip:"boolean",boundary:"(string|element)",reference:"(string|element)",display:"string",popperConfig:"(null|object)"},Ft=function(){function t(t,e){this._element=t,this._popper=null,this._config=this._getConfig(e),this._menu=this._getMenuElement(),this._inNavbar=this._detectNavbar(),this._addEventListeners()}var n=t.prototype;return n.toggle=function(){if(!this._element.disabled&&!e(this._element).hasClass("disabled")){var n=e(this._menu).hasClass("show");t._clearMenus(),n||this.show(!0)}},n.show=function(n){if(void 0===n&&(n=!1),!(this._element.disabled||e(this._element).hasClass("disabled")||e(this._menu).hasClass("show"))){var i={relatedTarget:this._element},o=e.Event("show.bs.dropdown",i),r=t._getParentFromElement(this._element);if(e(r).trigger(o),!o.isDefaultPrevented()){if(!this._inNavbar&&n){if("undefined"==typeof At)throw new TypeError("Bootstrap's dropdowns require Popper.js (https://popper.js.org/)");var s=this._element;"parent"===this._config.reference?s=r:l.isElement(this._config.reference)&&(s=this._config.reference,"undefined"!=typeof this._config.reference.jquery&&(s=this._config.reference[0])),"scrollParent"!==this._config.boundary&&e(r).addClass("position-static"),this._popper=new At(s,this._menu,this._getPopperConfig())}"ontouchstart"in document.documentElement&&0===e(r).closest(".navbar-nav").length&&e(document.body).children().on("mouseover",null,e.noop),this._element.focus(),this._element.setAttribute("aria-expanded",!0),e(this._menu).toggleClass("show"),e(r).toggleClass("show").trigger(e.Event("shown.bs.dropdown",i))}}},n.hide=function(){if(!this._element.disabled&&!e(this._element).hasClass("disabled")&&e(this._menu).hasClass("show")){var n={relatedTarget:this._element},i=e.Event("hide.bs.dropdown",n),o=t._getParentFromElement(this._element);e(o).trigger(i),i.isDefaultPrevented()||(this._popper&&this._popper.destroy(),e(this._menu).toggleClass("show"),e(o).toggleClass("show").trigger(e.Event("hidden.bs.dropdown",n)))}},n.dispose=function(){e.removeData(this._element,"bs.dropdown"),e(this._element).off(".bs.dropdown"),this._element=null,this._menu=null,null!==this._popper&&(this._popper.destroy(),this._popper=null)},n.update=function(){this._inNavbar=this._detectNavbar(),null!==this._popper&&this._popper.scheduleUpdate()},n._addEventListeners=function(){var t=this;e(this._element).on("click.bs.dropdown",(function(e){e.preventDefault(),e.stopPropagation(),t.toggle()}))},n._getConfig=function(t){return t=s(s(s({},this.constructor.Default),e(this._element).data()),t),l.typeCheckConfig(It,t,this.constructor.DefaultType),t},n._getMenuElement=function(){if(!this._menu){var e=t._getParentFromElement(this._element);e&&(this._menu=e.querySelector(".dropdown-menu"))}return this._menu},n._getPlacement=function(){var t=e(this._element.parentNode),n="bottom-start";return t.hasClass("dropup")?n=e(this._menu).hasClass("dropdown-menu-right")?"top-end":"top-start":t.hasClass("dropright")?n="right-start":t.hasClass("dropleft")?n="left-start":e(this._menu).hasClass("dropdown-menu-right")&&(n="bottom-end"),n},n._detectNavbar=function(){return e(this._element).closest(".navbar").length>0},n._getOffset=function(){var t=this,e={};return"function"==typeof this._config.offset?e.fn=function(e){return e.offsets=s(s({},e.offsets),t._config.offset(e.offsets,t._element)||{}),e}:e.offset=this._config.offset,e},n._getPopperConfig=function(){var t={placement:this._getPlacement(),modifiers:{offset:this._getOffset(),flip:{enabled:this._config.flip},preventOverflow:{boundariesElement:this._config.boundary}}};return"static"===this._config.display&&(t.modifiers.applyStyle={enabled:!1}),s(s({},t),this._config.popperConfig)},t._jQueryInterface=function(n){return this.each((function(){var i=e(this).data("bs.dropdown");if(i||(i=new t(this,"object"==typeof n?n:null),e(this).data("bs.dropdown",i)),"string"==typeof n){if("undefined"==typeof i[n])throw new TypeError('No method named "'+n+'"');i[n]()}}))},t._clearMenus=function(n){if(!n||3!==n.which&&("keyup"!==n.type||9===n.which))for(var i=[].slice.call(document.querySelectorAll('[data-toggle="dropdown"]')),o=0,r=i.length;o<r;o++){var s=t._getParentFromElement(i[o]),a=e(i[o]).data("bs.dropdown"),l={relatedTarget:i[o]};if(n&&"click"===n.type&&(l.clickEvent=n),a){var c=a._menu;if(e(s).hasClass("show")&&!(n&&("click"===n.type&&/input|textarea/i.test(n.target.tagName)||"keyup"===n.type&&9===n.which)&&e.contains(s,n.target))){var u=e.Event("hide.bs.dropdown",l);e(s).trigger(u),u.isDefaultPrevented()||("ontouchstart"in document.documentElement&&e(document.body).children().off("mouseover",null,e.noop),i[o].setAttribute("aria-expanded","false"),a._popper&&a._popper.destroy(),e(c).removeClass("show"),e(s).removeClass("show").trigger(e.Event("hidden.bs.dropdown",l)))}}}},t._getParentFromElement=function(t){var e,n=l.getSelectorFromElement(t);return n&&(e=document.querySelector(n)),e||t.parentNode},t._dataApiKeydownHandler=function(n){if(!(/input|textarea/i.test(n.target.tagName)?32===n.which||27!==n.which&&(40!==n.which&&38!==n.which||e(n.target).closest(".dropdown-menu").length):!jt.test(n.which))&&!this.disabled&&!e(this).hasClass("disabled")){var i=t._getParentFromElement(this),o=e(i).hasClass("show");if(o||27!==n.which){if(n.preventDefault(),n.stopPropagation(),!o||o&&(27===n.which||32===n.which))return 27===n.which&&e(i.querySelector('[data-toggle="dropdown"]')).trigger("focus"),void e(this).trigger("click");var r=[].slice.call(i.querySelectorAll(".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)")).filter((function(t){return e(t).is(":visible")}));if(0!==r.length){var s=r.indexOf(n.target);38===n.which&&s>0&&s--,40===n.which&&s<r.length-1&&s++,s<0&&(s=0),r[s].focus()}}}},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return Lt}},{key:"DefaultType",get:function(){return Pt}}]),t}();e(document).on("keydown.bs.dropdown.data-api",'[data-toggle="dropdown"]',Ft._dataApiKeydownHandler).on("keydown.bs.dropdown.data-api",".dropdown-menu",Ft._dataApiKeydownHandler).on("click.bs.dropdown.data-api keyup.bs.dropdown.data-api",Ft._clearMenus).on("click.bs.dropdown.data-api",'[data-toggle="dropdown"]',(function(t){t.preventDefault(),t.stopPropagation(),Ft._jQueryInterface.call(e(this),"toggle")})).on("click.bs.dropdown.data-api",".dropdown form",(function(t){t.stopPropagation()})),e.fn[It]=Ft._jQueryInterface,e.fn[It].Constructor=Ft,e.fn[It].noConflict=function(){return e.fn[It]=xt,Ft._jQueryInterface};var Rt=e.fn.modal,Mt={backdrop:!0,keyboard:!0,focus:!0,show:!0},Bt={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},qt=function(){function t(t,e){this._config=this._getConfig(e),this._element=t,this._dialog=t.querySelector(".modal-dialog"),this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._isTransitioning=!1,this._scrollbarWidth=0}var n=t.prototype;return n.toggle=function(t){return this._isShown?this.hide():this.show(t)},n.show=function(t){var n=this;if(!this._isShown&&!this._isTransitioning){e(this._element).hasClass("fade")&&(this._isTransitioning=!0);var i=e.Event("show.bs.modal",{relatedTarget:t});e(this._element).trigger(i),this._isShown||i.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),e(this._element).on("click.dismiss.bs.modal",'[data-dismiss="modal"]',(function(t){return n.hide(t)})),e(this._dialog).on("mousedown.dismiss.bs.modal",(function(){e(n._element).one("mouseup.dismiss.bs.modal",(function(t){e(t.target).is(n._element)&&(n._ignoreBackdropClick=!0)}))})),this._showBackdrop((function(){return n._showElement(t)})))}},n.hide=function(t){var n=this;if(t&&t.preventDefault(),this._isShown&&!this._isTransitioning){var i=e.Event("hide.bs.modal");if(e(this._element).trigger(i),this._isShown&&!i.isDefaultPrevented()){this._isShown=!1;var o=e(this._element).hasClass("fade");if(o&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),e(document).off("focusin.bs.modal"),e(this._element).removeClass("show"),e(this._element).off("click.dismiss.bs.modal"),e(this._dialog).off("mousedown.dismiss.bs.modal"),o){var r=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,(function(t){return n._hideModal(t)})).emulateTransitionEnd(r)}else this._hideModal()}}},n.dispose=function(){[window,this._element,this._dialog].forEach((function(t){return e(t).off(".bs.modal")})),e(document).off("focusin.bs.modal"),e.removeData(this._element,"bs.modal"),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._isTransitioning=null,this._scrollbarWidth=null},n.handleUpdate=function(){this._adjustDialog()},n._getConfig=function(t){return t=s(s({},Mt),t),l.typeCheckConfig("modal",t,Bt),t},n._triggerBackdropTransition=function(){var t=this;if("static"===this._config.backdrop){var n=e.Event("hidePrevented.bs.modal");if(e(this._element).trigger(n),n.defaultPrevented)return;this._element.classList.add("modal-static");var i=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,(function(){t._element.classList.remove("modal-static")})).emulateTransitionEnd(i),this._element.focus()}else this.hide()},n._showElement=function(t){var n=this,i=e(this._element).hasClass("fade"),o=this._dialog?this._dialog.querySelector(".modal-body"):null;this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),e(this._dialog).hasClass("modal-dialog-scrollable")&&o?o.scrollTop=0:this._element.scrollTop=0,i&&l.reflow(this._element),e(this._element).addClass("show"),this._config.focus&&this._enforceFocus();var r=e.Event("shown.bs.modal",{relatedTarget:t}),s=function(){n._config.focus&&n._element.focus(),n._isTransitioning=!1,e(n._element).trigger(r)};if(i){var a=l.getTransitionDurationFromElement(this._dialog);e(this._dialog).one(l.TRANSITION_END,s).emulateTransitionEnd(a)}else s()},n._enforceFocus=function(){var t=this;e(document).off("focusin.bs.modal").on("focusin.bs.modal",(function(n){document!==n.target&&t._element!==n.target&&0===e(t._element).has(n.target).length&&t._element.focus()}))},n._setEscapeEvent=function(){var t=this;this._isShown?e(this._element).on("keydown.dismiss.bs.modal",(function(e){t._config.keyboard&&27===e.which?(e.preventDefault(),t.hide()):t._config.keyboard||27!==e.which||t._triggerBackdropTransition()})):this._isShown||e(this._element).off("keydown.dismiss.bs.modal")},n._setResizeEvent=function(){var t=this;this._isShown?e(window).on("resize.bs.modal",(function(e){return t.handleUpdate(e)})):e(window).off("resize.bs.modal")},n._hideModal=function(){var t=this;this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._isTransitioning=!1,this._showBackdrop((function(){e(document.body).removeClass("modal-open"),t._resetAdjustments(),t._resetScrollbar(),e(t._element).trigger("hidden.bs.modal")}))},n._removeBackdrop=function(){this._backdrop&&(e(this._backdrop).remove(),this._backdrop=null)},n._showBackdrop=function(t){var n=this,i=e(this._element).hasClass("fade")?"fade":"";if(this._isShown&&this._config.backdrop){if(this._backdrop=document.createElement("div"),this._backdrop.className="modal-backdrop",i&&this._backdrop.classList.add(i),e(this._backdrop).appendTo(document.body),e(this._element).on("click.dismiss.bs.modal",(function(t){n._ignoreBackdropClick?n._ignoreBackdropClick=!1:t.target===t.currentTarget&&n._triggerBackdropTransition()})),i&&l.reflow(this._backdrop),e(this._backdrop).addClass("show"),!t)return;if(!i)return void t();var o=l.getTransitionDurationFromElement(this._backdrop);e(this._backdrop).one(l.TRANSITION_END,t).emulateTransitionEnd(o)}else if(!this._isShown&&this._backdrop){e(this._backdrop).removeClass("show");var r=function(){n._removeBackdrop(),t&&t()};if(e(this._element).hasClass("fade")){var s=l.getTransitionDurationFromElement(this._backdrop);e(this._backdrop).one(l.TRANSITION_END,r).emulateTransitionEnd(s)}else r()}else t&&t()},n._adjustDialog=function(){var t=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&t&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!t&&(this._element.style.paddingRight=this._scrollbarWidth+"px")},n._resetAdjustments=function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""},n._checkScrollbar=function(){var t=document.body.getBoundingClientRect();this._isBodyOverflowing=Math.round(t.left+t.right)<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()},n._setScrollbar=function(){var t=this;if(this._isBodyOverflowing){var n=[].slice.call(document.querySelectorAll(".fixed-top, .fixed-bottom, .is-fixed, .sticky-top")),i=[].slice.call(document.querySelectorAll(".sticky-top"));e(n).each((function(n,i){var o=i.style.paddingRight,r=e(i).css("padding-right");e(i).data("padding-right",o).css("padding-right",parseFloat(r)+t._scrollbarWidth+"px")})),e(i).each((function(n,i){var o=i.style.marginRight,r=e(i).css("margin-right");e(i).data("margin-right",o).css("margin-right",parseFloat(r)-t._scrollbarWidth+"px")}));var o=document.body.style.paddingRight,r=e(document.body).css("padding-right");e(document.body).data("padding-right",o).css("padding-right",parseFloat(r)+this._scrollbarWidth+"px")}e(document.body).addClass("modal-open")},n._resetScrollbar=function(){var t=[].slice.call(document.querySelectorAll(".fixed-top, .fixed-bottom, .is-fixed, .sticky-top"));e(t).each((function(t,n){var i=e(n).data("padding-right");e(n).removeData("padding-right"),n.style.paddingRight=i||""}));var n=[].slice.call(document.querySelectorAll(".sticky-top"));e(n).each((function(t,n){var i=e(n).data("margin-right");"undefined"!=typeof i&&e(n).css("margin-right",i).removeData("margin-right")}));var i=e(document.body).data("padding-right");e(document.body).removeData("padding-right"),document.body.style.paddingRight=i||""},n._getScrollbarWidth=function(){var t=document.createElement("div");t.className="modal-scrollbar-measure",document.body.appendChild(t);var e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e},t._jQueryInterface=function(n,i){return this.each((function(){var o=e(this).data("bs.modal"),r=s(s(s({},Mt),e(this).data()),"object"==typeof n&&n?n:{});if(o||(o=new t(this,r),e(this).data("bs.modal",o)),"string"==typeof n){if("undefined"==typeof o[n])throw new TypeError('No method named "'+n+'"');o[n](i)}else r.show&&o.show(i)}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return Mt}}]),t}();e(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',(function(t){var n,i=this,o=l.getSelectorFromElement(this);o&&(n=document.querySelector(o));var r=e(n).data("bs.modal")?"toggle":s(s({},e(n).data()),e(this).data());"A"!==this.tagName&&"AREA"!==this.tagName||t.preventDefault();var a=e(n).one("show.bs.modal",(function(t){t.isDefaultPrevented()||a.one("hidden.bs.modal",(function(){e(i).is(":visible")&&i.focus()}))}));qt._jQueryInterface.call(e(n),r,this)})),e.fn.modal=qt._jQueryInterface,e.fn.modal.Constructor=qt,e.fn.modal.noConflict=function(){return e.fn.modal=Rt,qt._jQueryInterface};var Ht=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],Qt={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","srcset","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Wt=/^(?:(?:https?|mailto|ftp|tel|file):|[^#&/:?]*(?:[#/?]|$))/gi,Ut=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;function Vt(t,e,n){if(0===t.length)return t;if(n&&"function"==typeof n)return n(t);for(var i=(new window.DOMParser).parseFromString(t,"text/html"),o=Object.keys(e),r=[].slice.call(i.body.querySelectorAll("*")),s=function(t,n){var i=r[t],s=i.nodeName.toLowerCase();if(-1===o.indexOf(i.nodeName.toLowerCase()))return i.parentNode.removeChild(i),"continue";var a=[].slice.call(i.attributes),l=[].concat(e["*"]||[],e[s]||[]);a.forEach((function(t){(function(t,e){var n=t.nodeName.toLowerCase();if(-1!==e.indexOf(n))return-1===Ht.indexOf(n)||Boolean(t.nodeValue.match(Wt)||t.nodeValue.match(Ut));for(var i=e.filter((function(t){return t instanceof RegExp})),o=0,r=i.length;o<r;o++)if(n.match(i[o]))return!0;return!1})(t,l)||i.removeAttribute(t.nodeName)}))},a=0,l=r.length;a<l;a++)s(a);return i.body.innerHTML}var Yt="tooltip",zt=e.fn[Yt],Xt=new RegExp("(^|\\s)bs-tooltip\\S+","g"),Kt=["sanitize","whiteList","sanitizeFn"],Gt={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"(number|string|function)",container:"(string|element|boolean)",fallbackPlacement:"(string|array)",boundary:"(string|element)",sanitize:"boolean",sanitizeFn:"(null|function)",whiteList:"object",popperConfig:"(null|object)"},$t={AUTO:"auto",TOP:"top",RIGHT:"right",BOTTOM:"bottom",LEFT:"left"},Jt={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:0,container:!1,fallbackPlacement:"flip",boundary:"scrollParent",sanitize:!0,sanitizeFn:null,whiteList:Qt,popperConfig:null},Zt={HIDE:"hide.bs.tooltip",HIDDEN:"hidden.bs.tooltip",SHOW:"show.bs.tooltip",SHOWN:"shown.bs.tooltip",INSERTED:"inserted.bs.tooltip",CLICK:"click.bs.tooltip",FOCUSIN:"focusin.bs.tooltip",FOCUSOUT:"focusout.bs.tooltip",MOUSEENTER:"mouseenter.bs.tooltip",MOUSELEAVE:"mouseleave.bs.tooltip"},te=function(){function t(t,e){if("undefined"==typeof At)throw new TypeError("Bootstrap's tooltips require Popper.js (https://popper.js.org/)");this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._popper=null,this.element=t,this.config=this._getConfig(e),this.tip=null,this._setListeners()}var n=t.prototype;return n.enable=function(){this._isEnabled=!0},n.disable=function(){this._isEnabled=!1},n.toggleEnabled=function(){this._isEnabled=!this._isEnabled},n.toggle=function(t){if(this._isEnabled)if(t){var n=this.constructor.DATA_KEY,i=e(t.currentTarget).data(n);i||(i=new this.constructor(t.currentTarget,this._getDelegateConfig()),e(t.currentTarget).data(n,i)),i._activeTrigger.click=!i._activeTrigger.click,i._isWithActiveTrigger()?i._enter(null,i):i._leave(null,i)}else{if(e(this.getTipElement()).hasClass("show"))return void this._leave(null,this);this._enter(null,this)}},n.dispose=function(){clearTimeout(this._timeout),e.removeData(this.element,this.constructor.DATA_KEY),e(this.element).off(this.constructor.EVENT_KEY),e(this.element).closest(".modal").off("hide.bs.modal",this._hideModalHandler),this.tip&&e(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,this._activeTrigger=null,this._popper&&this._popper.destroy(),this._popper=null,this.element=null,this.config=null,this.tip=null},n.show=function(){var t=this;if("none"===e(this.element).css("display"))throw new Error("Please use show on visible elements");var n=e.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){e(this.element).trigger(n);var i=l.findShadowRoot(this.element),o=e.contains(null!==i?i:this.element.ownerDocument.documentElement,this.element);if(n.isDefaultPrevented()||!o)return;var r=this.getTipElement(),s=l.getUID(this.constructor.NAME);r.setAttribute("id",s),this.element.setAttribute("aria-describedby",s),this.setContent(),this.config.animation&&e(r).addClass("fade");var a="function"==typeof this.config.placement?this.config.placement.call(this,r,this.element):this.config.placement,c=this._getAttachment(a);this.addAttachmentClass(c);var u=this._getContainer();e(r).data(this.constructor.DATA_KEY,this),e.contains(this.element.ownerDocument.documentElement,this.tip)||e(r).appendTo(u),e(this.element).trigger(this.constructor.Event.INSERTED),this._popper=new At(this.element,r,this._getPopperConfig(c)),e(r).addClass("show"),"ontouchstart"in document.documentElement&&e(document.body).children().on("mouseover",null,e.noop);var h=function(){t.config.animation&&t._fixTransition();var n=t._hoverState;t._hoverState=null,e(t.element).trigger(t.constructor.Event.SHOWN),"out"===n&&t._leave(null,t)};if(e(this.tip).hasClass("fade")){var f=l.getTransitionDurationFromElement(this.tip);e(this.tip).one(l.TRANSITION_END,h).emulateTransitionEnd(f)}else h()}},n.hide=function(t){var n=this,i=this.getTipElement(),o=e.Event(this.constructor.Event.HIDE),r=function(){"show"!==n._hoverState&&i.parentNode&&i.parentNode.removeChild(i),n._cleanTipClass(),n.element.removeAttribute("aria-describedby"),e(n.element).trigger(n.constructor.Event.HIDDEN),null!==n._popper&&n._popper.destroy(),t&&t()};if(e(this.element).trigger(o),!o.isDefaultPrevented()){if(e(i).removeClass("show"),"ontouchstart"in document.documentElement&&e(document.body).children().off("mouseover",null,e.noop),this._activeTrigger.click=!1,this._activeTrigger.focus=!1,this._activeTrigger.hover=!1,e(this.tip).hasClass("fade")){var s=l.getTransitionDurationFromElement(i);e(i).one(l.TRANSITION_END,r).emulateTransitionEnd(s)}else r();this._hoverState=""}},n.update=function(){null!==this._popper&&this._popper.scheduleUpdate()},n.isWithContent=function(){return Boolean(this.getTitle())},n.addAttachmentClass=function(t){e(this.getTipElement()).addClass("bs-tooltip-"+t)},n.getTipElement=function(){return this.tip=this.tip||e(this.config.template)[0],this.tip},n.setContent=function(){var t=this.getTipElement();this.setElementContent(e(t.querySelectorAll(".tooltip-inner")),this.getTitle()),e(t).removeClass("fade show")},n.setElementContent=function(t,n){"object"!=typeof n||!n.nodeType&&!n.jquery?this.config.html?(this.config.sanitize&&(n=Vt(n,this.config.whiteList,this.config.sanitizeFn)),t.html(n)):t.text(n):this.config.html?e(n).parent().is(t)||t.empty().append(n):t.text(e(n).text())},n.getTitle=function(){var t=this.element.getAttribute("data-original-title");return t||(t="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),t},n._getPopperConfig=function(t){var e=this;return s(s({},{placement:t,modifiers:{offset:this._getOffset(),flip:{behavior:this.config.fallbackPlacement},arrow:{element:".arrow"},preventOverflow:{boundariesElement:this.config.boundary}},onCreate:function(t){t.originalPlacement!==t.placement&&e._handlePopperPlacementChange(t)},onUpdate:function(t){return e._handlePopperPlacementChange(t)}}),this.config.popperConfig)},n._getOffset=function(){var t=this,e={};return"function"==typeof this.config.offset?e.fn=function(e){return e.offsets=s(s({},e.offsets),t.config.offset(e.offsets,t.element)||{}),e}:e.offset=this.config.offset,e},n._getContainer=function(){return!1===this.config.container?document.body:l.isElement(this.config.container)?e(this.config.container):e(document).find(this.config.container)},n._getAttachment=function(t){return $t[t.toUpperCase()]},n._setListeners=function(){var t=this;this.config.trigger.split(" ").forEach((function(n){if("click"===n)e(t.element).on(t.constructor.Event.CLICK,t.config.selector,(function(e){return t.toggle(e)}));else if("manual"!==n){var i="hover"===n?t.constructor.Event.MOUSEENTER:t.constructor.Event.FOCUSIN,o="hover"===n?t.constructor.Event.MOUSELEAVE:t.constructor.Event.FOCUSOUT;e(t.element).on(i,t.config.selector,(function(e){return t._enter(e)})).on(o,t.config.selector,(function(e){return t._leave(e)}))}})),this._hideModalHandler=function(){t.element&&t.hide()},e(this.element).closest(".modal").on("hide.bs.modal",this._hideModalHandler),this.config.selector?this.config=s(s({},this.config),{},{trigger:"manual",selector:""}):this._fixTitle()},n._fixTitle=function(){var t=typeof this.element.getAttribute("data-original-title");(this.element.getAttribute("title")||"string"!==t)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))},n._enter=function(t,n){var i=this.constructor.DATA_KEY;(n=n||e(t.currentTarget).data(i))||(n=new this.constructor(t.currentTarget,this._getDelegateConfig()),e(t.currentTarget).data(i,n)),t&&(n._activeTrigger["focusin"===t.type?"focus":"hover"]=!0),e(n.getTipElement()).hasClass("show")||"show"===n._hoverState?n._hoverState="show":(clearTimeout(n._timeout),n._hoverState="show",n.config.delay&&n.config.delay.show?n._timeout=setTimeout((function(){"show"===n._hoverState&&n.show()}),n.config.delay.show):n.show())},n._leave=function(t,n){var i=this.constructor.DATA_KEY;(n=n||e(t.currentTarget).data(i))||(n=new this.constructor(t.currentTarget,this._getDelegateConfig()),e(t.currentTarget).data(i,n)),t&&(n._activeTrigger["focusout"===t.type?"focus":"hover"]=!1),n._isWithActiveTrigger()||(clearTimeout(n._timeout),n._hoverState="out",n.config.delay&&n.config.delay.hide?n._timeout=setTimeout((function(){"out"===n._hoverState&&n.hide()}),n.config.delay.hide):n.hide())},n._isWithActiveTrigger=function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1},n._getConfig=function(t){var n=e(this.element).data();return Object.keys(n).forEach((function(t){-1!==Kt.indexOf(t)&&delete n[t]})),"number"==typeof(t=s(s(s({},this.constructor.Default),n),"object"==typeof t&&t?t:{})).delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),l.typeCheckConfig(Yt,t,this.constructor.DefaultType),t.sanitize&&(t.template=Vt(t.template,t.whiteList,t.sanitizeFn)),t},n._getDelegateConfig=function(){var t={};if(this.config)for(var e in this.config)this.constructor.Default[e]!==this.config[e]&&(t[e]=this.config[e]);return t},n._cleanTipClass=function(){var t=e(this.getTipElement()),n=t.attr("class").match(Xt);null!==n&&n.length&&t.removeClass(n.join(""))},n._handlePopperPlacementChange=function(t){this.tip=t.instance.popper,this._cleanTipClass(),this.addAttachmentClass(this._getAttachment(t.placement))},n._fixTransition=function(){var t=this.getTipElement(),n=this.config.animation;null===t.getAttribute("x-placement")&&(e(t).removeClass("fade"),this.config.animation=!1,this.hide(),this.show(),this.config.animation=n)},t._jQueryInterface=function(n){return this.each((function(){var i=e(this).data("bs.tooltip"),o="object"==typeof n&&n;if((i||!/dispose|hide/.test(n))&&(i||(i=new t(this,o),e(this).data("bs.tooltip",i)),"string"==typeof n)){if("undefined"==typeof i[n])throw new TypeError('No method named "'+n+'"');i[n]()}}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return Jt}},{key:"NAME",get:function(){return Yt}},{key:"DATA_KEY",get:function(){return"bs.tooltip"}},{key:"Event",get:function(){return Zt}},{key:"EVENT_KEY",get:function(){return".bs.tooltip"}},{key:"DefaultType",get:function(){return Gt}}]),t}();e.fn[Yt]=te._jQueryInterface,e.fn[Yt].Constructor=te,e.fn[Yt].noConflict=function(){return e.fn[Yt]=zt,te._jQueryInterface};var ee="popover",ne=e.fn[ee],ie=new RegExp("(^|\\s)bs-popover\\S+","g"),oe=s(s({},te.Default),{},{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'}),re=s(s({},te.DefaultType),{},{content:"(string|element|function)"}),se={HIDE:"hide.bs.popover",HIDDEN:"hidden.bs.popover",SHOW:"show.bs.popover",SHOWN:"shown.bs.popover",INSERTED:"inserted.bs.popover",CLICK:"click.bs.popover",FOCUSIN:"focusin.bs.popover",FOCUSOUT:"focusout.bs.popover",MOUSEENTER:"mouseenter.bs.popover",MOUSELEAVE:"mouseleave.bs.popover"},ae=function(t){var n,o;function r(){return t.apply(this,arguments)||this}o=t,(n=r).prototype=Object.create(o.prototype),n.prototype.constructor=n,n.__proto__=o;var s=r.prototype;return s.isWithContent=function(){return this.getTitle()||this._getContent()},s.addAttachmentClass=function(t){e(this.getTipElement()).addClass("bs-popover-"+t)},s.getTipElement=function(){return this.tip=this.tip||e(this.config.template)[0],this.tip},s.setContent=function(){var t=e(this.getTipElement());this.setElementContent(t.find(".popover-header"),this.getTitle());var n=this._getContent();"function"==typeof n&&(n=n.call(this.element)),this.setElementContent(t.find(".popover-body"),n),t.removeClass("fade show")},s._getContent=function(){return this.element.getAttribute("data-content")||this.config.content},s._cleanTipClass=function(){var t=e(this.getTipElement()),n=t.attr("class").match(ie);null!==n&&n.length>0&&t.removeClass(n.join(""))},r._jQueryInterface=function(t){return this.each((function(){var n=e(this).data("bs.popover"),i="object"==typeof t?t:null;if((n||!/dispose|hide/.test(t))&&(n||(n=new r(this,i),e(this).data("bs.popover",n)),"string"==typeof t)){if("undefined"==typeof n[t])throw new TypeError('No method named "'+t+'"');n[t]()}}))},i(r,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return oe}},{key:"NAME",get:function(){return ee}},{key:"DATA_KEY",get:function(){return"bs.popover"}},{key:"Event",get:function(){return se}},{key:"EVENT_KEY",get:function(){return".bs.popover"}},{key:"DefaultType",get:function(){return re}}]),r}(te);e.fn[ee]=ae._jQueryInterface,e.fn[ee].Constructor=ae,e.fn[ee].noConflict=function(){return e.fn[ee]=ne,ae._jQueryInterface};var le="scrollspy",ce=e.fn[le],ue={offset:10,method:"auto",target:""},he={offset:"number",method:"string",target:"(string|element)"},fe=function(){function t(t,n){var i=this;this._element=t,this._scrollElement="BODY"===t.tagName?window:t,this._config=this._getConfig(n),this._selector=this._config.target+" .nav-link,"+this._config.target+" .list-group-item,"+this._config.target+" .dropdown-item",this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,e(this._scrollElement).on("scroll.bs.scrollspy",(function(t){return i._process(t)})),this.refresh(),this._process()}var n=t.prototype;return n.refresh=function(){var t=this,n=this._scrollElement===this._scrollElement.window?"offset":"position",i="auto"===this._config.method?n:this._config.method,o="position"===i?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),[].slice.call(document.querySelectorAll(this._selector)).map((function(t){var n,r=l.getSelectorFromElement(t);if(r&&(n=document.querySelector(r)),n){var s=n.getBoundingClientRect();if(s.width||s.height)return[e(n)[i]().top+o,r]}return null})).filter((function(t){return t})).sort((function(t,e){return t[0]-e[0]})).forEach((function(e){t._offsets.push(e[0]),t._targets.push(e[1])}))},n.dispose=function(){e.removeData(this._element,"bs.scrollspy"),e(this._scrollElement).off(".bs.scrollspy"),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null},n._getConfig=function(t){if("string"!=typeof(t=s(s({},ue),"object"==typeof t&&t?t:{})).target&&l.isElement(t.target)){var n=e(t.target).attr("id");n||(n=l.getUID(le),e(t.target).attr("id",n)),t.target="#"+n}return l.typeCheckConfig(le,t,he),t},n._getScrollTop=function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop},n._getScrollHeight=function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},n._getOffsetHeight=function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClientRect().height},n._process=function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),t>=n){var i=this._targets[this._targets.length-1];this._activeTarget!==i&&this._activate(i)}else{if(this._activeTarget&&t<this._offsets[0]&&this._offsets[0]>0)return this._activeTarget=null,void this._clear();for(var o=this._offsets.length;o--;){this._activeTarget!==this._targets[o]&&t>=this._offsets[o]&&("undefined"==typeof this._offsets[o+1]||t<this._offsets[o+1])&&this._activate(this._targets[o])}}},n._activate=function(t){this._activeTarget=t,this._clear();var n=this._selector.split(",").map((function(e){return e+'[data-target="'+t+'"],'+e+'[href="'+t+'"]'})),i=e([].slice.call(document.querySelectorAll(n.join(","))));i.hasClass("dropdown-item")?(i.closest(".dropdown").find(".dropdown-toggle").addClass("active"),i.addClass("active")):(i.addClass("active"),i.parents(".nav, .list-group").prev(".nav-link, .list-group-item").addClass("active"),i.parents(".nav, .list-group").prev(".nav-item").children(".nav-link").addClass("active")),e(this._scrollElement).trigger("activate.bs.scrollspy",{relatedTarget:t})},n._clear=function(){[].slice.call(document.querySelectorAll(this._selector)).filter((function(t){return t.classList.contains("active")})).forEach((function(t){return t.classList.remove("active")}))},t._jQueryInterface=function(n){return this.each((function(){var i=e(this).data("bs.scrollspy");if(i||(i=new t(this,"object"==typeof n&&n),e(this).data("bs.scrollspy",i)),"string"==typeof n){if("undefined"==typeof i[n])throw new TypeError('No method named "'+n+'"');i[n]()}}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"Default",get:function(){return ue}}]),t}();e(window).on("load.bs.scrollspy.data-api",(function(){for(var t=[].slice.call(document.querySelectorAll('[data-spy="scroll"]')),n=t.length;n--;){var i=e(t[n]);fe._jQueryInterface.call(i,i.data())}})),e.fn[le]=fe._jQueryInterface,e.fn[le].Constructor=fe,e.fn[le].noConflict=function(){return e.fn[le]=ce,fe._jQueryInterface};var de=e.fn.tab,pe=function(){function t(t){this._element=t}var n=t.prototype;return n.show=function(){var t=this;if(!(this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&e(this._element).hasClass("active")||e(this._element).hasClass("disabled"))){var n,i,o=e(this._element).closest(".nav, .list-group")[0],r=l.getSelectorFromElement(this._element);if(o){var s="UL"===o.nodeName||"OL"===o.nodeName?"> li > .active":".active";i=(i=e.makeArray(e(o).find(s)))[i.length-1]}var a=e.Event("hide.bs.tab",{relatedTarget:this._element}),c=e.Event("show.bs.tab",{relatedTarget:i});if(i&&e(i).trigger(a),e(this._element).trigger(c),!c.isDefaultPrevented()&&!a.isDefaultPrevented()){r&&(n=document.querySelector(r)),this._activate(this._element,o);var u=function(){var n=e.Event("hidden.bs.tab",{relatedTarget:t._element}),o=e.Event("shown.bs.tab",{relatedTarget:i});e(i).trigger(n),e(t._element).trigger(o)};n?this._activate(n,n.parentNode,u):u()}}},n.dispose=function(){e.removeData(this._element,"bs.tab"),this._element=null},n._activate=function(t,n,i){var o=this,r=(!n||"UL"!==n.nodeName&&"OL"!==n.nodeName?e(n).children(".active"):e(n).find("> li > .active"))[0],s=i&&r&&e(r).hasClass("fade"),a=function(){return o._transitionComplete(t,r,i)};if(r&&s){var c=l.getTransitionDurationFromElement(r);e(r).removeClass("show").one(l.TRANSITION_END,a).emulateTransitionEnd(c)}else a()},n._transitionComplete=function(t,n,i){if(n){e(n).removeClass("active");var o=e(n.parentNode).find("> .dropdown-menu .active")[0];o&&e(o).removeClass("active"),"tab"===n.getAttribute("role")&&n.setAttribute("aria-selected",!1)}if(e(t).addClass("active"),"tab"===t.getAttribute("role")&&t.setAttribute("aria-selected",!0),l.reflow(t),t.classList.contains("fade")&&t.classList.add("show"),t.parentNode&&e(t.parentNode).hasClass("dropdown-menu")){var r=e(t).closest(".dropdown")[0];if(r){var s=[].slice.call(r.querySelectorAll(".dropdown-toggle"));e(s).addClass("active")}t.setAttribute("aria-expanded",!0)}i&&i()},t._jQueryInterface=function(n){return this.each((function(){var i=e(this),o=i.data("bs.tab");if(o||(o=new t(this),i.data("bs.tab",o)),"string"==typeof n){if("undefined"==typeof o[n])throw new TypeError('No method named "'+n+'"');o[n]()}}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}}]),t}();e(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',(function(t){t.preventDefault(),pe._jQueryInterface.call(e(this),"show")})),e.fn.tab=pe._jQueryInterface,e.fn.tab.Constructor=pe,e.fn.tab.noConflict=function(){return e.fn.tab=de,pe._jQueryInterface};var me=e.fn.toast,ge={animation:"boolean",autohide:"boolean",delay:"number"},ve={animation:!0,autohide:!0,delay:500},_e=function(){function t(t,e){this._element=t,this._config=this._getConfig(e),this._timeout=null,this._setListeners()}var n=t.prototype;return n.show=function(){var t=this,n=e.Event("show.bs.toast");if(e(this._element).trigger(n),!n.isDefaultPrevented()){this._config.animation&&this._element.classList.add("fade");var i=function(){t._element.classList.remove("showing"),t._element.classList.add("show"),e(t._element).trigger("shown.bs.toast"),t._config.autohide&&(t._timeout=setTimeout((function(){t.hide()}),t._config.delay))};if(this._element.classList.remove("hide"),l.reflow(this._element),this._element.classList.add("showing"),this._config.animation){var o=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,i).emulateTransitionEnd(o)}else i()}},n.hide=function(){if(this._element.classList.contains("show")){var t=e.Event("hide.bs.toast");e(this._element).trigger(t),t.isDefaultPrevented()||this._close()}},n.dispose=function(){clearTimeout(this._timeout),this._timeout=null,this._element.classList.contains("show")&&this._element.classList.remove("show"),e(this._element).off("click.dismiss.bs.toast"),e.removeData(this._element,"bs.toast"),this._element=null,this._config=null},n._getConfig=function(t){return t=s(s(s({},ve),e(this._element).data()),"object"==typeof t&&t?t:{}),l.typeCheckConfig("toast",t,this.constructor.DefaultType),t},n._setListeners=function(){var t=this;e(this._element).on("click.dismiss.bs.toast",'[data-dismiss="toast"]',(function(){return t.hide()}))},n._close=function(){var t=this,n=function(){t._element.classList.add("hide"),e(t._element).trigger("hidden.bs.toast")};if(this._element.classList.remove("show"),this._config.animation){var i=l.getTransitionDurationFromElement(this._element);e(this._element).one(l.TRANSITION_END,n).emulateTransitionEnd(i)}else n()},t._jQueryInterface=function(n){return this.each((function(){var i=e(this),o=i.data("bs.toast");if(o||(o=new t(this,"object"==typeof n&&n),i.data("bs.toast",o)),"string"==typeof n){if("undefined"==typeof o[n])throw new TypeError('No method named "'+n+'"');o[n](this)}}))},i(t,null,[{key:"VERSION",get:function(){return"4.5.0"}},{key:"DefaultType",get:function(){return ge}},{key:"Default",get:function(){return ve}}]),t}();e.fn.toast=_e._jQueryInterface,e.fn.toast.Constructor=_e,e.fn.toast.noConflict=function(){return e.fn.toast=me,_e._jQueryInterface},t.Alert=h,t.Button=d,t.Carousel=y,t.Collapse=S,t.Dropdown=Ft,t.Modal=qt,t.Popover=ae,t.Scrollspy=fe,t.Tab=pe,t.Toast=_e,t.Tooltip=te,t.Util=l,Object.defineProperty(t,"__esModule",{value:!0})}));
//# sourceMappingURL=bootstrap.bundle.min.js.map
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define('Draggable', [], factory);
	else if(typeof exports === 'object')
		exports['Draggable'] = factory();
	else
		root['Draggable'] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = '';
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 166);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _defineProperty = __webpack_require__(164);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _setPrototypeOf = __webpack_require__(137);

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = __webpack_require__(133);

var _create2 = _interopRequireDefault(_create);

var _typeof2 = __webpack_require__(61);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + (typeof superClass === 'undefined' ? 'undefined' : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _typeof2 = __webpack_require__(61);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
  }

  return call && ((typeof call === 'undefined' ? 'undefined' : (0, _typeof3.default)(call)) === 'object' || typeof call === 'function') ? call : self;
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _AbstractEvent = __webpack_require__(130);

var _AbstractEvent2 = _interopRequireDefault(_AbstractEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _AbstractEvent2.default;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(36)('wks');
var uid = __webpack_require__(24);
var Symbol = __webpack_require__(10).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _AbstractPlugin = __webpack_require__(126);

var _AbstractPlugin2 = _interopRequireDefault(_AbstractPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _AbstractPlugin2.default;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _closest = __webpack_require__(107);

Object.defineProperty(exports, 'closest', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_closest).default;
  }
});

var _requestNextAnimationFrame = __webpack_require__(105);

Object.defineProperty(exports, 'requestNextAnimationFrame', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_requestNextAnimationFrame).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(17);
var IE8_DOM_DEFINE = __webpack_require__(63);
var toPrimitive = __webpack_require__(43);
var dP = Object.defineProperty;

exports.f = __webpack_require__(13) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(155);
var defined = __webpack_require__(41);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(23)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(10);
var core = __webpack_require__(4);
var ctx = __webpack_require__(44);
var hide = __webpack_require__(18);
var has = __webpack_require__(12);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _from = __webpack_require__(123);

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(16);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var createDesc = __webpack_require__(22);
module.exports = __webpack_require__(13) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SensorEvent = __webpack_require__(100);

Object.keys(_SensorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SensorEvent[key];
    }
  });
});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Sensor = __webpack_require__(103);

var _Sensor2 = _interopRequireDefault(_Sensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Sensor2.default;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragEvent = __webpack_require__(64);

Object.keys(_DragEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DragEvent[key];
    }
  });
});

var _DraggableEvent = __webpack_require__(52);

Object.keys(_DraggableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DraggableEvent[key];
    }
  });
});

var _Plugins = __webpack_require__(51);

Object.keys(_Plugins).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Plugins[key];
    }
  });
});

var _Sensors = __webpack_require__(28);

Object.keys(_Sensors).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Sensors[key];
    }
  });
});

var _Draggable = __webpack_require__(93);

var _Draggable2 = _interopRequireDefault(_Draggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Draggable2.default;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _getPrototypeOf = __webpack_require__(87);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = __webpack_require__(84);

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ('value' in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Sensor = __webpack_require__(20);

Object.defineProperty(exports, 'Sensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Sensor).default;
  }
});

var _MouseSensor = __webpack_require__(102);

Object.defineProperty(exports, 'MouseSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MouseSensor).default;
  }
});

var _TouchSensor = __webpack_require__(99);

Object.defineProperty(exports, 'TouchSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TouchSensor).default;
  }
});

var _DragSensor = __webpack_require__(97);

Object.defineProperty(exports, 'DragSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_DragSensor).default;
  }
});

var _ForceTouchSensor = __webpack_require__(95);

Object.defineProperty(exports, 'ForceTouchSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ForceTouchSensor).default;
  }
});

var _SensorEvent = __webpack_require__(19);

Object.keys(_SensorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SensorEvent[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(30);
var createDesc = __webpack_require__(22);
var toIObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(43);
var has = __webpack_require__(12);
var IE8_DOM_DEFINE = __webpack_require__(63);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(13) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(10);
var core = __webpack_require__(4);
var LIBRARY = __webpack_require__(25);
var wksExt = __webpack_require__(32);
var defineProperty = __webpack_require__(9).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(6);


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(41);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(9).f;
var has = __webpack_require__(12);
var TAG = __webpack_require__(6)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(4);
var global = __webpack_require__(10);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(25) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(36)('keys');
var uid = __webpack_require__(24);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(57);
var enumBugKeys = __webpack_require__(35);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(17);
var dPs = __webpack_require__(156);
var enumBugKeys = __webpack_require__(35);
var IE_PROTO = __webpack_require__(37)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(62)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(152).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 41 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError('Can\'t call method on  ' + it);
  return it;
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(16);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError('Can\'t convert object to primitive value');
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(161);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SnappableEvent = __webpack_require__(68);

Object.keys(_SnappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SnappableEvent[key];
    }
  });
});

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CollidableEvent = __webpack_require__(73);

Object.keys(_CollidableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _CollidableEvent[key];
    }
  });
});

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SortableEvent = __webpack_require__(77);

Object.keys(_SortableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SortableEvent[key];
    }
  });
});

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SwappableEvent = __webpack_require__(80);

Object.keys(_SwappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SwappableEvent[key];
    }
  });
});

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(14);
var core = __webpack_require__(4);
var fails = __webpack_require__(23);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DroppableEvent = __webpack_require__(89);

Object.keys(_DroppableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DroppableEvent[key];
    }
  });
});

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Announcement = __webpack_require__(128);

Object.defineProperty(exports, 'Announcement', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Announcement).default;
  }
});
Object.defineProperty(exports, 'defaultAnnouncementOptions', {
  enumerable: true,
  get: function get() {
    return _Announcement.defaultOptions;
  }
});

var _Focusable = __webpack_require__(125);

Object.defineProperty(exports, 'Focusable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Focusable).default;
  }
});

var _Mirror = __webpack_require__(114);

Object.defineProperty(exports, 'Mirror', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Mirror).default;
  }
});
Object.defineProperty(exports, 'defaultMirrorOptions', {
  enumerable: true,
  get: function get() {
    return _Mirror.defaultOptions;
  }
});

var _Scrollable = __webpack_require__(109);

Object.defineProperty(exports, 'Scrollable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Scrollable).default;
  }
});
Object.defineProperty(exports, 'defaultScrollableOptions', {
  enumerable: true,
  get: function get() {
    return _Scrollable.defaultOptions;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DraggableEvent = __webpack_require__(129);

Object.keys(_DraggableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DraggableEvent[key];
    }
  });
});

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(57);
var hiddenKeys = __webpack_require__(35).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 54 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(12);
var toObject = __webpack_require__(33);
var IE_PROTO = __webpack_require__(37)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(42);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(12);
var toIObject = __webpack_require__(11);
var arrayIndexOf = __webpack_require__(154)(false);
var IE_PROTO = __webpack_require__(37)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(18);


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var LIBRARY = __webpack_require__(25);
var $export = __webpack_require__(14);
var redefine = __webpack_require__(58);
var hide = __webpack_require__(18);
var Iterators = __webpack_require__(21);
var $iterCreate = __webpack_require__(157);
var setToStringTag = __webpack_require__(34);
var getPrototypeOf = __webpack_require__(55);
var ITERATOR = __webpack_require__(6)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var $at = __webpack_require__(158)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(59)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _iterator = __webpack_require__(160);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(147);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === 'function' && typeof _iterator2.default === 'symbol' ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === 'function' && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? 'symbol' : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === 'function' && _typeof(_iterator2.default) === 'symbol' ? function (obj) {
  return typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === 'function' && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? 'symbol' : typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(16);
var document = __webpack_require__(10).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(13) && !__webpack_require__(23)(function () {
  return Object.defineProperty(__webpack_require__(62)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragEvent = __webpack_require__(165);

Object.keys(_DragEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DragEvent[key];
    }
  });
});

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onSortableSorted = Symbol('onSortableSorted');

/**
 * SwapAnimation default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.duration
 * @property {String} defaultOptions.easingFunction
 * @property {Boolean} defaultOptions.horizontal
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  duration: 150,
  easingFunction: 'ease-in-out',
  horizontal: false
};

/**
 * SwapAnimation plugin adds swap animations for sortable
 * @class SwapAnimation
 * @module SwapAnimation
 * @extends AbstractPlugin
 */

var SwapAnimation = function (_AbstractPlugin) {
  (0, _inherits3.default)(SwapAnimation, _AbstractPlugin);

  /**
   * SwapAnimation constructor.
   * @constructs SwapAnimation
   * @param {Draggable} draggable - Draggable instance
   */
  function SwapAnimation(draggable) {
    (0, _classCallCheck3.default)(this, SwapAnimation);

    /**
     * SwapAnimation options
     * @property {Object} options
     * @property {Number} defaultOptions.duration
     * @property {String} defaultOptions.easingFunction
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SwapAnimation.__proto__ || Object.getPrototypeOf(SwapAnimation)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Last animation frame
     * @property {Number} lastAnimationFrame
     * @type {Number}
     */
    _this.lastAnimationFrame = null;

    _this[onSortableSorted] = _this[onSortableSorted].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(SwapAnimation, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('sortable:sorted', this[onSortableSorted]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('sortable:sorted', this[onSortableSorted]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.swapAnimation || {};
    }

    /**
     * Sortable sorted handler
     * @param {SortableSortedEvent} sortableEvent
     * @private
     */

  }, {
    key: onSortableSorted,
    value: function value(_ref) {
      var _this2 = this;

      var oldIndex = _ref.oldIndex,
          newIndex = _ref.newIndex,
          dragEvent = _ref.dragEvent;
      var source = dragEvent.source,
          over = dragEvent.over;


      cancelAnimationFrame(this.lastAnimationFrame);

      // Can be done in a separate frame
      this.lastAnimationFrame = requestAnimationFrame(function () {
        if (oldIndex >= newIndex) {
          animate(source, over, _this2.options);
        } else {
          animate(over, source, _this2.options);
        }
      });
    }
  }]);
  return SwapAnimation;
}(_AbstractPlugin3.default);

/**
 * Animates two elements
 * @param {HTMLElement} from
 * @param {HTMLElement} to
 * @param {Object} options
 * @param {Number} options.duration
 * @param {String} options.easingFunction
 * @param {String} options.horizontal
 * @private
 */


exports.default = SwapAnimation;
function animate(from, to, _ref2) {
  var duration = _ref2.duration,
      easingFunction = _ref2.easingFunction,
      horizontal = _ref2.horizontal;
  var _arr = [from, to];

  for (var _i = 0; _i < _arr.length; _i++) {
    var element = _arr[_i];
    element.style.pointerEvents = 'none';
  }

  if (horizontal) {
    var width = from.offsetWidth;
    from.style.transform = 'translate3d(' + width + 'px, 0, 0)';
    to.style.transform = 'translate3d(-' + width + 'px, 0, 0)';
  } else {
    var height = from.offsetHeight;
    from.style.transform = 'translate3d(0, ' + height + 'px, 0)';
    to.style.transform = 'translate3d(0, -' + height + 'px, 0)';
  }

  requestAnimationFrame(function () {
    var _arr2 = [from, to];

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var _element = _arr2[_i2];
      _element.addEventListener('transitionend', resetElementOnTransitionEnd);
      _element.style.transition = 'transform ' + duration + 'ms ' + easingFunction;
      _element.style.transform = '';
    }
  });
}

/**
 * Resets animation style properties after animation has completed
 * @param {Event} event
 * @private
 */
function resetElementOnTransitionEnd(event) {
  event.target.style.transition = '';
  event.target.style.pointerEvents = '';
  event.target.removeEventListener('transitionend', resetElementOnTransitionEnd);
}

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _SwapAnimation = __webpack_require__(65);

var _SwapAnimation2 = _interopRequireDefault(_SwapAnimation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _SwapAnimation2.default;
exports.defaultOptions = _SwapAnimation.defaultOptions;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _SnappableEvent = __webpack_require__(45);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragStop = Symbol('onDragStop');
var onDragOver = Symbol('onDragOver');
var onDragOut = Symbol('onDragOut');
var onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorDestroy = Symbol('onMirrorDestroy');

/**
 * Snappable plugin which snaps draggable elements into place
 * @class Snappable
 * @module Snappable
 * @extends AbstractPlugin
 */

var Snappable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Snappable, _AbstractPlugin);

  /**
   * Snappable constructor.
   * @constructs Snappable
   * @param {Draggable} draggable - Draggable instance
   */
  function Snappable(draggable) {
    (0, _classCallCheck3.default)(this, Snappable);

    /**
     * Keeps track of the first source element
     * @property {HTMLElement|null} firstSource
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Snappable.__proto__ || Object.getPrototypeOf(Snappable)).call(this, draggable));

    _this.firstSource = null;

    /**
     * Keeps track of the mirror element
     * @property {HTMLElement} mirror
     */
    _this.mirror = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragOut] = _this[onDragOut].bind(_this);
    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorDestroy] = _this[onMirrorDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Snappable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:stop', this[onDragStop]).on('drag:over', this[onDragOver]).on('drag:out', this[onDragOut]).on('droppable:over', this[onDragOver]).on('droppable:out', this[onDragOut]).on('mirror:created', this[onMirrorCreated]).on('mirror:destroy', this[onMirrorDestroy]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:stop', this[onDragStop]).off('drag:over', this[onDragOver]).off('drag:out', this[onDragOut]).off('droppable:over', this[onDragOver]).off('droppable:out', this[onDragOut]).off('mirror:created', this[onMirrorCreated]).off('mirror:destroy', this[onMirrorDestroy]);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      this.firstSource = event.source;
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value() {
      this.firstSource = null;
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent|DroppableOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      var _this2 = this;

      if (event.canceled()) {
        return;
      }

      var source = event.source || event.dragEvent.source;

      if (source === this.firstSource) {
        this.firstSource = null;
        return;
      }

      var snapInEvent = new _SnappableEvent.SnapInEvent({
        dragEvent: event,
        snappable: event.over || event.droppable
      });

      this.draggable.trigger(snapInEvent);

      if (snapInEvent.canceled()) {
        return;
      }

      if (this.mirror) {
        this.mirror.style.display = 'none';
      }

      source.classList.remove(this.draggable.getClassNameFor('source:dragging'));
      source.classList.add(this.draggable.getClassNameFor('source:placed'));

      // Need to cancel this in drag out
      setTimeout(function () {
        source.classList.remove(_this2.draggable.getClassNameFor('source:placed'));
      }, this.draggable.options.placedTimeout);
    }

    /**
     * Drag out handler
     * @private
     * @param {DragOutEvent|DroppableOutEvent} event - Drag out event
     */

  }, {
    key: onDragOut,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var source = event.source || event.dragEvent.source;

      var snapOutEvent = new _SnappableEvent.SnapOutEvent({
        dragEvent: event,
        snappable: event.over || event.droppable
      });

      this.draggable.trigger(snapOutEvent);

      if (snapOutEvent.canceled()) {
        return;
      }

      if (this.mirror) {
        this.mirror.style.display = '';
      }

      source.classList.add(this.draggable.getClassNameFor('source:dragging'));
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var mirror = _ref.mirror;

      this.mirror = mirror;
    }

    /**
     * Mirror destroy handler
     * @param {MirrorDestroyEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorDestroy,
    value: function value() {
      this.mirror = null;
    }
  }]);
  return Snappable;
}(_AbstractPlugin3.default);

exports.default = Snappable;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SnapOutEvent = exports.SnapInEvent = exports.SnapEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base snap event
 * @class SnapEvent
 * @module SnapEvent
 * @extends AbstractEvent
 */
var SnapEvent = exports.SnapEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SnapEvent, _AbstractEvent);

  function SnapEvent() {
    (0, _classCallCheck3.default)(this, SnapEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapEvent.__proto__ || Object.getPrototypeOf(SnapEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SnapEvent, [{
    key: 'dragEvent',


    /**
     * Drag event that triggered this snap event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }

    /**
     * Snappable element
     * @property snappable
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'snappable',
    get: function get() {
      return this.data.snappable;
    }
  }]);
  return SnapEvent;
}(_AbstractEvent3.default);

/**
 * Snap in event
 * @class SnapInEvent
 * @module SnapInEvent
 * @extends SnapEvent
 */


SnapEvent.type = 'snap';

var SnapInEvent = exports.SnapInEvent = function (_SnapEvent) {
  (0, _inherits3.default)(SnapInEvent, _SnapEvent);

  function SnapInEvent() {
    (0, _classCallCheck3.default)(this, SnapInEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapInEvent.__proto__ || Object.getPrototypeOf(SnapInEvent)).apply(this, arguments));
  }

  return SnapInEvent;
}(SnapEvent);

/**
 * Snap out event
 * @class SnapOutEvent
 * @module SnapOutEvent
 * @extends SnapEvent
 */


SnapInEvent.type = 'snap:in';
SnapInEvent.cancelable = true;

var SnapOutEvent = exports.SnapOutEvent = function (_SnapEvent2) {
  (0, _inherits3.default)(SnapOutEvent, _SnapEvent2);

  function SnapOutEvent() {
    (0, _classCallCheck3.default)(this, SnapOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapOutEvent.__proto__ || Object.getPrototypeOf(SnapOutEvent)).apply(this, arguments));
  }

  return SnapOutEvent;
}(SnapEvent);

SnapOutEvent.type = 'snap:out';
SnapOutEvent.cancelable = true;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SnappableEvent = __webpack_require__(45);

Object.keys(_SnappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SnappableEvent[key];
    }
  });
});

var _Snappable = __webpack_require__(67);

var _Snappable2 = _interopRequireDefault(_Snappable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Snappable2.default;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorDestroy = Symbol('onMirrorDestroy');
var onDragOver = Symbol('onDragOver');
var resize = Symbol('resize');

/**
 * ResizeMirror default options
 * @property {Object} defaultOptions
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {};

/**
 * The ResizeMirror plugin resizes the mirror element to the dimensions of the draggable element that the mirror is hovering over
 * @class ResizeMirror
 * @module ResizeMirror
 * @extends AbstractPlugin
 */

var ResizeMirror = function (_AbstractPlugin) {
  (0, _inherits3.default)(ResizeMirror, _AbstractPlugin);

  /**
   * ResizeMirror constructor.
   * @constructs ResizeMirror
   * @param {Draggable} draggable - Draggable instance
   */
  function ResizeMirror(draggable) {
    (0, _classCallCheck3.default)(this, ResizeMirror);

    /**
     * ResizeMirror options
     * @property {Object} options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (ResizeMirror.__proto__ || Object.getPrototypeOf(ResizeMirror)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * ResizeMirror remembers the last width when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastWidth
     */
    _this.lastWidth = 0;

    /**
     * ResizeMirror remembers the last height when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastHeight
     */
    _this.lastHeight = 0;

    /**
     * Keeps track of the mirror element
     * @property {HTMLElement} mirror
     */
    _this.mirror = null;

    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorDestroy] = _this[onMirrorDestroy].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(ResizeMirror, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('mirror:created', this[onMirrorCreated]).on('drag:over', this[onDragOver]).on('drag:over:container', this[onDragOver]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('mirror:created', this[onMirrorCreated]).off('mirror:destroy', this[onMirrorDestroy]).off('drag:over', this[onDragOver]).off('drag:over:container', this[onDragOver]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.resizeMirror || {};
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var mirror = _ref.mirror;

      this.mirror = mirror;
    }

    /**
     * Mirror destroy handler
     * @param {MirrorDestroyEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorDestroy,
    value: function value() {
      this.mirror = null;
    }

    /**
     * Drag over handler
     * @param {DragOverEvent | DragOverContainer} dragEvent
     * @private
     */

  }, {
    key: onDragOver,
    value: function value(dragEvent) {
      this[resize](dragEvent);
    }

    /**
     * Resize function for
     * @param {DragOverEvent | DragOverContainer} dragEvent
     * @private
     */

  }, {
    key: resize,
    value: function value(_ref2) {
      var _this2 = this;

      var overContainer = _ref2.overContainer,
          over = _ref2.over;

      requestAnimationFrame(function () {
        if (_this2.mirror.parentNode !== overContainer) {
          overContainer.appendChild(_this2.mirror);
        }

        var overElement = over || _this2.draggable.getDraggableElementsForContainer(overContainer)[0];

        if (!overElement) {
          return;
        }

        (0, _utils.requestNextAnimationFrame)(function () {
          var overRect = overElement.getBoundingClientRect();

          if (_this2.lastHeight === overRect.height && _this2.lastWidth === overRect.width) {
            return;
          }

          _this2.mirror.style.width = overRect.width + 'px';
          _this2.mirror.style.height = overRect.height + 'px';

          _this2.lastWidth = overRect.width;
          _this2.lastHeight = overRect.height;
        });
      });
    }
  }]);
  return ResizeMirror;
}(_AbstractPlugin3.default);

exports.default = ResizeMirror;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _ResizeMirror = __webpack_require__(70);

var _ResizeMirror2 = _interopRequireDefault(_ResizeMirror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _ResizeMirror2.default;
exports.defaultOptions = _ResizeMirror.defaultOptions;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(8);

var _CollidableEvent = __webpack_require__(46);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var onRequestAnimationFrame = Symbol('onRequestAnimationFrame');

/**
 * Collidable plugin which detects colliding elements while dragging
 * @class Collidable
 * @module Collidable
 * @extends AbstractPlugin
 */

var Collidable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Collidable, _AbstractPlugin);

  /**
   * Collidable constructor.
   * @constructs Collidable
   * @param {Draggable} draggable - Draggable instance
   */
  function Collidable(draggable) {
    (0, _classCallCheck3.default)(this, Collidable);

    /**
     * Keeps track of currently colliding elements
     * @property {HTMLElement|null} currentlyCollidingElement
     * @type {HTMLElement|null}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Collidable.__proto__ || Object.getPrototypeOf(Collidable)).call(this, draggable));

    _this.currentlyCollidingElement = null;

    /**
     * Keeps track of currently colliding elements
     * @property {HTMLElement|null} lastCollidingElement
     * @type {HTMLElement|null}
     */
    _this.lastCollidingElement = null;

    /**
     * Animation frame for finding colliding elements
     * @property {Number|null} currentAnimationFrame
     * @type {Number|null}
     */
    _this.currentAnimationFrame = null;

    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onRequestAnimationFrame] = _this[onRequestAnimationFrame].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Collidable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns current collidables based on `collidables` option
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getCollidables',
    value: function getCollidables() {
      var collidables = this.draggable.options.collidables;

      if (typeof collidables === 'string') {
        return Array.prototype.slice.call(document.querySelectorAll(collidables));
      } else if (collidables instanceof NodeList || collidables instanceof Array) {
        return Array.prototype.slice.call(collidables);
      } else if (collidables instanceof HTMLElement) {
        return [collidables];
      } else if (typeof collidables === 'function') {
        return collidables();
      } else {
        return [];
      }
    }

    /**
     * Drag move handler
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      var target = event.sensorEvent.target;

      this.currentAnimationFrame = requestAnimationFrame(this[onRequestAnimationFrame](target));

      if (this.currentlyCollidingElement) {
        event.cancel();
      }

      var collidableInEvent = new _CollidableEvent.CollidableInEvent({
        dragEvent: event,
        collidingElement: this.currentlyCollidingElement
      });

      var collidableOutEvent = new _CollidableEvent.CollidableOutEvent({
        dragEvent: event,
        collidingElement: this.lastCollidingElement
      });

      var enteringCollidable = Boolean(this.currentlyCollidingElement && this.lastCollidingElement !== this.currentlyCollidingElement);
      var leavingCollidable = Boolean(!this.currentlyCollidingElement && this.lastCollidingElement);

      if (enteringCollidable) {
        if (this.lastCollidingElement) {
          this.draggable.trigger(collidableOutEvent);
        }

        this.draggable.trigger(collidableInEvent);
      } else if (leavingCollidable) {
        this.draggable.trigger(collidableOutEvent);
      }

      this.lastCollidingElement = this.currentlyCollidingElement;
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var lastCollidingElement = this.currentlyCollidingElement || this.lastCollidingElement;
      var collidableOutEvent = new _CollidableEvent.CollidableOutEvent({
        dragEvent: event,
        collidingElement: lastCollidingElement
      });

      if (lastCollidingElement) {
        this.draggable.trigger(collidableOutEvent);
      }

      this.lastCollidingElement = null;
      this.currentlyCollidingElement = null;
    }

    /**
     * Animation frame function
     * @private
     * @param {HTMLElement} target - Current move target
     * @return {Function}
     */

  }, {
    key: onRequestAnimationFrame,
    value: function value(target) {
      var _this2 = this;

      return function () {
        var collidables = _this2.getCollidables();
        _this2.currentlyCollidingElement = (0, _utils.closest)(target, function (element) {
          return collidables.includes(element);
        });
      };
    }
  }]);
  return Collidable;
}(_AbstractPlugin3.default);

exports.default = Collidable;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.CollidableOutEvent = exports.CollidableInEvent = exports.CollidableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base collidable event
 * @class CollidableEvent
 * @module CollidableEvent
 * @extends AbstractEvent
 */
var CollidableEvent = exports.CollidableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(CollidableEvent, _AbstractEvent);

  function CollidableEvent() {
    (0, _classCallCheck3.default)(this, CollidableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableEvent.__proto__ || Object.getPrototypeOf(CollidableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableEvent, [{
    key: 'dragEvent',


    /**
     * Drag event that triggered this colliable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return CollidableEvent;
}(_AbstractEvent3.default);

/**
 * Collidable in event
 * @class CollidableInEvent
 * @module CollidableInEvent
 * @extends CollidableEvent
 */


CollidableEvent.type = 'collidable';

var CollidableInEvent = exports.CollidableInEvent = function (_CollidableEvent) {
  (0, _inherits3.default)(CollidableInEvent, _CollidableEvent);

  function CollidableInEvent() {
    (0, _classCallCheck3.default)(this, CollidableInEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableInEvent.__proto__ || Object.getPrototypeOf(CollidableInEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableInEvent, [{
    key: 'collidingElement',


    /**
     * Element you are currently colliding with
     * @property collidingElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.collidingElement;
    }
  }]);
  return CollidableInEvent;
}(CollidableEvent);

/**
 * Collidable out event
 * @class CollidableOutEvent
 * @module CollidableOutEvent
 * @extends CollidableEvent
 */


CollidableInEvent.type = 'collidable:in';

var CollidableOutEvent = exports.CollidableOutEvent = function (_CollidableEvent2) {
  (0, _inherits3.default)(CollidableOutEvent, _CollidableEvent2);

  function CollidableOutEvent() {
    (0, _classCallCheck3.default)(this, CollidableOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableOutEvent.__proto__ || Object.getPrototypeOf(CollidableOutEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableOutEvent, [{
    key: 'collidingElement',


    /**
     * Element you were previously colliding with
     * @property collidingElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.collidingElement;
    }
  }]);
  return CollidableOutEvent;
}(CollidableEvent);

CollidableOutEvent.type = 'collidable:out';

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CollidableEvent = __webpack_require__(46);

Object.keys(_CollidableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _CollidableEvent[key];
    }
  });
});

var _Collidable = __webpack_require__(72);

var _Collidable2 = _interopRequireDefault(_Collidable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Collidable2.default;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Collidable = __webpack_require__(74);

Object.defineProperty(exports, 'Collidable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Collidable).default;
  }
});

var _ResizeMirror = __webpack_require__(71);

Object.defineProperty(exports, 'ResizeMirror', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ResizeMirror).default;
  }
});
Object.defineProperty(exports, 'defaultResizeMirrorOptions', {
  enumerable: true,
  get: function get() {
    return _ResizeMirror.defaultOptions;
  }
});

var _Snappable = __webpack_require__(69);

Object.defineProperty(exports, 'Snappable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Snappable).default;
  }
});

var _SwapAnimation = __webpack_require__(66);

Object.defineProperty(exports, 'SwapAnimation', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SwapAnimation).default;
  }
});
Object.defineProperty(exports, 'defaultSwapAnimationOptions', {
  enumerable: true,
  get: function get() {
    return _SwapAnimation.defaultOptions;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(27);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Draggable2 = __webpack_require__(26);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _SortableEvent = __webpack_require__(47);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragOverContainer = Symbol('onDragOverContainer');
var onDragOver = Symbol('onDragOver');
var onDragStop = Symbol('onDragStop');

/**
 * Returns announcement message when a Draggable element has been sorted with another Draggable element
 * or moved into a new container
 * @param {SortableSortedEvent} sortableEvent
 * @return {String}
 */
function onSortableSortedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'sortable element';

  if (dragEvent.over) {
    var overText = dragEvent.over.textContent.trim() || dragEvent.over.id || 'sortable element';
    var isFollowing = dragEvent.source.compareDocumentPosition(dragEvent.over) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (isFollowing) {
      return 'Placed ' + sourceText + ' after ' + overText;
    } else {
      return 'Placed ' + sourceText + ' before ' + overText;
    }
  } else {
    // need to figure out how to compute container name
    return 'Placed ' + sourceText + ' into a different container';
  }
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['sortable:sorted']
 */
var defaultAnnouncements = {
  'sortable:sorted': onSortableSortedDefaultAnnouncement
};

/**
 * Sortable is built on top of Draggable and allows sorting of draggable elements. Sortable will keep
 * track of the original index and emits the new index as you drag over draggable elements.
 * @class Sortable
 * @module Sortable
 * @extends Draggable
 */

var Sortable = function (_Draggable) {
  (0, _inherits3.default)(Sortable, _Draggable);

  /**
   * Sortable constructor.
   * @constructs Sortable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Sortable containers
   * @param {Object} options - Options for Sortable
   */
  function Sortable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Sortable);

    /**
     * start index of source on drag start
     * @property startIndex
     * @type {Number}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Sortable.__proto__ || Object.getPrototypeOf(Sortable)).call(this, containers, Object.assign({}, options, {
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.startIndex = null;

    /**
     * start container on drag start
     * @property startContainer
     * @type {HTMLElement}
     * @default null
     */
    _this.startContainer = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOverContainer] = _this[onDragOverContainer].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:over:container', _this[onDragOverContainer]).on('drag:over', _this[onDragOver]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Sortable instance.
   */


  (0, _createClass3.default)(Sortable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Sortable.prototype.__proto__ || Object.getPrototypeOf(Sortable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this[onDragStart]).off('drag:over:container', this[onDragOverContainer]).off('drag:over', this[onDragOver]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns true index of element within its container during drag operation, i.e. excluding mirror and original source
     * @param {HTMLElement} element - An element
     * @return {Number}
     */

  }, {
    key: 'index',
    value: function index(element) {
      return this.getDraggableElementsForContainer(element.parentNode).indexOf(element);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      this.startContainer = event.source.parentNode;
      this.startIndex = this.index(event.source);

      var sortableStartEvent = new _SortableEvent.SortableStartEvent({
        dragEvent: event,
        startIndex: this.startIndex,
        startContainer: this.startContainer
      });

      this.trigger(sortableStartEvent);

      if (sortableStartEvent.canceled()) {
        event.cancel();
      }
    }

    /**
     * Drag over container handler
     * @private
     * @param {DragOverContainerEvent} event - Drag over container event
     */

  }, {
    key: onDragOverContainer,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var source = event.source,
          over = event.over,
          overContainer = event.overContainer;

      var oldIndex = this.index(source);

      var sortableSortEvent = new _SortableEvent.SortableSortEvent({
        dragEvent: event,
        currentIndex: oldIndex,
        source: source,
        over: over
      });

      this.trigger(sortableSortEvent);

      if (sortableSortEvent.canceled()) {
        return;
      }

      var children = this.getDraggableElementsForContainer(overContainer);
      var moves = move({ source: source, over: over, overContainer: overContainer, children: children });

      if (!moves) {
        return;
      }

      var oldContainer = moves.oldContainer,
          newContainer = moves.newContainer;

      var newIndex = this.index(event.source);

      var sortableSortedEvent = new _SortableEvent.SortableSortedEvent({
        dragEvent: event,
        oldIndex: oldIndex,
        newIndex: newIndex,
        oldContainer: oldContainer,
        newContainer: newContainer
      });

      this.trigger(sortableSortedEvent);
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (event.over === event.originalSource || event.over === event.source) {
        return;
      }

      var source = event.source,
          over = event.over,
          overContainer = event.overContainer;

      var oldIndex = this.index(source);

      var sortableSortEvent = new _SortableEvent.SortableSortEvent({
        dragEvent: event,
        currentIndex: oldIndex,
        source: source,
        over: over
      });

      this.trigger(sortableSortEvent);

      if (sortableSortEvent.canceled()) {
        return;
      }

      var children = this.getDraggableElementsForContainer(overContainer);
      var moves = move({ source: source, over: over, overContainer: overContainer, children: children });

      if (!moves) {
        return;
      }

      var oldContainer = moves.oldContainer,
          newContainer = moves.newContainer;

      var newIndex = this.index(source);

      var sortableSortedEvent = new _SortableEvent.SortableSortedEvent({
        dragEvent: event,
        oldIndex: oldIndex,
        newIndex: newIndex,
        oldContainer: oldContainer,
        newContainer: newContainer
      });

      this.trigger(sortableSortedEvent);
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var sortableStopEvent = new _SortableEvent.SortableStopEvent({
        dragEvent: event,
        oldIndex: this.startIndex,
        newIndex: this.index(event.source),
        oldContainer: this.startContainer,
        newContainer: event.source.parentNode
      });

      this.trigger(sortableStopEvent);

      this.startIndex = null;
      this.startContainer = null;
    }
  }]);
  return Sortable;
}(_Draggable3.default);

exports.default = Sortable;


function index(element) {
  return Array.prototype.indexOf.call(element.parentNode.children, element);
}

function move(_ref2) {
  var source = _ref2.source,
      over = _ref2.over,
      overContainer = _ref2.overContainer,
      children = _ref2.children;

  var emptyOverContainer = !children.length;
  var differentContainer = source.parentNode !== overContainer;
  var sameContainer = over && !differentContainer;

  if (emptyOverContainer) {
    return moveInsideEmptyContainer(source, overContainer);
  } else if (sameContainer) {
    return moveWithinContainer(source, over);
  } else if (differentContainer) {
    return moveOutsideContainer(source, over, overContainer);
  } else {
    return null;
  }
}

function moveInsideEmptyContainer(source, overContainer) {
  var oldContainer = source.parentNode;

  overContainer.appendChild(source);

  return { oldContainer: oldContainer, newContainer: overContainer };
}

function moveWithinContainer(source, over) {
  var oldIndex = index(source);
  var newIndex = index(over);

  if (oldIndex < newIndex) {
    source.parentNode.insertBefore(source, over.nextElementSibling);
  } else {
    source.parentNode.insertBefore(source, over);
  }

  return { oldContainer: source.parentNode, newContainer: source.parentNode };
}

function moveOutsideContainer(source, over, overContainer) {
  var oldContainer = source.parentNode;

  if (over) {
    over.parentNode.insertBefore(source, over);
  } else {
    // need to figure out proper position
    overContainer.appendChild(source);
  }

  return { oldContainer: oldContainer, newContainer: source.parentNode };
}

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SortableStopEvent = exports.SortableSortedEvent = exports.SortableSortEvent = exports.SortableStartEvent = exports.SortableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sortable event
 * @class SortableEvent
 * @module SortableEvent
 * @extends AbstractEvent
 */
var SortableEvent = exports.SortableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SortableEvent, _AbstractEvent);

  function SortableEvent() {
    (0, _classCallCheck3.default)(this, SortableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableEvent.__proto__ || Object.getPrototypeOf(SortableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this sortable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return SortableEvent;
}(_AbstractEvent3.default);

/**
 * Sortable start event
 * @class SortableStartEvent
 * @module SortableStartEvent
 * @extends SortableEvent
 */


SortableEvent.type = 'sortable';

var SortableStartEvent = exports.SortableStartEvent = function (_SortableEvent) {
  (0, _inherits3.default)(SortableStartEvent, _SortableEvent);

  function SortableStartEvent() {
    (0, _classCallCheck3.default)(this, SortableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableStartEvent.__proto__ || Object.getPrototypeOf(SortableStartEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableStartEvent, [{
    key: 'startIndex',


    /**
     * Start index of source on sortable start
     * @property startIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.startIndex;
    }

    /**
     * Start container on sortable start
     * @property startContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'startContainer',
    get: function get() {
      return this.data.startContainer;
    }
  }]);
  return SortableStartEvent;
}(SortableEvent);

/**
 * Sortable sort event
 * @class SortableSortEvent
 * @module SortableSortEvent
 * @extends SortableEvent
 */


SortableStartEvent.type = 'sortable:start';
SortableStartEvent.cancelable = true;

var SortableSortEvent = exports.SortableSortEvent = function (_SortableEvent2) {
  (0, _inherits3.default)(SortableSortEvent, _SortableEvent2);

  function SortableSortEvent() {
    (0, _classCallCheck3.default)(this, SortableSortEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableSortEvent.__proto__ || Object.getPrototypeOf(SortableSortEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableSortEvent, [{
    key: 'currentIndex',


    /**
     * Index of current draggable element
     * @property currentIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.currentIndex;
    }

    /**
     * Draggable element you are hovering over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * Draggable container element you are hovering over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'overContainer',
    get: function get() {
      return this.data.newIndex;
    }
  }]);
  return SortableSortEvent;
}(SortableEvent);

/**
 * Sortable sorted event
 * @class SortableSortedEvent
 * @module SortableSortedEvent
 * @extends SortableEvent
 */


SortableSortEvent.type = 'sortable:sort';
SortableSortEvent.cancelable = true;

var SortableSortedEvent = exports.SortableSortedEvent = function (_SortableEvent3) {
  (0, _inherits3.default)(SortableSortedEvent, _SortableEvent3);

  function SortableSortedEvent() {
    (0, _classCallCheck3.default)(this, SortableSortedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableSortedEvent.__proto__ || Object.getPrototypeOf(SortableSortedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableSortedEvent, [{
    key: 'oldIndex',


    /**
     * Index of last sorted event
     * @property oldIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * New index of this sorted event
     * @property newIndex
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'newIndex',
    get: function get() {
      return this.data.newIndex;
    }

    /**
     * Old container of draggable element
     * @property oldContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'oldContainer',
    get: function get() {
      return this.data.oldContainer;
    }

    /**
     * New container of draggable element
     * @property newContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'newContainer',
    get: function get() {
      return this.data.newContainer;
    }
  }]);
  return SortableSortedEvent;
}(SortableEvent);

/**
 * Sortable stop event
 * @class SortableStopEvent
 * @module SortableStopEvent
 * @extends SortableEvent
 */


SortableSortedEvent.type = 'sortable:sorted';

var SortableStopEvent = exports.SortableStopEvent = function (_SortableEvent4) {
  (0, _inherits3.default)(SortableStopEvent, _SortableEvent4);

  function SortableStopEvent() {
    (0, _classCallCheck3.default)(this, SortableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableStopEvent.__proto__ || Object.getPrototypeOf(SortableStopEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableStopEvent, [{
    key: 'oldIndex',


    /**
     * Original index on sortable start
     * @property oldIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * New index of draggable element
     * @property newIndex
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'newIndex',
    get: function get() {
      return this.data.newIndex;
    }

    /**
     * Original container of draggable element
     * @property oldContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'oldContainer',
    get: function get() {
      return this.data.oldContainer;
    }

    /**
     * New container of draggable element
     * @property newContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'newContainer',
    get: function get() {
      return this.data.newContainer;
    }
  }]);
  return SortableStopEvent;
}(SortableEvent);

SortableStopEvent.type = 'sortable:stop';

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SortableEvent = __webpack_require__(47);

Object.keys(_SortableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SortableEvent[key];
    }
  });
});

var _Sortable = __webpack_require__(76);

var _Sortable2 = _interopRequireDefault(_Sortable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Sortable2.default;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(27);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Draggable2 = __webpack_require__(26);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _SwappableEvent = __webpack_require__(48);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragOver = Symbol('onDragOver');
var onDragStop = Symbol('onDragStop');

/**
 * Returns an announcement message when the Draggable element is swapped with another draggable element
 * @param {SwappableSwappedEvent} swappableEvent
 * @return {String}
 */
function onSwappableSwappedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent,
      swappedElement = _ref.swappedElement;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'swappable element';
  var overText = swappedElement.textContent.trim() || swappedElement.id || 'swappable element';

  return 'Swapped ' + sourceText + ' with ' + overText;
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['swappabled:swapped']
 */
var defaultAnnouncements = {
  'swappabled:swapped': onSwappableSwappedDefaultAnnouncement
};

/**
 * Swappable is built on top of Draggable and allows swapping of draggable elements.
 * Order is irrelevant to Swappable.
 * @class Swappable
 * @module Swappable
 * @extends Draggable
 */

var Swappable = function (_Draggable) {
  (0, _inherits3.default)(Swappable, _Draggable);

  /**
   * Swappable constructor.
   * @constructs Swappable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Swappable containers
   * @param {Object} options - Options for Swappable
   */
  function Swappable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Swappable);

    /**
     * Last draggable element that was dragged over
     * @property lastOver
     * @type {HTMLElement}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Swappable.__proto__ || Object.getPrototypeOf(Swappable)).call(this, containers, Object.assign({}, options, {
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.lastOver = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:over', _this[onDragOver]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Swappable instance.
   */


  (0, _createClass3.default)(Swappable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Swappable.prototype.__proto__ || Object.getPrototypeOf(Swappable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this._onDragStart).off('drag:over', this._onDragOver).off('drag:stop', this._onDragStop);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var swappableStartEvent = new _SwappableEvent.SwappableStartEvent({
        dragEvent: event
      });

      this.trigger(swappableStartEvent);

      if (swappableStartEvent.canceled()) {
        event.cancel();
      }
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (event.over === event.originalSource || event.over === event.source || event.canceled()) {
        return;
      }

      var swappableSwapEvent = new _SwappableEvent.SwappableSwapEvent({
        dragEvent: event,
        over: event.over,
        overContainer: event.overContainer
      });

      this.trigger(swappableSwapEvent);

      if (swappableSwapEvent.canceled()) {
        return;
      }

      // swap originally swapped element back
      if (this.lastOver && this.lastOver !== event.over) {
        swap(this.lastOver, event.source);
      }

      if (this.lastOver === event.over) {
        this.lastOver = null;
      } else {
        this.lastOver = event.over;
      }

      swap(event.source, event.over);

      var swappableSwappedEvent = new _SwappableEvent.SwappableSwappedEvent({
        dragEvent: event,
        swappedElement: event.over
      });

      this.trigger(swappableSwappedEvent);
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var swappableStopEvent = new _SwappableEvent.SwappableStopEvent({
        dragEvent: event
      });

      this.trigger(swappableStopEvent);
      this.lastOver = null;
    }
  }]);
  return Swappable;
}(_Draggable3.default);

exports.default = Swappable;


function withTempElement(callback) {
  var tmpElement = document.createElement('div');
  callback(tmpElement);
  tmpElement.parentNode.removeChild(tmpElement);
}

function swap(source, over) {
  var overParent = over.parentNode;
  var sourceParent = source.parentNode;

  withTempElement(function (tmpElement) {
    sourceParent.insertBefore(tmpElement, source);
    overParent.insertBefore(source, over);
    sourceParent.insertBefore(over, tmpElement);
  });
}

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SwappableStopEvent = exports.SwappableSwappedEvent = exports.SwappableSwapEvent = exports.SwappableStartEvent = exports.SwappableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base swappable event
 * @class SwappableEvent
 * @module SwappableEvent
 * @extends AbstractEvent
 */
var SwappableEvent = exports.SwappableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SwappableEvent, _AbstractEvent);

  function SwappableEvent() {
    (0, _classCallCheck3.default)(this, SwappableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableEvent.__proto__ || Object.getPrototypeOf(SwappableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this swappable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return SwappableEvent;
}(_AbstractEvent3.default);

/**
 * Swappable start event
 * @class SwappableStartEvent
 * @module SwappableStartEvent
 * @extends SwappableEvent
 */


SwappableEvent.type = 'swappable';

var SwappableStartEvent = exports.SwappableStartEvent = function (_SwappableEvent) {
  (0, _inherits3.default)(SwappableStartEvent, _SwappableEvent);

  function SwappableStartEvent() {
    (0, _classCallCheck3.default)(this, SwappableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableStartEvent.__proto__ || Object.getPrototypeOf(SwappableStartEvent)).apply(this, arguments));
  }

  return SwappableStartEvent;
}(SwappableEvent);

/**
 * Swappable swap event
 * @class SwappableSwapEvent
 * @module SwappableSwapEvent
 * @extends SwappableEvent
 */


SwappableStartEvent.type = 'swappable:start';
SwappableStartEvent.cancelable = true;

var SwappableSwapEvent = exports.SwappableSwapEvent = function (_SwappableEvent2) {
  (0, _inherits3.default)(SwappableSwapEvent, _SwappableEvent2);

  function SwappableSwapEvent() {
    (0, _classCallCheck3.default)(this, SwappableSwapEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableSwapEvent.__proto__ || Object.getPrototypeOf(SwappableSwapEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableSwapEvent, [{
    key: 'over',


    /**
     * Draggable element you are over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.over;
    }

    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'overContainer',
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return SwappableSwapEvent;
}(SwappableEvent);

/**
 * Swappable swapped event
 * @class SwappableSwappedEvent
 * @module SwappableSwappedEvent
 * @extends SwappableEvent
 */


SwappableSwapEvent.type = 'swappable:swap';
SwappableSwapEvent.cancelable = true;

var SwappableSwappedEvent = exports.SwappableSwappedEvent = function (_SwappableEvent3) {
  (0, _inherits3.default)(SwappableSwappedEvent, _SwappableEvent3);

  function SwappableSwappedEvent() {
    (0, _classCallCheck3.default)(this, SwappableSwappedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableSwappedEvent.__proto__ || Object.getPrototypeOf(SwappableSwappedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableSwappedEvent, [{
    key: 'swappedElement',


    /**
     * The draggable element that you swapped with
     * @property swappedElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.swappedElement;
    }
  }]);
  return SwappableSwappedEvent;
}(SwappableEvent);

/**
 * Swappable stop event
 * @class SwappableStopEvent
 * @module SwappableStopEvent
 * @extends SwappableEvent
 */


SwappableSwappedEvent.type = 'swappable:swapped';

var SwappableStopEvent = exports.SwappableStopEvent = function (_SwappableEvent4) {
  (0, _inherits3.default)(SwappableStopEvent, _SwappableEvent4);

  function SwappableStopEvent() {
    (0, _classCallCheck3.default)(this, SwappableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableStopEvent.__proto__ || Object.getPrototypeOf(SwappableStopEvent)).apply(this, arguments));
  }

  return SwappableStopEvent;
}(SwappableEvent);

SwappableStopEvent.type = 'swappable:stop';

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SwappableEvent = __webpack_require__(48);

Object.keys(_SwappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SwappableEvent[key];
    }
  });
});

var _Swappable = __webpack_require__(79);

var _Swappable2 = _interopRequireDefault(_Swappable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Swappable2.default;

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(11);
var $getOwnPropertyDescriptor = __webpack_require__(29).f;

__webpack_require__(49)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(82);
var $Object = __webpack_require__(4).Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(83), __esModule: true };

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = __webpack_require__(33);
var $getPrototypeOf = __webpack_require__(55);

__webpack_require__(49)('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(85);
module.exports = __webpack_require__(4).Object.getPrototypeOf;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(86), __esModule: true };

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(27);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(8);

var _Draggable2 = __webpack_require__(26);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _DroppableEvent = __webpack_require__(50);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var dropInDropzone = Symbol('dropInDropZone');
var returnToOriginalDropzone = Symbol('returnToOriginalDropzone');
var closestDropzone = Symbol('closestDropzone');
var getDropzones = Symbol('getDropzones');

/**
 * Returns an announcement message when the Draggable element is dropped into a dropzone element
 * @param {DroppableDroppedEvent} droppableEvent
 * @return {String}
 */
function onDroppableDroppedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent,
      dropzone = _ref.dropzone;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'draggable element';
  var dropzoneText = dropzone.textContent.trim() || dropzone.id || 'droppable element';

  return 'Dropped ' + sourceText + ' into ' + dropzoneText;
}

/**
 * Returns an announcement message when the Draggable element has returned to its original dropzone element
 * @param {DroppableReturnedEvent} droppableEvent
 * @return {String}
 */
function onDroppableReturnedDefaultAnnouncement(_ref2) {
  var dragEvent = _ref2.dragEvent,
      dropzone = _ref2.dropzone;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'draggable element';
  var dropzoneText = dropzone.textContent.trim() || dropzone.id || 'droppable element';

  return 'Returned ' + sourceText + ' from ' + dropzoneText;
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['droppable:dropped']
 * @const {Function} defaultAnnouncements['droppable:returned']
 */
var defaultAnnouncements = {
  'droppable:dropped': onDroppableDroppedDefaultAnnouncement,
  'droppable:returned': onDroppableReturnedDefaultAnnouncement
};

var defaultClasses = {
  'droppable:active': 'draggable-dropzone--active',
  'droppable:occupied': 'draggable-dropzone--occupied'
};

var defaultOptions = {
  dropzone: '.draggable-droppable'
};

/**
 * Droppable is built on top of Draggable and allows dropping draggable elements
 * into dropzone element
 * @class Droppable
 * @module Droppable
 * @extends Draggable
 */

var Droppable = function (_Draggable) {
  (0, _inherits3.default)(Droppable, _Draggable);

  /**
   * Droppable constructor.
   * @constructs Droppable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Droppable containers
   * @param {Object} options - Options for Droppable
   */
  function Droppable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Droppable);

    /**
     * All dropzone elements on drag start
     * @property dropzones
     * @type {HTMLElement[]}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Droppable.__proto__ || Object.getPrototypeOf(Droppable)).call(this, containers, Object.assign({}, defaultOptions, options, {
      classes: Object.assign({}, defaultClasses, options.classes || {}),
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.dropzones = null;

    /**
     * Last dropzone element that the source was dropped into
     * @property lastDropzone
     * @type {HTMLElement}
     */
    _this.lastDropzone = null;

    /**
     * Initial dropzone element that the source was drag from
     * @property initialDropzone
     * @type {HTMLElement}
     */
    _this.initialDropzone = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:move', _this[onDragMove]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Droppable instance.
   */


  (0, _createClass3.default)(Droppable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Droppable.prototype.__proto__ || Object.getPrototypeOf(Droppable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      this.dropzones = [].concat((0, _toConsumableArray3.default)(this[getDropzones]()));
      var dropzone = (0, _utils.closest)(event.sensorEvent.target, this.options.dropzone);

      if (!dropzone) {
        event.cancel();
        return;
      }

      var droppableStartEvent = new _DroppableEvent.DroppableStartEvent({
        dragEvent: event,
        dropzone: dropzone
      });

      this.trigger(droppableStartEvent);

      if (droppableStartEvent.canceled()) {
        event.cancel();
        return;
      }

      this.initialDropzone = dropzone;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.dropzones[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var dropzoneElement = _step.value;

          if (dropzoneElement.classList.contains(this.getClassNameFor('droppable:occupied'))) {
            continue;
          }

          dropzoneElement.classList.add(this.getClassNameFor('droppable:active'));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Drag move handler
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var dropzone = this[closestDropzone](event.sensorEvent.target);
      var overEmptyDropzone = dropzone && !dropzone.classList.contains(this.getClassNameFor('droppable:occupied'));

      if (overEmptyDropzone && this[dropInDropzone](event, dropzone)) {
        this.lastDropzone = dropzone;
      } else if ((!dropzone || dropzone === this.initialDropzone) && this.lastDropzone) {
        this[returnToOriginalDropzone](event);
        this.lastDropzone = null;
      }
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var droppableStopEvent = new _DroppableEvent.DroppableStopEvent({
        dragEvent: event,
        dropzone: this.lastDropzone || this.initialDropzone
      });

      this.trigger(droppableStopEvent);

      var occupiedClass = this.getClassNameFor('droppable:occupied');

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.dropzones[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var dropzone = _step2.value;

          dropzone.classList.remove(this.getClassNameFor('droppable:active'));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (this.lastDropzone && this.lastDropzone !== this.initialDropzone) {
        this.initialDropzone.classList.remove(occupiedClass);
      }

      this.dropzones = null;
      this.lastDropzone = null;
      this.initialDropzone = null;
    }

    /**
     * Drops a draggable element into a dropzone element
     * @private
     * @param {DragMoveEvent} event - Drag move event
     * @param {HTMLElement} dropzone - Dropzone element to drop draggable into
     */

  }, {
    key: dropInDropzone,
    value: function value(event, dropzone) {
      var droppableDroppedEvent = new _DroppableEvent.DroppableDroppedEvent({
        dragEvent: event,
        dropzone: dropzone
      });

      this.trigger(droppableDroppedEvent);

      if (droppableDroppedEvent.canceled()) {
        return false;
      }

      var occupiedClass = this.getClassNameFor('droppable:occupied');

      if (this.lastDropzone) {
        this.lastDropzone.classList.remove(occupiedClass);
      }

      dropzone.appendChild(event.source);
      dropzone.classList.add(occupiedClass);

      return true;
    }

    /**
     * Moves the previously dropped element back into its original dropzone
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: returnToOriginalDropzone,
    value: function value(event) {
      var droppableReturnedEvent = new _DroppableEvent.DroppableReturnedEvent({
        dragEvent: event,
        dropzone: this.lastDropzone
      });

      this.trigger(droppableReturnedEvent);

      if (droppableReturnedEvent.canceled()) {
        return;
      }

      this.initialDropzone.appendChild(event.source);
      this.lastDropzone.classList.remove(this.getClassNameFor('droppable:occupied'));
    }

    /**
     * Returns closest dropzone element for even target
     * @private
     * @param {HTMLElement} target - Event target
     * @return {HTMLElement|null}
     */

  }, {
    key: closestDropzone,
    value: function value(target) {
      if (!this.dropzones) {
        return null;
      }

      return (0, _utils.closest)(target, this.dropzones);
    }

    /**
     * Returns all current dropzone elements for this draggable instance
     * @private
     * @return {NodeList|HTMLElement[]|Array}
     */

  }, {
    key: getDropzones,
    value: function value() {
      var dropzone = this.options.dropzone;

      if (typeof dropzone === 'string') {
        return document.querySelectorAll(dropzone);
      } else if (dropzone instanceof NodeList || dropzone instanceof Array) {
        return dropzone;
      } else if (typeof dropzone === 'function') {
        return dropzone();
      } else {
        return [];
      }
    }
  }]);
  return Droppable;
}(_Draggable3.default);

exports.default = Droppable;

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DroppableStopEvent = exports.DroppableReturnedEvent = exports.DroppableDroppedEvent = exports.DroppableStartEvent = exports.DroppableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base droppable event
 * @class DroppableEvent
 * @module DroppableEvent
 * @extends AbstractEvent
 */
var DroppableEvent = exports.DroppableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DroppableEvent, _AbstractEvent);

  function DroppableEvent() {
    (0, _classCallCheck3.default)(this, DroppableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableEvent.__proto__ || Object.getPrototypeOf(DroppableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this droppable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return DroppableEvent;
}(_AbstractEvent3.default);

/**
 * Droppable start event
 * @class DroppableStartEvent
 * @module DroppableStartEvent
 * @extends DroppableEvent
 */


DroppableEvent.type = 'droppable';

var DroppableStartEvent = exports.DroppableStartEvent = function (_DroppableEvent) {
  (0, _inherits3.default)(DroppableStartEvent, _DroppableEvent);

  function DroppableStartEvent() {
    (0, _classCallCheck3.default)(this, DroppableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableStartEvent.__proto__ || Object.getPrototypeOf(DroppableStartEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableStartEvent, [{
    key: 'dropzone',


    /**
     * The initial dropzone element of the currently dragging draggable element
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableStartEvent;
}(DroppableEvent);

/**
 * Droppable dropped event
 * @class DroppableDroppedEvent
 * @module DroppableDroppedEvent
 * @extends DroppableEvent
 */


DroppableStartEvent.type = 'droppable:start';
DroppableStartEvent.cancelable = true;

var DroppableDroppedEvent = exports.DroppableDroppedEvent = function (_DroppableEvent2) {
  (0, _inherits3.default)(DroppableDroppedEvent, _DroppableEvent2);

  function DroppableDroppedEvent() {
    (0, _classCallCheck3.default)(this, DroppableDroppedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableDroppedEvent.__proto__ || Object.getPrototypeOf(DroppableDroppedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableDroppedEvent, [{
    key: 'dropzone',


    /**
     * The dropzone element you dropped the draggable element into
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableDroppedEvent;
}(DroppableEvent);

/**
 * Droppable returned event
 * @class DroppableReturnedEvent
 * @module DroppableReturnedEvent
 * @extends DroppableEvent
 */


DroppableDroppedEvent.type = 'droppable:dropped';
DroppableDroppedEvent.cancelable = true;

var DroppableReturnedEvent = exports.DroppableReturnedEvent = function (_DroppableEvent3) {
  (0, _inherits3.default)(DroppableReturnedEvent, _DroppableEvent3);

  function DroppableReturnedEvent() {
    (0, _classCallCheck3.default)(this, DroppableReturnedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableReturnedEvent.__proto__ || Object.getPrototypeOf(DroppableReturnedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableReturnedEvent, [{
    key: 'dropzone',


    /**
     * The dropzone element you dragged away from
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableReturnedEvent;
}(DroppableEvent);

/**
 * Droppable stop event
 * @class DroppableStopEvent
 * @module DroppableStopEvent
 * @extends DroppableEvent
 */


DroppableReturnedEvent.type = 'droppable:returned';
DroppableReturnedEvent.cancelable = true;

var DroppableStopEvent = exports.DroppableStopEvent = function (_DroppableEvent4) {
  (0, _inherits3.default)(DroppableStopEvent, _DroppableEvent4);

  function DroppableStopEvent() {
    (0, _classCallCheck3.default)(this, DroppableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableStopEvent.__proto__ || Object.getPrototypeOf(DroppableStopEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableStopEvent, [{
    key: 'dropzone',


    /**
     * The final dropzone element of the draggable element
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableStopEvent;
}(DroppableEvent);

DroppableStopEvent.type = 'droppable:stop';
DroppableStopEvent.cancelable = true;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DroppableEvent = __webpack_require__(50);

Object.keys(_DroppableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DroppableEvent[key];
    }
  });
});

var _Droppable = __webpack_require__(88);

var _Droppable2 = _interopRequireDefault(_Droppable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Droppable2.default;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The Emitter is a simple emitter class that provides you with `on()`, `off()` and `trigger()` methods
 * @class Emitter
 * @module Emitter
 */
var Emitter = function () {
  function Emitter() {
    (0, _classCallCheck3.default)(this, Emitter);

    this.callbacks = {};
  }

  /**
   * Registers callbacks by event name
   * @param {String} type
   * @param {...Function} callbacks
   */


  (0, _createClass3.default)(Emitter, [{
    key: 'on',
    value: function on(type) {
      var _callbacks$type;

      if (!this.callbacks[type]) {
        this.callbacks[type] = [];
      }

      for (var _len = arguments.length, callbacks = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        callbacks[_key - 1] = arguments[_key];
      }

      (_callbacks$type = this.callbacks[type]).push.apply(_callbacks$type, callbacks);

      return this;
    }

    /**
     * Unregisters callbacks by event name
     * @param {String} type
     * @param {Function} callback
     */

  }, {
    key: 'off',
    value: function off(type, callback) {
      if (!this.callbacks[type]) {
        return null;
      }

      var copy = this.callbacks[type].slice(0);

      for (var i = 0; i < copy.length; i++) {
        if (callback === copy[i]) {
          this.callbacks[type].splice(i, 1);
        }
      }

      return this;
    }

    /**
     * Triggers event callbacks by event object
     * @param {AbstractEvent} event
     */

  }, {
    key: 'trigger',
    value: function trigger(event) {
      if (!this.callbacks[event.type]) {
        return null;
      }

      var callbacks = [].concat((0, _toConsumableArray3.default)(this.callbacks[event.type]));
      var caughtErrors = [];

      for (var i = callbacks.length - 1; i >= 0; i--) {
        var callback = callbacks[i];

        try {
          callback(event);
        } catch (error) {
          caughtErrors.push(error);
        }
      }

      if (caughtErrors.length) {
        /* eslint-disable no-console */
        console.error('Draggable caught errors while triggering \'' + event.type + '\'', caughtErrors);
        /* eslint-disable no-console */
      }

      return this;
    }
  }]);
  return Emitter;
}();

exports.default = Emitter;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Emitter = __webpack_require__(91);

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Emitter2.default;

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = __webpack_require__(8);

var _Plugins = __webpack_require__(51);

var _Emitter = __webpack_require__(92);

var _Emitter2 = _interopRequireDefault(_Emitter);

var _Sensors = __webpack_require__(28);

var _DraggableEvent = __webpack_require__(52);

var _DragEvent = __webpack_require__(64);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var onDragPressure = Symbol('onDragPressure');

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['drag:start']
 * @const {Function} defaultAnnouncements['drag:stop']
 */
var defaultAnnouncements = {
  'drag:start': function dragStart(event) {
    return 'Picked up ' + (event.source.textContent.trim() || event.source.id || 'draggable element');
  },
  'drag:stop': function dragStop(event) {
    return 'Released ' + (event.source.textContent.trim() || event.source.id || 'draggable element');
  }
};

var defaultClasses = {
  'container:dragging': 'draggable-container--is-dragging',
  'source:dragging': 'draggable-source--is-dragging',
  'source:placed': 'draggable-source--placed',
  'container:placed': 'draggable-container--placed',
  'body:dragging': 'draggable--is-dragging',
  'draggable:over': 'draggable--over',
  'container:over': 'draggable-container--over',
  'source:original': 'draggable--original',
  mirror: 'draggable-mirror'
};

var defaultOptions = exports.defaultOptions = {
  draggable: '.draggable-source',
  handle: null,
  delay: 100,
  placedTimeout: 800,
  plugins: [],
  sensors: []
};

/**
 * This is the core draggable library that does the heavy lifting
 * @class Draggable
 * @module Draggable
 */

var Draggable = function () {

  /**
   * Draggable constructor.
   * @constructs Draggable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Draggable containers
   * @param {Object} options - Options for draggable
   */
  function Draggable() {
    var _this = this;

    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [document.body];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Draggable);

    /**
     * Draggable containers
     * @property containers
     * @type {HTMLElement[]}
     */
    if (containers instanceof NodeList || containers instanceof Array) {
      this.containers = [].concat((0, _toConsumableArray3.default)(containers));
    } else if (containers instanceof HTMLElement) {
      this.containers = [containers];
    } else {
      throw new Error('Draggable containers are expected to be of type `NodeList`, `HTMLElement[]` or `HTMLElement`');
    }

    this.options = Object.assign({}, defaultOptions, options, {
      classes: Object.assign({}, defaultClasses, options.classes || {}),
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    });

    /**
     * Draggables event emitter
     * @property emitter
     * @type {Emitter}
     */
    this.emitter = new _Emitter2.default();

    /**
     * Current drag state
     * @property dragging
     * @type {Boolean}
     */
    this.dragging = false;

    /**
     * Active plugins
     * @property plugins
     * @type {Plugin[]}
     */
    this.plugins = [];

    /**
     * Active sensors
     * @property sensors
     * @type {Sensor[]}
     */
    this.sensors = [];

    this[onDragStart] = this[onDragStart].bind(this);
    this[onDragMove] = this[onDragMove].bind(this);
    this[onDragStop] = this[onDragStop].bind(this);
    this[onDragPressure] = this[onDragPressure].bind(this);

    document.addEventListener('drag:start', this[onDragStart], true);
    document.addEventListener('drag:move', this[onDragMove], true);
    document.addEventListener('drag:stop', this[onDragStop], true);
    document.addEventListener('drag:pressure', this[onDragPressure], true);

    var defaultPlugins = Object.values(Draggable.Plugins).map(function (Plugin) {
      return Plugin;
    });
    var defaultSensors = [_Sensors.MouseSensor, _Sensors.TouchSensor];

    this.addPlugin.apply(this, [].concat((0, _toConsumableArray3.default)(defaultPlugins), (0, _toConsumableArray3.default)(this.options.plugins)));
    this.addSensor.apply(this, [].concat(defaultSensors, (0, _toConsumableArray3.default)(this.options.sensors)));

    var draggableInitializedEvent = new _DraggableEvent.DraggableInitializedEvent({
      draggable: this
    });

    this.on('mirror:created', function (_ref) {
      var mirror = _ref.mirror;
      return _this.mirror = mirror;
    });
    this.on('mirror:destroy', function () {
      return _this.mirror = null;
    });

    this.trigger(draggableInitializedEvent);
  }

  /**
   * Destroys Draggable instance. This removes all internal event listeners and
   * deactivates sensors and plugins
   */

  /**
   * Default plugins draggable uses
   * @static
   * @property {Object} Plugins
   * @property {Announcement} Plugins.Announcement
   * @property {Focusable} Plugins.Focusable
   * @property {Mirror} Plugins.Mirror
   * @property {Scrollable} Plugins.Scrollable
   * @type {Object}
   */


  (0, _createClass3.default)(Draggable, [{
    key: 'destroy',
    value: function destroy() {
      document.removeEventListener('drag:start', this[onDragStart], true);
      document.removeEventListener('drag:move', this[onDragMove], true);
      document.removeEventListener('drag:stop', this[onDragStop], true);
      document.removeEventListener('drag:pressure', this[onDragPressure], true);

      var draggableDestroyEvent = new _DraggableEvent.DraggableDestroyEvent({
        draggable: this
      });

      this.trigger(draggableDestroyEvent);

      this.removePlugin.apply(this, (0, _toConsumableArray3.default)(this.plugins.map(function (plugin) {
        return plugin.constructor;
      })));
      this.removeSensor.apply(this, (0, _toConsumableArray3.default)(this.sensors.map(function (sensor) {
        return sensor.constructor;
      })));
    }

    /**
     * Adds plugin to this draggable instance. This will end up calling the attach method of the plugin
     * @param {...typeof Plugin} plugins - Plugins that you want attached to draggable
     * @return {Draggable}
     * @example draggable.addPlugin(CustomA11yPlugin, CustomMirrorPlugin)
     */

  }, {
    key: 'addPlugin',
    value: function addPlugin() {
      var _this2 = this;

      for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
        plugins[_key] = arguments[_key];
      }

      var activePlugins = plugins.map(function (Plugin) {
        return new Plugin(_this2);
      });

      activePlugins.forEach(function (plugin) {
        return plugin.attach();
      });
      this.plugins = [].concat((0, _toConsumableArray3.default)(this.plugins), (0, _toConsumableArray3.default)(activePlugins));

      return this;
    }

    /**
     * Removes plugins that are already attached to this draggable instance. This will end up calling
     * the detach method of the plugin
     * @param {...typeof Plugin} plugins - Plugins that you want detached from draggable
     * @return {Draggable}
     * @example draggable.removePlugin(MirrorPlugin, CustomMirrorPlugin)
     */

  }, {
    key: 'removePlugin',
    value: function removePlugin() {
      for (var _len2 = arguments.length, plugins = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        plugins[_key2] = arguments[_key2];
      }

      var removedPlugins = this.plugins.filter(function (plugin) {
        return plugins.includes(plugin.constructor);
      });

      removedPlugins.forEach(function (plugin) {
        return plugin.detach();
      });
      this.plugins = this.plugins.filter(function (plugin) {
        return !plugins.includes(plugin.constructor);
      });

      return this;
    }

    /**
     * Adds sensors to this draggable instance. This will end up calling the attach method of the sensor
     * @param {...typeof Sensor} sensors - Sensors that you want attached to draggable
     * @return {Draggable}
     * @example draggable.addSensor(ForceTouchSensor, CustomSensor)
     */

  }, {
    key: 'addSensor',
    value: function addSensor() {
      var _this3 = this;

      for (var _len3 = arguments.length, sensors = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        sensors[_key3] = arguments[_key3];
      }

      var activeSensors = sensors.map(function (Sensor) {
        return new Sensor(_this3.containers, _this3.options);
      });

      activeSensors.forEach(function (sensor) {
        return sensor.attach();
      });
      this.sensors = [].concat((0, _toConsumableArray3.default)(this.sensors), (0, _toConsumableArray3.default)(activeSensors));

      return this;
    }

    /**
     * Removes sensors that are already attached to this draggable instance. This will end up calling
     * the detach method of the sensor
     * @param {...typeof Sensor} sensors - Sensors that you want attached to draggable
     * @return {Draggable}
     * @example draggable.removeSensor(TouchSensor, DragSensor)
     */

  }, {
    key: 'removeSensor',
    value: function removeSensor() {
      for (var _len4 = arguments.length, sensors = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        sensors[_key4] = arguments[_key4];
      }

      var removedSensors = this.sensors.filter(function (sensor) {
        return sensors.includes(sensor.constructor);
      });

      removedSensors.forEach(function (sensor) {
        return sensor.detach();
      });
      this.sensors = this.sensors.filter(function (sensor) {
        return !sensors.includes(sensor.constructor);
      });

      return this;
    }

    /**
     * Adds container to this draggable instance
     * @param {...HTMLElement} containers - Containers you want to add to draggable
     * @return {Draggable}
     * @example draggable.addContainer(document.body)
     */

  }, {
    key: 'addContainer',
    value: function addContainer() {
      for (var _len5 = arguments.length, containers = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        containers[_key5] = arguments[_key5];
      }

      this.containers = [].concat((0, _toConsumableArray3.default)(this.containers), containers);
      this.sensors.forEach(function (sensor) {
        return sensor.addContainer.apply(sensor, containers);
      });
      return this;
    }

    /**
     * Removes container from this draggable instance
     * @param {...HTMLElement} containers - Containers you want to remove from draggable
     * @return {Draggable}
     * @example draggable.removeContainer(document.body)
     */

  }, {
    key: 'removeContainer',
    value: function removeContainer() {
      for (var _len6 = arguments.length, containers = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        containers[_key6] = arguments[_key6];
      }

      this.containers = this.containers.filter(function (container) {
        return !containers.includes(container);
      });
      this.sensors.forEach(function (sensor) {
        return sensor.removeContainer.apply(sensor, containers);
      });
      return this;
    }

    /**
     * Adds listener for draggable events
     * @param {String} type - Event name
     * @param {...Function} callbacks - Event callbacks
     * @return {Draggable}
     * @example draggable.on('drag:start', (dragEvent) => dragEvent.cancel());
     */

  }, {
    key: 'on',
    value: function on(type) {
      var _emitter;

      for (var _len7 = arguments.length, callbacks = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        callbacks[_key7 - 1] = arguments[_key7];
      }

      (_emitter = this.emitter).on.apply(_emitter, [type].concat(callbacks));
      return this;
    }

    /**
     * Removes listener from draggable
     * @param {String} type - Event name
     * @param {Function} callback - Event callback
     * @return {Draggable}
     * @example draggable.off('drag:start', handlerFunction);
     */

  }, {
    key: 'off',
    value: function off(type, callback) {
      this.emitter.off(type, callback);
      return this;
    }

    /**
     * Triggers draggable event
     * @param {AbstractEvent} event - Event instance
     * @return {Draggable}
     * @example draggable.trigger(event);
     */

  }, {
    key: 'trigger',
    value: function trigger(event) {
      this.emitter.trigger(event);
      return this;
    }

    /**
     * Returns class name for class identifier
     * @param {String} name - Name of class identifier
     * @return {String|null}
     */

  }, {
    key: 'getClassNameFor',
    value: function getClassNameFor(name) {
      return this.options.classes[name];
    }

    /**
     * Returns true if this draggable instance is currently dragging
     * @return {Boolean}
     */

  }, {
    key: 'isDragging',
    value: function isDragging() {
      return Boolean(this.dragging);
    }

    /**
     * Returns all draggable elements
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getDraggableElements',
    value: function getDraggableElements() {
      var _this4 = this;

      return this.containers.reduce(function (current, container) {
        return [].concat((0, _toConsumableArray3.default)(current), (0, _toConsumableArray3.default)(_this4.getDraggableElementsForContainer(container)));
      }, []);
    }

    /**
     * Returns draggable elements for a given container, excluding the mirror and
     * original source element if present
     * @param {HTMLElement} container
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getDraggableElementsForContainer',
    value: function getDraggableElementsForContainer(container) {
      var _this5 = this;

      var allDraggableElements = container.querySelectorAll(this.options.draggable);

      return [].concat((0, _toConsumableArray3.default)(allDraggableElements)).filter(function (childElement) {
        return childElement !== _this5.originalSource && childElement !== _this5.mirror;
      });
    }

    /**
     * Drag start handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var _this6 = this;

      var sensorEvent = getSensorEvent(event);
      var target = sensorEvent.target,
          container = sensorEvent.container;


      if (!this.containers.includes(container)) {
        return;
      }

      if (this.options.handle && target && !(0, _utils.closest)(target, this.options.handle)) {
        sensorEvent.cancel();
        return;
      }

      // Find draggable source element
      this.originalSource = (0, _utils.closest)(target, this.options.draggable);
      this.sourceContainer = container;

      if (!this.originalSource) {
        sensorEvent.cancel();
        return;
      }

      if (this.lastPlacedSource && this.lastPlacedContainer) {
        clearTimeout(this.placedTimeoutID);
        this.lastPlacedSource.classList.remove(this.getClassNameFor('source:placed'));
        this.lastPlacedContainer.classList.remove(this.getClassNameFor('container:placed'));
      }

      this.source = this.originalSource.cloneNode(true);
      this.originalSource.parentNode.insertBefore(this.source, this.originalSource);
      this.originalSource.style.display = 'none';

      var dragEvent = new _DragEvent.DragStartEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: sensorEvent
      });

      this.trigger(dragEvent);

      this.dragging = !dragEvent.canceled();

      if (dragEvent.canceled()) {
        this.source.parentNode.removeChild(this.source);
        this.originalSource.style.display = null;
        return;
      }

      this.originalSource.classList.add(this.getClassNameFor('source:original'));
      this.source.classList.add(this.getClassNameFor('source:dragging'));
      this.sourceContainer.classList.add(this.getClassNameFor('container:dragging'));
      document.body.classList.add(this.getClassNameFor('body:dragging'));
      applyUserSelect(document.body, 'none');

      requestAnimationFrame(function () {
        var oldSensorEvent = getSensorEvent(event);
        var newSensorEvent = oldSensorEvent.clone({ target: _this6.source });

        _this6[onDragMove](Object.assign({}, event, {
          detail: newSensorEvent
        }));
      });
    }

    /**
     * Drag move handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var sensorEvent = getSensorEvent(event);
      var container = sensorEvent.container;

      var target = sensorEvent.target;

      var dragMoveEvent = new _DragEvent.DragMoveEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: sensorEvent
      });

      this.trigger(dragMoveEvent);

      if (dragMoveEvent.canceled()) {
        sensorEvent.cancel();
      }

      target = (0, _utils.closest)(target, this.options.draggable);
      var withinCorrectContainer = (0, _utils.closest)(sensorEvent.target, this.containers);
      var overContainer = sensorEvent.overContainer || withinCorrectContainer;
      var isLeavingContainer = this.currentOverContainer && overContainer !== this.currentOverContainer;
      var isLeavingDraggable = this.currentOver && target !== this.currentOver;
      var isOverContainer = overContainer && this.currentOverContainer !== overContainer;
      var isOverDraggable = withinCorrectContainer && target && this.currentOver !== target;

      if (isLeavingDraggable) {
        var dragOutEvent = new _DragEvent.DragOutEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          over: this.currentOver
        });

        this.currentOver.classList.remove(this.getClassNameFor('draggable:over'));
        this.currentOver = null;

        this.trigger(dragOutEvent);
      }

      if (isLeavingContainer) {
        var dragOutContainerEvent = new _DragEvent.DragOutContainerEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: this.currentOverContainer
        });

        this.currentOverContainer.classList.remove(this.getClassNameFor('container:over'));
        this.currentOverContainer = null;

        this.trigger(dragOutContainerEvent);
      }

      if (isOverContainer) {
        overContainer.classList.add(this.getClassNameFor('container:over'));

        var dragOverContainerEvent = new _DragEvent.DragOverContainerEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: overContainer
        });

        this.currentOverContainer = overContainer;

        this.trigger(dragOverContainerEvent);
      }

      if (isOverDraggable) {
        target.classList.add(this.getClassNameFor('draggable:over'));

        var dragOverEvent = new _DragEvent.DragOverEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: overContainer,
          over: target
        });

        this.currentOver = target;

        this.trigger(dragOverEvent);
      }
    }

    /**
     * Drag stop handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var _this7 = this;

      if (!this.dragging) {
        return;
      }

      this.dragging = false;

      var dragStopEvent = new _DragEvent.DragStopEvent({
        source: this.source,
        originalSource: this.originalSource,
        sensorEvent: event.sensorEvent,
        sourceContainer: this.sourceContainer
      });

      this.trigger(dragStopEvent);

      this.source.parentNode.insertBefore(this.originalSource, this.source);
      this.source.parentNode.removeChild(this.source);
      this.originalSource.style.display = '';

      this.source.classList.remove(this.getClassNameFor('source:dragging'));
      this.originalSource.classList.remove(this.getClassNameFor('source:original'));
      this.originalSource.classList.add(this.getClassNameFor('source:placed'));
      this.sourceContainer.classList.add(this.getClassNameFor('container:placed'));
      this.sourceContainer.classList.remove(this.getClassNameFor('container:dragging'));
      document.body.classList.remove(this.getClassNameFor('body:dragging'));
      applyUserSelect(document.body, '');

      if (this.currentOver) {
        this.currentOver.classList.remove(this.getClassNameFor('draggable:over'));
      }

      if (this.currentOverContainer) {
        this.currentOverContainer.classList.remove(this.getClassNameFor('container:over'));
      }

      this.lastPlacedSource = this.originalSource;
      this.lastPlacedContainer = this.sourceContainer;

      this.placedTimeoutID = setTimeout(function () {
        if (_this7.lastPlacedSource) {
          _this7.lastPlacedSource.classList.remove(_this7.getClassNameFor('source:placed'));
        }

        if (_this7.lastPlacedContainer) {
          _this7.lastPlacedContainer.classList.remove(_this7.getClassNameFor('container:placed'));
        }

        _this7.lastPlacedSource = null;
        _this7.lastPlacedContainer = null;
      }, this.options.placedTimeout);

      this.source = null;
      this.originalSource = null;
      this.currentOverContainer = null;
      this.currentOver = null;
      this.sourceContainer = null;
    }

    /**
     * Drag pressure handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragPressure,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var sensorEvent = getSensorEvent(event);
      var source = this.source || (0, _utils.closest)(sensorEvent.originalEvent.target, this.options.draggable);

      var dragPressureEvent = new _DragEvent.DragPressureEvent({
        sensorEvent: sensorEvent,
        source: source,
        pressure: sensorEvent.pressure
      });

      this.trigger(dragPressureEvent);
    }
  }]);
  return Draggable;
}();

Draggable.Plugins = { Announcement: _Plugins.Announcement, Focusable: _Plugins.Focusable, Mirror: _Plugins.Mirror, Scrollable: _Plugins.Scrollable };
exports.default = Draggable;


function getSensorEvent(event) {
  return event.detail;
}

function applyUserSelect(element, value) {
  element.style.webkitUserSelect = value;
  element.style.mozUserSelect = value;
  element.style.msUserSelect = value;
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Sensor2 = __webpack_require__(20);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMouseForceWillBegin = Symbol('onMouseForceWillBegin');
var onMouseForceDown = Symbol('onMouseForceDown');
var onMouseDown = Symbol('onMouseDown');
var onMouseForceChange = Symbol('onMouseForceChange');
var onMouseMove = Symbol('onMouseMove');
var onMouseUp = Symbol('onMouseUp');
var onMouseForceGlobalChange = Symbol('onMouseForceGlobalChange');

/**
 * This sensor picks up native force touch events and dictates drag operations
 * @class ForceTouchSensor
 * @module ForceTouchSensor
 * @extends Sensor
 */

var ForceTouchSensor = function (_Sensor) {
  (0, _inherits3.default)(ForceTouchSensor, _Sensor);

  /**
   * ForceTouchSensor constructor.
   * @constructs ForceTouchSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function ForceTouchSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, ForceTouchSensor);

    /**
     * Draggable element needs to be remembered to unset the draggable attribute after drag operation has completed
     * @property mightDrag
     * @type {Boolean}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (ForceTouchSensor.__proto__ || Object.getPrototypeOf(ForceTouchSensor)).call(this, containers, options));

    _this.mightDrag = false;

    _this[onMouseForceWillBegin] = _this[onMouseForceWillBegin].bind(_this);
    _this[onMouseForceDown] = _this[onMouseForceDown].bind(_this);
    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseForceChange] = _this[onMouseForceChange].bind(_this);
    _this[onMouseMove] = _this[onMouseMove].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(ForceTouchSensor, [{
    key: 'attach',
    value: function attach() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.containers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var container = _step.value;

          container.addEventListener('webkitmouseforcewillbegin', this[onMouseForceWillBegin], false);
          container.addEventListener('webkitmouseforcedown', this[onMouseForceDown], false);
          container.addEventListener('mousedown', this[onMouseDown], true);
          container.addEventListener('webkitmouseforcechanged', this[onMouseForceChange], false);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      document.addEventListener('mousemove', this[onMouseMove]);
      document.addEventListener('mouseup', this[onMouseUp]);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.containers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var container = _step2.value;

          container.removeEventListener('webkitmouseforcewillbegin', this[onMouseForceWillBegin], false);
          container.removeEventListener('webkitmouseforcedown', this[onMouseForceDown], false);
          container.removeEventListener('mousedown', this[onMouseDown], true);
          container.removeEventListener('webkitmouseforcechanged', this[onMouseForceChange], false);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      document.removeEventListener('mousemove', this[onMouseMove]);
      document.removeEventListener('mouseup', this[onMouseUp]);
    }

    /**
     * Mouse force will begin handler
     * @private
     * @param {Event} event - Mouse force will begin event
     */

  }, {
    key: onMouseForceWillBegin,
    value: function value(event) {
      event.preventDefault();
      this.mightDrag = true;
    }

    /**
     * Mouse force down handler
     * @private
     * @param {Event} event - Mouse force down event
     */

  }, {
    key: onMouseForceDown,
    value: function value(event) {
      if (this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = event.currentTarget;

      var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragStartEvent);

      this.currentContainer = container;
      this.dragging = !dragStartEvent.canceled();
      this.mightDrag = false;
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: null,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      this.currentContainer = null;
      this.dragging = false;
      this.mightDrag = false;
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      if (!this.mightDrag) {
        return;
      }

      // Need workaround for real click
      // Cancel potential drag events
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    /**
     * Mouse move handler
     * @private
     * @param {Event} event - Mouse force will begin event
     */

  }, {
    key: onMouseMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Mouse force change handler
     * @private
     * @param {Event} event - Mouse force change event
     */

  }, {
    key: onMouseForceChange,
    value: function value(event) {
      if (this.dragging) {
        return;
      }

      var target = event.target;
      var container = event.currentTarget;

      var dragPressureEvent = new _SensorEvent.DragPressureSensorEvent({
        pressure: event.webkitForce,
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragPressureEvent);
    }

    /**
     * Mouse force global change handler
     * @private
     * @param {Event} event - Mouse force global change event
     */

  }, {
    key: onMouseForceGlobalChange,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = event.target;

      var dragPressureEvent = new _SensorEvent.DragPressureSensorEvent({
        pressure: event.webkitForce,
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragPressureEvent);
    }
  }]);
  return ForceTouchSensor;
}(_Sensor3.default);

exports.default = ForceTouchSensor;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ForceTouchSensor = __webpack_require__(94);

var _ForceTouchSensor2 = _interopRequireDefault(_ForceTouchSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _ForceTouchSensor2.default;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(8);

var _Sensor2 = __webpack_require__(20);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMouseDown = Symbol('onMouseDown');
var onMouseUp = Symbol('onMouseUp');
var onDragStart = Symbol('onDragStart');
var onDragOver = Symbol('onDragOver');
var onDragEnd = Symbol('onDragEnd');
var onDrop = Symbol('onDrop');
var reset = Symbol('reset');

/**
 * This sensor picks up native browser drag events and dictates drag operations
 * @class DragSensor
 * @module DragSensor
 * @extends Sensor
 */

var DragSensor = function (_Sensor) {
  (0, _inherits3.default)(DragSensor, _Sensor);

  /**
   * DragSensor constructor.
   * @constructs DragSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function DragSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, DragSensor);

    /**
     * Mouse down timer which will end up setting the draggable attribute, unless canceled
     * @property mouseDownTimeout
     * @type {Number}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (DragSensor.__proto__ || Object.getPrototypeOf(DragSensor)).call(this, containers, options));

    _this.mouseDownTimeout = null;

    /**
     * Draggable element needs to be remembered to unset the draggable attribute after drag operation has completed
     * @property draggableElement
     * @type {HTMLElement}
     */
    _this.draggableElement = null;

    /**
     * Native draggable element could be links or images, their draggable state will be disabled during drag operation
     * @property nativeDraggableElement
     * @type {HTMLElement}
     */
    _this.nativeDraggableElement = null;

    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragEnd] = _this[onDragEnd].bind(_this);
    _this[onDrop] = _this[onDrop].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(DragSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Drag start handler
     * @private
     * @param {Event} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var _this2 = this;

      // Need for firefox. "text" key is needed for IE
      event.dataTransfer.setData('text', '');
      event.dataTransfer.effectAllowed = this.options.type;

      var target = document.elementFromPoint(event.clientX, event.clientY);
      this.currentContainer = (0, _utils.closest)(event.target, this.containers);

      if (!this.currentContainer) {
        return;
      }

      var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      // Workaround
      setTimeout(function () {
        _this2.trigger(_this2.currentContainer, dragStartEvent);

        if (dragStartEvent.canceled()) {
          _this2.dragging = false;
        } else {
          _this2.dragging = true;
        }
      }, 0);
    }

    /**
     * Drag over handler
     * @private
     * @param {Event} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = this.currentContainer;

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragMoveEvent);

      if (!dragMoveEvent.canceled()) {
        event.preventDefault();
        event.dataTransfer.dropEffect = this.options.type;
      }
    }

    /**
     * Drag end handler
     * @private
     * @param {Event} event - Drag end event
     */

  }, {
    key: onDragEnd,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      document.removeEventListener('mouseup', this[onMouseUp], true);

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = this.currentContainer;

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragStopEvent);

      this.dragging = false;

      this[reset]();
    }

    /**
     * Drop handler
     * @private
     * @param {Event} event - Drop event
     */

  }, {
    key: onDrop,
    value: function value(event) {
      // eslint-disable-line class-methods-use-this
      event.preventDefault();
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      var _this3 = this;

      // Firefox bug for inputs within draggables https://bugzilla.mozilla.org/show_bug.cgi?id=739071
      if (event.target && (event.target.form || event.target.contenteditable)) {
        return;
      }

      var nativeDraggableElement = (0, _utils.closest)(event.target, function (element) {
        return element.draggable;
      });

      if (nativeDraggableElement) {
        nativeDraggableElement.draggable = false;
        this.nativeDraggableElement = nativeDraggableElement;
      }

      document.addEventListener('mouseup', this[onMouseUp], true);
      document.addEventListener('dragstart', this[onDragStart], false);
      document.addEventListener('dragover', this[onDragOver], false);
      document.addEventListener('dragend', this[onDragEnd], false);
      document.addEventListener('drop', this[onDrop], false);

      var target = (0, _utils.closest)(event.target, this.options.draggable);

      if (!target) {
        return;
      }

      this.mouseDownTimeout = setTimeout(function () {
        target.draggable = true;
        _this3.draggableElement = target;
      }, this.options.delay);
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value() {
      this[reset]();
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: reset,
    value: function value() {
      clearTimeout(this.mouseDownTimeout);

      document.removeEventListener('mouseup', this[onMouseUp], true);
      document.removeEventListener('dragstart', this[onDragStart], false);
      document.removeEventListener('dragover', this[onDragOver], false);
      document.removeEventListener('dragend', this[onDragEnd], false);
      document.removeEventListener('drop', this[onDrop], false);

      if (this.nativeDraggableElement) {
        this.nativeDraggableElement.draggable = true;
        this.nativeDraggableElement = null;
      }

      if (this.draggableElement) {
        this.draggableElement.draggable = false;
        this.draggableElement = null;
      }
    }
  }]);
  return DragSensor;
}(_Sensor3.default);

exports.default = DragSensor;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragSensor = __webpack_require__(96);

var _DragSensor2 = _interopRequireDefault(_DragSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _DragSensor2.default;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(8);

var _Sensor2 = __webpack_require__(20);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onTouchStart = Symbol('onTouchStart');
var onTouchHold = Symbol('onTouchHold');
var onTouchEnd = Symbol('onTouchEnd');
var onTouchMove = Symbol('onTouchMove');

/**
 * Prevents scrolling when set to true
 * @var {Boolean} preventScrolling
 */
var preventScrolling = false;

// WebKit requires cancelable `touchmove` events to be added as early as possible
window.addEventListener('touchmove', function (event) {
  if (!preventScrolling) {
    return;
  }

  // Prevent scrolling
  event.preventDefault();
}, { passive: false });

/**
 * This sensor picks up native browser touch events and dictates drag operations
 * @class TouchSensor
 * @module TouchSensor
 * @extends Sensor
 */

var TouchSensor = function (_Sensor) {
  (0, _inherits3.default)(TouchSensor, _Sensor);

  /**
   * TouchSensor constructor.
   * @constructs TouchSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function TouchSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, TouchSensor);

    /**
     * Closest scrollable container so accidental scroll can cancel long touch
     * @property currentScrollableParent
     * @type {HTMLElement}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (TouchSensor.__proto__ || Object.getPrototypeOf(TouchSensor)).call(this, containers, options));

    _this.currentScrollableParent = null;

    /**
     * TimeoutID for long touch
     * @property tapTimeout
     * @type {Number}
     */
    _this.tapTimeout = null;

    /**
     * touchMoved indicates if touch has moved during tapTimeout
     * @property touchMoved
     * @type {Boolean}
     */
    _this.touchMoved = false;

    _this[onTouchStart] = _this[onTouchStart].bind(_this);
    _this[onTouchHold] = _this[onTouchHold].bind(_this);
    _this[onTouchEnd] = _this[onTouchEnd].bind(_this);
    _this[onTouchMove] = _this[onTouchMove].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(TouchSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('touchstart', this[onTouchStart]);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('touchstart', this[onTouchStart]);
    }

    /**
     * Touch start handler
     * @private
     * @param {Event} event - Touch start event
     */

  }, {
    key: onTouchStart,
    value: function value(event) {
      var container = (0, _utils.closest)(event.target, this.containers);

      if (!container) {
        return;
      }

      document.addEventListener('touchmove', this[onTouchMove]);
      document.addEventListener('touchend', this[onTouchEnd]);
      document.addEventListener('touchcancel', this[onTouchEnd]);
      container.addEventListener('contextmenu', onContextMenu);

      this.currentContainer = container;
      this.tapTimeout = setTimeout(this[onTouchHold](event, container), this.options.delay);
    }

    /**
     * Touch hold handler
     * @private
     * @param {Event} event - Touch start event
     * @param {HTMLElement} container - Container element
     */

  }, {
    key: onTouchHold,
    value: function value(event, container) {
      var _this2 = this;

      return function () {
        if (_this2.touchMoved) {
          return;
        }

        var touch = event.touches[0] || event.changedTouches[0];
        var target = event.target;

        var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
          clientX: touch.pageX,
          clientY: touch.pageY,
          target: target,
          container: container,
          originalEvent: event
        });

        _this2.trigger(container, dragStartEvent);

        _this2.dragging = !dragStartEvent.canceled();
        preventScrolling = _this2.dragging;
      };
    }

    /**
     * Touch move handler
     * @private
     * @param {Event} event - Touch move event
     */

  }, {
    key: onTouchMove,
    value: function value(event) {
      this.touchMoved = true;

      if (!this.dragging) {
        return;
      }

      var touch = event.touches[0] || event.changedTouches[0];
      var target = document.elementFromPoint(touch.pageX - window.scrollX, touch.pageY - window.scrollY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: touch.pageX,
        clientY: touch.pageY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Touch end handler
     * @private
     * @param {Event} event - Touch end event
     */

  }, {
    key: onTouchEnd,
    value: function value(event) {
      this.touchMoved = false;
      preventScrolling = false;

      document.removeEventListener('touchend', this[onTouchEnd]);
      document.removeEventListener('touchcancel', this[onTouchEnd]);
      document.removeEventListener('touchmove', this[onTouchMove]);

      if (this.currentContainer) {
        this.currentContainer.removeEventListener('contextmenu', onContextMenu);
      }

      clearTimeout(this.tapTimeout);

      if (!this.dragging) {
        return;
      }

      var touch = event.touches[0] || event.changedTouches[0];
      var target = document.elementFromPoint(touch.pageX - window.scrollX, touch.pageY - window.scrollY);

      event.preventDefault();

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: touch.pageX,
        clientY: touch.pageY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      this.currentContainer = null;
      this.dragging = false;
    }
  }]);
  return TouchSensor;
}(_Sensor3.default);

exports.default = TouchSensor;


function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
}

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _TouchSensor = __webpack_require__(98);

var _TouchSensor2 = _interopRequireDefault(_TouchSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _TouchSensor2.default;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DragPressureSensorEvent = exports.DragStopSensorEvent = exports.DragMoveSensorEvent = exports.DragStartSensorEvent = exports.SensorEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sensor event
 * @class SensorEvent
 * @module SensorEvent
 * @extends AbstractEvent
 */
var SensorEvent = exports.SensorEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SensorEvent, _AbstractEvent);

  function SensorEvent() {
    (0, _classCallCheck3.default)(this, SensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SensorEvent.__proto__ || Object.getPrototypeOf(SensorEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SensorEvent, [{
    key: 'originalEvent',

    /**
     * Original browser event that triggered a sensor
     * @property originalEvent
     * @type {Event}
     * @readonly
     */
    get: function get() {
      return this.data.originalEvent;
    }

    /**
     * Normalized clientX for both touch and mouse events
     * @property clientX
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'clientX',
    get: function get() {
      return this.data.clientX;
    }

    /**
     * Normalized clientY for both touch and mouse events
     * @property clientY
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'clientY',
    get: function get() {
      return this.data.clientY;
    }

    /**
     * Normalized target for both touch and mouse events
     * Returns the element that is behind cursor or touch pointer
     * @property target
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'target',
    get: function get() {
      return this.data.target;
    }

    /**
     * Container that initiated the sensor
     * @property container
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'container',
    get: function get() {
      return this.data.container;
    }

    /**
     * Trackpad pressure
     * @property pressure
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'pressure',
    get: function get() {
      return this.data.pressure;
    }
  }]);
  return SensorEvent;
}(_AbstractEvent3.default);

/**
 * Drag start sensor event
 * @class DragStartSensorEvent
 * @module DragStartSensorEvent
 * @extends SensorEvent
 */


var DragStartSensorEvent = exports.DragStartSensorEvent = function (_SensorEvent) {
  (0, _inherits3.default)(DragStartSensorEvent, _SensorEvent);

  function DragStartSensorEvent() {
    (0, _classCallCheck3.default)(this, DragStartSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStartSensorEvent.__proto__ || Object.getPrototypeOf(DragStartSensorEvent)).apply(this, arguments));
  }

  return DragStartSensorEvent;
}(SensorEvent);

/**
 * Drag move sensor event
 * @class DragMoveSensorEvent
 * @module DragMoveSensorEvent
 * @extends SensorEvent
 */


DragStartSensorEvent.type = 'drag:start';

var DragMoveSensorEvent = exports.DragMoveSensorEvent = function (_SensorEvent2) {
  (0, _inherits3.default)(DragMoveSensorEvent, _SensorEvent2);

  function DragMoveSensorEvent() {
    (0, _classCallCheck3.default)(this, DragMoveSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragMoveSensorEvent.__proto__ || Object.getPrototypeOf(DragMoveSensorEvent)).apply(this, arguments));
  }

  return DragMoveSensorEvent;
}(SensorEvent);

/**
 * Drag stop sensor event
 * @class DragStopSensorEvent
 * @module DragStopSensorEvent
 * @extends SensorEvent
 */


DragMoveSensorEvent.type = 'drag:move';

var DragStopSensorEvent = exports.DragStopSensorEvent = function (_SensorEvent3) {
  (0, _inherits3.default)(DragStopSensorEvent, _SensorEvent3);

  function DragStopSensorEvent() {
    (0, _classCallCheck3.default)(this, DragStopSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStopSensorEvent.__proto__ || Object.getPrototypeOf(DragStopSensorEvent)).apply(this, arguments));
  }

  return DragStopSensorEvent;
}(SensorEvent);

/**
 * Drag pressure sensor event
 * @class DragPressureSensorEvent
 * @module DragPressureSensorEvent
 * @extends SensorEvent
 */


DragStopSensorEvent.type = 'drag:stop';

var DragPressureSensorEvent = exports.DragPressureSensorEvent = function (_SensorEvent4) {
  (0, _inherits3.default)(DragPressureSensorEvent, _SensorEvent4);

  function DragPressureSensorEvent() {
    (0, _classCallCheck3.default)(this, DragPressureSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragPressureSensorEvent.__proto__ || Object.getPrototypeOf(DragPressureSensorEvent)).apply(this, arguments));
  }

  return DragPressureSensorEvent;
}(SensorEvent);

DragPressureSensorEvent.type = 'drag:pressure';

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(8);

var _Sensor2 = __webpack_require__(20);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onContextMenuWhileDragging = Symbol('onContextMenuWhileDragging');
var onMouseDown = Symbol('onMouseDown');
var onMouseMove = Symbol('onMouseMove');
var onMouseUp = Symbol('onMouseUp');

/**
 * This sensor picks up native browser mouse events and dictates drag operations
 * @class MouseSensor
 * @module MouseSensor
 * @extends Sensor
 */

var MouseSensor = function (_Sensor) {
  (0, _inherits3.default)(MouseSensor, _Sensor);

  /**
   * MouseSensor constructor.
   * @constructs MouseSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function MouseSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, MouseSensor);

    /**
     * Indicates if mouse button is still down
     * @property mouseDown
     * @type {Boolean}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (MouseSensor.__proto__ || Object.getPrototypeOf(MouseSensor)).call(this, containers, options));

    _this.mouseDown = false;

    /**
     * Mouse down timer which will end up triggering the drag start operation
     * @property mouseDownTimeout
     * @type {Number}
     */
    _this.mouseDownTimeout = null;

    /**
     * Indicates if context menu has been opened during drag operation
     * @property openedContextMenu
     * @type {Boolean}
     */
    _this.openedContextMenu = false;

    _this[onContextMenuWhileDragging] = _this[onContextMenuWhileDragging].bind(_this);
    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseMove] = _this[onMouseMove].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(MouseSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      var _this2 = this;

      if (event.button !== 0 || event.ctrlKey || event.metaKey) {
        return;
      }

      document.addEventListener('mouseup', this[onMouseUp]);

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = (0, _utils.closest)(target, this.containers);

      if (!container) {
        return;
      }

      document.addEventListener('dragstart', preventNativeDragStart);

      this.mouseDown = true;

      clearTimeout(this.mouseDownTimeout);
      this.mouseDownTimeout = setTimeout(function () {
        if (!_this2.mouseDown) {
          return;
        }

        var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
          clientX: event.clientX,
          clientY: event.clientY,
          target: target,
          container: container,
          originalEvent: event
        });

        _this2.trigger(container, dragStartEvent);

        _this2.currentContainer = container;
        _this2.dragging = !dragStartEvent.canceled();

        if (_this2.dragging) {
          document.addEventListener('contextmenu', _this2[onContextMenuWhileDragging]);
          document.addEventListener('mousemove', _this2[onMouseMove]);
        }
      }, this.options.delay);
    }

    /**
     * Mouse move handler
     * @private
     * @param {Event} event - Mouse move event
     */

  }, {
    key: onMouseMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value(event) {
      this.mouseDown = Boolean(this.openedContextMenu);

      if (this.openedContextMenu) {
        this.openedContextMenu = false;
        return;
      }

      document.removeEventListener('mouseup', this[onMouseUp]);
      document.removeEventListener('dragstart', preventNativeDragStart);

      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      document.removeEventListener('contextmenu', this[onContextMenuWhileDragging]);
      document.removeEventListener('mousemove', this[onMouseMove]);

      this.currentContainer = null;
      this.dragging = false;
    }

    /**
     * Context menu handler
     * @private
     * @param {Event} event - Context menu event
     */

  }, {
    key: onContextMenuWhileDragging,
    value: function value(event) {
      event.preventDefault();
      this.openedContextMenu = true;
    }
  }]);
  return MouseSensor;
}(_Sensor3.default);

exports.default = MouseSensor;


function preventNativeDragStart(event) {
  event.preventDefault();
}

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _MouseSensor = __webpack_require__(101);

var _MouseSensor2 = _interopRequireDefault(_MouseSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _MouseSensor2.default;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sensor class. Extend from this class to create a new or custom sensor
 * @class Sensor
 * @module Sensor
 */
var Sensor = function () {
  /**
   * Sensor constructor.
   * @constructs Sensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function Sensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Sensor);

    /**
     * Current containers
     * @property containers
     * @type {HTMLElement[]}
     */
    this.containers = [].concat((0, _toConsumableArray3.default)(containers));

    /**
     * Current options
     * @property options
     * @type {Object}
     */
    this.options = Object.assign({}, options);

    /**
     * Current drag state
     * @property dragging
     * @type {Boolean}
     */
    this.dragging = false;

    /**
     * Current container
     * @property currentContainer
     * @type {HTMLElement}
     */
    this.currentContainer = null;
  }

  /**
   * Attaches sensors event listeners to the DOM
   * @return {Sensor}
   */


  (0, _createClass3.default)(Sensor, [{
    key: 'attach',
    value: function attach() {
      return this;
    }

    /**
     * Detaches sensors event listeners to the DOM
     * @return {Sensor}
     */

  }, {
    key: 'detach',
    value: function detach() {
      return this;
    }

    /**
     * Adds container to this sensor instance
     * @param {...HTMLElement} containers - Containers you want to add to this sensor
     * @example draggable.addContainer(document.body)
     */

  }, {
    key: 'addContainer',
    value: function addContainer() {
      for (var _len = arguments.length, containers = Array(_len), _key = 0; _key < _len; _key++) {
        containers[_key] = arguments[_key];
      }

      this.containers = [].concat((0, _toConsumableArray3.default)(this.containers), containers);
    }

    /**
     * Removes container from this sensor instance
     * @param {...HTMLElement} containers - Containers you want to remove from this sensor
     * @example draggable.removeContainer(document.body)
     */

  }, {
    key: 'removeContainer',
    value: function removeContainer() {
      for (var _len2 = arguments.length, containers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        containers[_key2] = arguments[_key2];
      }

      this.containers = this.containers.filter(function (container) {
        return !containers.includes(container);
      });
    }

    /**
     * Triggers event on target element
     * @param {HTMLElement} element - Element to trigger event on
     * @param {SensorEvent} sensorEvent - Sensor event to trigger
     */

  }, {
    key: 'trigger',
    value: function trigger(element, sensorEvent) {
      var event = document.createEvent('Event');
      event.detail = sensorEvent;
      event.initEvent(sensorEvent.type, true, true);
      element.dispatchEvent(event);
      this.lastEvent = sensorEvent;

      return sensorEvent;
    }
  }]);
  return Sensor;
}();

exports.default = Sensor;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = requestNextAnimationFrame;
function requestNextAnimationFrame(callback) {
  return requestAnimationFrame(function () {
    requestAnimationFrame(callback);
  });
}

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _requestNextAnimationFrame = __webpack_require__(104);

var _requestNextAnimationFrame2 = _interopRequireDefault(_requestNextAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _requestNextAnimationFrame2.default;

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = closest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchFunction = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector;

/**
 * Get the closest parent element of a given element that matches the given
 * selector string or matching function
 *
 * @param {Element} element The child element to find a parent of
 * @param {String|Function} selector The string or function to use to match
 *     the parent element
 * @return {Element|null}
 */
function closest(element, value) {
  if (!element) {
    return null;
  }

  var selector = value;
  var callback = value;
  var nodeList = value;
  var singleElement = value;

  var isSelector = Boolean(typeof value === 'string');
  var isFunction = Boolean(typeof value === 'function');
  var isNodeList = Boolean(value instanceof NodeList || value instanceof Array);
  var isElement = Boolean(value instanceof HTMLElement);

  function conditionFn(currentElement) {
    if (!currentElement) {
      return currentElement;
    } else if (isSelector) {
      return matchFunction.call(currentElement, selector);
    } else if (isNodeList) {
      return [].concat((0, _toConsumableArray3.default)(nodeList)).includes(currentElement);
    } else if (isElement) {
      return singleElement === currentElement;
    } else if (isFunction) {
      return callback(currentElement);
    } else {
      return null;
    }
  }

  var current = element;

  do {
    current = current.correspondingUseElement || current.correspondingElement || current;

    if (conditionFn(current)) {
      return current;
    }

    current = current.parentNode;
  } while (current && current !== document.body && current !== document);

  return null;
}

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _closest = __webpack_require__(106);

var _closest2 = _interopRequireDefault(_closest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _closest2.default;

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = exports.scroll = exports.onDragStop = exports.onDragMove = exports.onDragStart = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = exports.onDragStart = Symbol('onDragStart');
var onDragMove = exports.onDragMove = Symbol('onDragMove');
var onDragStop = exports.onDragStop = Symbol('onDragStop');
var scroll = exports.scroll = Symbol('scroll');

/**
 * Scrollable default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.speed
 * @property {Number} defaultOptions.sensitivity
 * @property {HTMLElement[]} defaultOptions.scrollableElements
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  speed: 6,
  sensitivity: 50,
  scrollableElements: []
};

/**
 * Scrollable plugin which scrolls the closest scrollable parent
 * @class Scrollable
 * @module Scrollable
 * @extends AbstractPlugin
 */

var Scrollable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Scrollable, _AbstractPlugin);

  /**
   * Scrollable constructor.
   * @constructs Scrollable
   * @param {Draggable} draggable - Draggable instance
   */
  function Scrollable(draggable) {
    (0, _classCallCheck3.default)(this, Scrollable);

    /**
     * Scrollable options
     * @property {Object} options
     * @property {Number} options.speed
     * @property {Number} options.sensitivity
     * @property {HTMLElement[]} options.scrollableElements
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Scrollable.__proto__ || Object.getPrototypeOf(Scrollable)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Keeps current mouse position
     * @property {Object} currentMousePosition
     * @property {Number} currentMousePosition.clientX
     * @property {Number} currentMousePosition.clientY
     * @type {Object|null}
     */
    _this.currentMousePosition = null;

    /**
     * Scroll animation frame
     * @property scrollAnimationFrame
     * @type {Number|null}
     */
    _this.scrollAnimationFrame = null;

    /**
     * Closest scrollable element
     * @property scrollableElement
     * @type {HTMLElement|null}
     */
    _this.scrollableElement = null;

    /**
     * Animation frame looking for the closest scrollable element
     * @property findScrollableElementFrame
     * @type {Number|null}
     */
    _this.findScrollableElementFrame = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[scroll] = _this[scroll].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Scrollable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.scrollable || {};
    }

    /**
     * Returns closest scrollable elements by element
     * @param {HTMLElement} target
     * @return {HTMLElement}
     */

  }, {
    key: 'getScrollableElement',
    value: function getScrollableElement(target) {
      if (this.hasDefinedScrollableElements()) {
        return (0, _utils.closest)(target, this.options.scrollableElements) || document.documentElement;
      } else {
        return closestScrollableElement(target);
      }
    }

    /**
     * Returns true if at least one scrollable element have been defined via options
     * @param {HTMLElement} target
     * @return {Boolean}
     */

  }, {
    key: 'hasDefinedScrollableElements',
    value: function hasDefinedScrollableElements() {
      return Boolean(this.options.scrollableElements.length !== 0);
    }

    /**
     * Drag start handler. Finds closest scrollable parent in separate frame
     * @param {DragStartEvent} dragEvent
     * @private
     */

  }, {
    key: onDragStart,
    value: function value(dragEvent) {
      var _this2 = this;

      this.findScrollableElementFrame = requestAnimationFrame(function () {
        _this2.scrollableElement = _this2.getScrollableElement(dragEvent.source);
      });
    }

    /**
     * Drag move handler. Remembers mouse position and initiates scrolling
     * @param {DragMoveEvent} dragEvent
     * @private
     */

  }, {
    key: onDragMove,
    value: function value(dragEvent) {
      var _this3 = this;

      this.findScrollableElementFrame = requestAnimationFrame(function () {
        _this3.scrollableElement = _this3.getScrollableElement(dragEvent.sensorEvent.target);
      });

      if (!this.scrollableElement) {
        return;
      }

      var sensorEvent = dragEvent.sensorEvent;
      var scrollOffset = { x: 0, y: 0 };

      if ('ontouchstart' in window) {
        scrollOffset.y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        scrollOffset.x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      }

      this.currentMousePosition = {
        clientX: sensorEvent.clientX - scrollOffset.x,
        clientY: sensorEvent.clientY - scrollOffset.y
      };

      this.scrollAnimationFrame = requestAnimationFrame(this[scroll]);
    }

    /**
     * Drag stop handler. Cancels scroll animations and resets state
     * @private
     */

  }, {
    key: onDragStop,
    value: function value() {
      cancelAnimationFrame(this.scrollAnimationFrame);
      cancelAnimationFrame(this.findScrollableElementFrame);

      this.scrollableElement = null;
      this.scrollAnimationFrame = null;
      this.findScrollableElementFrame = null;
      this.currentMousePosition = null;
    }

    /**
     * Scroll function that does the heavylifting
     * @private
     */

  }, {
    key: scroll,
    value: function value() {
      if (!this.scrollableElement || !this.currentMousePosition) {
        return;
      }

      cancelAnimationFrame(this.scrollAnimationFrame);

      var _options = this.options,
          speed = _options.speed,
          sensitivity = _options.sensitivity;


      var rect = this.scrollableElement.getBoundingClientRect();
      var bottomCutOff = rect.bottom > window.innerHeight;
      var topCutOff = rect.top < 0;
      var cutOff = topCutOff || bottomCutOff;

      var documentScrollingElement = getDocumentScrollingElement();
      var scrollableElement = this.scrollableElement;
      var clientX = this.currentMousePosition.clientX;
      var clientY = this.currentMousePosition.clientY;

      if (scrollableElement !== document.body && scrollableElement !== document.documentElement && !cutOff) {
        var offsetHeight = scrollableElement.offsetHeight,
            offsetWidth = scrollableElement.offsetWidth;


        if (rect.top + offsetHeight - clientY < sensitivity) {
          scrollableElement.scrollTop += speed;
        } else if (clientY - rect.top < sensitivity) {
          scrollableElement.scrollTop -= speed;
        }

        if (rect.left + offsetWidth - clientX < sensitivity) {
          scrollableElement.scrollLeft += speed;
        } else if (clientX - rect.left < sensitivity) {
          scrollableElement.scrollLeft -= speed;
        }
      } else {
        var _window = window,
            innerHeight = _window.innerHeight,
            innerWidth = _window.innerWidth;


        if (clientY < sensitivity) {
          documentScrollingElement.scrollTop -= speed;
        } else if (innerHeight - clientY < sensitivity) {
          documentScrollingElement.scrollTop += speed;
        }

        if (clientX < sensitivity) {
          documentScrollingElement.scrollLeft -= speed;
        } else if (innerWidth - clientX < sensitivity) {
          documentScrollingElement.scrollLeft += speed;
        }
      }

      this.scrollAnimationFrame = requestAnimationFrame(this[scroll]);
    }
  }]);
  return Scrollable;
}(_AbstractPlugin3.default);

/**
 * Returns true if the passed element has overflow
 * @param {HTMLElement} element
 * @return {Boolean}
 * @private
 */


exports.default = Scrollable;
function hasOverflow(element) {
  var overflowRegex = /(auto|scroll)/;
  var computedStyles = getComputedStyle(element, null);

  var overflow = computedStyles.getPropertyValue('overflow') + computedStyles.getPropertyValue('overflow-y') + computedStyles.getPropertyValue('overflow-x');

  return overflowRegex.test(overflow);
}

/**
 * Returns true if the passed element is statically positioned
 * @param {HTMLElement} element
 * @return {Boolean}
 * @private
 */
function isStaticallyPositioned(element) {
  var position = getComputedStyle(element).getPropertyValue('position');
  return position === 'static';
}

/**
 * Finds closest scrollable element
 * @param {HTMLElement} element
 * @return {HTMLElement}
 * @private
 */
function closestScrollableElement(element) {
  if (!element) {
    return getDocumentScrollingElement();
  }

  var position = getComputedStyle(element).getPropertyValue('position');
  var excludeStaticParents = position === 'absolute';

  var scrollableElement = (0, _utils.closest)(element, function (parent) {
    if (excludeStaticParents && isStaticallyPositioned(parent)) {
      return false;
    }
    return hasOverflow(parent);
  });

  if (position === 'fixed' || !scrollableElement) {
    return getDocumentScrollingElement();
  } else {
    return scrollableElement;
  }
}

/**
 * Returns element that scrolls document
 * @return {HTMLElement}
 * @private
 */
function getDocumentScrollingElement() {
  return document.scrollingElement || document.documentElement;
}

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Scrollable = __webpack_require__(108);

var _Scrollable2 = _interopRequireDefault(_Scrollable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Scrollable2.default;
exports.defaultOptions = _Scrollable.defaultOptions;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.MirrorDestroyEvent = exports.MirrorMoveEvent = exports.MirrorAttachedEvent = exports.MirrorCreatedEvent = exports.MirrorCreateEvent = exports.MirrorEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base mirror event
 * @class MirrorEvent
 * @module MirrorEvent
 * @extends AbstractEvent
 */
var MirrorEvent = exports.MirrorEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(MirrorEvent, _AbstractEvent);

  function MirrorEvent() {
    (0, _classCallCheck3.default)(this, MirrorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorEvent.__proto__ || Object.getPrototypeOf(MirrorEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorEvent, [{
    key: 'source',

    /**
     * Draggables source element
     * @property source
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.source;
    }

    /**
     * Draggables original source element
     * @property originalSource
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'originalSource',
    get: function get() {
      return this.data.originalSource;
    }

    /**
     * Draggables source container element
     * @property sourceContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'sourceContainer',
    get: function get() {
      return this.data.sourceContainer;
    }

    /**
     * Sensor event
     * @property sensorEvent
     * @type {SensorEvent}
     * @readonly
     */

  }, {
    key: 'sensorEvent',
    get: function get() {
      return this.data.sensorEvent;
    }

    /**
     * Drag event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */

  }, {
    key: 'dragEvent',
    get: function get() {
      return this.data.dragEvent;
    }

    /**
     * Original event that triggered sensor event
     * @property originalEvent
     * @type {Event}
     * @readonly
     */

  }, {
    key: 'originalEvent',
    get: function get() {
      if (this.sensorEvent) {
        return this.sensorEvent.originalEvent;
      }

      return null;
    }
  }]);
  return MirrorEvent;
}(_AbstractEvent3.default);

/**
 * Mirror create event
 * @class MirrorCreateEvent
 * @module MirrorCreateEvent
 * @extends MirrorEvent
 */


var MirrorCreateEvent = exports.MirrorCreateEvent = function (_MirrorEvent) {
  (0, _inherits3.default)(MirrorCreateEvent, _MirrorEvent);

  function MirrorCreateEvent() {
    (0, _classCallCheck3.default)(this, MirrorCreateEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorCreateEvent.__proto__ || Object.getPrototypeOf(MirrorCreateEvent)).apply(this, arguments));
  }

  return MirrorCreateEvent;
}(MirrorEvent);

/**
 * Mirror created event
 * @class MirrorCreatedEvent
 * @module MirrorCreatedEvent
 * @extends MirrorEvent
 */


MirrorCreateEvent.type = 'mirror:create';

var MirrorCreatedEvent = exports.MirrorCreatedEvent = function (_MirrorEvent2) {
  (0, _inherits3.default)(MirrorCreatedEvent, _MirrorEvent2);

  function MirrorCreatedEvent() {
    (0, _classCallCheck3.default)(this, MirrorCreatedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorCreatedEvent.__proto__ || Object.getPrototypeOf(MirrorCreatedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorCreatedEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorCreatedEvent;
}(MirrorEvent);

/**
 * Mirror attached event
 * @class MirrorAttachedEvent
 * @module MirrorAttachedEvent
 * @extends MirrorEvent
 */


MirrorCreatedEvent.type = 'mirror:created';

var MirrorAttachedEvent = exports.MirrorAttachedEvent = function (_MirrorEvent3) {
  (0, _inherits3.default)(MirrorAttachedEvent, _MirrorEvent3);

  function MirrorAttachedEvent() {
    (0, _classCallCheck3.default)(this, MirrorAttachedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorAttachedEvent.__proto__ || Object.getPrototypeOf(MirrorAttachedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorAttachedEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorAttachedEvent;
}(MirrorEvent);

/**
 * Mirror move event
 * @class MirrorMoveEvent
 * @module MirrorMoveEvent
 * @extends MirrorEvent
 */


MirrorAttachedEvent.type = 'mirror:attached';

var MirrorMoveEvent = exports.MirrorMoveEvent = function (_MirrorEvent4) {
  (0, _inherits3.default)(MirrorMoveEvent, _MirrorEvent4);

  function MirrorMoveEvent() {
    (0, _classCallCheck3.default)(this, MirrorMoveEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorMoveEvent.__proto__ || Object.getPrototypeOf(MirrorMoveEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorMoveEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorMoveEvent;
}(MirrorEvent);

/**
 * Mirror destroy event
 * @class MirrorDestroyEvent
 * @module MirrorDestroyEvent
 * @extends MirrorEvent
 */


MirrorMoveEvent.type = 'mirror:move';
MirrorMoveEvent.cancelable = true;

var MirrorDestroyEvent = exports.MirrorDestroyEvent = function (_MirrorEvent5) {
  (0, _inherits3.default)(MirrorDestroyEvent, _MirrorEvent5);

  function MirrorDestroyEvent() {
    (0, _classCallCheck3.default)(this, MirrorDestroyEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorDestroyEvent.__proto__ || Object.getPrototypeOf(MirrorDestroyEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorDestroyEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorDestroyEvent;
}(MirrorEvent);

MirrorDestroyEvent.type = 'mirror:destroy';
MirrorDestroyEvent.cancelable = true;

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _MirrorEvent = __webpack_require__(110);

Object.keys(_MirrorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _MirrorEvent[key];
    }
  });
});

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

exports.default = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = exports.getAppendableContainer = exports.onScroll = exports.onMirrorMove = exports.onMirrorCreated = exports.onDragStop = exports.onDragMove = exports.onDragStart = undefined;

var _objectWithoutProperties2 = __webpack_require__(112);

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _MirrorEvent = __webpack_require__(111);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = exports.onDragStart = Symbol('onDragStart');
var onDragMove = exports.onDragMove = Symbol('onDragMove');
var onDragStop = exports.onDragStop = Symbol('onDragStop');
var onMirrorCreated = exports.onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorMove = exports.onMirrorMove = Symbol('onMirrorMove');
var onScroll = exports.onScroll = Symbol('onScroll');
var getAppendableContainer = exports.getAppendableContainer = Symbol('getAppendableContainer');

/**
 * Mirror default options
 * @property {Object} defaultOptions
 * @property {Boolean} defaultOptions.constrainDimensions
 * @property {Boolean} defaultOptions.xAxis
 * @property {Boolean} defaultOptions.yAxis
 * @property {null} defaultOptions.cursorOffsetX
 * @property {null} defaultOptions.cursorOffsetY
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  constrainDimensions: false,
  xAxis: true,
  yAxis: true,
  cursorOffsetX: null,
  cursorOffsetY: null
};

/**
 * Mirror plugin which controls the mirror positioning while dragging
 * @class Mirror
 * @module Mirror
 * @extends AbstractPlugin
 */

var Mirror = function (_AbstractPlugin) {
  (0, _inherits3.default)(Mirror, _AbstractPlugin);

  /**
   * Mirror constructor.
   * @constructs Mirror
   * @param {Draggable} draggable - Draggable instance
   */
  function Mirror(draggable) {
    (0, _classCallCheck3.default)(this, Mirror);

    /**
     * Mirror options
     * @property {Object} options
     * @property {Boolean} options.constrainDimensions
     * @property {Boolean} options.xAxis
     * @property {Boolean} options.yAxis
     * @property {Number|null} options.cursorOffsetX
     * @property {Number|null} options.cursorOffsetY
     * @property {String|HTMLElement|Function} options.appendTo
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Mirror.__proto__ || Object.getPrototypeOf(Mirror)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Scroll offset for touch devices because the mirror is positioned fixed
     * @property {Object} scrollOffset
     * @property {Number} scrollOffset.x
     * @property {Number} scrollOffset.y
     */
    _this.scrollOffset = { x: 0, y: 0 };

    /**
     * Initial scroll offset for touch devices because the mirror is positioned fixed
     * @property {Object} scrollOffset
     * @property {Number} scrollOffset.x
     * @property {Number} scrollOffset.y
     */
    _this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY
    };

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorMove] = _this[onMirrorMove].bind(_this);
    _this[onScroll] = _this[onScroll].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Mirror, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]).on('mirror:created', this[onMirrorCreated]).on('mirror:move', this[onMirrorMove]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]).off('mirror:created', this[onMirrorCreated]).off('mirror:move', this[onMirrorMove]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.mirror || {};
    }
  }, {
    key: onDragStart,
    value: function value(dragEvent) {
      if (dragEvent.canceled()) {
        return;
      }

      if ('ontouchstart' in window) {
        document.addEventListener('scroll', this[onScroll], true);
      }

      this.initialScrollOffset = {
        x: window.scrollX,
        y: window.scrollY
      };

      var source = dragEvent.source,
          originalSource = dragEvent.originalSource,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorCreateEvent = new _MirrorEvent.MirrorCreateEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent
      });

      this.draggable.trigger(mirrorCreateEvent);

      if (isNativeDragEvent(sensorEvent) || mirrorCreateEvent.canceled()) {
        return;
      }

      var appendableContainer = this[getAppendableContainer](source) || sourceContainer;
      this.mirror = source.cloneNode(true);

      var mirrorCreatedEvent = new _MirrorEvent.MirrorCreatedEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      var mirrorAttachedEvent = new _MirrorEvent.MirrorAttachedEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      this.draggable.trigger(mirrorCreatedEvent);
      appendableContainer.appendChild(this.mirror);
      this.draggable.trigger(mirrorAttachedEvent);
    }
  }, {
    key: onDragMove,
    value: function value(dragEvent) {
      if (!this.mirror || dragEvent.canceled()) {
        return;
      }

      var source = dragEvent.source,
          originalSource = dragEvent.originalSource,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorMoveEvent = new _MirrorEvent.MirrorMoveEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      this.draggable.trigger(mirrorMoveEvent);
    }
  }, {
    key: onDragStop,
    value: function value(dragEvent) {
      if ('ontouchstart' in window) {
        document.removeEventListener('scroll', this[onScroll], true);
      }

      this.initialScrollOffset = { x: 0, y: 0 };
      this.scrollOffset = { x: 0, y: 0 };

      if (!this.mirror) {
        return;
      }

      var source = dragEvent.source,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorDestroyEvent = new _MirrorEvent.MirrorDestroyEvent({
        source: source,
        mirror: this.mirror,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent
      });

      this.draggable.trigger(mirrorDestroyEvent);

      if (!mirrorDestroyEvent.canceled()) {
        this.mirror.parentNode.removeChild(this.mirror);
      }
    }
  }, {
    key: onScroll,
    value: function value() {
      this.scrollOffset = {
        x: window.scrollX - this.initialScrollOffset.x,
        y: window.scrollY - this.initialScrollOffset.y
      };
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @return {Promise}
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var _this2 = this;

      var mirror = _ref.mirror,
          source = _ref.source,
          sensorEvent = _ref.sensorEvent;

      var mirrorClass = this.draggable.getClassNameFor('mirror');

      var setState = function setState(_ref2) {
        var mirrorOffset = _ref2.mirrorOffset,
            initialX = _ref2.initialX,
            initialY = _ref2.initialY,
            args = (0, _objectWithoutProperties3.default)(_ref2, ['mirrorOffset', 'initialX', 'initialY']);

        _this2.mirrorOffset = mirrorOffset;
        _this2.initialX = initialX;
        _this2.initialY = initialY;
        return Object.assign({ mirrorOffset: mirrorOffset, initialX: initialX, initialY: initialY }, args);
      };

      var initialState = {
        mirror: mirror,
        source: source,
        sensorEvent: sensorEvent,
        mirrorClass: mirrorClass,
        scrollOffset: this.scrollOffset,
        options: this.options
      };

      return Promise.resolve(initialState)
      // Fix reflow here
      .then(computeMirrorDimensions).then(calculateMirrorOffset).then(resetMirror).then(addMirrorClasses).then(positionMirror({ initial: true })).then(removeMirrorID).then(setState);
    }

    /**
     * Mirror move handler
     * @param {MirrorMoveEvent} mirrorEvent
     * @return {Promise|null}
     * @private
     */

  }, {
    key: onMirrorMove,
    value: function value(mirrorEvent) {
      if (mirrorEvent.canceled()) {
        return null;
      }

      var initialState = {
        mirror: mirrorEvent.mirror,
        sensorEvent: mirrorEvent.sensorEvent,
        mirrorOffset: this.mirrorOffset,
        options: this.options,
        initialX: this.initialX,
        initialY: this.initialY,
        scrollOffset: this.scrollOffset
      };

      return Promise.resolve(initialState).then(positionMirror({ raf: true }));
    }

    /**
     * Returns appendable container for mirror based on the appendTo option
     * @private
     * @param {Object} options
     * @param {HTMLElement} options.source - Current source
     * @return {HTMLElement}
     */

  }, {
    key: getAppendableContainer,
    value: function value(source) {
      var appendTo = this.options.appendTo;

      if (typeof appendTo === 'string') {
        return document.querySelector(appendTo);
      } else if (appendTo instanceof HTMLElement) {
        return appendTo;
      } else if (typeof appendTo === 'function') {
        return appendTo(source);
      } else {
        return source.parentNode;
      }
    }
  }]);
  return Mirror;
}(_AbstractPlugin3.default);

/**
 * Computes mirror dimensions based on the source element
 * Adds sourceRect to state
 * @param {Object} state
 * @param {HTMLElement} state.source
 * @return {Promise}
 * @private
 */


exports.default = Mirror;
function computeMirrorDimensions(_ref3) {
  var source = _ref3.source,
      args = (0, _objectWithoutProperties3.default)(_ref3, ['source']);

  return withPromise(function (resolve) {
    var sourceRect = source.getBoundingClientRect();
    resolve(Object.assign({ source: source, sourceRect: sourceRect }, args));
  });
}

/**
 * Calculates mirror offset
 * Adds mirrorOffset to state
 * @param {Object} state
 * @param {SensorEvent} state.sensorEvent
 * @param {DOMRect} state.sourceRect
 * @return {Promise}
 * @private
 */
function calculateMirrorOffset(_ref4) {
  var sensorEvent = _ref4.sensorEvent,
      sourceRect = _ref4.sourceRect,
      options = _ref4.options,
      args = (0, _objectWithoutProperties3.default)(_ref4, ['sensorEvent', 'sourceRect', 'options']);

  return withPromise(function (resolve) {
    var top = options.cursorOffsetY === null ? sensorEvent.clientY - sourceRect.top : options.cursorOffsetY;
    var left = options.cursorOffsetX === null ? sensorEvent.clientX - sourceRect.left : options.cursorOffsetX;

    var mirrorOffset = { top: top, left: left };

    resolve(Object.assign({ sensorEvent: sensorEvent, sourceRect: sourceRect, mirrorOffset: mirrorOffset, options: options }, args));
  });
}

/**
 * Applys mirror styles
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {HTMLElement} state.source
 * @param {Object} state.options
 * @return {Promise}
 * @private
 */
function resetMirror(_ref5) {
  var mirror = _ref5.mirror,
      source = _ref5.source,
      options = _ref5.options,
      args = (0, _objectWithoutProperties3.default)(_ref5, ['mirror', 'source', 'options']);

  return withPromise(function (resolve) {
    var offsetHeight = void 0;
    var offsetWidth = void 0;

    if (options.constrainDimensions) {
      var computedSourceStyles = getComputedStyle(source);
      offsetHeight = computedSourceStyles.getPropertyValue('height');
      offsetWidth = computedSourceStyles.getPropertyValue('width');
    }

    mirror.style.position = 'fixed';
    mirror.style.pointerEvents = 'none';
    mirror.style.top = 0;
    mirror.style.left = 0;
    mirror.style.margin = 0;

    if (options.constrainDimensions) {
      mirror.style.height = offsetHeight;
      mirror.style.width = offsetWidth;
    }

    resolve(Object.assign({ mirror: mirror, source: source, options: options }, args));
  });
}

/**
 * Applys mirror class on mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {String} state.mirrorClass
 * @return {Promise}
 * @private
 */
function addMirrorClasses(_ref6) {
  var mirror = _ref6.mirror,
      mirrorClass = _ref6.mirrorClass,
      args = (0, _objectWithoutProperties3.default)(_ref6, ['mirror', 'mirrorClass']);

  return withPromise(function (resolve) {
    mirror.classList.add(mirrorClass);
    resolve(Object.assign({ mirror: mirror, mirrorClass: mirrorClass }, args));
  });
}

/**
 * Removes source ID from cloned mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @return {Promise}
 * @private
 */
function removeMirrorID(_ref7) {
  var mirror = _ref7.mirror,
      args = (0, _objectWithoutProperties3.default)(_ref7, ['mirror']);

  return withPromise(function (resolve) {
    mirror.removeAttribute('id');
    delete mirror.id;
    resolve(Object.assign({ mirror: mirror }, args));
  });
}

/**
 * Positions mirror with translate3d
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {SensorEvent} state.sensorEvent
 * @param {Object} state.mirrorOffset
 * @param {Number} state.initialY
 * @param {Number} state.initialX
 * @param {Object} state.options
 * @return {Promise}
 * @private
 */
function positionMirror() {
  var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref8$withFrame = _ref8.withFrame,
      withFrame = _ref8$withFrame === undefined ? false : _ref8$withFrame,
      _ref8$initial = _ref8.initial,
      initial = _ref8$initial === undefined ? false : _ref8$initial;

  return function (_ref9) {
    var mirror = _ref9.mirror,
        sensorEvent = _ref9.sensorEvent,
        mirrorOffset = _ref9.mirrorOffset,
        initialY = _ref9.initialY,
        initialX = _ref9.initialX,
        scrollOffset = _ref9.scrollOffset,
        options = _ref9.options,
        args = (0, _objectWithoutProperties3.default)(_ref9, ['mirror', 'sensorEvent', 'mirrorOffset', 'initialY', 'initialX', 'scrollOffset', 'options']);

    return withPromise(function (resolve) {
      var result = Object.assign({
        mirror: mirror,
        sensorEvent: sensorEvent,
        mirrorOffset: mirrorOffset,
        options: options
      }, args);

      if (mirrorOffset) {
        var x = sensorEvent.clientX - mirrorOffset.left - scrollOffset.x;
        var y = sensorEvent.clientY - mirrorOffset.top - scrollOffset.y;

        if (options.xAxis && options.yAxis || initial) {
          mirror.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        } else if (options.xAxis && !options.yAxis) {
          mirror.style.transform = 'translate3d(' + x + 'px, ' + initialY + 'px, 0)';
        } else if (options.yAxis && !options.xAxis) {
          mirror.style.transform = 'translate3d(' + initialX + 'px, ' + y + 'px, 0)';
        }

        if (initial) {
          result.initialX = x;
          result.initialY = y;
        }
      }

      resolve(result);
    }, { frame: withFrame });
  };
}

/**
 * Wraps functions in promise with potential animation frame option
 * @param {Function} callback
 * @param {Object} options
 * @param {Boolean} options.raf
 * @return {Promise}
 * @private
 */
function withPromise(callback) {
  var _ref10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref10$raf = _ref10.raf,
      raf = _ref10$raf === undefined ? false : _ref10$raf;

  return new Promise(function (resolve, reject) {
    if (raf) {
      requestAnimationFrame(function () {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}

/**
 * Returns true if the sensor event was triggered by a native browser drag event
 * @param {SensorEvent} sensorEvent
 */
function isNativeDragEvent(sensorEvent) {
  return (/^drag/.test(sensorEvent.originalEvent.type)
  );
}

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Mirror = __webpack_require__(113);

var _Mirror2 = _interopRequireDefault(_Mirror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Mirror2.default;
exports.defaultOptions = _Mirror.defaultOptions;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(6)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(38);
var TAG = __webpack_require__(6)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(116);
var ITERATOR = __webpack_require__(6)('iterator');
var Iterators = __webpack_require__(21);
module.exports = __webpack_require__(4).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var $defineProperty = __webpack_require__(9);
var createDesc = __webpack_require__(22);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(21);
var ITERATOR = __webpack_require__(6)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(17);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var ctx = __webpack_require__(44);
var $export = __webpack_require__(14);
var toObject = __webpack_require__(33);
var call = __webpack_require__(120);
var isArrayIter = __webpack_require__(119);
var toLength = __webpack_require__(56);
var createProperty = __webpack_require__(118);
var getIterFn = __webpack_require__(117);

$export($export.S + $export.F * !__webpack_require__(115)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(60);
__webpack_require__(121);
module.exports = __webpack_require__(4).Array.from;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(122), __esModule: true };

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(15);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onInitialize = Symbol('onInitialize');
var onDestroy = Symbol('onDestroy');

/**
 * Focusable default options
 * @property {Object} defaultOptions
 * @type {Object}
 */
var defaultOptions = {};

/**
 * Focusable plugin
 * @class Focusable
 * @module Focusable
 * @extends AbstractPlugin
 */

var Focusable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Focusable, _AbstractPlugin);

  /**
   * Focusable constructor.
   * @constructs Focusable
   * @param {Draggable} draggable - Draggable instance
   */
  function Focusable(draggable) {
    (0, _classCallCheck3.default)(this, Focusable);

    /**
     * Focusable options
     * @property {Object} options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Focusable.__proto__ || Object.getPrototypeOf(Focusable)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    _this[onInitialize] = _this[onInitialize].bind(_this);
    _this[onDestroy] = _this[onDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches listeners to draggable
   */


  (0, _createClass3.default)(Focusable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('draggable:initialize', this[onInitialize]).on('draggable:destroy', this[onDestroy]);
    }

    /**
     * Detaches listeners from draggable
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('draggable:initialize', this[onInitialize]).off('draggable:destroy', this[onDestroy]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.focusable || {};
    }

    /**
     * Returns draggable containers and elements
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getElements',
    value: function getElements() {
      return [].concat((0, _toConsumableArray3.default)(this.draggable.containers), (0, _toConsumableArray3.default)(this.draggable.getDraggableElements()));
    }

    /**
     * Intialize handler
     * @private
     */

  }, {
    key: onInitialize,
    value: function value() {
      var _this2 = this;

      // Can wait until the next best frame is available
      requestAnimationFrame(function () {
        _this2.getElements().forEach(function (element) {
          return decorateElement(element);
        });
      });
    }

    /**
     * Destroy handler
     * @private
     */

  }, {
    key: onDestroy,
    value: function value() {
      var _this3 = this;

      // Can wait until the next best frame is available
      requestAnimationFrame(function () {
        _this3.getElements().forEach(function (element) {
          return stripElement(element);
        });
      });
    }
  }]);
  return Focusable;
}(_AbstractPlugin3.default);

/**
 * Keeps track of all the elements that are missing tabindex attributes
 * so they can be reset when draggable gets destroyed
 * @const {HTMLElement[]} elementsWithMissingTabIndex
 */


exports.default = Focusable;
var elementsWithMissingTabIndex = [];

/**
 * Decorates element with tabindex attributes
 * @param {HTMLElement} element
 * @return {Object}
 * @private
 */
function decorateElement(element) {
  var hasMissingTabIndex = Boolean(!element.getAttribute('tabindex') && element.tabIndex === -1);

  if (hasMissingTabIndex) {
    elementsWithMissingTabIndex.push(element);
    element.tabIndex = 0;
  }
}

/**
 * Removes elements tabindex attributes
 * @param {HTMLElement} element
 * @private
 */
function stripElement(element) {
  var tabIndexElementPosition = elementsWithMissingTabIndex.indexOf(element);

  if (tabIndexElementPosition !== -1) {
    element.tabIndex = -1;
    elementsWithMissingTabIndex.splice(tabIndexElementPosition, 1);
  }
}

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Focusable = __webpack_require__(124);

var _Focusable2 = _interopRequireDefault(_Focusable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Focusable2.default;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * All draggable plugins inherit from this class.
 * @abstract
 * @class AbstractPlugin
 * @module AbstractPlugin
 */
var AbstractPlugin = function () {
  /**
   * AbstractPlugin constructor.
   * @constructs AbstractPlugin
   * @param {Draggable} draggable - Draggable instance
   */
  function AbstractPlugin(draggable) {
    (0, _classCallCheck3.default)(this, AbstractPlugin);

    /**
     * Draggable instance
     * @property draggable
     * @type {Draggable}
     */
    this.draggable = draggable;
  }

  /**
   * Override to add listeners
   * @abstract
   */


  (0, _createClass3.default)(AbstractPlugin, [{
    key: 'attach',
    value: function attach() {
      throw new Error('Not Implemented');
    }

    /**
     * Override to remove listeners
     * @abstract
     */

  }, {
    key: 'detach',
    value: function detach() {
      throw new Error('Not Implemented');
    }
  }]);
  return AbstractPlugin;
}();

exports.default = AbstractPlugin;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(7);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onInitialize = Symbol('onInitialize');
var onDestroy = Symbol('onDestroy');
var announceEvent = Symbol('announceEvent');
var announceMessage = Symbol('announceMessage');

var ARIA_RELEVANT = 'aria-relevant';
var ARIA_ATOMIC = 'aria-atomic';
var ARIA_LIVE = 'aria-live';
var ROLE = 'role';

/**
 * Announcement default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.expire
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  expire: 7000
};

/**
 * Announcement plugin
 * @class Announcement
 * @module Announcement
 * @extends AbstractPlugin
 */

var Announcement = function (_AbstractPlugin) {
  (0, _inherits3.default)(Announcement, _AbstractPlugin);

  /**
   * Announcement constructor.
   * @constructs Announcement
   * @param {Draggable} draggable - Draggable instance
   */
  function Announcement(draggable) {
    (0, _classCallCheck3.default)(this, Announcement);

    /**
     * Plugin options
     * @property options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Announcement.__proto__ || Object.getPrototypeOf(Announcement)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Original draggable trigger method. Hack until we have onAll or on('all')
     * @property originalTriggerMethod
     * @type {Function}
     */
    _this.originalTriggerMethod = _this.draggable.trigger;

    _this[onInitialize] = _this[onInitialize].bind(_this);
    _this[onDestroy] = _this[onDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches listeners to draggable
   */


  (0, _createClass3.default)(Announcement, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('draggable:initialize', this[onInitialize]);
    }

    /**
     * Detaches listeners from draggable
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('draggable:destroy', this[onDestroy]);
    }

    /**
     * Returns passed in options
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.announcements || {};
    }

    /**
     * Announces event
     * @private
     * @param {AbstractEvent} event
     */

  }, {
    key: announceEvent,
    value: function value(event) {
      var message = this.options[event.type];

      if (message && typeof message === 'string') {
        this[announceMessage](message);
      }

      if (message && typeof message === 'function') {
        this[announceMessage](message(event));
      }
    }

    /**
     * Announces message to screen reader
     * @private
     * @param {String} message
     */

  }, {
    key: announceMessage,
    value: function value(message) {
      announce(message, { expire: this.options.expire });
    }

    /**
     * Initialize hander
     * @private
     */

  }, {
    key: onInitialize,
    value: function value() {
      var _this2 = this;

      // Hack until there is an api for listening for all events
      this.draggable.trigger = function (event) {
        try {
          _this2[announceEvent](event);
        } finally {
          // Ensure that original trigger is called
          _this2.originalTriggerMethod.call(_this2.draggable, event);
        }
      };
    }

    /**
     * Destroy hander
     * @private
     */

  }, {
    key: onDestroy,
    value: function value() {
      this.draggable.trigger = this.originalTriggerMethod;
    }
  }]);
  return Announcement;
}(_AbstractPlugin3.default);

/**
 * @const {HTMLElement} liveRegion
 */


exports.default = Announcement;
var liveRegion = createRegion();

/**
 * Announces message via live region
 * @param {String} message
 * @param {Object} options
 * @param {Number} options.expire
 */
function announce(message, _ref) {
  var expire = _ref.expire;

  var element = document.createElement('div');

  element.textContent = message;
  liveRegion.appendChild(element);

  return setTimeout(function () {
    liveRegion.removeChild(element);
  }, expire);
}

/**
 * Creates region element
 * @return {HTMLElement}
 */
function createRegion() {
  var element = document.createElement('div');

  element.setAttribute('id', 'draggable-live-region');
  element.setAttribute(ARIA_RELEVANT, 'additions');
  element.setAttribute(ARIA_ATOMIC, 'true');
  element.setAttribute(ARIA_LIVE, 'assertive');
  element.setAttribute(ROLE, 'log');

  element.style.position = 'fixed';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.top = '-1px';
  element.style.overflow = 'hidden';

  return element;
}

// Append live region element as early as possible
document.addEventListener('DOMContentLoaded', function () {
  document.body.appendChild(liveRegion);
});

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Announcement = __webpack_require__(127);

var _Announcement2 = _interopRequireDefault(_Announcement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Announcement2.default;
exports.defaultOptions = _Announcement.defaultOptions;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DraggableDestroyEvent = exports.DraggableInitializedEvent = exports.DraggableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base draggable event
 * @class DraggableEvent
 * @module DraggableEvent
 * @extends AbstractEvent
 */
var DraggableEvent = exports.DraggableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DraggableEvent, _AbstractEvent);

  function DraggableEvent() {
    (0, _classCallCheck3.default)(this, DraggableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableEvent.__proto__ || Object.getPrototypeOf(DraggableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DraggableEvent, [{
    key: 'draggable',


    /**
     * Draggable instance
     * @property draggable
     * @type {Draggable}
     * @readonly
     */
    get: function get() {
      return this.data.draggable;
    }
  }]);
  return DraggableEvent;
}(_AbstractEvent3.default);

/**
 * Draggable initialized event
 * @class DraggableInitializedEvent
 * @module DraggableInitializedEvent
 * @extends DraggableEvent
 */


DraggableEvent.type = 'draggable';

var DraggableInitializedEvent = exports.DraggableInitializedEvent = function (_DraggableEvent) {
  (0, _inherits3.default)(DraggableInitializedEvent, _DraggableEvent);

  function DraggableInitializedEvent() {
    (0, _classCallCheck3.default)(this, DraggableInitializedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableInitializedEvent.__proto__ || Object.getPrototypeOf(DraggableInitializedEvent)).apply(this, arguments));
  }

  return DraggableInitializedEvent;
}(DraggableEvent);

/**
 * Draggable destory event
 * @class DraggableInitializedEvent
 * @module DraggableDestroyEvent
 * @extends DraggableDestroyEvent
 */


DraggableInitializedEvent.type = 'draggable:initialize';

var DraggableDestroyEvent = exports.DraggableDestroyEvent = function (_DraggableEvent2) {
  (0, _inherits3.default)(DraggableDestroyEvent, _DraggableEvent2);

  function DraggableDestroyEvent() {
    (0, _classCallCheck3.default)(this, DraggableDestroyEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableDestroyEvent.__proto__ || Object.getPrototypeOf(DraggableDestroyEvent)).apply(this, arguments));
  }

  return DraggableDestroyEvent;
}(DraggableEvent);

DraggableDestroyEvent.type = 'draggable:destroy';

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _canceled = Symbol('canceled');

/**
 * All events fired by draggable inherit this class. You can call `cancel()` to
 * cancel a specific event or you can check if an event has been canceled by
 * calling `canceled()`.
 * @abstract
 * @class AbstractEvent
 * @module AbstractEvent
 */

var AbstractEvent = function () {

  /**
   * AbstractEvent constructor.
   * @constructs AbstractEvent
   * @param {object} data - Event data
   */

  /**
   * Event type
   * @static
   * @abstract
   * @property type
   * @type {String}
   */
  function AbstractEvent(data) {
    (0, _classCallCheck3.default)(this, AbstractEvent);

    this[_canceled] = false;
    this.data = data;
  }

  /**
   * Read-only type
   * @abstract
   * @return {String}
   */


  /**
   * Event cancelable
   * @static
   * @abstract
   * @property cancelable
   * @type {Boolean}
   */


  (0, _createClass3.default)(AbstractEvent, [{
    key: 'cancel',


    /**
     * Cancels the event instance
     * @abstract
     */
    value: function cancel() {
      this[_canceled] = true;
    }

    /**
     * Check if event has been canceled
     * @abstract
     * @return {Boolean}
     */

  }, {
    key: 'canceled',
    value: function canceled() {
      return Boolean(this[_canceled]);
    }

    /**
     * Returns new event instance with existing event data.
     * This method allows for overriding of event data.
     * @param {Object} data
     * @return {AbstractEvent}
     */

  }, {
    key: 'clone',
    value: function clone(data) {
      return new this.constructor(Object.assign({}, this.data, data));
    }
  }, {
    key: 'type',
    get: function get() {
      return this.constructor.type;
    }

    /**
     * Read-only cancelable
     * @abstract
     * @return {Boolean}
     */

  }, {
    key: 'cancelable',
    get: function get() {
      return this.constructor.cancelable;
    }
  }]);
  return AbstractEvent;
}();

AbstractEvent.type = 'event';
AbstractEvent.cancelable = false;
exports.default = AbstractEvent;

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(14);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: __webpack_require__(40) });


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(131);
var $Object = __webpack_require__(4).Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(132), __esModule: true };

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__(16);
var anObject = __webpack_require__(17);
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ': can\'t set as prototype!');
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__(44)(Function.call, __webpack_require__(29).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = __webpack_require__(14);
$export($export.S, 'Object', { setPrototypeOf: __webpack_require__(134).set });


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(135);
module.exports = __webpack_require__(4).Object.setPrototypeOf;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(136), __esModule: true };

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(31)('observable');


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(31)('asyncIterator');


/***/ }),
/* 140 */
/***/ (function(module, exports) {



/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(11);
var gOPN = __webpack_require__(53).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(38);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(39);
var gOPS = __webpack_require__(54);
var pIE = __webpack_require__(30);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(24)('meta');
var isObject = __webpack_require__(16);
var has = __webpack_require__(12);
var setDesc = __webpack_require__(9).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(23)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// ECMAScript 6 symbols shim
var global = __webpack_require__(10);
var has = __webpack_require__(12);
var DESCRIPTORS = __webpack_require__(13);
var $export = __webpack_require__(14);
var redefine = __webpack_require__(58);
var META = __webpack_require__(144).KEY;
var $fails = __webpack_require__(23);
var shared = __webpack_require__(36);
var setToStringTag = __webpack_require__(34);
var uid = __webpack_require__(24);
var wks = __webpack_require__(6);
var wksExt = __webpack_require__(32);
var wksDefine = __webpack_require__(31);
var enumKeys = __webpack_require__(143);
var isArray = __webpack_require__(142);
var anObject = __webpack_require__(17);
var isObject = __webpack_require__(16);
var toIObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(43);
var createDesc = __webpack_require__(22);
var _create = __webpack_require__(40);
var gOPNExt = __webpack_require__(141);
var $GOPD = __webpack_require__(29);
var $DP = __webpack_require__(9);
var $keys = __webpack_require__(39);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(53).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(30).f = $propertyIsEnumerable;
  __webpack_require__(54).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(25)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(18)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(145);
__webpack_require__(140);
__webpack_require__(139);
__webpack_require__(138);
module.exports = __webpack_require__(4).Symbol;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(146), __esModule: true };

/***/ }),
/* 148 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 149 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var addToUnscopables = __webpack_require__(149);
var step = __webpack_require__(148);
var Iterators = __webpack_require__(21);
var toIObject = __webpack_require__(11);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(59)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(150);
var global = __webpack_require__(10);
var hide = __webpack_require__(18);
var Iterators = __webpack_require__(21);
var TO_STRING_TAG = __webpack_require__(6)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(10).document;
module.exports = document && document.documentElement;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(42);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(11);
var toLength = __webpack_require__(56);
var toAbsoluteIndex = __webpack_require__(153);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(38);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var anObject = __webpack_require__(17);
var getKeys = __webpack_require__(39);

module.exports = __webpack_require__(13) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var create = __webpack_require__(40);
var descriptor = __webpack_require__(22);
var setToStringTag = __webpack_require__(34);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(18)(IteratorPrototype, __webpack_require__(6)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(42);
var defined = __webpack_require__(41);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(60);
__webpack_require__(151);
module.exports = __webpack_require__(32).f('iterator');


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(159), __esModule: true };

/***/ }),
/* 161 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(14);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(13), 'Object', { defineProperty: __webpack_require__(9).f });


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(162);
var $Object = __webpack_require__(4).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(163), __esModule: true };

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DragStopEvent = exports.DragPressureEvent = exports.DragOutContainerEvent = exports.DragOverContainerEvent = exports.DragOutEvent = exports.DragOverEvent = exports.DragMoveEvent = exports.DragStartEvent = exports.DragEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(5);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base drag event
 * @class DragEvent
 * @module DragEvent
 * @extends AbstractEvent
 */
var DragEvent = exports.DragEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DragEvent, _AbstractEvent);

  function DragEvent() {
    (0, _classCallCheck3.default)(this, DragEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragEvent.__proto__ || Object.getPrototypeOf(DragEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragEvent, [{
    key: 'source',


    /**
     * Draggables source element
     * @property source
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.source;
    }

    /**
     * Draggables original source element
     * @property originalSource
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'originalSource',
    get: function get() {
      return this.data.originalSource;
    }

    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'mirror',
    get: function get() {
      return this.data.mirror;
    }

    /**
     * Draggables source container element
     * @property sourceContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'sourceContainer',
    get: function get() {
      return this.data.sourceContainer;
    }

    /**
     * Sensor event
     * @property sensorEvent
     * @type {SensorEvent}
     * @readonly
     */

  }, {
    key: 'sensorEvent',
    get: function get() {
      return this.data.sensorEvent;
    }

    /**
     * Original event that triggered sensor event
     * @property originalEvent
     * @type {Event}
     * @readonly
     */

  }, {
    key: 'originalEvent',
    get: function get() {
      if (this.sensorEvent) {
        return this.sensorEvent.originalEvent;
      }

      return null;
    }
  }]);
  return DragEvent;
}(_AbstractEvent3.default);

/**
 * Drag start event
 * @class DragStartEvent
 * @module DragStartEvent
 * @extends DragEvent
 */


DragEvent.type = 'drag';

var DragStartEvent = exports.DragStartEvent = function (_DragEvent) {
  (0, _inherits3.default)(DragStartEvent, _DragEvent);

  function DragStartEvent() {
    (0, _classCallCheck3.default)(this, DragStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStartEvent.__proto__ || Object.getPrototypeOf(DragStartEvent)).apply(this, arguments));
  }

  return DragStartEvent;
}(DragEvent);

/**
 * Drag move event
 * @class DragMoveEvent
 * @module DragMoveEvent
 * @extends DragEvent
 */


DragStartEvent.type = 'drag:start';
DragStartEvent.cancelable = true;

var DragMoveEvent = exports.DragMoveEvent = function (_DragEvent2) {
  (0, _inherits3.default)(DragMoveEvent, _DragEvent2);

  function DragMoveEvent() {
    (0, _classCallCheck3.default)(this, DragMoveEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragMoveEvent.__proto__ || Object.getPrototypeOf(DragMoveEvent)).apply(this, arguments));
  }

  return DragMoveEvent;
}(DragEvent);

/**
 * Drag over event
 * @class DragOverEvent
 * @module DragOverEvent
 * @extends DragEvent
 */


DragMoveEvent.type = 'drag:move';

var DragOverEvent = exports.DragOverEvent = function (_DragEvent3) {
  (0, _inherits3.default)(DragOverEvent, _DragEvent3);

  function DragOverEvent() {
    (0, _classCallCheck3.default)(this, DragOverEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOverEvent.__proto__ || Object.getPrototypeOf(DragOverEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOverEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }

    /**
     * Draggable element you are over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.over;
    }
  }]);
  return DragOverEvent;
}(DragEvent);

/**
 * Drag out event
 * @class DragOutEvent
 * @module DragOutEvent
 * @extends DragEvent
 */


DragOverEvent.type = 'drag:over';
DragOverEvent.cancelable = true;

var DragOutEvent = exports.DragOutEvent = function (_DragEvent4) {
  (0, _inherits3.default)(DragOutEvent, _DragEvent4);

  function DragOutEvent() {
    (0, _classCallCheck3.default)(this, DragOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOutEvent.__proto__ || Object.getPrototypeOf(DragOutEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOutEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }

    /**
     * Draggable element you left
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.over;
    }
  }]);
  return DragOutEvent;
}(DragEvent);

/**
 * Drag over container event
 * @class DragOverContainerEvent
 * @module DragOverContainerEvent
 * @extends DragEvent
 */


DragOutEvent.type = 'drag:out';

var DragOverContainerEvent = exports.DragOverContainerEvent = function (_DragEvent5) {
  (0, _inherits3.default)(DragOverContainerEvent, _DragEvent5);

  function DragOverContainerEvent() {
    (0, _classCallCheck3.default)(this, DragOverContainerEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOverContainerEvent.__proto__ || Object.getPrototypeOf(DragOverContainerEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOverContainerEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return DragOverContainerEvent;
}(DragEvent);

/**
 * Drag out container event
 * @class DragOutContainerEvent
 * @module DragOutContainerEvent
 * @extends DragEvent
 */


DragOverContainerEvent.type = 'drag:over:container';

var DragOutContainerEvent = exports.DragOutContainerEvent = function (_DragEvent6) {
  (0, _inherits3.default)(DragOutContainerEvent, _DragEvent6);

  function DragOutContainerEvent() {
    (0, _classCallCheck3.default)(this, DragOutContainerEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOutContainerEvent.__proto__ || Object.getPrototypeOf(DragOutContainerEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOutContainerEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you left
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return DragOutContainerEvent;
}(DragEvent);

/**
 * Drag pressure event
 * @class DragPressureEvent
 * @module DragPressureEvent
 * @extends DragEvent
 */


DragOutContainerEvent.type = 'drag:out:container';

var DragPressureEvent = exports.DragPressureEvent = function (_DragEvent7) {
  (0, _inherits3.default)(DragPressureEvent, _DragEvent7);

  function DragPressureEvent() {
    (0, _classCallCheck3.default)(this, DragPressureEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragPressureEvent.__proto__ || Object.getPrototypeOf(DragPressureEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragPressureEvent, [{
    key: 'pressure',


    /**
     * Pressure applied on draggable element
     * @property pressure
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.pressure;
    }
  }]);
  return DragPressureEvent;
}(DragEvent);

/**
 * Drag stop event
 * @class DragStopEvent
 * @module DragStopEvent
 * @extends DragEvent
 */


DragPressureEvent.type = 'drag:pressure';

var DragStopEvent = exports.DragStopEvent = function (_DragEvent8) {
  (0, _inherits3.default)(DragStopEvent, _DragEvent8);

  function DragStopEvent() {
    (0, _classCallCheck3.default)(this, DragStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStopEvent.__proto__ || Object.getPrototypeOf(DragStopEvent)).apply(this, arguments));
  }

  return DragStopEvent;
}(DragEvent);

DragStopEvent.type = 'drag:stop';

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Plugins = exports.Sensors = exports.Sortable = exports.Swappable = exports.Droppable = exports.Draggable = exports.BasePlugin = exports.BaseEvent = undefined;

var _Draggable = __webpack_require__(26);

Object.defineProperty(exports, 'Draggable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Draggable).default;
  }
});

var _Droppable = __webpack_require__(90);

Object.defineProperty(exports, 'Droppable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Droppable).default;
  }
});

var _Swappable = __webpack_require__(81);

Object.defineProperty(exports, 'Swappable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Swappable).default;
  }
});

var _Sortable = __webpack_require__(78);

Object.defineProperty(exports, 'Sortable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Sortable).default;
  }
});

var _AbstractEvent = __webpack_require__(5);

var _AbstractEvent2 = _interopRequireDefault(_AbstractEvent);

var _AbstractPlugin = __webpack_require__(7);

var _AbstractPlugin2 = _interopRequireDefault(_AbstractPlugin);

var _Sensors = __webpack_require__(28);

var Sensors = _interopRequireWildcard(_Sensors);

var _Plugins = __webpack_require__(75);

var Plugins = _interopRequireWildcard(_Plugins);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.BaseEvent = _AbstractEvent2.default;
exports.BasePlugin = _AbstractPlugin2.default;
exports.Sensors = Sensors;
exports.Plugins = Plugins;

/***/ })
/******/ ]);
});
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define('Draggable', [], factory);
	else if(typeof exports === 'object')
		exports['Draggable'] = factory();
	else
		root['Draggable'] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = '';
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 254);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _defineProperty = __webpack_require__(211);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _setPrototypeOf = __webpack_require__(171);

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = __webpack_require__(167);

var _create2 = _interopRequireDefault(_create);

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + (typeof superClass === 'undefined' ? 'undefined' : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _typeof2 = __webpack_require__(88);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
  }

  return call && ((typeof call === 'undefined' ? 'undefined' : (0, _typeof3.default)(call)) === 'object' || typeof call === 'function') ? call : self;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(74)('wks');
var uid = __webpack_require__(41);
var Symbol = __webpack_require__(5).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 7 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(58)('wks');
var uid = __webpack_require__(44);
var Symbol = __webpack_require__(13).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _AbstractEvent = __webpack_require__(212);

var _AbstractEvent2 = _interopRequireDefault(_AbstractEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _AbstractEvent2.default;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _AbstractPlugin = __webpack_require__(207);

var _AbstractPlugin2 = _interopRequireDefault(_AbstractPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _AbstractPlugin2.default;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _closest = __webpack_require__(164);

Object.defineProperty(exports, 'closest', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_closest).default;
  }
});

var _requestNextAnimationFrame = __webpack_require__(162);

Object.defineProperty(exports, 'requestNextAnimationFrame', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_requestNextAnimationFrame).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(27);
var IE8_DOM_DEFINE = __webpack_require__(96);
var toPrimitive = __webpack_require__(66);
var dP = Object.defineProperty;

exports.f = __webpack_require__(17) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 13 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(20);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(200);
var defined = __webpack_require__(63);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 16 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(36)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(13);
var core = __webpack_require__(6);
var ctx = __webpack_require__(67);
var hide = __webpack_require__(28);
var has = __webpack_require__(16);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(108);
var defined = __webpack_require__(73);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(14);
var IE8_DOM_DEFINE = __webpack_require__(111);
var toPrimitive = __webpack_require__(75);
var dP = Object.defineProperty;

exports.f = __webpack_require__(23) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(21);
var createDesc = __webpack_require__(49);
module.exports = __webpack_require__(23) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(42)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 24 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _from = __webpack_require__(205);

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(26);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(12);
var createDesc = __webpack_require__(35);
module.exports = __webpack_require__(17) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(109);
var enumBugKeys = __webpack_require__(70);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var hide = __webpack_require__(22);
var has = __webpack_require__(24);
var SRC = __webpack_require__(41)('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(7).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var core = __webpack_require__(7);
var hide = __webpack_require__(22);
var redefine = __webpack_require__(30);
var ctx = __webpack_require__(48);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SensorEvent = __webpack_require__(160);

Object.keys(_SensorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SensorEvent[key];
    }
  });
});

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Sensor = __webpack_require__(206);

var _Sensor2 = _interopRequireDefault(_Sensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Sensor2.default;

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragEvent = __webpack_require__(83);

Object.keys(_DragEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DragEvent[key];
    }
  });
});

var _DraggableEvent = __webpack_require__(82);

Object.keys(_DraggableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DraggableEvent[key];
    }
  });
});

var _Plugins = __webpack_require__(81);

Object.keys(_Plugins).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Plugins[key];
    }
  });
});

var _Sensors = __webpack_require__(65);

Object.keys(_Sensors).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Sensors[key];
    }
  });
});

var _Draggable = __webpack_require__(129);

var _Draggable2 = _interopRequireDefault(_Draggable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Draggable2.default;

/***/ }),
/* 44 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 45 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(21).f;
var has = __webpack_require__(24);
var TAG = __webpack_require__(4)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(47);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _getPrototypeOf = __webpack_require__(123);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = __webpack_require__(120);

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ('value' in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(52);
var createDesc = __webpack_require__(35);
var toIObject = __webpack_require__(15);
var toPrimitive = __webpack_require__(66);
var has = __webpack_require__(16);
var IE8_DOM_DEFINE = __webpack_require__(96);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(17) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 52 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(13);
var core = __webpack_require__(6);
var LIBRARY = __webpack_require__(45);
var wksExt = __webpack_require__(54);
var defineProperty = __webpack_require__(12).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(8);


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(63);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(12).f;
var has = __webpack_require__(16);
var TAG = __webpack_require__(8)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 57 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(6);
var global = __webpack_require__(13);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(45) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(58)('keys');
var uid = __webpack_require__(44);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 60 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(91);
var enumBugKeys = __webpack_require__(57);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(27);
var dPs = __webpack_require__(201);
var enumBugKeys = __webpack_require__(57);
var IE_PROTO = __webpack_require__(59)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(95)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(197).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 63 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError('Can\'t call method on  ' + it);
  return it;
};


/***/ }),
/* 64 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Sensor = __webpack_require__(34);

Object.defineProperty(exports, 'Sensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Sensor).default;
  }
});

var _MouseSensor = __webpack_require__(189);

Object.defineProperty(exports, 'MouseSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MouseSensor).default;
  }
});

var _TouchSensor = __webpack_require__(159);

Object.defineProperty(exports, 'TouchSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TouchSensor).default;
  }
});

var _DragSensor = __webpack_require__(157);

Object.defineProperty(exports, 'DragSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_DragSensor).default;
  }
});

var _ForceTouchSensor = __webpack_require__(155);

Object.defineProperty(exports, 'ForceTouchSensor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ForceTouchSensor).default;
  }
});

var _SensorEvent = __webpack_require__(32);

Object.keys(_SensorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SensorEvent[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(26);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError('Can\'t convert object to primitive value');
};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(208);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(39);
var TAG = __webpack_require__(4)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 69 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(74)('keys');
var uid = __webpack_require__(41);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 72 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 73 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError('Can\'t call method on  ' + it);
  return it;
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(7);
var global = __webpack_require__(5);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(40) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(20);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError('Can\'t convert object to primitive value');
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(20);
var document = __webpack_require__(5).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SortableEvent = __webpack_require__(113);

Object.keys(_SortableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SortableEvent[key];
    }
  });
});

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SwappableEvent = __webpack_require__(116);

Object.keys(_SwappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SwappableEvent[key];
    }
  });
});

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(18);
var core = __webpack_require__(6);
var fails = __webpack_require__(36);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DroppableEvent = __webpack_require__(125);

Object.keys(_DroppableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DroppableEvent[key];
    }
  });
});

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Announcement = __webpack_require__(140);

Object.defineProperty(exports, 'Announcement', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Announcement).default;
  }
});
Object.defineProperty(exports, 'defaultAnnouncementOptions', {
  enumerable: true,
  get: function get() {
    return _Announcement.defaultOptions;
  }
});

var _Focusable = __webpack_require__(138);

Object.defineProperty(exports, 'Focusable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Focusable).default;
  }
});

var _Mirror = __webpack_require__(136);

Object.defineProperty(exports, 'Mirror', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Mirror).default;
  }
});
Object.defineProperty(exports, 'defaultMirrorOptions', {
  enumerable: true,
  get: function get() {
    return _Mirror.defaultOptions;
  }
});

var _Scrollable = __webpack_require__(131);

Object.defineProperty(exports, 'Scrollable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Scrollable).default;
  }
});
Object.defineProperty(exports, 'defaultScrollableOptions', {
  enumerable: true,
  get: function get() {
    return _Scrollable.defaultOptions;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DraggableEvent = __webpack_require__(141);

Object.keys(_DraggableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DraggableEvent[key];
    }
  });
});

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragEvent = __webpack_require__(142);

Object.keys(_DragEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DragEvent[key];
    }
  });
});

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SnappableEvent = __webpack_require__(146);

Object.keys(_SnappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SnappableEvent[key];
    }
  });
});

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CollidableEvent = __webpack_require__(151);

Object.keys(_CollidableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _CollidableEvent[key];
    }
  });
});

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(91);
var hiddenKeys = __webpack_require__(57).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 87 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

var _iterator = __webpack_require__(187);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(181);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === 'function' && typeof _iterator2.default === 'symbol' ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === 'function' && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? 'symbol' : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === 'function' && _typeof(_iterator2.default) === 'symbol' ? function (obj) {
  return typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === 'function' && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? 'symbol' : typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(16);
var toObject = __webpack_require__(55);
var IE_PROTO = __webpack_require__(59)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(64);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(16);
var toIObject = __webpack_require__(15);
var arrayIndexOf = __webpack_require__(199)(false);
var IE_PROTO = __webpack_require__(59)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(28);


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var LIBRARY = __webpack_require__(45);
var $export = __webpack_require__(18);
var redefine = __webpack_require__(92);
var hide = __webpack_require__(28);
var Iterators = __webpack_require__(33);
var $iterCreate = __webpack_require__(202);
var setToStringTag = __webpack_require__(56);
var getPrototypeOf = __webpack_require__(89);
var ITERATOR = __webpack_require__(8)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var $at = __webpack_require__(203)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(93)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(26);
var document = __webpack_require__(13).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(17) && !__webpack_require__(36)(function () {
  return Object.defineProperty(__webpack_require__(95)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(47);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(48);
var invoke = __webpack_require__(228);
var html = __webpack_require__(104);
var cel = __webpack_require__(76);
var global = __webpack_require__(5);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(39)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(4)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(22)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(73);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var LIBRARY = __webpack_require__(40);
var $export = __webpack_require__(31);
var redefine = __webpack_require__(30);
var hide = __webpack_require__(22);
var Iterators = __webpack_require__(37);
var $iterCreate = __webpack_require__(240);
var setToStringTag = __webpack_require__(46);
var getPrototypeOf = __webpack_require__(239);
var ITERATOR = __webpack_require__(4)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// 19.1.3.6 Object.prototype.toString()
var classof = __webpack_require__(68);
var test = {};
test[__webpack_require__(4)('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  __webpack_require__(30)(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(109);
var hiddenKeys = __webpack_require__(70).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(5).document;
module.exports = document && document.documentElement;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(14);
var dPs = __webpack_require__(246);
var enumBugKeys = __webpack_require__(70);
var IE_PROTO = __webpack_require__(71)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(76)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(104).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(72);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(19);
var toLength = __webpack_require__(106);
var toAbsoluteIndex = __webpack_require__(248);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(39);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(24);
var toIObject = __webpack_require__(19);
var arrayIndexOf = __webpack_require__(107)(false);
var IE_PROTO = __webpack_require__(71)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(4);


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(23) && !__webpack_require__(42)(function () {
  return Object.defineProperty(__webpack_require__(76)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(50);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Draggable2 = __webpack_require__(43);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _SortableEvent = __webpack_require__(77);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragOverContainer = Symbol('onDragOverContainer');
var onDragOver = Symbol('onDragOver');
var onDragStop = Symbol('onDragStop');

/**
 * Returns announcement message when a Draggable element has been sorted with another Draggable element
 * or moved into a new container
 * @param {SortableSortedEvent} sortableEvent
 * @return {String}
 */
function onSortableSortedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'sortable element';

  if (dragEvent.over) {
    var overText = dragEvent.over.textContent.trim() || dragEvent.over.id || 'sortable element';
    var isFollowing = dragEvent.source.compareDocumentPosition(dragEvent.over) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (isFollowing) {
      return 'Placed ' + sourceText + ' after ' + overText;
    } else {
      return 'Placed ' + sourceText + ' before ' + overText;
    }
  } else {
    // need to figure out how to compute container name
    return 'Placed ' + sourceText + ' into a different container';
  }
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['sortable:sorted']
 */
var defaultAnnouncements = {
  'sortable:sorted': onSortableSortedDefaultAnnouncement
};

/**
 * Sortable is built on top of Draggable and allows sorting of draggable elements. Sortable will keep
 * track of the original index and emits the new index as you drag over draggable elements.
 * @class Sortable
 * @module Sortable
 * @extends Draggable
 */

var Sortable = function (_Draggable) {
  (0, _inherits3.default)(Sortable, _Draggable);

  /**
   * Sortable constructor.
   * @constructs Sortable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Sortable containers
   * @param {Object} options - Options for Sortable
   */
  function Sortable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Sortable);

    /**
     * start index of source on drag start
     * @property startIndex
     * @type {Number}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Sortable.__proto__ || Object.getPrototypeOf(Sortable)).call(this, containers, Object.assign({}, options, {
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.startIndex = null;

    /**
     * start container on drag start
     * @property startContainer
     * @type {HTMLElement}
     * @default null
     */
    _this.startContainer = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOverContainer] = _this[onDragOverContainer].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:over:container', _this[onDragOverContainer]).on('drag:over', _this[onDragOver]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Sortable instance.
   */


  (0, _createClass3.default)(Sortable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Sortable.prototype.__proto__ || Object.getPrototypeOf(Sortable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this[onDragStart]).off('drag:over:container', this[onDragOverContainer]).off('drag:over', this[onDragOver]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns true index of element within its container during drag operation, i.e. excluding mirror and original source
     * @param {HTMLElement} element - An element
     * @return {Number}
     */

  }, {
    key: 'index',
    value: function index(element) {
      return this.getDraggableElementsForContainer(element.parentNode).indexOf(element);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      this.startContainer = event.source.parentNode;
      this.startIndex = this.index(event.source);

      var sortableStartEvent = new _SortableEvent.SortableStartEvent({
        dragEvent: event,
        startIndex: this.startIndex,
        startContainer: this.startContainer
      });

      this.trigger(sortableStartEvent);

      if (sortableStartEvent.canceled()) {
        event.cancel();
      }
    }

    /**
     * Drag over container handler
     * @private
     * @param {DragOverContainerEvent} event - Drag over container event
     */

  }, {
    key: onDragOverContainer,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var source = event.source,
          over = event.over,
          overContainer = event.overContainer;

      var oldIndex = this.index(source);

      var sortableSortEvent = new _SortableEvent.SortableSortEvent({
        dragEvent: event,
        currentIndex: oldIndex,
        source: source,
        over: over
      });

      this.trigger(sortableSortEvent);

      if (sortableSortEvent.canceled()) {
        return;
      }

      var children = this.getDraggableElementsForContainer(overContainer);
      var moves = move({ source: source, over: over, overContainer: overContainer, children: children });

      if (!moves) {
        return;
      }

      var oldContainer = moves.oldContainer,
          newContainer = moves.newContainer;

      var newIndex = this.index(event.source);

      var sortableSortedEvent = new _SortableEvent.SortableSortedEvent({
        dragEvent: event,
        oldIndex: oldIndex,
        newIndex: newIndex,
        oldContainer: oldContainer,
        newContainer: newContainer
      });

      this.trigger(sortableSortedEvent);
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (event.over === event.originalSource || event.over === event.source) {
        return;
      }

      var source = event.source,
          over = event.over,
          overContainer = event.overContainer;

      var oldIndex = this.index(source);

      var sortableSortEvent = new _SortableEvent.SortableSortEvent({
        dragEvent: event,
        currentIndex: oldIndex,
        source: source,
        over: over
      });

      this.trigger(sortableSortEvent);

      if (sortableSortEvent.canceled()) {
        return;
      }

      var children = this.getDraggableElementsForContainer(overContainer);
      var moves = move({ source: source, over: over, overContainer: overContainer, children: children });

      if (!moves) {
        return;
      }

      var oldContainer = moves.oldContainer,
          newContainer = moves.newContainer;

      var newIndex = this.index(source);

      var sortableSortedEvent = new _SortableEvent.SortableSortedEvent({
        dragEvent: event,
        oldIndex: oldIndex,
        newIndex: newIndex,
        oldContainer: oldContainer,
        newContainer: newContainer
      });

      this.trigger(sortableSortedEvent);
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var sortableStopEvent = new _SortableEvent.SortableStopEvent({
        dragEvent: event,
        oldIndex: this.startIndex,
        newIndex: this.index(event.source),
        oldContainer: this.startContainer,
        newContainer: event.source.parentNode
      });

      this.trigger(sortableStopEvent);

      this.startIndex = null;
      this.startContainer = null;
    }
  }]);
  return Sortable;
}(_Draggable3.default);

exports.default = Sortable;


function index(element) {
  return Array.prototype.indexOf.call(element.parentNode.children, element);
}

function move(_ref2) {
  var source = _ref2.source,
      over = _ref2.over,
      overContainer = _ref2.overContainer,
      children = _ref2.children;

  var emptyOverContainer = !children.length;
  var differentContainer = source.parentNode !== overContainer;
  var sameContainer = over && !differentContainer;

  if (emptyOverContainer) {
    return moveInsideEmptyContainer(source, overContainer);
  } else if (sameContainer) {
    return moveWithinContainer(source, over);
  } else if (differentContainer) {
    return moveOutsideContainer(source, over, overContainer);
  } else {
    return null;
  }
}

function moveInsideEmptyContainer(source, overContainer) {
  var oldContainer = source.parentNode;

  overContainer.appendChild(source);

  return { oldContainer: oldContainer, newContainer: overContainer };
}

function moveWithinContainer(source, over) {
  var oldIndex = index(source);
  var newIndex = index(over);

  if (oldIndex < newIndex) {
    source.parentNode.insertBefore(source, over.nextElementSibling);
  } else {
    source.parentNode.insertBefore(source, over);
  }

  return { oldContainer: source.parentNode, newContainer: source.parentNode };
}

function moveOutsideContainer(source, over, overContainer) {
  var oldContainer = source.parentNode;

  if (over) {
    over.parentNode.insertBefore(source, over);
  } else {
    // need to figure out proper position
    overContainer.appendChild(source);
  }

  return { oldContainer: oldContainer, newContainer: source.parentNode };
}

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SortableStopEvent = exports.SortableSortedEvent = exports.SortableSortEvent = exports.SortableStartEvent = exports.SortableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sortable event
 * @class SortableEvent
 * @module SortableEvent
 * @extends AbstractEvent
 */
var SortableEvent = exports.SortableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SortableEvent, _AbstractEvent);

  function SortableEvent() {
    (0, _classCallCheck3.default)(this, SortableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableEvent.__proto__ || Object.getPrototypeOf(SortableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this sortable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return SortableEvent;
}(_AbstractEvent3.default);

/**
 * Sortable start event
 * @class SortableStartEvent
 * @module SortableStartEvent
 * @extends SortableEvent
 */


SortableEvent.type = 'sortable';

var SortableStartEvent = exports.SortableStartEvent = function (_SortableEvent) {
  (0, _inherits3.default)(SortableStartEvent, _SortableEvent);

  function SortableStartEvent() {
    (0, _classCallCheck3.default)(this, SortableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableStartEvent.__proto__ || Object.getPrototypeOf(SortableStartEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableStartEvent, [{
    key: 'startIndex',


    /**
     * Start index of source on sortable start
     * @property startIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.startIndex;
    }

    /**
     * Start container on sortable start
     * @property startContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'startContainer',
    get: function get() {
      return this.data.startContainer;
    }
  }]);
  return SortableStartEvent;
}(SortableEvent);

/**
 * Sortable sort event
 * @class SortableSortEvent
 * @module SortableSortEvent
 * @extends SortableEvent
 */


SortableStartEvent.type = 'sortable:start';
SortableStartEvent.cancelable = true;

var SortableSortEvent = exports.SortableSortEvent = function (_SortableEvent2) {
  (0, _inherits3.default)(SortableSortEvent, _SortableEvent2);

  function SortableSortEvent() {
    (0, _classCallCheck3.default)(this, SortableSortEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableSortEvent.__proto__ || Object.getPrototypeOf(SortableSortEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableSortEvent, [{
    key: 'currentIndex',


    /**
     * Index of current draggable element
     * @property currentIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.currentIndex;
    }

    /**
     * Draggable element you are hovering over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * Draggable container element you are hovering over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'overContainer',
    get: function get() {
      return this.data.newIndex;
    }
  }]);
  return SortableSortEvent;
}(SortableEvent);

/**
 * Sortable sorted event
 * @class SortableSortedEvent
 * @module SortableSortedEvent
 * @extends SortableEvent
 */


SortableSortEvent.type = 'sortable:sort';
SortableSortEvent.cancelable = true;

var SortableSortedEvent = exports.SortableSortedEvent = function (_SortableEvent3) {
  (0, _inherits3.default)(SortableSortedEvent, _SortableEvent3);

  function SortableSortedEvent() {
    (0, _classCallCheck3.default)(this, SortableSortedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableSortedEvent.__proto__ || Object.getPrototypeOf(SortableSortedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableSortedEvent, [{
    key: 'oldIndex',


    /**
     * Index of last sorted event
     * @property oldIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * New index of this sorted event
     * @property newIndex
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'newIndex',
    get: function get() {
      return this.data.newIndex;
    }

    /**
     * Old container of draggable element
     * @property oldContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'oldContainer',
    get: function get() {
      return this.data.oldContainer;
    }

    /**
     * New container of draggable element
     * @property newContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'newContainer',
    get: function get() {
      return this.data.newContainer;
    }
  }]);
  return SortableSortedEvent;
}(SortableEvent);

/**
 * Sortable stop event
 * @class SortableStopEvent
 * @module SortableStopEvent
 * @extends SortableEvent
 */


SortableSortedEvent.type = 'sortable:sorted';

var SortableStopEvent = exports.SortableStopEvent = function (_SortableEvent4) {
  (0, _inherits3.default)(SortableStopEvent, _SortableEvent4);

  function SortableStopEvent() {
    (0, _classCallCheck3.default)(this, SortableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SortableStopEvent.__proto__ || Object.getPrototypeOf(SortableStopEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SortableStopEvent, [{
    key: 'oldIndex',


    /**
     * Original index on sortable start
     * @property oldIndex
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.oldIndex;
    }

    /**
     * New index of draggable element
     * @property newIndex
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'newIndex',
    get: function get() {
      return this.data.newIndex;
    }

    /**
     * Original container of draggable element
     * @property oldContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'oldContainer',
    get: function get() {
      return this.data.oldContainer;
    }

    /**
     * New container of draggable element
     * @property newContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'newContainer',
    get: function get() {
      return this.data.newContainer;
    }
  }]);
  return SortableStopEvent;
}(SortableEvent);

SortableStopEvent.type = 'sortable:stop';

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SortableEvent = __webpack_require__(77);

Object.keys(_SortableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SortableEvent[key];
    }
  });
});

var _Sortable = __webpack_require__(112);

var _Sortable2 = _interopRequireDefault(_Sortable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Sortable2.default;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(50);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Draggable2 = __webpack_require__(43);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _SwappableEvent = __webpack_require__(78);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragOver = Symbol('onDragOver');
var onDragStop = Symbol('onDragStop');

/**
 * Returns an announcement message when the Draggable element is swapped with another draggable element
 * @param {SwappableSwappedEvent} swappableEvent
 * @return {String}
 */
function onSwappableSwappedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent,
      swappedElement = _ref.swappedElement;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'swappable element';
  var overText = swappedElement.textContent.trim() || swappedElement.id || 'swappable element';

  return 'Swapped ' + sourceText + ' with ' + overText;
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['swappabled:swapped']
 */
var defaultAnnouncements = {
  'swappabled:swapped': onSwappableSwappedDefaultAnnouncement
};

/**
 * Swappable is built on top of Draggable and allows swapping of draggable elements.
 * Order is irrelevant to Swappable.
 * @class Swappable
 * @module Swappable
 * @extends Draggable
 */

var Swappable = function (_Draggable) {
  (0, _inherits3.default)(Swappable, _Draggable);

  /**
   * Swappable constructor.
   * @constructs Swappable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Swappable containers
   * @param {Object} options - Options for Swappable
   */
  function Swappable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Swappable);

    /**
     * Last draggable element that was dragged over
     * @property lastOver
     * @type {HTMLElement}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Swappable.__proto__ || Object.getPrototypeOf(Swappable)).call(this, containers, Object.assign({}, options, {
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.lastOver = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:over', _this[onDragOver]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Swappable instance.
   */


  (0, _createClass3.default)(Swappable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Swappable.prototype.__proto__ || Object.getPrototypeOf(Swappable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this._onDragStart).off('drag:over', this._onDragOver).off('drag:stop', this._onDragStop);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var swappableStartEvent = new _SwappableEvent.SwappableStartEvent({
        dragEvent: event
      });

      this.trigger(swappableStartEvent);

      if (swappableStartEvent.canceled()) {
        event.cancel();
      }
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (event.over === event.originalSource || event.over === event.source || event.canceled()) {
        return;
      }

      var swappableSwapEvent = new _SwappableEvent.SwappableSwapEvent({
        dragEvent: event,
        over: event.over,
        overContainer: event.overContainer
      });

      this.trigger(swappableSwapEvent);

      if (swappableSwapEvent.canceled()) {
        return;
      }

      // swap originally swapped element back
      if (this.lastOver && this.lastOver !== event.over) {
        swap(this.lastOver, event.source);
      }

      if (this.lastOver === event.over) {
        this.lastOver = null;
      } else {
        this.lastOver = event.over;
      }

      swap(event.source, event.over);

      var swappableSwappedEvent = new _SwappableEvent.SwappableSwappedEvent({
        dragEvent: event,
        swappedElement: event.over
      });

      this.trigger(swappableSwappedEvent);
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var swappableStopEvent = new _SwappableEvent.SwappableStopEvent({
        dragEvent: event
      });

      this.trigger(swappableStopEvent);
      this.lastOver = null;
    }
  }]);
  return Swappable;
}(_Draggable3.default);

exports.default = Swappable;


function withTempElement(callback) {
  var tmpElement = document.createElement('div');
  callback(tmpElement);
  tmpElement.parentNode.removeChild(tmpElement);
}

function swap(source, over) {
  var overParent = over.parentNode;
  var sourceParent = source.parentNode;

  withTempElement(function (tmpElement) {
    sourceParent.insertBefore(tmpElement, source);
    overParent.insertBefore(source, over);
    sourceParent.insertBefore(over, tmpElement);
  });
}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SwappableStopEvent = exports.SwappableSwappedEvent = exports.SwappableSwapEvent = exports.SwappableStartEvent = exports.SwappableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base swappable event
 * @class SwappableEvent
 * @module SwappableEvent
 * @extends AbstractEvent
 */
var SwappableEvent = exports.SwappableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SwappableEvent, _AbstractEvent);

  function SwappableEvent() {
    (0, _classCallCheck3.default)(this, SwappableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableEvent.__proto__ || Object.getPrototypeOf(SwappableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this swappable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return SwappableEvent;
}(_AbstractEvent3.default);

/**
 * Swappable start event
 * @class SwappableStartEvent
 * @module SwappableStartEvent
 * @extends SwappableEvent
 */


SwappableEvent.type = 'swappable';

var SwappableStartEvent = exports.SwappableStartEvent = function (_SwappableEvent) {
  (0, _inherits3.default)(SwappableStartEvent, _SwappableEvent);

  function SwappableStartEvent() {
    (0, _classCallCheck3.default)(this, SwappableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableStartEvent.__proto__ || Object.getPrototypeOf(SwappableStartEvent)).apply(this, arguments));
  }

  return SwappableStartEvent;
}(SwappableEvent);

/**
 * Swappable swap event
 * @class SwappableSwapEvent
 * @module SwappableSwapEvent
 * @extends SwappableEvent
 */


SwappableStartEvent.type = 'swappable:start';
SwappableStartEvent.cancelable = true;

var SwappableSwapEvent = exports.SwappableSwapEvent = function (_SwappableEvent2) {
  (0, _inherits3.default)(SwappableSwapEvent, _SwappableEvent2);

  function SwappableSwapEvent() {
    (0, _classCallCheck3.default)(this, SwappableSwapEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableSwapEvent.__proto__ || Object.getPrototypeOf(SwappableSwapEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableSwapEvent, [{
    key: 'over',


    /**
     * Draggable element you are over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.over;
    }

    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'overContainer',
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return SwappableSwapEvent;
}(SwappableEvent);

/**
 * Swappable swapped event
 * @class SwappableSwappedEvent
 * @module SwappableSwappedEvent
 * @extends SwappableEvent
 */


SwappableSwapEvent.type = 'swappable:swap';
SwappableSwapEvent.cancelable = true;

var SwappableSwappedEvent = exports.SwappableSwappedEvent = function (_SwappableEvent3) {
  (0, _inherits3.default)(SwappableSwappedEvent, _SwappableEvent3);

  function SwappableSwappedEvent() {
    (0, _classCallCheck3.default)(this, SwappableSwappedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableSwappedEvent.__proto__ || Object.getPrototypeOf(SwappableSwappedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SwappableSwappedEvent, [{
    key: 'swappedElement',


    /**
     * The draggable element that you swapped with
     * @property swappedElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.swappedElement;
    }
  }]);
  return SwappableSwappedEvent;
}(SwappableEvent);

/**
 * Swappable stop event
 * @class SwappableStopEvent
 * @module SwappableStopEvent
 * @extends SwappableEvent
 */


SwappableSwappedEvent.type = 'swappable:swapped';

var SwappableStopEvent = exports.SwappableStopEvent = function (_SwappableEvent4) {
  (0, _inherits3.default)(SwappableStopEvent, _SwappableEvent4);

  function SwappableStopEvent() {
    (0, _classCallCheck3.default)(this, SwappableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SwappableStopEvent.__proto__ || Object.getPrototypeOf(SwappableStopEvent)).apply(this, arguments));
  }

  return SwappableStopEvent;
}(SwappableEvent);

SwappableStopEvent.type = 'swappable:stop';

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SwappableEvent = __webpack_require__(78);

Object.keys(_SwappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SwappableEvent[key];
    }
  });
});

var _Swappable = __webpack_require__(115);

var _Swappable2 = _interopRequireDefault(_Swappable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Swappable2.default;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(15);
var $getOwnPropertyDescriptor = __webpack_require__(51).f;

__webpack_require__(79)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(118);
var $Object = __webpack_require__(6).Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(119), __esModule: true };

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = __webpack_require__(55);
var $getPrototypeOf = __webpack_require__(89);

__webpack_require__(79)('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(121);
module.exports = __webpack_require__(6).Object.getPrototypeOf;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(122), __esModule: true };

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = __webpack_require__(50);

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(11);

var _Draggable2 = __webpack_require__(43);

var _Draggable3 = _interopRequireDefault(_Draggable2);

var _DroppableEvent = __webpack_require__(80);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var dropInDropzone = Symbol('dropInDropZone');
var returnToOriginalDropzone = Symbol('returnToOriginalDropzone');
var closestDropzone = Symbol('closestDropzone');
var getDropzones = Symbol('getDropzones');

/**
 * Returns an announcement message when the Draggable element is dropped into a dropzone element
 * @param {DroppableDroppedEvent} droppableEvent
 * @return {String}
 */
function onDroppableDroppedDefaultAnnouncement(_ref) {
  var dragEvent = _ref.dragEvent,
      dropzone = _ref.dropzone;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'draggable element';
  var dropzoneText = dropzone.textContent.trim() || dropzone.id || 'droppable element';

  return 'Dropped ' + sourceText + ' into ' + dropzoneText;
}

/**
 * Returns an announcement message when the Draggable element has returned to its original dropzone element
 * @param {DroppableReturnedEvent} droppableEvent
 * @return {String}
 */
function onDroppableReturnedDefaultAnnouncement(_ref2) {
  var dragEvent = _ref2.dragEvent,
      dropzone = _ref2.dropzone;

  var sourceText = dragEvent.source.textContent.trim() || dragEvent.source.id || 'draggable element';
  var dropzoneText = dropzone.textContent.trim() || dropzone.id || 'droppable element';

  return 'Returned ' + sourceText + ' from ' + dropzoneText;
}

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['droppable:dropped']
 * @const {Function} defaultAnnouncements['droppable:returned']
 */
var defaultAnnouncements = {
  'droppable:dropped': onDroppableDroppedDefaultAnnouncement,
  'droppable:returned': onDroppableReturnedDefaultAnnouncement
};

var defaultClasses = {
  'droppable:active': 'draggable-dropzone--active',
  'droppable:occupied': 'draggable-dropzone--occupied'
};

var defaultOptions = {
  dropzone: '.draggable-droppable'
};

/**
 * Droppable is built on top of Draggable and allows dropping draggable elements
 * into dropzone element
 * @class Droppable
 * @module Droppable
 * @extends Draggable
 */

var Droppable = function (_Draggable) {
  (0, _inherits3.default)(Droppable, _Draggable);

  /**
   * Droppable constructor.
   * @constructs Droppable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Droppable containers
   * @param {Object} options - Options for Droppable
   */
  function Droppable() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Droppable);

    /**
     * All dropzone elements on drag start
     * @property dropzones
     * @type {HTMLElement[]}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Droppable.__proto__ || Object.getPrototypeOf(Droppable)).call(this, containers, Object.assign({}, defaultOptions, options, {
      classes: Object.assign({}, defaultClasses, options.classes || {}),
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    })));

    _this.dropzones = null;

    /**
     * Last dropzone element that the source was dropped into
     * @property lastDropzone
     * @type {HTMLElement}
     */
    _this.lastDropzone = null;

    /**
     * Initial dropzone element that the source was drag from
     * @property initialDropzone
     * @type {HTMLElement}
     */
    _this.initialDropzone = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);

    _this.on('drag:start', _this[onDragStart]).on('drag:move', _this[onDragMove]).on('drag:stop', _this[onDragStop]);
    return _this;
  }

  /**
   * Destroys Droppable instance.
   */


  (0, _createClass3.default)(Droppable, [{
    key: 'destroy',
    value: function destroy() {
      (0, _get3.default)(Droppable.prototype.__proto__ || Object.getPrototypeOf(Droppable.prototype), 'destroy', this).call(this);

      this.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      this.dropzones = [].concat((0, _toConsumableArray3.default)(this[getDropzones]()));
      var dropzone = (0, _utils.closest)(event.sensorEvent.target, this.options.dropzone);

      if (!dropzone) {
        event.cancel();
        return;
      }

      var droppableStartEvent = new _DroppableEvent.DroppableStartEvent({
        dragEvent: event,
        dropzone: dropzone
      });

      this.trigger(droppableStartEvent);

      if (droppableStartEvent.canceled()) {
        event.cancel();
        return;
      }

      this.initialDropzone = dropzone;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.dropzones[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var dropzoneElement = _step.value;

          if (dropzoneElement.classList.contains(this.getClassNameFor('droppable:occupied'))) {
            continue;
          }

          dropzoneElement.classList.add(this.getClassNameFor('droppable:active'));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Drag move handler
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var dropzone = this[closestDropzone](event.sensorEvent.target);
      var overEmptyDropzone = dropzone && !dropzone.classList.contains(this.getClassNameFor('droppable:occupied'));

      if (overEmptyDropzone && this[dropInDropzone](event, dropzone)) {
        this.lastDropzone = dropzone;
      } else if ((!dropzone || dropzone === this.initialDropzone) && this.lastDropzone) {
        this[returnToOriginalDropzone](event);
        this.lastDropzone = null;
      }
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var droppableStopEvent = new _DroppableEvent.DroppableStopEvent({
        dragEvent: event,
        dropzone: this.lastDropzone || this.initialDropzone
      });

      this.trigger(droppableStopEvent);

      var occupiedClass = this.getClassNameFor('droppable:occupied');

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.dropzones[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var dropzone = _step2.value;

          dropzone.classList.remove(this.getClassNameFor('droppable:active'));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (this.lastDropzone && this.lastDropzone !== this.initialDropzone) {
        this.initialDropzone.classList.remove(occupiedClass);
      }

      this.dropzones = null;
      this.lastDropzone = null;
      this.initialDropzone = null;
    }

    /**
     * Drops a draggable element into a dropzone element
     * @private
     * @param {DragMoveEvent} event - Drag move event
     * @param {HTMLElement} dropzone - Dropzone element to drop draggable into
     */

  }, {
    key: dropInDropzone,
    value: function value(event, dropzone) {
      var droppableDroppedEvent = new _DroppableEvent.DroppableDroppedEvent({
        dragEvent: event,
        dropzone: dropzone
      });

      this.trigger(droppableDroppedEvent);

      if (droppableDroppedEvent.canceled()) {
        return false;
      }

      var occupiedClass = this.getClassNameFor('droppable:occupied');

      if (this.lastDropzone) {
        this.lastDropzone.classList.remove(occupiedClass);
      }

      dropzone.appendChild(event.source);
      dropzone.classList.add(occupiedClass);

      return true;
    }

    /**
     * Moves the previously dropped element back into its original dropzone
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: returnToOriginalDropzone,
    value: function value(event) {
      var droppableReturnedEvent = new _DroppableEvent.DroppableReturnedEvent({
        dragEvent: event,
        dropzone: this.lastDropzone
      });

      this.trigger(droppableReturnedEvent);

      if (droppableReturnedEvent.canceled()) {
        return;
      }

      this.initialDropzone.appendChild(event.source);
      this.lastDropzone.classList.remove(this.getClassNameFor('droppable:occupied'));
    }

    /**
     * Returns closest dropzone element for even target
     * @private
     * @param {HTMLElement} target - Event target
     * @return {HTMLElement|null}
     */

  }, {
    key: closestDropzone,
    value: function value(target) {
      if (!this.dropzones) {
        return null;
      }

      return (0, _utils.closest)(target, this.dropzones);
    }

    /**
     * Returns all current dropzone elements for this draggable instance
     * @private
     * @return {NodeList|HTMLElement[]|Array}
     */

  }, {
    key: getDropzones,
    value: function value() {
      var dropzone = this.options.dropzone;

      if (typeof dropzone === 'string') {
        return document.querySelectorAll(dropzone);
      } else if (dropzone instanceof NodeList || dropzone instanceof Array) {
        return dropzone;
      } else if (typeof dropzone === 'function') {
        return dropzone();
      } else {
        return [];
      }
    }
  }]);
  return Droppable;
}(_Draggable3.default);

exports.default = Droppable;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DroppableStopEvent = exports.DroppableReturnedEvent = exports.DroppableDroppedEvent = exports.DroppableStartEvent = exports.DroppableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base droppable event
 * @class DroppableEvent
 * @module DroppableEvent
 * @extends AbstractEvent
 */
var DroppableEvent = exports.DroppableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DroppableEvent, _AbstractEvent);

  function DroppableEvent() {
    (0, _classCallCheck3.default)(this, DroppableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableEvent.__proto__ || Object.getPrototypeOf(DroppableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableEvent, [{
    key: 'dragEvent',


    /**
     * Original drag event that triggered this droppable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return DroppableEvent;
}(_AbstractEvent3.default);

/**
 * Droppable start event
 * @class DroppableStartEvent
 * @module DroppableStartEvent
 * @extends DroppableEvent
 */


DroppableEvent.type = 'droppable';

var DroppableStartEvent = exports.DroppableStartEvent = function (_DroppableEvent) {
  (0, _inherits3.default)(DroppableStartEvent, _DroppableEvent);

  function DroppableStartEvent() {
    (0, _classCallCheck3.default)(this, DroppableStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableStartEvent.__proto__ || Object.getPrototypeOf(DroppableStartEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableStartEvent, [{
    key: 'dropzone',


    /**
     * The initial dropzone element of the currently dragging draggable element
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableStartEvent;
}(DroppableEvent);

/**
 * Droppable dropped event
 * @class DroppableDroppedEvent
 * @module DroppableDroppedEvent
 * @extends DroppableEvent
 */


DroppableStartEvent.type = 'droppable:start';
DroppableStartEvent.cancelable = true;

var DroppableDroppedEvent = exports.DroppableDroppedEvent = function (_DroppableEvent2) {
  (0, _inherits3.default)(DroppableDroppedEvent, _DroppableEvent2);

  function DroppableDroppedEvent() {
    (0, _classCallCheck3.default)(this, DroppableDroppedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableDroppedEvent.__proto__ || Object.getPrototypeOf(DroppableDroppedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableDroppedEvent, [{
    key: 'dropzone',


    /**
     * The dropzone element you dropped the draggable element into
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableDroppedEvent;
}(DroppableEvent);

/**
 * Droppable returned event
 * @class DroppableReturnedEvent
 * @module DroppableReturnedEvent
 * @extends DroppableEvent
 */


DroppableDroppedEvent.type = 'droppable:dropped';
DroppableDroppedEvent.cancelable = true;

var DroppableReturnedEvent = exports.DroppableReturnedEvent = function (_DroppableEvent3) {
  (0, _inherits3.default)(DroppableReturnedEvent, _DroppableEvent3);

  function DroppableReturnedEvent() {
    (0, _classCallCheck3.default)(this, DroppableReturnedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableReturnedEvent.__proto__ || Object.getPrototypeOf(DroppableReturnedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableReturnedEvent, [{
    key: 'dropzone',


    /**
     * The dropzone element you dragged away from
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableReturnedEvent;
}(DroppableEvent);

/**
 * Droppable stop event
 * @class DroppableStopEvent
 * @module DroppableStopEvent
 * @extends DroppableEvent
 */


DroppableReturnedEvent.type = 'droppable:returned';
DroppableReturnedEvent.cancelable = true;

var DroppableStopEvent = exports.DroppableStopEvent = function (_DroppableEvent4) {
  (0, _inherits3.default)(DroppableStopEvent, _DroppableEvent4);

  function DroppableStopEvent() {
    (0, _classCallCheck3.default)(this, DroppableStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DroppableStopEvent.__proto__ || Object.getPrototypeOf(DroppableStopEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DroppableStopEvent, [{
    key: 'dropzone',


    /**
     * The final dropzone element of the draggable element
     * @property dropzone
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.dropzone;
    }
  }]);
  return DroppableStopEvent;
}(DroppableEvent);

DroppableStopEvent.type = 'droppable:stop';
DroppableStopEvent.cancelable = true;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DroppableEvent = __webpack_require__(80);

Object.keys(_DroppableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _DroppableEvent[key];
    }
  });
});

var _Droppable = __webpack_require__(124);

var _Droppable2 = _interopRequireDefault(_Droppable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Droppable2.default;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The Emitter is a simple emitter class that provides you with `on()`, `off()` and `trigger()` methods
 * @class Emitter
 * @module Emitter
 */
var Emitter = function () {
  function Emitter() {
    (0, _classCallCheck3.default)(this, Emitter);

    this.callbacks = {};
  }

  /**
   * Registers callbacks by event name
   * @param {String} type
   * @param {...Function} callbacks
   */


  (0, _createClass3.default)(Emitter, [{
    key: 'on',
    value: function on(type) {
      var _callbacks$type;

      if (!this.callbacks[type]) {
        this.callbacks[type] = [];
      }

      for (var _len = arguments.length, callbacks = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        callbacks[_key - 1] = arguments[_key];
      }

      (_callbacks$type = this.callbacks[type]).push.apply(_callbacks$type, callbacks);

      return this;
    }

    /**
     * Unregisters callbacks by event name
     * @param {String} type
     * @param {Function} callback
     */

  }, {
    key: 'off',
    value: function off(type, callback) {
      if (!this.callbacks[type]) {
        return null;
      }

      var copy = this.callbacks[type].slice(0);

      for (var i = 0; i < copy.length; i++) {
        if (callback === copy[i]) {
          this.callbacks[type].splice(i, 1);
        }
      }

      return this;
    }

    /**
     * Triggers event callbacks by event object
     * @param {AbstractEvent} event
     */

  }, {
    key: 'trigger',
    value: function trigger(event) {
      if (!this.callbacks[event.type]) {
        return null;
      }

      var callbacks = [].concat((0, _toConsumableArray3.default)(this.callbacks[event.type]));
      var caughtErrors = [];

      for (var i = callbacks.length - 1; i >= 0; i--) {
        var callback = callbacks[i];

        try {
          callback(event);
        } catch (error) {
          caughtErrors.push(error);
        }
      }

      if (caughtErrors.length) {
        /* eslint-disable no-console */
        console.error('Draggable caught errors while triggering \'' + event.type + '\'', caughtErrors);
        /* eslint-disable no-console */
      }

      return this;
    }
  }]);
  return Emitter;
}();

exports.default = Emitter;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Emitter = __webpack_require__(127);

var _Emitter2 = _interopRequireDefault(_Emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Emitter2.default;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = __webpack_require__(11);

var _Plugins = __webpack_require__(81);

var _Emitter = __webpack_require__(128);

var _Emitter2 = _interopRequireDefault(_Emitter);

var _Sensors = __webpack_require__(65);

var _DraggableEvent = __webpack_require__(82);

var _DragEvent = __webpack_require__(83);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var onDragPressure = Symbol('onDragPressure');

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['drag:start']
 * @const {Function} defaultAnnouncements['drag:stop']
 */
var defaultAnnouncements = {
  'drag:start': function dragStart(event) {
    return 'Picked up ' + (event.source.textContent.trim() || event.source.id || 'draggable element');
  },
  'drag:stop': function dragStop(event) {
    return 'Released ' + (event.source.textContent.trim() || event.source.id || 'draggable element');
  }
};

var defaultClasses = {
  'container:dragging': 'draggable-container--is-dragging',
  'source:dragging': 'draggable-source--is-dragging',
  'source:placed': 'draggable-source--placed',
  'container:placed': 'draggable-container--placed',
  'body:dragging': 'draggable--is-dragging',
  'draggable:over': 'draggable--over',
  'container:over': 'draggable-container--over',
  'source:original': 'draggable--original',
  mirror: 'draggable-mirror'
};

var defaultOptions = exports.defaultOptions = {
  draggable: '.draggable-source',
  handle: null,
  delay: 100,
  placedTimeout: 800,
  plugins: [],
  sensors: []
};

/**
 * This is the core draggable library that does the heavy lifting
 * @class Draggable
 * @module Draggable
 */

var Draggable = function () {

  /**
   * Draggable constructor.
   * @constructs Draggable
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Draggable containers
   * @param {Object} options - Options for draggable
   */
  function Draggable() {
    var _this = this;

    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [document.body];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Draggable);

    /**
     * Draggable containers
     * @property containers
     * @type {HTMLElement[]}
     */
    if (containers instanceof NodeList || containers instanceof Array) {
      this.containers = [].concat((0, _toConsumableArray3.default)(containers));
    } else if (containers instanceof HTMLElement) {
      this.containers = [containers];
    } else {
      throw new Error('Draggable containers are expected to be of type `NodeList`, `HTMLElement[]` or `HTMLElement`');
    }

    this.options = Object.assign({}, defaultOptions, options, {
      classes: Object.assign({}, defaultClasses, options.classes || {}),
      announcements: Object.assign({}, defaultAnnouncements, options.announcements || {})
    });

    /**
     * Draggables event emitter
     * @property emitter
     * @type {Emitter}
     */
    this.emitter = new _Emitter2.default();

    /**
     * Current drag state
     * @property dragging
     * @type {Boolean}
     */
    this.dragging = false;

    /**
     * Active plugins
     * @property plugins
     * @type {Plugin[]}
     */
    this.plugins = [];

    /**
     * Active sensors
     * @property sensors
     * @type {Sensor[]}
     */
    this.sensors = [];

    this[onDragStart] = this[onDragStart].bind(this);
    this[onDragMove] = this[onDragMove].bind(this);
    this[onDragStop] = this[onDragStop].bind(this);
    this[onDragPressure] = this[onDragPressure].bind(this);

    document.addEventListener('drag:start', this[onDragStart], true);
    document.addEventListener('drag:move', this[onDragMove], true);
    document.addEventListener('drag:stop', this[onDragStop], true);
    document.addEventListener('drag:pressure', this[onDragPressure], true);

    var defaultPlugins = Object.values(Draggable.Plugins).map(function (Plugin) {
      return Plugin;
    });
    var defaultSensors = [_Sensors.MouseSensor, _Sensors.TouchSensor];

    this.addPlugin.apply(this, [].concat((0, _toConsumableArray3.default)(defaultPlugins), (0, _toConsumableArray3.default)(this.options.plugins)));
    this.addSensor.apply(this, [].concat(defaultSensors, (0, _toConsumableArray3.default)(this.options.sensors)));

    var draggableInitializedEvent = new _DraggableEvent.DraggableInitializedEvent({
      draggable: this
    });

    this.on('mirror:created', function (_ref) {
      var mirror = _ref.mirror;
      return _this.mirror = mirror;
    });
    this.on('mirror:destroy', function () {
      return _this.mirror = null;
    });

    this.trigger(draggableInitializedEvent);
  }

  /**
   * Destroys Draggable instance. This removes all internal event listeners and
   * deactivates sensors and plugins
   */

  /**
   * Default plugins draggable uses
   * @static
   * @property {Object} Plugins
   * @property {Announcement} Plugins.Announcement
   * @property {Focusable} Plugins.Focusable
   * @property {Mirror} Plugins.Mirror
   * @property {Scrollable} Plugins.Scrollable
   * @type {Object}
   */


  (0, _createClass3.default)(Draggable, [{
    key: 'destroy',
    value: function destroy() {
      document.removeEventListener('drag:start', this[onDragStart], true);
      document.removeEventListener('drag:move', this[onDragMove], true);
      document.removeEventListener('drag:stop', this[onDragStop], true);
      document.removeEventListener('drag:pressure', this[onDragPressure], true);

      var draggableDestroyEvent = new _DraggableEvent.DraggableDestroyEvent({
        draggable: this
      });

      this.trigger(draggableDestroyEvent);

      this.removePlugin.apply(this, (0, _toConsumableArray3.default)(this.plugins.map(function (plugin) {
        return plugin.constructor;
      })));
      this.removeSensor.apply(this, (0, _toConsumableArray3.default)(this.sensors.map(function (sensor) {
        return sensor.constructor;
      })));
    }

    /**
     * Adds plugin to this draggable instance. This will end up calling the attach method of the plugin
     * @param {...typeof Plugin} plugins - Plugins that you want attached to draggable
     * @return {Draggable}
     * @example draggable.addPlugin(CustomA11yPlugin, CustomMirrorPlugin)
     */

  }, {
    key: 'addPlugin',
    value: function addPlugin() {
      var _this2 = this;

      for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
        plugins[_key] = arguments[_key];
      }

      var activePlugins = plugins.map(function (Plugin) {
        return new Plugin(_this2);
      });

      activePlugins.forEach(function (plugin) {
        return plugin.attach();
      });
      this.plugins = [].concat((0, _toConsumableArray3.default)(this.plugins), (0, _toConsumableArray3.default)(activePlugins));

      return this;
    }

    /**
     * Removes plugins that are already attached to this draggable instance. This will end up calling
     * the detach method of the plugin
     * @param {...typeof Plugin} plugins - Plugins that you want detached from draggable
     * @return {Draggable}
     * @example draggable.removePlugin(MirrorPlugin, CustomMirrorPlugin)
     */

  }, {
    key: 'removePlugin',
    value: function removePlugin() {
      for (var _len2 = arguments.length, plugins = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        plugins[_key2] = arguments[_key2];
      }

      var removedPlugins = this.plugins.filter(function (plugin) {
        return plugins.includes(plugin.constructor);
      });

      removedPlugins.forEach(function (plugin) {
        return plugin.detach();
      });
      this.plugins = this.plugins.filter(function (plugin) {
        return !plugins.includes(plugin.constructor);
      });

      return this;
    }

    /**
     * Adds sensors to this draggable instance. This will end up calling the attach method of the sensor
     * @param {...typeof Sensor} sensors - Sensors that you want attached to draggable
     * @return {Draggable}
     * @example draggable.addSensor(ForceTouchSensor, CustomSensor)
     */

  }, {
    key: 'addSensor',
    value: function addSensor() {
      var _this3 = this;

      for (var _len3 = arguments.length, sensors = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        sensors[_key3] = arguments[_key3];
      }

      var activeSensors = sensors.map(function (Sensor) {
        return new Sensor(_this3.containers, _this3.options);
      });

      activeSensors.forEach(function (sensor) {
        return sensor.attach();
      });
      this.sensors = [].concat((0, _toConsumableArray3.default)(this.sensors), (0, _toConsumableArray3.default)(activeSensors));

      return this;
    }

    /**
     * Removes sensors that are already attached to this draggable instance. This will end up calling
     * the detach method of the sensor
     * @param {...typeof Sensor} sensors - Sensors that you want attached to draggable
     * @return {Draggable}
     * @example draggable.removeSensor(TouchSensor, DragSensor)
     */

  }, {
    key: 'removeSensor',
    value: function removeSensor() {
      for (var _len4 = arguments.length, sensors = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        sensors[_key4] = arguments[_key4];
      }

      var removedSensors = this.sensors.filter(function (sensor) {
        return sensors.includes(sensor.constructor);
      });

      removedSensors.forEach(function (sensor) {
        return sensor.detach();
      });
      this.sensors = this.sensors.filter(function (sensor) {
        return !sensors.includes(sensor.constructor);
      });

      return this;
    }

    /**
     * Adds container to this draggable instance
     * @param {...HTMLElement} containers - Containers you want to add to draggable
     * @return {Draggable}
     * @example draggable.addContainer(document.body)
     */

  }, {
    key: 'addContainer',
    value: function addContainer() {
      for (var _len5 = arguments.length, containers = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        containers[_key5] = arguments[_key5];
      }

      this.containers = [].concat((0, _toConsumableArray3.default)(this.containers), containers);
      this.sensors.forEach(function (sensor) {
        return sensor.addContainer.apply(sensor, containers);
      });
      return this;
    }

    /**
     * Removes container from this draggable instance
     * @param {...HTMLElement} containers - Containers you want to remove from draggable
     * @return {Draggable}
     * @example draggable.removeContainer(document.body)
     */

  }, {
    key: 'removeContainer',
    value: function removeContainer() {
      for (var _len6 = arguments.length, containers = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        containers[_key6] = arguments[_key6];
      }

      this.containers = this.containers.filter(function (container) {
        return !containers.includes(container);
      });
      this.sensors.forEach(function (sensor) {
        return sensor.removeContainer.apply(sensor, containers);
      });
      return this;
    }

    /**
     * Adds listener for draggable events
     * @param {String} type - Event name
     * @param {...Function} callbacks - Event callbacks
     * @return {Draggable}
     * @example draggable.on('drag:start', (dragEvent) => dragEvent.cancel());
     */

  }, {
    key: 'on',
    value: function on(type) {
      var _emitter;

      for (var _len7 = arguments.length, callbacks = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
        callbacks[_key7 - 1] = arguments[_key7];
      }

      (_emitter = this.emitter).on.apply(_emitter, [type].concat(callbacks));
      return this;
    }

    /**
     * Removes listener from draggable
     * @param {String} type - Event name
     * @param {Function} callback - Event callback
     * @return {Draggable}
     * @example draggable.off('drag:start', handlerFunction);
     */

  }, {
    key: 'off',
    value: function off(type, callback) {
      this.emitter.off(type, callback);
      return this;
    }

    /**
     * Triggers draggable event
     * @param {AbstractEvent} event - Event instance
     * @return {Draggable}
     * @example draggable.trigger(event);
     */

  }, {
    key: 'trigger',
    value: function trigger(event) {
      this.emitter.trigger(event);
      return this;
    }

    /**
     * Returns class name for class identifier
     * @param {String} name - Name of class identifier
     * @return {String|null}
     */

  }, {
    key: 'getClassNameFor',
    value: function getClassNameFor(name) {
      return this.options.classes[name];
    }

    /**
     * Returns true if this draggable instance is currently dragging
     * @return {Boolean}
     */

  }, {
    key: 'isDragging',
    value: function isDragging() {
      return Boolean(this.dragging);
    }

    /**
     * Returns all draggable elements
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getDraggableElements',
    value: function getDraggableElements() {
      var _this4 = this;

      return this.containers.reduce(function (current, container) {
        return [].concat((0, _toConsumableArray3.default)(current), (0, _toConsumableArray3.default)(_this4.getDraggableElementsForContainer(container)));
      }, []);
    }

    /**
     * Returns draggable elements for a given container, excluding the mirror and
     * original source element if present
     * @param {HTMLElement} container
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getDraggableElementsForContainer',
    value: function getDraggableElementsForContainer(container) {
      var _this5 = this;

      var allDraggableElements = container.querySelectorAll(this.options.draggable);

      return [].concat((0, _toConsumableArray3.default)(allDraggableElements)).filter(function (childElement) {
        return childElement !== _this5.originalSource && childElement !== _this5.mirror;
      });
    }

    /**
     * Drag start handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var _this6 = this;

      var sensorEvent = getSensorEvent(event);
      var target = sensorEvent.target,
          container = sensorEvent.container;


      if (!this.containers.includes(container)) {
        return;
      }

      if (this.options.handle && target && !(0, _utils.closest)(target, this.options.handle)) {
        sensorEvent.cancel();
        return;
      }

      // Find draggable source element
      this.originalSource = (0, _utils.closest)(target, this.options.draggable);
      this.sourceContainer = container;

      if (!this.originalSource) {
        sensorEvent.cancel();
        return;
      }

      if (this.lastPlacedSource && this.lastPlacedContainer) {
        clearTimeout(this.placedTimeoutID);
        this.lastPlacedSource.classList.remove(this.getClassNameFor('source:placed'));
        this.lastPlacedContainer.classList.remove(this.getClassNameFor('container:placed'));
      }

      this.source = this.originalSource.cloneNode(true);
      this.originalSource.parentNode.insertBefore(this.source, this.originalSource);
      this.originalSource.style.display = 'none';

      var dragEvent = new _DragEvent.DragStartEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: sensorEvent
      });

      this.trigger(dragEvent);

      this.dragging = !dragEvent.canceled();

      if (dragEvent.canceled()) {
        this.source.parentNode.removeChild(this.source);
        this.originalSource.style.display = null;
        return;
      }

      this.originalSource.classList.add(this.getClassNameFor('source:original'));
      this.source.classList.add(this.getClassNameFor('source:dragging'));
      this.sourceContainer.classList.add(this.getClassNameFor('container:dragging'));
      document.body.classList.add(this.getClassNameFor('body:dragging'));
      applyUserSelect(document.body, 'none');

      requestAnimationFrame(function () {
        var oldSensorEvent = getSensorEvent(event);
        var newSensorEvent = oldSensorEvent.clone({ target: _this6.source });

        _this6[onDragMove](Object.assign({}, event, {
          detail: newSensorEvent
        }));
      });
    }

    /**
     * Drag move handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var sensorEvent = getSensorEvent(event);
      var container = sensorEvent.container;

      var target = sensorEvent.target;

      var dragMoveEvent = new _DragEvent.DragMoveEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent: sensorEvent
      });

      this.trigger(dragMoveEvent);

      if (dragMoveEvent.canceled()) {
        sensorEvent.cancel();
      }

      target = (0, _utils.closest)(target, this.options.draggable);
      var withinCorrectContainer = (0, _utils.closest)(sensorEvent.target, this.containers);
      var overContainer = sensorEvent.overContainer || withinCorrectContainer;
      var isLeavingContainer = this.currentOverContainer && overContainer !== this.currentOverContainer;
      var isLeavingDraggable = this.currentOver && target !== this.currentOver;
      var isOverContainer = overContainer && this.currentOverContainer !== overContainer;
      var isOverDraggable = withinCorrectContainer && target && this.currentOver !== target;

      if (isLeavingDraggable) {
        var dragOutEvent = new _DragEvent.DragOutEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          over: this.currentOver
        });

        this.currentOver.classList.remove(this.getClassNameFor('draggable:over'));
        this.currentOver = null;

        this.trigger(dragOutEvent);
      }

      if (isLeavingContainer) {
        var dragOutContainerEvent = new _DragEvent.DragOutContainerEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: this.currentOverContainer
        });

        this.currentOverContainer.classList.remove(this.getClassNameFor('container:over'));
        this.currentOverContainer = null;

        this.trigger(dragOutContainerEvent);
      }

      if (isOverContainer) {
        overContainer.classList.add(this.getClassNameFor('container:over'));

        var dragOverContainerEvent = new _DragEvent.DragOverContainerEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: overContainer
        });

        this.currentOverContainer = overContainer;

        this.trigger(dragOverContainerEvent);
      }

      if (isOverDraggable) {
        target.classList.add(this.getClassNameFor('draggable:over'));

        var dragOverEvent = new _DragEvent.DragOverEvent({
          source: this.source,
          originalSource: this.originalSource,
          sourceContainer: container,
          sensorEvent: sensorEvent,
          overContainer: overContainer,
          over: target
        });

        this.currentOver = target;

        this.trigger(dragOverEvent);
      }
    }

    /**
     * Drag stop handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var _this7 = this;

      if (!this.dragging) {
        return;
      }

      this.dragging = false;

      var dragStopEvent = new _DragEvent.DragStopEvent({
        source: this.source,
        originalSource: this.originalSource,
        sensorEvent: event.sensorEvent,
        sourceContainer: this.sourceContainer
      });

      this.trigger(dragStopEvent);

      this.source.parentNode.insertBefore(this.originalSource, this.source);
      this.source.parentNode.removeChild(this.source);
      this.originalSource.style.display = '';

      this.source.classList.remove(this.getClassNameFor('source:dragging'));
      this.originalSource.classList.remove(this.getClassNameFor('source:original'));
      this.originalSource.classList.add(this.getClassNameFor('source:placed'));
      this.sourceContainer.classList.add(this.getClassNameFor('container:placed'));
      this.sourceContainer.classList.remove(this.getClassNameFor('container:dragging'));
      document.body.classList.remove(this.getClassNameFor('body:dragging'));
      applyUserSelect(document.body, '');

      if (this.currentOver) {
        this.currentOver.classList.remove(this.getClassNameFor('draggable:over'));
      }

      if (this.currentOverContainer) {
        this.currentOverContainer.classList.remove(this.getClassNameFor('container:over'));
      }

      this.lastPlacedSource = this.originalSource;
      this.lastPlacedContainer = this.sourceContainer;

      this.placedTimeoutID = setTimeout(function () {
        if (_this7.lastPlacedSource) {
          _this7.lastPlacedSource.classList.remove(_this7.getClassNameFor('source:placed'));
        }

        if (_this7.lastPlacedContainer) {
          _this7.lastPlacedContainer.classList.remove(_this7.getClassNameFor('container:placed'));
        }

        _this7.lastPlacedSource = null;
        _this7.lastPlacedContainer = null;
      }, this.options.placedTimeout);

      this.source = null;
      this.originalSource = null;
      this.currentOverContainer = null;
      this.currentOver = null;
      this.sourceContainer = null;
    }

    /**
     * Drag pressure handler
     * @private
     * @param {Event} event - DOM Drag event
     */

  }, {
    key: onDragPressure,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var sensorEvent = getSensorEvent(event);
      var source = this.source || (0, _utils.closest)(sensorEvent.originalEvent.target, this.options.draggable);

      var dragPressureEvent = new _DragEvent.DragPressureEvent({
        sensorEvent: sensorEvent,
        source: source,
        pressure: sensorEvent.pressure
      });

      this.trigger(dragPressureEvent);
    }
  }]);
  return Draggable;
}();

Draggable.Plugins = { Announcement: _Plugins.Announcement, Focusable: _Plugins.Focusable, Mirror: _Plugins.Mirror, Scrollable: _Plugins.Scrollable };
exports.default = Draggable;


function getSensorEvent(event) {
  return event.detail;
}

function applyUserSelect(element, value) {
  element.style.webkitUserSelect = value;
  element.style.mozUserSelect = value;
  element.style.msUserSelect = value;
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = exports.scroll = exports.onDragStop = exports.onDragMove = exports.onDragStart = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = exports.onDragStart = Symbol('onDragStart');
var onDragMove = exports.onDragMove = Symbol('onDragMove');
var onDragStop = exports.onDragStop = Symbol('onDragStop');
var scroll = exports.scroll = Symbol('scroll');

/**
 * Scrollable default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.speed
 * @property {Number} defaultOptions.sensitivity
 * @property {HTMLElement[]} defaultOptions.scrollableElements
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  speed: 6,
  sensitivity: 50,
  scrollableElements: []
};

/**
 * Scrollable plugin which scrolls the closest scrollable parent
 * @class Scrollable
 * @module Scrollable
 * @extends AbstractPlugin
 */

var Scrollable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Scrollable, _AbstractPlugin);

  /**
   * Scrollable constructor.
   * @constructs Scrollable
   * @param {Draggable} draggable - Draggable instance
   */
  function Scrollable(draggable) {
    (0, _classCallCheck3.default)(this, Scrollable);

    /**
     * Scrollable options
     * @property {Object} options
     * @property {Number} options.speed
     * @property {Number} options.sensitivity
     * @property {HTMLElement[]} options.scrollableElements
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Scrollable.__proto__ || Object.getPrototypeOf(Scrollable)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Keeps current mouse position
     * @property {Object} currentMousePosition
     * @property {Number} currentMousePosition.clientX
     * @property {Number} currentMousePosition.clientY
     * @type {Object|null}
     */
    _this.currentMousePosition = null;

    /**
     * Scroll animation frame
     * @property scrollAnimationFrame
     * @type {Number|null}
     */
    _this.scrollAnimationFrame = null;

    /**
     * Closest scrollable element
     * @property scrollableElement
     * @type {HTMLElement|null}
     */
    _this.scrollableElement = null;

    /**
     * Animation frame looking for the closest scrollable element
     * @property findScrollableElementFrame
     * @type {Number|null}
     */
    _this.findScrollableElementFrame = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[scroll] = _this[scroll].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Scrollable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.scrollable || {};
    }

    /**
     * Returns closest scrollable elements by element
     * @param {HTMLElement} target
     * @return {HTMLElement}
     */

  }, {
    key: 'getScrollableElement',
    value: function getScrollableElement(target) {
      if (this.hasDefinedScrollableElements()) {
        return (0, _utils.closest)(target, this.options.scrollableElements) || document.documentElement;
      } else {
        return closestScrollableElement(target);
      }
    }

    /**
     * Returns true if at least one scrollable element have been defined via options
     * @param {HTMLElement} target
     * @return {Boolean}
     */

  }, {
    key: 'hasDefinedScrollableElements',
    value: function hasDefinedScrollableElements() {
      return Boolean(this.options.scrollableElements.length !== 0);
    }

    /**
     * Drag start handler. Finds closest scrollable parent in separate frame
     * @param {DragStartEvent} dragEvent
     * @private
     */

  }, {
    key: onDragStart,
    value: function value(dragEvent) {
      var _this2 = this;

      this.findScrollableElementFrame = requestAnimationFrame(function () {
        _this2.scrollableElement = _this2.getScrollableElement(dragEvent.source);
      });
    }

    /**
     * Drag move handler. Remembers mouse position and initiates scrolling
     * @param {DragMoveEvent} dragEvent
     * @private
     */

  }, {
    key: onDragMove,
    value: function value(dragEvent) {
      var _this3 = this;

      this.findScrollableElementFrame = requestAnimationFrame(function () {
        _this3.scrollableElement = _this3.getScrollableElement(dragEvent.sensorEvent.target);
      });

      if (!this.scrollableElement) {
        return;
      }

      var sensorEvent = dragEvent.sensorEvent;
      var scrollOffset = { x: 0, y: 0 };

      if ('ontouchstart' in window) {
        scrollOffset.y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        scrollOffset.x = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      }

      this.currentMousePosition = {
        clientX: sensorEvent.clientX - scrollOffset.x,
        clientY: sensorEvent.clientY - scrollOffset.y
      };

      this.scrollAnimationFrame = requestAnimationFrame(this[scroll]);
    }

    /**
     * Drag stop handler. Cancels scroll animations and resets state
     * @private
     */

  }, {
    key: onDragStop,
    value: function value() {
      cancelAnimationFrame(this.scrollAnimationFrame);
      cancelAnimationFrame(this.findScrollableElementFrame);

      this.scrollableElement = null;
      this.scrollAnimationFrame = null;
      this.findScrollableElementFrame = null;
      this.currentMousePosition = null;
    }

    /**
     * Scroll function that does the heavylifting
     * @private
     */

  }, {
    key: scroll,
    value: function value() {
      if (!this.scrollableElement || !this.currentMousePosition) {
        return;
      }

      cancelAnimationFrame(this.scrollAnimationFrame);

      var _options = this.options,
          speed = _options.speed,
          sensitivity = _options.sensitivity;


      var rect = this.scrollableElement.getBoundingClientRect();
      var bottomCutOff = rect.bottom > window.innerHeight;
      var topCutOff = rect.top < 0;
      var cutOff = topCutOff || bottomCutOff;

      var documentScrollingElement = getDocumentScrollingElement();
      var scrollableElement = this.scrollableElement;
      var clientX = this.currentMousePosition.clientX;
      var clientY = this.currentMousePosition.clientY;

      if (scrollableElement !== document.body && scrollableElement !== document.documentElement && !cutOff) {
        var offsetHeight = scrollableElement.offsetHeight,
            offsetWidth = scrollableElement.offsetWidth;


        if (rect.top + offsetHeight - clientY < sensitivity) {
          scrollableElement.scrollTop += speed;
        } else if (clientY - rect.top < sensitivity) {
          scrollableElement.scrollTop -= speed;
        }

        if (rect.left + offsetWidth - clientX < sensitivity) {
          scrollableElement.scrollLeft += speed;
        } else if (clientX - rect.left < sensitivity) {
          scrollableElement.scrollLeft -= speed;
        }
      } else {
        var _window = window,
            innerHeight = _window.innerHeight,
            innerWidth = _window.innerWidth;


        if (clientY < sensitivity) {
          documentScrollingElement.scrollTop -= speed;
        } else if (innerHeight - clientY < sensitivity) {
          documentScrollingElement.scrollTop += speed;
        }

        if (clientX < sensitivity) {
          documentScrollingElement.scrollLeft -= speed;
        } else if (innerWidth - clientX < sensitivity) {
          documentScrollingElement.scrollLeft += speed;
        }
      }

      this.scrollAnimationFrame = requestAnimationFrame(this[scroll]);
    }
  }]);
  return Scrollable;
}(_AbstractPlugin3.default);

/**
 * Returns true if the passed element has overflow
 * @param {HTMLElement} element
 * @return {Boolean}
 * @private
 */


exports.default = Scrollable;
function hasOverflow(element) {
  var overflowRegex = /(auto|scroll)/;
  var computedStyles = getComputedStyle(element, null);

  var overflow = computedStyles.getPropertyValue('overflow') + computedStyles.getPropertyValue('overflow-y') + computedStyles.getPropertyValue('overflow-x');

  return overflowRegex.test(overflow);
}

/**
 * Returns true if the passed element is statically positioned
 * @param {HTMLElement} element
 * @return {Boolean}
 * @private
 */
function isStaticallyPositioned(element) {
  var position = getComputedStyle(element).getPropertyValue('position');
  return position === 'static';
}

/**
 * Finds closest scrollable element
 * @param {HTMLElement} element
 * @return {HTMLElement}
 * @private
 */
function closestScrollableElement(element) {
  if (!element) {
    return getDocumentScrollingElement();
  }

  var position = getComputedStyle(element).getPropertyValue('position');
  var excludeStaticParents = position === 'absolute';

  var scrollableElement = (0, _utils.closest)(element, function (parent) {
    if (excludeStaticParents && isStaticallyPositioned(parent)) {
      return false;
    }
    return hasOverflow(parent);
  });

  if (position === 'fixed' || !scrollableElement) {
    return getDocumentScrollingElement();
  } else {
    return scrollableElement;
  }
}

/**
 * Returns element that scrolls document
 * @return {HTMLElement}
 * @private
 */
function getDocumentScrollingElement() {
  return document.scrollingElement || document.documentElement;
}

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Scrollable = __webpack_require__(130);

var _Scrollable2 = _interopRequireDefault(_Scrollable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Scrollable2.default;
exports.defaultOptions = _Scrollable.defaultOptions;

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.MirrorDestroyEvent = exports.MirrorMoveEvent = exports.MirrorAttachedEvent = exports.MirrorCreatedEvent = exports.MirrorCreateEvent = exports.MirrorEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base mirror event
 * @class MirrorEvent
 * @module MirrorEvent
 * @extends AbstractEvent
 */
var MirrorEvent = exports.MirrorEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(MirrorEvent, _AbstractEvent);

  function MirrorEvent() {
    (0, _classCallCheck3.default)(this, MirrorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorEvent.__proto__ || Object.getPrototypeOf(MirrorEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorEvent, [{
    key: 'source',

    /**
     * Draggables source element
     * @property source
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.source;
    }

    /**
     * Draggables original source element
     * @property originalSource
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'originalSource',
    get: function get() {
      return this.data.originalSource;
    }

    /**
     * Draggables source container element
     * @property sourceContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'sourceContainer',
    get: function get() {
      return this.data.sourceContainer;
    }

    /**
     * Sensor event
     * @property sensorEvent
     * @type {SensorEvent}
     * @readonly
     */

  }, {
    key: 'sensorEvent',
    get: function get() {
      return this.data.sensorEvent;
    }

    /**
     * Drag event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */

  }, {
    key: 'dragEvent',
    get: function get() {
      return this.data.dragEvent;
    }

    /**
     * Original event that triggered sensor event
     * @property originalEvent
     * @type {Event}
     * @readonly
     */

  }, {
    key: 'originalEvent',
    get: function get() {
      if (this.sensorEvent) {
        return this.sensorEvent.originalEvent;
      }

      return null;
    }
  }]);
  return MirrorEvent;
}(_AbstractEvent3.default);

/**
 * Mirror create event
 * @class MirrorCreateEvent
 * @module MirrorCreateEvent
 * @extends MirrorEvent
 */


var MirrorCreateEvent = exports.MirrorCreateEvent = function (_MirrorEvent) {
  (0, _inherits3.default)(MirrorCreateEvent, _MirrorEvent);

  function MirrorCreateEvent() {
    (0, _classCallCheck3.default)(this, MirrorCreateEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorCreateEvent.__proto__ || Object.getPrototypeOf(MirrorCreateEvent)).apply(this, arguments));
  }

  return MirrorCreateEvent;
}(MirrorEvent);

/**
 * Mirror created event
 * @class MirrorCreatedEvent
 * @module MirrorCreatedEvent
 * @extends MirrorEvent
 */


MirrorCreateEvent.type = 'mirror:create';

var MirrorCreatedEvent = exports.MirrorCreatedEvent = function (_MirrorEvent2) {
  (0, _inherits3.default)(MirrorCreatedEvent, _MirrorEvent2);

  function MirrorCreatedEvent() {
    (0, _classCallCheck3.default)(this, MirrorCreatedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorCreatedEvent.__proto__ || Object.getPrototypeOf(MirrorCreatedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorCreatedEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorCreatedEvent;
}(MirrorEvent);

/**
 * Mirror attached event
 * @class MirrorAttachedEvent
 * @module MirrorAttachedEvent
 * @extends MirrorEvent
 */


MirrorCreatedEvent.type = 'mirror:created';

var MirrorAttachedEvent = exports.MirrorAttachedEvent = function (_MirrorEvent3) {
  (0, _inherits3.default)(MirrorAttachedEvent, _MirrorEvent3);

  function MirrorAttachedEvent() {
    (0, _classCallCheck3.default)(this, MirrorAttachedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorAttachedEvent.__proto__ || Object.getPrototypeOf(MirrorAttachedEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorAttachedEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorAttachedEvent;
}(MirrorEvent);

/**
 * Mirror move event
 * @class MirrorMoveEvent
 * @module MirrorMoveEvent
 * @extends MirrorEvent
 */


MirrorAttachedEvent.type = 'mirror:attached';

var MirrorMoveEvent = exports.MirrorMoveEvent = function (_MirrorEvent4) {
  (0, _inherits3.default)(MirrorMoveEvent, _MirrorEvent4);

  function MirrorMoveEvent() {
    (0, _classCallCheck3.default)(this, MirrorMoveEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorMoveEvent.__proto__ || Object.getPrototypeOf(MirrorMoveEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorMoveEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorMoveEvent;
}(MirrorEvent);

/**
 * Mirror destroy event
 * @class MirrorDestroyEvent
 * @module MirrorDestroyEvent
 * @extends MirrorEvent
 */


MirrorMoveEvent.type = 'mirror:move';
MirrorMoveEvent.cancelable = true;

var MirrorDestroyEvent = exports.MirrorDestroyEvent = function (_MirrorEvent5) {
  (0, _inherits3.default)(MirrorDestroyEvent, _MirrorEvent5);

  function MirrorDestroyEvent() {
    (0, _classCallCheck3.default)(this, MirrorDestroyEvent);
    return (0, _possibleConstructorReturn3.default)(this, (MirrorDestroyEvent.__proto__ || Object.getPrototypeOf(MirrorDestroyEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(MirrorDestroyEvent, [{
    key: 'mirror',


    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.mirror;
    }
  }]);
  return MirrorDestroyEvent;
}(MirrorEvent);

MirrorDestroyEvent.type = 'mirror:destroy';
MirrorDestroyEvent.cancelable = true;

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _MirrorEvent = __webpack_require__(132);

Object.keys(_MirrorEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _MirrorEvent[key];
    }
  });
});

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


exports.__esModule = true;

exports.default = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = exports.getAppendableContainer = exports.onScroll = exports.onMirrorMove = exports.onMirrorCreated = exports.onDragStop = exports.onDragMove = exports.onDragStart = undefined;

var _objectWithoutProperties2 = __webpack_require__(134);

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _MirrorEvent = __webpack_require__(133);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = exports.onDragStart = Symbol('onDragStart');
var onDragMove = exports.onDragMove = Symbol('onDragMove');
var onDragStop = exports.onDragStop = Symbol('onDragStop');
var onMirrorCreated = exports.onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorMove = exports.onMirrorMove = Symbol('onMirrorMove');
var onScroll = exports.onScroll = Symbol('onScroll');
var getAppendableContainer = exports.getAppendableContainer = Symbol('getAppendableContainer');

/**
 * Mirror default options
 * @property {Object} defaultOptions
 * @property {Boolean} defaultOptions.constrainDimensions
 * @property {Boolean} defaultOptions.xAxis
 * @property {Boolean} defaultOptions.yAxis
 * @property {null} defaultOptions.cursorOffsetX
 * @property {null} defaultOptions.cursorOffsetY
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  constrainDimensions: false,
  xAxis: true,
  yAxis: true,
  cursorOffsetX: null,
  cursorOffsetY: null
};

/**
 * Mirror plugin which controls the mirror positioning while dragging
 * @class Mirror
 * @module Mirror
 * @extends AbstractPlugin
 */

var Mirror = function (_AbstractPlugin) {
  (0, _inherits3.default)(Mirror, _AbstractPlugin);

  /**
   * Mirror constructor.
   * @constructs Mirror
   * @param {Draggable} draggable - Draggable instance
   */
  function Mirror(draggable) {
    (0, _classCallCheck3.default)(this, Mirror);

    /**
     * Mirror options
     * @property {Object} options
     * @property {Boolean} options.constrainDimensions
     * @property {Boolean} options.xAxis
     * @property {Boolean} options.yAxis
     * @property {Number|null} options.cursorOffsetX
     * @property {Number|null} options.cursorOffsetY
     * @property {String|HTMLElement|Function} options.appendTo
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Mirror.__proto__ || Object.getPrototypeOf(Mirror)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Scroll offset for touch devices because the mirror is positioned fixed
     * @property {Object} scrollOffset
     * @property {Number} scrollOffset.x
     * @property {Number} scrollOffset.y
     */
    _this.scrollOffset = { x: 0, y: 0 };

    /**
     * Initial scroll offset for touch devices because the mirror is positioned fixed
     * @property {Object} scrollOffset
     * @property {Number} scrollOffset.x
     * @property {Number} scrollOffset.y
     */
    _this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY
    };

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorMove] = _this[onMirrorMove].bind(_this);
    _this[onScroll] = _this[onScroll].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Mirror, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]).on('mirror:created', this[onMirrorCreated]).on('mirror:move', this[onMirrorMove]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]).off('mirror:created', this[onMirrorCreated]).off('mirror:move', this[onMirrorMove]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.mirror || {};
    }
  }, {
    key: onDragStart,
    value: function value(dragEvent) {
      if (dragEvent.canceled()) {
        return;
      }

      if ('ontouchstart' in window) {
        document.addEventListener('scroll', this[onScroll], true);
      }

      this.initialScrollOffset = {
        x: window.scrollX,
        y: window.scrollY
      };

      var source = dragEvent.source,
          originalSource = dragEvent.originalSource,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorCreateEvent = new _MirrorEvent.MirrorCreateEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent
      });

      this.draggable.trigger(mirrorCreateEvent);

      if (isNativeDragEvent(sensorEvent) || mirrorCreateEvent.canceled()) {
        return;
      }

      var appendableContainer = this[getAppendableContainer](source) || sourceContainer;
      this.mirror = source.cloneNode(true);

      var mirrorCreatedEvent = new _MirrorEvent.MirrorCreatedEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      var mirrorAttachedEvent = new _MirrorEvent.MirrorAttachedEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      this.draggable.trigger(mirrorCreatedEvent);
      appendableContainer.appendChild(this.mirror);
      this.draggable.trigger(mirrorAttachedEvent);
    }
  }, {
    key: onDragMove,
    value: function value(dragEvent) {
      if (!this.mirror || dragEvent.canceled()) {
        return;
      }

      var source = dragEvent.source,
          originalSource = dragEvent.originalSource,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorMoveEvent = new _MirrorEvent.MirrorMoveEvent({
        source: source,
        originalSource: originalSource,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent,
        mirror: this.mirror
      });

      this.draggable.trigger(mirrorMoveEvent);
    }
  }, {
    key: onDragStop,
    value: function value(dragEvent) {
      if ('ontouchstart' in window) {
        document.removeEventListener('scroll', this[onScroll], true);
      }

      this.initialScrollOffset = { x: 0, y: 0 };
      this.scrollOffset = { x: 0, y: 0 };

      if (!this.mirror) {
        return;
      }

      var source = dragEvent.source,
          sourceContainer = dragEvent.sourceContainer,
          sensorEvent = dragEvent.sensorEvent;


      var mirrorDestroyEvent = new _MirrorEvent.MirrorDestroyEvent({
        source: source,
        mirror: this.mirror,
        sourceContainer: sourceContainer,
        sensorEvent: sensorEvent,
        dragEvent: dragEvent
      });

      this.draggable.trigger(mirrorDestroyEvent);

      if (!mirrorDestroyEvent.canceled()) {
        this.mirror.parentNode.removeChild(this.mirror);
      }
    }
  }, {
    key: onScroll,
    value: function value() {
      this.scrollOffset = {
        x: window.scrollX - this.initialScrollOffset.x,
        y: window.scrollY - this.initialScrollOffset.y
      };
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @return {Promise}
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var _this2 = this;

      var mirror = _ref.mirror,
          source = _ref.source,
          sensorEvent = _ref.sensorEvent;

      var mirrorClass = this.draggable.getClassNameFor('mirror');

      var setState = function setState(_ref2) {
        var mirrorOffset = _ref2.mirrorOffset,
            initialX = _ref2.initialX,
            initialY = _ref2.initialY,
            args = (0, _objectWithoutProperties3.default)(_ref2, ['mirrorOffset', 'initialX', 'initialY']);

        _this2.mirrorOffset = mirrorOffset;
        _this2.initialX = initialX;
        _this2.initialY = initialY;
        return Object.assign({ mirrorOffset: mirrorOffset, initialX: initialX, initialY: initialY }, args);
      };

      var initialState = {
        mirror: mirror,
        source: source,
        sensorEvent: sensorEvent,
        mirrorClass: mirrorClass,
        scrollOffset: this.scrollOffset,
        options: this.options
      };

      return Promise.resolve(initialState)
      // Fix reflow here
      .then(computeMirrorDimensions).then(calculateMirrorOffset).then(resetMirror).then(addMirrorClasses).then(positionMirror({ initial: true })).then(removeMirrorID).then(setState);
    }

    /**
     * Mirror move handler
     * @param {MirrorMoveEvent} mirrorEvent
     * @return {Promise|null}
     * @private
     */

  }, {
    key: onMirrorMove,
    value: function value(mirrorEvent) {
      if (mirrorEvent.canceled()) {
        return null;
      }

      var initialState = {
        mirror: mirrorEvent.mirror,
        sensorEvent: mirrorEvent.sensorEvent,
        mirrorOffset: this.mirrorOffset,
        options: this.options,
        initialX: this.initialX,
        initialY: this.initialY,
        scrollOffset: this.scrollOffset
      };

      return Promise.resolve(initialState).then(positionMirror({ raf: true }));
    }

    /**
     * Returns appendable container for mirror based on the appendTo option
     * @private
     * @param {Object} options
     * @param {HTMLElement} options.source - Current source
     * @return {HTMLElement}
     */

  }, {
    key: getAppendableContainer,
    value: function value(source) {
      var appendTo = this.options.appendTo;

      if (typeof appendTo === 'string') {
        return document.querySelector(appendTo);
      } else if (appendTo instanceof HTMLElement) {
        return appendTo;
      } else if (typeof appendTo === 'function') {
        return appendTo(source);
      } else {
        return source.parentNode;
      }
    }
  }]);
  return Mirror;
}(_AbstractPlugin3.default);

/**
 * Computes mirror dimensions based on the source element
 * Adds sourceRect to state
 * @param {Object} state
 * @param {HTMLElement} state.source
 * @return {Promise}
 * @private
 */


exports.default = Mirror;
function computeMirrorDimensions(_ref3) {
  var source = _ref3.source,
      args = (0, _objectWithoutProperties3.default)(_ref3, ['source']);

  return withPromise(function (resolve) {
    var sourceRect = source.getBoundingClientRect();
    resolve(Object.assign({ source: source, sourceRect: sourceRect }, args));
  });
}

/**
 * Calculates mirror offset
 * Adds mirrorOffset to state
 * @param {Object} state
 * @param {SensorEvent} state.sensorEvent
 * @param {DOMRect} state.sourceRect
 * @return {Promise}
 * @private
 */
function calculateMirrorOffset(_ref4) {
  var sensorEvent = _ref4.sensorEvent,
      sourceRect = _ref4.sourceRect,
      options = _ref4.options,
      args = (0, _objectWithoutProperties3.default)(_ref4, ['sensorEvent', 'sourceRect', 'options']);

  return withPromise(function (resolve) {
    var top = options.cursorOffsetY === null ? sensorEvent.clientY - sourceRect.top : options.cursorOffsetY;
    var left = options.cursorOffsetX === null ? sensorEvent.clientX - sourceRect.left : options.cursorOffsetX;

    var mirrorOffset = { top: top, left: left };

    resolve(Object.assign({ sensorEvent: sensorEvent, sourceRect: sourceRect, mirrorOffset: mirrorOffset, options: options }, args));
  });
}

/**
 * Applys mirror styles
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {HTMLElement} state.source
 * @param {Object} state.options
 * @return {Promise}
 * @private
 */
function resetMirror(_ref5) {
  var mirror = _ref5.mirror,
      source = _ref5.source,
      options = _ref5.options,
      args = (0, _objectWithoutProperties3.default)(_ref5, ['mirror', 'source', 'options']);

  return withPromise(function (resolve) {
    var offsetHeight = void 0;
    var offsetWidth = void 0;

    if (options.constrainDimensions) {
      var computedSourceStyles = getComputedStyle(source);
      offsetHeight = computedSourceStyles.getPropertyValue('height');
      offsetWidth = computedSourceStyles.getPropertyValue('width');
    }

    mirror.style.position = 'fixed';
    mirror.style.pointerEvents = 'none';
    mirror.style.top = 0;
    mirror.style.left = 0;
    mirror.style.margin = 0;

    if (options.constrainDimensions) {
      mirror.style.height = offsetHeight;
      mirror.style.width = offsetWidth;
    }

    resolve(Object.assign({ mirror: mirror, source: source, options: options }, args));
  });
}

/**
 * Applys mirror class on mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {String} state.mirrorClass
 * @return {Promise}
 * @private
 */
function addMirrorClasses(_ref6) {
  var mirror = _ref6.mirror,
      mirrorClass = _ref6.mirrorClass,
      args = (0, _objectWithoutProperties3.default)(_ref6, ['mirror', 'mirrorClass']);

  return withPromise(function (resolve) {
    mirror.classList.add(mirrorClass);
    resolve(Object.assign({ mirror: mirror, mirrorClass: mirrorClass }, args));
  });
}

/**
 * Removes source ID from cloned mirror element
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @return {Promise}
 * @private
 */
function removeMirrorID(_ref7) {
  var mirror = _ref7.mirror,
      args = (0, _objectWithoutProperties3.default)(_ref7, ['mirror']);

  return withPromise(function (resolve) {
    mirror.removeAttribute('id');
    delete mirror.id;
    resolve(Object.assign({ mirror: mirror }, args));
  });
}

/**
 * Positions mirror with translate3d
 * @param {Object} state
 * @param {HTMLElement} state.mirror
 * @param {SensorEvent} state.sensorEvent
 * @param {Object} state.mirrorOffset
 * @param {Number} state.initialY
 * @param {Number} state.initialX
 * @param {Object} state.options
 * @return {Promise}
 * @private
 */
function positionMirror() {
  var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref8$withFrame = _ref8.withFrame,
      withFrame = _ref8$withFrame === undefined ? false : _ref8$withFrame,
      _ref8$initial = _ref8.initial,
      initial = _ref8$initial === undefined ? false : _ref8$initial;

  return function (_ref9) {
    var mirror = _ref9.mirror,
        sensorEvent = _ref9.sensorEvent,
        mirrorOffset = _ref9.mirrorOffset,
        initialY = _ref9.initialY,
        initialX = _ref9.initialX,
        scrollOffset = _ref9.scrollOffset,
        options = _ref9.options,
        args = (0, _objectWithoutProperties3.default)(_ref9, ['mirror', 'sensorEvent', 'mirrorOffset', 'initialY', 'initialX', 'scrollOffset', 'options']);

    return withPromise(function (resolve) {
      var result = Object.assign({
        mirror: mirror,
        sensorEvent: sensorEvent,
        mirrorOffset: mirrorOffset,
        options: options
      }, args);

      if (mirrorOffset) {
        var x = sensorEvent.clientX - mirrorOffset.left - scrollOffset.x;
        var y = sensorEvent.clientY - mirrorOffset.top - scrollOffset.y;

        if (options.xAxis && options.yAxis || initial) {
          mirror.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        } else if (options.xAxis && !options.yAxis) {
          mirror.style.transform = 'translate3d(' + x + 'px, ' + initialY + 'px, 0)';
        } else if (options.yAxis && !options.xAxis) {
          mirror.style.transform = 'translate3d(' + initialX + 'px, ' + y + 'px, 0)';
        }

        if (initial) {
          result.initialX = x;
          result.initialY = y;
        }
      }

      resolve(result);
    }, { frame: withFrame });
  };
}

/**
 * Wraps functions in promise with potential animation frame option
 * @param {Function} callback
 * @param {Object} options
 * @param {Boolean} options.raf
 * @return {Promise}
 * @private
 */
function withPromise(callback) {
  var _ref10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref10$raf = _ref10.raf,
      raf = _ref10$raf === undefined ? false : _ref10$raf;

  return new Promise(function (resolve, reject) {
    if (raf) {
      requestAnimationFrame(function () {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}

/**
 * Returns true if the sensor event was triggered by a native browser drag event
 * @param {SensorEvent} sensorEvent
 */
function isNativeDragEvent(sensorEvent) {
  return (/^drag/.test(sensorEvent.originalEvent.type)
  );
}

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Mirror = __webpack_require__(135);

var _Mirror2 = _interopRequireDefault(_Mirror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Mirror2.default;
exports.defaultOptions = _Mirror.defaultOptions;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onInitialize = Symbol('onInitialize');
var onDestroy = Symbol('onDestroy');

/**
 * Focusable default options
 * @property {Object} defaultOptions
 * @type {Object}
 */
var defaultOptions = {};

/**
 * Focusable plugin
 * @class Focusable
 * @module Focusable
 * @extends AbstractPlugin
 */

var Focusable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Focusable, _AbstractPlugin);

  /**
   * Focusable constructor.
   * @constructs Focusable
   * @param {Draggable} draggable - Draggable instance
   */
  function Focusable(draggable) {
    (0, _classCallCheck3.default)(this, Focusable);

    /**
     * Focusable options
     * @property {Object} options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Focusable.__proto__ || Object.getPrototypeOf(Focusable)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    _this[onInitialize] = _this[onInitialize].bind(_this);
    _this[onDestroy] = _this[onDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches listeners to draggable
   */


  (0, _createClass3.default)(Focusable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('draggable:initialize', this[onInitialize]).on('draggable:destroy', this[onDestroy]);
    }

    /**
     * Detaches listeners from draggable
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('draggable:initialize', this[onInitialize]).off('draggable:destroy', this[onDestroy]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.focusable || {};
    }

    /**
     * Returns draggable containers and elements
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getElements',
    value: function getElements() {
      return [].concat((0, _toConsumableArray3.default)(this.draggable.containers), (0, _toConsumableArray3.default)(this.draggable.getDraggableElements()));
    }

    /**
     * Intialize handler
     * @private
     */

  }, {
    key: onInitialize,
    value: function value() {
      var _this2 = this;

      // Can wait until the next best frame is available
      requestAnimationFrame(function () {
        _this2.getElements().forEach(function (element) {
          return decorateElement(element);
        });
      });
    }

    /**
     * Destroy handler
     * @private
     */

  }, {
    key: onDestroy,
    value: function value() {
      var _this3 = this;

      // Can wait until the next best frame is available
      requestAnimationFrame(function () {
        _this3.getElements().forEach(function (element) {
          return stripElement(element);
        });
      });
    }
  }]);
  return Focusable;
}(_AbstractPlugin3.default);

/**
 * Keeps track of all the elements that are missing tabindex attributes
 * so they can be reset when draggable gets destroyed
 * @const {HTMLElement[]} elementsWithMissingTabIndex
 */


exports.default = Focusable;
var elementsWithMissingTabIndex = [];

/**
 * Decorates element with tabindex attributes
 * @param {HTMLElement} element
 * @return {Object}
 * @private
 */
function decorateElement(element) {
  var hasMissingTabIndex = Boolean(!element.getAttribute('tabindex') && element.tabIndex === -1);

  if (hasMissingTabIndex) {
    elementsWithMissingTabIndex.push(element);
    element.tabIndex = 0;
  }
}

/**
 * Removes elements tabindex attributes
 * @param {HTMLElement} element
 * @private
 */
function stripElement(element) {
  var tabIndexElementPosition = elementsWithMissingTabIndex.indexOf(element);

  if (tabIndexElementPosition !== -1) {
    element.tabIndex = -1;
    elementsWithMissingTabIndex.splice(tabIndexElementPosition, 1);
  }
}

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Focusable = __webpack_require__(137);

var _Focusable2 = _interopRequireDefault(_Focusable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Focusable2.default;

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onInitialize = Symbol('onInitialize');
var onDestroy = Symbol('onDestroy');
var announceEvent = Symbol('announceEvent');
var announceMessage = Symbol('announceMessage');

var ARIA_RELEVANT = 'aria-relevant';
var ARIA_ATOMIC = 'aria-atomic';
var ARIA_LIVE = 'aria-live';
var ROLE = 'role';

/**
 * Announcement default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.expire
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  expire: 7000
};

/**
 * Announcement plugin
 * @class Announcement
 * @module Announcement
 * @extends AbstractPlugin
 */

var Announcement = function (_AbstractPlugin) {
  (0, _inherits3.default)(Announcement, _AbstractPlugin);

  /**
   * Announcement constructor.
   * @constructs Announcement
   * @param {Draggable} draggable - Draggable instance
   */
  function Announcement(draggable) {
    (0, _classCallCheck3.default)(this, Announcement);

    /**
     * Plugin options
     * @property options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Announcement.__proto__ || Object.getPrototypeOf(Announcement)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Original draggable trigger method. Hack until we have onAll or on('all')
     * @property originalTriggerMethod
     * @type {Function}
     */
    _this.originalTriggerMethod = _this.draggable.trigger;

    _this[onInitialize] = _this[onInitialize].bind(_this);
    _this[onDestroy] = _this[onDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches listeners to draggable
   */


  (0, _createClass3.default)(Announcement, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('draggable:initialize', this[onInitialize]);
    }

    /**
     * Detaches listeners from draggable
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('draggable:destroy', this[onDestroy]);
    }

    /**
     * Returns passed in options
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.announcements || {};
    }

    /**
     * Announces event
     * @private
     * @param {AbstractEvent} event
     */

  }, {
    key: announceEvent,
    value: function value(event) {
      var message = this.options[event.type];

      if (message && typeof message === 'string') {
        this[announceMessage](message);
      }

      if (message && typeof message === 'function') {
        this[announceMessage](message(event));
      }
    }

    /**
     * Announces message to screen reader
     * @private
     * @param {String} message
     */

  }, {
    key: announceMessage,
    value: function value(message) {
      announce(message, { expire: this.options.expire });
    }

    /**
     * Initialize hander
     * @private
     */

  }, {
    key: onInitialize,
    value: function value() {
      var _this2 = this;

      // Hack until there is an api for listening for all events
      this.draggable.trigger = function (event) {
        try {
          _this2[announceEvent](event);
        } finally {
          // Ensure that original trigger is called
          _this2.originalTriggerMethod.call(_this2.draggable, event);
        }
      };
    }

    /**
     * Destroy hander
     * @private
     */

  }, {
    key: onDestroy,
    value: function value() {
      this.draggable.trigger = this.originalTriggerMethod;
    }
  }]);
  return Announcement;
}(_AbstractPlugin3.default);

/**
 * @const {HTMLElement} liveRegion
 */


exports.default = Announcement;
var liveRegion = createRegion();

/**
 * Announces message via live region
 * @param {String} message
 * @param {Object} options
 * @param {Number} options.expire
 */
function announce(message, _ref) {
  var expire = _ref.expire;

  var element = document.createElement('div');

  element.textContent = message;
  liveRegion.appendChild(element);

  return setTimeout(function () {
    liveRegion.removeChild(element);
  }, expire);
}

/**
 * Creates region element
 * @return {HTMLElement}
 */
function createRegion() {
  var element = document.createElement('div');

  element.setAttribute('id', 'draggable-live-region');
  element.setAttribute(ARIA_RELEVANT, 'additions');
  element.setAttribute(ARIA_ATOMIC, 'true');
  element.setAttribute(ARIA_LIVE, 'assertive');
  element.setAttribute(ROLE, 'log');

  element.style.position = 'fixed';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.top = '-1px';
  element.style.overflow = 'hidden';

  return element;
}

// Append live region element as early as possible
document.addEventListener('DOMContentLoaded', function () {
  document.body.appendChild(liveRegion);
});

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _Announcement = __webpack_require__(139);

var _Announcement2 = _interopRequireDefault(_Announcement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Announcement2.default;
exports.defaultOptions = _Announcement.defaultOptions;

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DraggableDestroyEvent = exports.DraggableInitializedEvent = exports.DraggableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base draggable event
 * @class DraggableEvent
 * @module DraggableEvent
 * @extends AbstractEvent
 */
var DraggableEvent = exports.DraggableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DraggableEvent, _AbstractEvent);

  function DraggableEvent() {
    (0, _classCallCheck3.default)(this, DraggableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableEvent.__proto__ || Object.getPrototypeOf(DraggableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DraggableEvent, [{
    key: 'draggable',


    /**
     * Draggable instance
     * @property draggable
     * @type {Draggable}
     * @readonly
     */
    get: function get() {
      return this.data.draggable;
    }
  }]);
  return DraggableEvent;
}(_AbstractEvent3.default);

/**
 * Draggable initialized event
 * @class DraggableInitializedEvent
 * @module DraggableInitializedEvent
 * @extends DraggableEvent
 */


DraggableEvent.type = 'draggable';

var DraggableInitializedEvent = exports.DraggableInitializedEvent = function (_DraggableEvent) {
  (0, _inherits3.default)(DraggableInitializedEvent, _DraggableEvent);

  function DraggableInitializedEvent() {
    (0, _classCallCheck3.default)(this, DraggableInitializedEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableInitializedEvent.__proto__ || Object.getPrototypeOf(DraggableInitializedEvent)).apply(this, arguments));
  }

  return DraggableInitializedEvent;
}(DraggableEvent);

/**
 * Draggable destory event
 * @class DraggableInitializedEvent
 * @module DraggableDestroyEvent
 * @extends DraggableDestroyEvent
 */


DraggableInitializedEvent.type = 'draggable:initialize';

var DraggableDestroyEvent = exports.DraggableDestroyEvent = function (_DraggableEvent2) {
  (0, _inherits3.default)(DraggableDestroyEvent, _DraggableEvent2);

  function DraggableDestroyEvent() {
    (0, _classCallCheck3.default)(this, DraggableDestroyEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DraggableDestroyEvent.__proto__ || Object.getPrototypeOf(DraggableDestroyEvent)).apply(this, arguments));
  }

  return DraggableDestroyEvent;
}(DraggableEvent);

DraggableDestroyEvent.type = 'draggable:destroy';

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DragStopEvent = exports.DragPressureEvent = exports.DragOutContainerEvent = exports.DragOverContainerEvent = exports.DragOutEvent = exports.DragOverEvent = exports.DragMoveEvent = exports.DragStartEvent = exports.DragEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base drag event
 * @class DragEvent
 * @module DragEvent
 * @extends AbstractEvent
 */
var DragEvent = exports.DragEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(DragEvent, _AbstractEvent);

  function DragEvent() {
    (0, _classCallCheck3.default)(this, DragEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragEvent.__proto__ || Object.getPrototypeOf(DragEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragEvent, [{
    key: 'source',


    /**
     * Draggables source element
     * @property source
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.source;
    }

    /**
     * Draggables original source element
     * @property originalSource
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'originalSource',
    get: function get() {
      return this.data.originalSource;
    }

    /**
     * Draggables mirror element
     * @property mirror
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'mirror',
    get: function get() {
      return this.data.mirror;
    }

    /**
     * Draggables source container element
     * @property sourceContainer
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'sourceContainer',
    get: function get() {
      return this.data.sourceContainer;
    }

    /**
     * Sensor event
     * @property sensorEvent
     * @type {SensorEvent}
     * @readonly
     */

  }, {
    key: 'sensorEvent',
    get: function get() {
      return this.data.sensorEvent;
    }

    /**
     * Original event that triggered sensor event
     * @property originalEvent
     * @type {Event}
     * @readonly
     */

  }, {
    key: 'originalEvent',
    get: function get() {
      if (this.sensorEvent) {
        return this.sensorEvent.originalEvent;
      }

      return null;
    }
  }]);
  return DragEvent;
}(_AbstractEvent3.default);

/**
 * Drag start event
 * @class DragStartEvent
 * @module DragStartEvent
 * @extends DragEvent
 */


DragEvent.type = 'drag';

var DragStartEvent = exports.DragStartEvent = function (_DragEvent) {
  (0, _inherits3.default)(DragStartEvent, _DragEvent);

  function DragStartEvent() {
    (0, _classCallCheck3.default)(this, DragStartEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStartEvent.__proto__ || Object.getPrototypeOf(DragStartEvent)).apply(this, arguments));
  }

  return DragStartEvent;
}(DragEvent);

/**
 * Drag move event
 * @class DragMoveEvent
 * @module DragMoveEvent
 * @extends DragEvent
 */


DragStartEvent.type = 'drag:start';
DragStartEvent.cancelable = true;

var DragMoveEvent = exports.DragMoveEvent = function (_DragEvent2) {
  (0, _inherits3.default)(DragMoveEvent, _DragEvent2);

  function DragMoveEvent() {
    (0, _classCallCheck3.default)(this, DragMoveEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragMoveEvent.__proto__ || Object.getPrototypeOf(DragMoveEvent)).apply(this, arguments));
  }

  return DragMoveEvent;
}(DragEvent);

/**
 * Drag over event
 * @class DragOverEvent
 * @module DragOverEvent
 * @extends DragEvent
 */


DragMoveEvent.type = 'drag:move';

var DragOverEvent = exports.DragOverEvent = function (_DragEvent3) {
  (0, _inherits3.default)(DragOverEvent, _DragEvent3);

  function DragOverEvent() {
    (0, _classCallCheck3.default)(this, DragOverEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOverEvent.__proto__ || Object.getPrototypeOf(DragOverEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOverEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }

    /**
     * Draggable element you are over
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.over;
    }
  }]);
  return DragOverEvent;
}(DragEvent);

/**
 * Drag out event
 * @class DragOutEvent
 * @module DragOutEvent
 * @extends DragEvent
 */


DragOverEvent.type = 'drag:over';
DragOverEvent.cancelable = true;

var DragOutEvent = exports.DragOutEvent = function (_DragEvent4) {
  (0, _inherits3.default)(DragOutEvent, _DragEvent4);

  function DragOutEvent() {
    (0, _classCallCheck3.default)(this, DragOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOutEvent.__proto__ || Object.getPrototypeOf(DragOutEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOutEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }

    /**
     * Draggable element you left
     * @property over
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'over',
    get: function get() {
      return this.data.over;
    }
  }]);
  return DragOutEvent;
}(DragEvent);

/**
 * Drag over container event
 * @class DragOverContainerEvent
 * @module DragOverContainerEvent
 * @extends DragEvent
 */


DragOutEvent.type = 'drag:out';

var DragOverContainerEvent = exports.DragOverContainerEvent = function (_DragEvent5) {
  (0, _inherits3.default)(DragOverContainerEvent, _DragEvent5);

  function DragOverContainerEvent() {
    (0, _classCallCheck3.default)(this, DragOverContainerEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOverContainerEvent.__proto__ || Object.getPrototypeOf(DragOverContainerEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOverContainerEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you are over
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return DragOverContainerEvent;
}(DragEvent);

/**
 * Drag out container event
 * @class DragOutContainerEvent
 * @module DragOutContainerEvent
 * @extends DragEvent
 */


DragOverContainerEvent.type = 'drag:over:container';

var DragOutContainerEvent = exports.DragOutContainerEvent = function (_DragEvent6) {
  (0, _inherits3.default)(DragOutContainerEvent, _DragEvent6);

  function DragOutContainerEvent() {
    (0, _classCallCheck3.default)(this, DragOutContainerEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragOutContainerEvent.__proto__ || Object.getPrototypeOf(DragOutContainerEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragOutContainerEvent, [{
    key: 'overContainer',


    /**
     * Draggable container you left
     * @property overContainer
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.overContainer;
    }
  }]);
  return DragOutContainerEvent;
}(DragEvent);

/**
 * Drag pressure event
 * @class DragPressureEvent
 * @module DragPressureEvent
 * @extends DragEvent
 */


DragOutContainerEvent.type = 'drag:out:container';

var DragPressureEvent = exports.DragPressureEvent = function (_DragEvent7) {
  (0, _inherits3.default)(DragPressureEvent, _DragEvent7);

  function DragPressureEvent() {
    (0, _classCallCheck3.default)(this, DragPressureEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragPressureEvent.__proto__ || Object.getPrototypeOf(DragPressureEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(DragPressureEvent, [{
    key: 'pressure',


    /**
     * Pressure applied on draggable element
     * @property pressure
     * @type {Number}
     * @readonly
     */
    get: function get() {
      return this.data.pressure;
    }
  }]);
  return DragPressureEvent;
}(DragEvent);

/**
 * Drag stop event
 * @class DragStopEvent
 * @module DragStopEvent
 * @extends DragEvent
 */


DragPressureEvent.type = 'drag:pressure';

var DragStopEvent = exports.DragStopEvent = function (_DragEvent8) {
  (0, _inherits3.default)(DragStopEvent, _DragEvent8);

  function DragStopEvent() {
    (0, _classCallCheck3.default)(this, DragStopEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStopEvent.__proto__ || Object.getPrototypeOf(DragStopEvent)).apply(this, arguments));
  }

  return DragStopEvent;
}(DragEvent);

DragStopEvent.type = 'drag:stop';

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onSortableSorted = Symbol('onSortableSorted');

/**
 * SwapAnimation default options
 * @property {Object} defaultOptions
 * @property {Number} defaultOptions.duration
 * @property {String} defaultOptions.easingFunction
 * @property {Boolean} defaultOptions.horizontal
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {
  duration: 150,
  easingFunction: 'ease-in-out',
  horizontal: false
};

/**
 * SwapAnimation plugin adds swap animations for sortable
 * @class SwapAnimation
 * @module SwapAnimation
 * @extends AbstractPlugin
 */

var SwapAnimation = function (_AbstractPlugin) {
  (0, _inherits3.default)(SwapAnimation, _AbstractPlugin);

  /**
   * SwapAnimation constructor.
   * @constructs SwapAnimation
   * @param {Draggable} draggable - Draggable instance
   */
  function SwapAnimation(draggable) {
    (0, _classCallCheck3.default)(this, SwapAnimation);

    /**
     * SwapAnimation options
     * @property {Object} options
     * @property {Number} defaultOptions.duration
     * @property {String} defaultOptions.easingFunction
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SwapAnimation.__proto__ || Object.getPrototypeOf(SwapAnimation)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * Last animation frame
     * @property {Number} lastAnimationFrame
     * @type {Number}
     */
    _this.lastAnimationFrame = null;

    _this[onSortableSorted] = _this[onSortableSorted].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(SwapAnimation, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('sortable:sorted', this[onSortableSorted]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('sortable:sorted', this[onSortableSorted]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.swapAnimation || {};
    }

    /**
     * Sortable sorted handler
     * @param {SortableSortedEvent} sortableEvent
     * @private
     */

  }, {
    key: onSortableSorted,
    value: function value(_ref) {
      var _this2 = this;

      var oldIndex = _ref.oldIndex,
          newIndex = _ref.newIndex,
          dragEvent = _ref.dragEvent;
      var source = dragEvent.source,
          over = dragEvent.over;


      cancelAnimationFrame(this.lastAnimationFrame);

      // Can be done in a separate frame
      this.lastAnimationFrame = requestAnimationFrame(function () {
        if (oldIndex >= newIndex) {
          animate(source, over, _this2.options);
        } else {
          animate(over, source, _this2.options);
        }
      });
    }
  }]);
  return SwapAnimation;
}(_AbstractPlugin3.default);

/**
 * Animates two elements
 * @param {HTMLElement} from
 * @param {HTMLElement} to
 * @param {Object} options
 * @param {Number} options.duration
 * @param {String} options.easingFunction
 * @param {String} options.horizontal
 * @private
 */


exports.default = SwapAnimation;
function animate(from, to, _ref2) {
  var duration = _ref2.duration,
      easingFunction = _ref2.easingFunction,
      horizontal = _ref2.horizontal;
  var _arr = [from, to];

  for (var _i = 0; _i < _arr.length; _i++) {
    var element = _arr[_i];
    element.style.pointerEvents = 'none';
  }

  if (horizontal) {
    var width = from.offsetWidth;
    from.style.transform = 'translate3d(' + width + 'px, 0, 0)';
    to.style.transform = 'translate3d(-' + width + 'px, 0, 0)';
  } else {
    var height = from.offsetHeight;
    from.style.transform = 'translate3d(0, ' + height + 'px, 0)';
    to.style.transform = 'translate3d(0, -' + height + 'px, 0)';
  }

  requestAnimationFrame(function () {
    var _arr2 = [from, to];

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var _element = _arr2[_i2];
      _element.addEventListener('transitionend', resetElementOnTransitionEnd);
      _element.style.transition = 'transform ' + duration + 'ms ' + easingFunction;
      _element.style.transform = '';
    }
  });
}

/**
 * Resets animation style properties after animation has completed
 * @param {Event} event
 * @private
 */
function resetElementOnTransitionEnd(event) {
  event.target.style.transition = '';
  event.target.style.pointerEvents = '';
  event.target.removeEventListener('transitionend', resetElementOnTransitionEnd);
}

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _SwapAnimation = __webpack_require__(143);

var _SwapAnimation2 = _interopRequireDefault(_SwapAnimation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _SwapAnimation2.default;
exports.defaultOptions = _SwapAnimation.defaultOptions;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _SnappableEvent = __webpack_require__(84);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragStart = Symbol('onDragStart');
var onDragStop = Symbol('onDragStop');
var onDragOver = Symbol('onDragOver');
var onDragOut = Symbol('onDragOut');
var onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorDestroy = Symbol('onMirrorDestroy');

/**
 * Snappable plugin which snaps draggable elements into place
 * @class Snappable
 * @module Snappable
 * @extends AbstractPlugin
 */

var Snappable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Snappable, _AbstractPlugin);

  /**
   * Snappable constructor.
   * @constructs Snappable
   * @param {Draggable} draggable - Draggable instance
   */
  function Snappable(draggable) {
    (0, _classCallCheck3.default)(this, Snappable);

    /**
     * Keeps track of the first source element
     * @property {HTMLElement|null} firstSource
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Snappable.__proto__ || Object.getPrototypeOf(Snappable)).call(this, draggable));

    _this.firstSource = null;

    /**
     * Keeps track of the mirror element
     * @property {HTMLElement} mirror
     */
    _this.mirror = null;

    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragOut] = _this[onDragOut].bind(_this);
    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorDestroy] = _this[onMirrorDestroy].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Snappable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:start', this[onDragStart]).on('drag:stop', this[onDragStop]).on('drag:over', this[onDragOver]).on('drag:out', this[onDragOut]).on('droppable:over', this[onDragOver]).on('droppable:out', this[onDragOut]).on('mirror:created', this[onMirrorCreated]).on('mirror:destroy', this[onMirrorDestroy]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:start', this[onDragStart]).off('drag:stop', this[onDragStop]).off('drag:over', this[onDragOver]).off('drag:out', this[onDragOut]).off('droppable:over', this[onDragOver]).off('droppable:out', this[onDragOut]).off('mirror:created', this[onMirrorCreated]).off('mirror:destroy', this[onMirrorDestroy]);
    }

    /**
     * Drag start handler
     * @private
     * @param {DragStartEvent} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      this.firstSource = event.source;
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value() {
      this.firstSource = null;
    }

    /**
     * Drag over handler
     * @private
     * @param {DragOverEvent|DroppableOverEvent} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      var _this2 = this;

      if (event.canceled()) {
        return;
      }

      var source = event.source || event.dragEvent.source;

      if (source === this.firstSource) {
        this.firstSource = null;
        return;
      }

      var snapInEvent = new _SnappableEvent.SnapInEvent({
        dragEvent: event,
        snappable: event.over || event.droppable
      });

      this.draggable.trigger(snapInEvent);

      if (snapInEvent.canceled()) {
        return;
      }

      if (this.mirror) {
        this.mirror.style.display = 'none';
      }

      source.classList.remove(this.draggable.getClassNameFor('source:dragging'));
      source.classList.add(this.draggable.getClassNameFor('source:placed'));

      // Need to cancel this in drag out
      setTimeout(function () {
        source.classList.remove(_this2.draggable.getClassNameFor('source:placed'));
      }, this.draggable.options.placedTimeout);
    }

    /**
     * Drag out handler
     * @private
     * @param {DragOutEvent|DroppableOutEvent} event - Drag out event
     */

  }, {
    key: onDragOut,
    value: function value(event) {
      if (event.canceled()) {
        return;
      }

      var source = event.source || event.dragEvent.source;

      var snapOutEvent = new _SnappableEvent.SnapOutEvent({
        dragEvent: event,
        snappable: event.over || event.droppable
      });

      this.draggable.trigger(snapOutEvent);

      if (snapOutEvent.canceled()) {
        return;
      }

      if (this.mirror) {
        this.mirror.style.display = '';
      }

      source.classList.add(this.draggable.getClassNameFor('source:dragging'));
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var mirror = _ref.mirror;

      this.mirror = mirror;
    }

    /**
     * Mirror destroy handler
     * @param {MirrorDestroyEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorDestroy,
    value: function value() {
      this.mirror = null;
    }
  }]);
  return Snappable;
}(_AbstractPlugin3.default);

exports.default = Snappable;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.SnapOutEvent = exports.SnapInEvent = exports.SnapEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base snap event
 * @class SnapEvent
 * @module SnapEvent
 * @extends AbstractEvent
 */
var SnapEvent = exports.SnapEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SnapEvent, _AbstractEvent);

  function SnapEvent() {
    (0, _classCallCheck3.default)(this, SnapEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapEvent.__proto__ || Object.getPrototypeOf(SnapEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SnapEvent, [{
    key: 'dragEvent',


    /**
     * Drag event that triggered this snap event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }

    /**
     * Snappable element
     * @property snappable
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'snappable',
    get: function get() {
      return this.data.snappable;
    }
  }]);
  return SnapEvent;
}(_AbstractEvent3.default);

/**
 * Snap in event
 * @class SnapInEvent
 * @module SnapInEvent
 * @extends SnapEvent
 */


SnapEvent.type = 'snap';

var SnapInEvent = exports.SnapInEvent = function (_SnapEvent) {
  (0, _inherits3.default)(SnapInEvent, _SnapEvent);

  function SnapInEvent() {
    (0, _classCallCheck3.default)(this, SnapInEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapInEvent.__proto__ || Object.getPrototypeOf(SnapInEvent)).apply(this, arguments));
  }

  return SnapInEvent;
}(SnapEvent);

/**
 * Snap out event
 * @class SnapOutEvent
 * @module SnapOutEvent
 * @extends SnapEvent
 */


SnapInEvent.type = 'snap:in';
SnapInEvent.cancelable = true;

var SnapOutEvent = exports.SnapOutEvent = function (_SnapEvent2) {
  (0, _inherits3.default)(SnapOutEvent, _SnapEvent2);

  function SnapOutEvent() {
    (0, _classCallCheck3.default)(this, SnapOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SnapOutEvent.__proto__ || Object.getPrototypeOf(SnapOutEvent)).apply(this, arguments));
  }

  return SnapOutEvent;
}(SnapEvent);

SnapOutEvent.type = 'snap:out';
SnapOutEvent.cancelable = true;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SnappableEvent = __webpack_require__(84);

Object.keys(_SnappableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SnappableEvent[key];
    }
  });
});

var _Snappable = __webpack_require__(145);

var _Snappable2 = _interopRequireDefault(_Snappable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Snappable2.default;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMirrorCreated = Symbol('onMirrorCreated');
var onMirrorDestroy = Symbol('onMirrorDestroy');
var onDragOver = Symbol('onDragOver');
var resize = Symbol('resize');

/**
 * ResizeMirror default options
 * @property {Object} defaultOptions
 * @type {Object}
 */
var defaultOptions = exports.defaultOptions = {};

/**
 * The ResizeMirror plugin resizes the mirror element to the dimensions of the draggable element that the mirror is hovering over
 * @class ResizeMirror
 * @module ResizeMirror
 * @extends AbstractPlugin
 */

var ResizeMirror = function (_AbstractPlugin) {
  (0, _inherits3.default)(ResizeMirror, _AbstractPlugin);

  /**
   * ResizeMirror constructor.
   * @constructs ResizeMirror
   * @param {Draggable} draggable - Draggable instance
   */
  function ResizeMirror(draggable) {
    (0, _classCallCheck3.default)(this, ResizeMirror);

    /**
     * ResizeMirror options
     * @property {Object} options
     * @type {Object}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (ResizeMirror.__proto__ || Object.getPrototypeOf(ResizeMirror)).call(this, draggable));

    _this.options = Object.assign({}, defaultOptions, _this.getOptions());

    /**
     * ResizeMirror remembers the last width when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastWidth
     */
    _this.lastWidth = 0;

    /**
     * ResizeMirror remembers the last height when resizing the mirror
     * to avoid additional writes to the DOM
     * @property {number} lastHeight
     */
    _this.lastHeight = 0;

    /**
     * Keeps track of the mirror element
     * @property {HTMLElement} mirror
     */
    _this.mirror = null;

    _this[onMirrorCreated] = _this[onMirrorCreated].bind(_this);
    _this[onMirrorDestroy] = _this[onMirrorDestroy].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(ResizeMirror, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('mirror:created', this[onMirrorCreated]).on('drag:over', this[onDragOver]).on('drag:over:container', this[onDragOver]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('mirror:created', this[onMirrorCreated]).off('mirror:destroy', this[onMirrorDestroy]).off('drag:over', this[onDragOver]).off('drag:over:container', this[onDragOver]);
    }

    /**
     * Returns options passed through draggable
     * @return {Object}
     */

  }, {
    key: 'getOptions',
    value: function getOptions() {
      return this.draggable.options.resizeMirror || {};
    }

    /**
     * Mirror created handler
     * @param {MirrorCreatedEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorCreated,
    value: function value(_ref) {
      var mirror = _ref.mirror;

      this.mirror = mirror;
    }

    /**
     * Mirror destroy handler
     * @param {MirrorDestroyEvent} mirrorEvent
     * @private
     */

  }, {
    key: onMirrorDestroy,
    value: function value() {
      this.mirror = null;
    }

    /**
     * Drag over handler
     * @param {DragOverEvent | DragOverContainer} dragEvent
     * @private
     */

  }, {
    key: onDragOver,
    value: function value(dragEvent) {
      this[resize](dragEvent);
    }

    /**
     * Resize function for
     * @param {DragOverEvent | DragOverContainer} dragEvent
     * @private
     */

  }, {
    key: resize,
    value: function value(_ref2) {
      var _this2 = this;

      var overContainer = _ref2.overContainer,
          over = _ref2.over;

      requestAnimationFrame(function () {
        if (_this2.mirror.parentNode !== overContainer) {
          overContainer.appendChild(_this2.mirror);
        }

        var overElement = over || _this2.draggable.getDraggableElementsForContainer(overContainer)[0];

        if (!overElement) {
          return;
        }

        (0, _utils.requestNextAnimationFrame)(function () {
          var overRect = overElement.getBoundingClientRect();

          if (_this2.lastHeight === overRect.height && _this2.lastWidth === overRect.width) {
            return;
          }

          _this2.mirror.style.width = overRect.width + 'px';
          _this2.mirror.style.height = overRect.height + 'px';

          _this2.lastWidth = overRect.width;
          _this2.lastHeight = overRect.height;
        });
      });
    }
  }]);
  return ResizeMirror;
}(_AbstractPlugin3.default);

exports.default = ResizeMirror;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.defaultOptions = undefined;

var _ResizeMirror = __webpack_require__(148);

var _ResizeMirror2 = _interopRequireDefault(_ResizeMirror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _ResizeMirror2.default;
exports.defaultOptions = _ResizeMirror.defaultOptions;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractPlugin2 = __webpack_require__(10);

var _AbstractPlugin3 = _interopRequireDefault(_AbstractPlugin2);

var _utils = __webpack_require__(11);

var _CollidableEvent = __webpack_require__(85);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onDragMove = Symbol('onDragMove');
var onDragStop = Symbol('onDragStop');
var onRequestAnimationFrame = Symbol('onRequestAnimationFrame');

/**
 * Collidable plugin which detects colliding elements while dragging
 * @class Collidable
 * @module Collidable
 * @extends AbstractPlugin
 */

var Collidable = function (_AbstractPlugin) {
  (0, _inherits3.default)(Collidable, _AbstractPlugin);

  /**
   * Collidable constructor.
   * @constructs Collidable
   * @param {Draggable} draggable - Draggable instance
   */
  function Collidable(draggable) {
    (0, _classCallCheck3.default)(this, Collidable);

    /**
     * Keeps track of currently colliding elements
     * @property {HTMLElement|null} currentlyCollidingElement
     * @type {HTMLElement|null}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Collidable.__proto__ || Object.getPrototypeOf(Collidable)).call(this, draggable));

    _this.currentlyCollidingElement = null;

    /**
     * Keeps track of currently colliding elements
     * @property {HTMLElement|null} lastCollidingElement
     * @type {HTMLElement|null}
     */
    _this.lastCollidingElement = null;

    /**
     * Animation frame for finding colliding elements
     * @property {Number|null} currentAnimationFrame
     * @type {Number|null}
     */
    _this.currentAnimationFrame = null;

    _this[onDragMove] = _this[onDragMove].bind(_this);
    _this[onDragStop] = _this[onDragStop].bind(_this);
    _this[onRequestAnimationFrame] = _this[onRequestAnimationFrame].bind(_this);
    return _this;
  }

  /**
   * Attaches plugins event listeners
   */


  (0, _createClass3.default)(Collidable, [{
    key: 'attach',
    value: function attach() {
      this.draggable.on('drag:move', this[onDragMove]).on('drag:stop', this[onDragStop]);
    }

    /**
     * Detaches plugins event listeners
     */

  }, {
    key: 'detach',
    value: function detach() {
      this.draggable.off('drag:move', this[onDragMove]).off('drag:stop', this[onDragStop]);
    }

    /**
     * Returns current collidables based on `collidables` option
     * @return {HTMLElement[]}
     */

  }, {
    key: 'getCollidables',
    value: function getCollidables() {
      var collidables = this.draggable.options.collidables;

      if (typeof collidables === 'string') {
        return Array.prototype.slice.call(document.querySelectorAll(collidables));
      } else if (collidables instanceof NodeList || collidables instanceof Array) {
        return Array.prototype.slice.call(collidables);
      } else if (collidables instanceof HTMLElement) {
        return [collidables];
      } else if (typeof collidables === 'function') {
        return collidables();
      } else {
        return [];
      }
    }

    /**
     * Drag move handler
     * @private
     * @param {DragMoveEvent} event - Drag move event
     */

  }, {
    key: onDragMove,
    value: function value(event) {
      var target = event.sensorEvent.target;

      this.currentAnimationFrame = requestAnimationFrame(this[onRequestAnimationFrame](target));

      if (this.currentlyCollidingElement) {
        event.cancel();
      }

      var collidableInEvent = new _CollidableEvent.CollidableInEvent({
        dragEvent: event,
        collidingElement: this.currentlyCollidingElement
      });

      var collidableOutEvent = new _CollidableEvent.CollidableOutEvent({
        dragEvent: event,
        collidingElement: this.lastCollidingElement
      });

      var enteringCollidable = Boolean(this.currentlyCollidingElement && this.lastCollidingElement !== this.currentlyCollidingElement);
      var leavingCollidable = Boolean(!this.currentlyCollidingElement && this.lastCollidingElement);

      if (enteringCollidable) {
        if (this.lastCollidingElement) {
          this.draggable.trigger(collidableOutEvent);
        }

        this.draggable.trigger(collidableInEvent);
      } else if (leavingCollidable) {
        this.draggable.trigger(collidableOutEvent);
      }

      this.lastCollidingElement = this.currentlyCollidingElement;
    }

    /**
     * Drag stop handler
     * @private
     * @param {DragStopEvent} event - Drag stop event
     */

  }, {
    key: onDragStop,
    value: function value(event) {
      var lastCollidingElement = this.currentlyCollidingElement || this.lastCollidingElement;
      var collidableOutEvent = new _CollidableEvent.CollidableOutEvent({
        dragEvent: event,
        collidingElement: lastCollidingElement
      });

      if (lastCollidingElement) {
        this.draggable.trigger(collidableOutEvent);
      }

      this.lastCollidingElement = null;
      this.currentlyCollidingElement = null;
    }

    /**
     * Animation frame function
     * @private
     * @param {HTMLElement} target - Current move target
     * @return {Function}
     */

  }, {
    key: onRequestAnimationFrame,
    value: function value(target) {
      var _this2 = this;

      return function () {
        var collidables = _this2.getCollidables();
        _this2.currentlyCollidingElement = (0, _utils.closest)(target, function (element) {
          return collidables.includes(element);
        });
      };
    }
  }]);
  return Collidable;
}(_AbstractPlugin3.default);

exports.default = Collidable;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.CollidableOutEvent = exports.CollidableInEvent = exports.CollidableEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base collidable event
 * @class CollidableEvent
 * @module CollidableEvent
 * @extends AbstractEvent
 */
var CollidableEvent = exports.CollidableEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(CollidableEvent, _AbstractEvent);

  function CollidableEvent() {
    (0, _classCallCheck3.default)(this, CollidableEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableEvent.__proto__ || Object.getPrototypeOf(CollidableEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableEvent, [{
    key: 'dragEvent',


    /**
     * Drag event that triggered this colliable event
     * @property dragEvent
     * @type {DragEvent}
     * @readonly
     */
    get: function get() {
      return this.data.dragEvent;
    }
  }]);
  return CollidableEvent;
}(_AbstractEvent3.default);

/**
 * Collidable in event
 * @class CollidableInEvent
 * @module CollidableInEvent
 * @extends CollidableEvent
 */


CollidableEvent.type = 'collidable';

var CollidableInEvent = exports.CollidableInEvent = function (_CollidableEvent) {
  (0, _inherits3.default)(CollidableInEvent, _CollidableEvent);

  function CollidableInEvent() {
    (0, _classCallCheck3.default)(this, CollidableInEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableInEvent.__proto__ || Object.getPrototypeOf(CollidableInEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableInEvent, [{
    key: 'collidingElement',


    /**
     * Element you are currently colliding with
     * @property collidingElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.collidingElement;
    }
  }]);
  return CollidableInEvent;
}(CollidableEvent);

/**
 * Collidable out event
 * @class CollidableOutEvent
 * @module CollidableOutEvent
 * @extends CollidableEvent
 */


CollidableInEvent.type = 'collidable:in';

var CollidableOutEvent = exports.CollidableOutEvent = function (_CollidableEvent2) {
  (0, _inherits3.default)(CollidableOutEvent, _CollidableEvent2);

  function CollidableOutEvent() {
    (0, _classCallCheck3.default)(this, CollidableOutEvent);
    return (0, _possibleConstructorReturn3.default)(this, (CollidableOutEvent.__proto__ || Object.getPrototypeOf(CollidableOutEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(CollidableOutEvent, [{
    key: 'collidingElement',


    /**
     * Element you were previously colliding with
     * @property collidingElement
     * @type {HTMLElement}
     * @readonly
     */
    get: function get() {
      return this.data.collidingElement;
    }
  }]);
  return CollidableOutEvent;
}(CollidableEvent);

CollidableOutEvent.type = 'collidable:out';

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CollidableEvent = __webpack_require__(85);

Object.keys(_CollidableEvent).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _CollidableEvent[key];
    }
  });
});

var _Collidable = __webpack_require__(150);

var _Collidable2 = _interopRequireDefault(_Collidable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Collidable2.default;

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _Collidable = __webpack_require__(152);

Object.defineProperty(exports, 'Collidable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Collidable).default;
  }
});

var _ResizeMirror = __webpack_require__(149);

Object.defineProperty(exports, 'ResizeMirror', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ResizeMirror).default;
  }
});
Object.defineProperty(exports, 'defaultResizeMirrorOptions', {
  enumerable: true,
  get: function get() {
    return _ResizeMirror.defaultOptions;
  }
});

var _Snappable = __webpack_require__(147);

Object.defineProperty(exports, 'Snappable', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Snappable).default;
  }
});

var _SwapAnimation = __webpack_require__(144);

Object.defineProperty(exports, 'SwapAnimation', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SwapAnimation).default;
  }
});
Object.defineProperty(exports, 'defaultSwapAnimationOptions', {
  enumerable: true,
  get: function get() {
    return _SwapAnimation.defaultOptions;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _Sensor2 = __webpack_require__(34);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMouseForceWillBegin = Symbol('onMouseForceWillBegin');
var onMouseForceDown = Symbol('onMouseForceDown');
var onMouseDown = Symbol('onMouseDown');
var onMouseForceChange = Symbol('onMouseForceChange');
var onMouseMove = Symbol('onMouseMove');
var onMouseUp = Symbol('onMouseUp');
var onMouseForceGlobalChange = Symbol('onMouseForceGlobalChange');

/**
 * This sensor picks up native force touch events and dictates drag operations
 * @class ForceTouchSensor
 * @module ForceTouchSensor
 * @extends Sensor
 */

var ForceTouchSensor = function (_Sensor) {
  (0, _inherits3.default)(ForceTouchSensor, _Sensor);

  /**
   * ForceTouchSensor constructor.
   * @constructs ForceTouchSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function ForceTouchSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, ForceTouchSensor);

    /**
     * Draggable element needs to be remembered to unset the draggable attribute after drag operation has completed
     * @property mightDrag
     * @type {Boolean}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (ForceTouchSensor.__proto__ || Object.getPrototypeOf(ForceTouchSensor)).call(this, containers, options));

    _this.mightDrag = false;

    _this[onMouseForceWillBegin] = _this[onMouseForceWillBegin].bind(_this);
    _this[onMouseForceDown] = _this[onMouseForceDown].bind(_this);
    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseForceChange] = _this[onMouseForceChange].bind(_this);
    _this[onMouseMove] = _this[onMouseMove].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(ForceTouchSensor, [{
    key: 'attach',
    value: function attach() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.containers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var container = _step.value;

          container.addEventListener('webkitmouseforcewillbegin', this[onMouseForceWillBegin], false);
          container.addEventListener('webkitmouseforcedown', this[onMouseForceDown], false);
          container.addEventListener('mousedown', this[onMouseDown], true);
          container.addEventListener('webkitmouseforcechanged', this[onMouseForceChange], false);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      document.addEventListener('mousemove', this[onMouseMove]);
      document.addEventListener('mouseup', this[onMouseUp]);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.containers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var container = _step2.value;

          container.removeEventListener('webkitmouseforcewillbegin', this[onMouseForceWillBegin], false);
          container.removeEventListener('webkitmouseforcedown', this[onMouseForceDown], false);
          container.removeEventListener('mousedown', this[onMouseDown], true);
          container.removeEventListener('webkitmouseforcechanged', this[onMouseForceChange], false);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      document.removeEventListener('mousemove', this[onMouseMove]);
      document.removeEventListener('mouseup', this[onMouseUp]);
    }

    /**
     * Mouse force will begin handler
     * @private
     * @param {Event} event - Mouse force will begin event
     */

  }, {
    key: onMouseForceWillBegin,
    value: function value(event) {
      event.preventDefault();
      this.mightDrag = true;
    }

    /**
     * Mouse force down handler
     * @private
     * @param {Event} event - Mouse force down event
     */

  }, {
    key: onMouseForceDown,
    value: function value(event) {
      if (this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = event.currentTarget;

      var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragStartEvent);

      this.currentContainer = container;
      this.dragging = !dragStartEvent.canceled();
      this.mightDrag = false;
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: null,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      this.currentContainer = null;
      this.dragging = false;
      this.mightDrag = false;
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      if (!this.mightDrag) {
        return;
      }

      // Need workaround for real click
      // Cancel potential drag events
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    /**
     * Mouse move handler
     * @private
     * @param {Event} event - Mouse force will begin event
     */

  }, {
    key: onMouseMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Mouse force change handler
     * @private
     * @param {Event} event - Mouse force change event
     */

  }, {
    key: onMouseForceChange,
    value: function value(event) {
      if (this.dragging) {
        return;
      }

      var target = event.target;
      var container = event.currentTarget;

      var dragPressureEvent = new _SensorEvent.DragPressureSensorEvent({
        pressure: event.webkitForce,
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragPressureEvent);
    }

    /**
     * Mouse force global change handler
     * @private
     * @param {Event} event - Mouse force global change event
     */

  }, {
    key: onMouseForceGlobalChange,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = event.target;

      var dragPressureEvent = new _SensorEvent.DragPressureSensorEvent({
        pressure: event.webkitForce,
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragPressureEvent);
    }
  }]);
  return ForceTouchSensor;
}(_Sensor3.default);

exports.default = ForceTouchSensor;

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ForceTouchSensor = __webpack_require__(154);

var _ForceTouchSensor2 = _interopRequireDefault(_ForceTouchSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _ForceTouchSensor2.default;

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(11);

var _Sensor2 = __webpack_require__(34);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onMouseDown = Symbol('onMouseDown');
var onMouseUp = Symbol('onMouseUp');
var onDragStart = Symbol('onDragStart');
var onDragOver = Symbol('onDragOver');
var onDragEnd = Symbol('onDragEnd');
var onDrop = Symbol('onDrop');
var reset = Symbol('reset');

/**
 * This sensor picks up native browser drag events and dictates drag operations
 * @class DragSensor
 * @module DragSensor
 * @extends Sensor
 */

var DragSensor = function (_Sensor) {
  (0, _inherits3.default)(DragSensor, _Sensor);

  /**
   * DragSensor constructor.
   * @constructs DragSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function DragSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, DragSensor);

    /**
     * Mouse down timer which will end up setting the draggable attribute, unless canceled
     * @property mouseDownTimeout
     * @type {Number}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (DragSensor.__proto__ || Object.getPrototypeOf(DragSensor)).call(this, containers, options));

    _this.mouseDownTimeout = null;

    /**
     * Draggable element needs to be remembered to unset the draggable attribute after drag operation has completed
     * @property draggableElement
     * @type {HTMLElement}
     */
    _this.draggableElement = null;

    /**
     * Native draggable element could be links or images, their draggable state will be disabled during drag operation
     * @property nativeDraggableElement
     * @type {HTMLElement}
     */
    _this.nativeDraggableElement = null;

    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    _this[onDragStart] = _this[onDragStart].bind(_this);
    _this[onDragOver] = _this[onDragOver].bind(_this);
    _this[onDragEnd] = _this[onDragEnd].bind(_this);
    _this[onDrop] = _this[onDrop].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(DragSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Drag start handler
     * @private
     * @param {Event} event - Drag start event
     */

  }, {
    key: onDragStart,
    value: function value(event) {
      var _this2 = this;

      // Need for firefox. "text" key is needed for IE
      event.dataTransfer.setData('text', '');
      event.dataTransfer.effectAllowed = this.options.type;

      var target = document.elementFromPoint(event.clientX, event.clientY);
      this.currentContainer = (0, _utils.closest)(event.target, this.containers);

      if (!this.currentContainer) {
        return;
      }

      var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      // Workaround
      setTimeout(function () {
        _this2.trigger(_this2.currentContainer, dragStartEvent);

        if (dragStartEvent.canceled()) {
          _this2.dragging = false;
        } else {
          _this2.dragging = true;
        }
      }, 0);
    }

    /**
     * Drag over handler
     * @private
     * @param {Event} event - Drag over event
     */

  }, {
    key: onDragOver,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = this.currentContainer;

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragMoveEvent);

      if (!dragMoveEvent.canceled()) {
        event.preventDefault();
        event.dataTransfer.dropEffect = this.options.type;
      }
    }

    /**
     * Drag end handler
     * @private
     * @param {Event} event - Drag end event
     */

  }, {
    key: onDragEnd,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      document.removeEventListener('mouseup', this[onMouseUp], true);

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = this.currentContainer;

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: container,
        originalEvent: event
      });

      this.trigger(container, dragStopEvent);

      this.dragging = false;

      this[reset]();
    }

    /**
     * Drop handler
     * @private
     * @param {Event} event - Drop event
     */

  }, {
    key: onDrop,
    value: function value(event) {
      // eslint-disable-line class-methods-use-this
      event.preventDefault();
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      var _this3 = this;

      // Firefox bug for inputs within draggables https://bugzilla.mozilla.org/show_bug.cgi?id=739071
      if (event.target && (event.target.form || event.target.contenteditable)) {
        return;
      }

      var nativeDraggableElement = (0, _utils.closest)(event.target, function (element) {
        return element.draggable;
      });

      if (nativeDraggableElement) {
        nativeDraggableElement.draggable = false;
        this.nativeDraggableElement = nativeDraggableElement;
      }

      document.addEventListener('mouseup', this[onMouseUp], true);
      document.addEventListener('dragstart', this[onDragStart], false);
      document.addEventListener('dragover', this[onDragOver], false);
      document.addEventListener('dragend', this[onDragEnd], false);
      document.addEventListener('drop', this[onDrop], false);

      var target = (0, _utils.closest)(event.target, this.options.draggable);

      if (!target) {
        return;
      }

      this.mouseDownTimeout = setTimeout(function () {
        target.draggable = true;
        _this3.draggableElement = target;
      }, this.options.delay);
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value() {
      this[reset]();
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: reset,
    value: function value() {
      clearTimeout(this.mouseDownTimeout);

      document.removeEventListener('mouseup', this[onMouseUp], true);
      document.removeEventListener('dragstart', this[onDragStart], false);
      document.removeEventListener('dragover', this[onDragOver], false);
      document.removeEventListener('dragend', this[onDragEnd], false);
      document.removeEventListener('drop', this[onDrop], false);

      if (this.nativeDraggableElement) {
        this.nativeDraggableElement.draggable = true;
        this.nativeDraggableElement = null;
      }

      if (this.draggableElement) {
        this.draggableElement.draggable = false;
        this.draggableElement = null;
      }
    }
  }]);
  return DragSensor;
}(_Sensor3.default);

exports.default = DragSensor;

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _DragSensor = __webpack_require__(156);

var _DragSensor2 = _interopRequireDefault(_DragSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _DragSensor2.default;

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(11);

var _Sensor2 = __webpack_require__(34);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onTouchStart = Symbol('onTouchStart');
var onTouchHold = Symbol('onTouchHold');
var onTouchEnd = Symbol('onTouchEnd');
var onTouchMove = Symbol('onTouchMove');

/**
 * Prevents scrolling when set to true
 * @var {Boolean} preventScrolling
 */
var preventScrolling = false;

// WebKit requires cancelable `touchmove` events to be added as early as possible
window.addEventListener('touchmove', function (event) {
  if (!preventScrolling) {
    return;
  }

  // Prevent scrolling
  event.preventDefault();
}, { passive: false });

/**
 * This sensor picks up native browser touch events and dictates drag operations
 * @class TouchSensor
 * @module TouchSensor
 * @extends Sensor
 */

var TouchSensor = function (_Sensor) {
  (0, _inherits3.default)(TouchSensor, _Sensor);

  /**
   * TouchSensor constructor.
   * @constructs TouchSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function TouchSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, TouchSensor);

    /**
     * Closest scrollable container so accidental scroll can cancel long touch
     * @property currentScrollableParent
     * @type {HTMLElement}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (TouchSensor.__proto__ || Object.getPrototypeOf(TouchSensor)).call(this, containers, options));

    _this.currentScrollableParent = null;

    /**
     * TimeoutID for long touch
     * @property tapTimeout
     * @type {Number}
     */
    _this.tapTimeout = null;

    /**
     * touchMoved indicates if touch has moved during tapTimeout
     * @property touchMoved
     * @type {Boolean}
     */
    _this.touchMoved = false;

    _this[onTouchStart] = _this[onTouchStart].bind(_this);
    _this[onTouchHold] = _this[onTouchHold].bind(_this);
    _this[onTouchEnd] = _this[onTouchEnd].bind(_this);
    _this[onTouchMove] = _this[onTouchMove].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(TouchSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('touchstart', this[onTouchStart]);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('touchstart', this[onTouchStart]);
    }

    /**
     * Touch start handler
     * @private
     * @param {Event} event - Touch start event
     */

  }, {
    key: onTouchStart,
    value: function value(event) {
      var container = (0, _utils.closest)(event.target, this.containers);

      if (!container) {
        return;
      }

      document.addEventListener('touchmove', this[onTouchMove]);
      document.addEventListener('touchend', this[onTouchEnd]);
      document.addEventListener('touchcancel', this[onTouchEnd]);
      container.addEventListener('contextmenu', onContextMenu);

      this.currentContainer = container;
      this.tapTimeout = setTimeout(this[onTouchHold](event, container), this.options.delay);
    }

    /**
     * Touch hold handler
     * @private
     * @param {Event} event - Touch start event
     * @param {HTMLElement} container - Container element
     */

  }, {
    key: onTouchHold,
    value: function value(event, container) {
      var _this2 = this;

      return function () {
        if (_this2.touchMoved) {
          return;
        }

        var touch = event.touches[0] || event.changedTouches[0];
        var target = event.target;

        var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
          clientX: touch.pageX,
          clientY: touch.pageY,
          target: target,
          container: container,
          originalEvent: event
        });

        _this2.trigger(container, dragStartEvent);

        _this2.dragging = !dragStartEvent.canceled();
        preventScrolling = _this2.dragging;
      };
    }

    /**
     * Touch move handler
     * @private
     * @param {Event} event - Touch move event
     */

  }, {
    key: onTouchMove,
    value: function value(event) {
      this.touchMoved = true;

      if (!this.dragging) {
        return;
      }

      var touch = event.touches[0] || event.changedTouches[0];
      var target = document.elementFromPoint(touch.pageX - window.scrollX, touch.pageY - window.scrollY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: touch.pageX,
        clientY: touch.pageY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Touch end handler
     * @private
     * @param {Event} event - Touch end event
     */

  }, {
    key: onTouchEnd,
    value: function value(event) {
      this.touchMoved = false;
      preventScrolling = false;

      document.removeEventListener('touchend', this[onTouchEnd]);
      document.removeEventListener('touchcancel', this[onTouchEnd]);
      document.removeEventListener('touchmove', this[onTouchMove]);

      if (this.currentContainer) {
        this.currentContainer.removeEventListener('contextmenu', onContextMenu);
      }

      clearTimeout(this.tapTimeout);

      if (!this.dragging) {
        return;
      }

      var touch = event.touches[0] || event.changedTouches[0];
      var target = document.elementFromPoint(touch.pageX - window.scrollX, touch.pageY - window.scrollY);

      event.preventDefault();

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: touch.pageX,
        clientY: touch.pageY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      this.currentContainer = null;
      this.dragging = false;
    }
  }]);
  return TouchSensor;
}(_Sensor3.default);

exports.default = TouchSensor;


function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
}

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _TouchSensor = __webpack_require__(158);

var _TouchSensor2 = _interopRequireDefault(_TouchSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _TouchSensor2.default;

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.DragPressureSensorEvent = exports.DragStopSensorEvent = exports.DragMoveSensorEvent = exports.DragStartSensorEvent = exports.SensorEvent = undefined;

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _AbstractEvent2 = __webpack_require__(9);

var _AbstractEvent3 = _interopRequireDefault(_AbstractEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sensor event
 * @class SensorEvent
 * @module SensorEvent
 * @extends AbstractEvent
 */
var SensorEvent = exports.SensorEvent = function (_AbstractEvent) {
  (0, _inherits3.default)(SensorEvent, _AbstractEvent);

  function SensorEvent() {
    (0, _classCallCheck3.default)(this, SensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (SensorEvent.__proto__ || Object.getPrototypeOf(SensorEvent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SensorEvent, [{
    key: 'originalEvent',

    /**
     * Original browser event that triggered a sensor
     * @property originalEvent
     * @type {Event}
     * @readonly
     */
    get: function get() {
      return this.data.originalEvent;
    }

    /**
     * Normalized clientX for both touch and mouse events
     * @property clientX
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'clientX',
    get: function get() {
      return this.data.clientX;
    }

    /**
     * Normalized clientY for both touch and mouse events
     * @property clientY
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'clientY',
    get: function get() {
      return this.data.clientY;
    }

    /**
     * Normalized target for both touch and mouse events
     * Returns the element that is behind cursor or touch pointer
     * @property target
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'target',
    get: function get() {
      return this.data.target;
    }

    /**
     * Container that initiated the sensor
     * @property container
     * @type {HTMLElement}
     * @readonly
     */

  }, {
    key: 'container',
    get: function get() {
      return this.data.container;
    }

    /**
     * Trackpad pressure
     * @property pressure
     * @type {Number}
     * @readonly
     */

  }, {
    key: 'pressure',
    get: function get() {
      return this.data.pressure;
    }
  }]);
  return SensorEvent;
}(_AbstractEvent3.default);

/**
 * Drag start sensor event
 * @class DragStartSensorEvent
 * @module DragStartSensorEvent
 * @extends SensorEvent
 */


var DragStartSensorEvent = exports.DragStartSensorEvent = function (_SensorEvent) {
  (0, _inherits3.default)(DragStartSensorEvent, _SensorEvent);

  function DragStartSensorEvent() {
    (0, _classCallCheck3.default)(this, DragStartSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStartSensorEvent.__proto__ || Object.getPrototypeOf(DragStartSensorEvent)).apply(this, arguments));
  }

  return DragStartSensorEvent;
}(SensorEvent);

/**
 * Drag move sensor event
 * @class DragMoveSensorEvent
 * @module DragMoveSensorEvent
 * @extends SensorEvent
 */


DragStartSensorEvent.type = 'drag:start';

var DragMoveSensorEvent = exports.DragMoveSensorEvent = function (_SensorEvent2) {
  (0, _inherits3.default)(DragMoveSensorEvent, _SensorEvent2);

  function DragMoveSensorEvent() {
    (0, _classCallCheck3.default)(this, DragMoveSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragMoveSensorEvent.__proto__ || Object.getPrototypeOf(DragMoveSensorEvent)).apply(this, arguments));
  }

  return DragMoveSensorEvent;
}(SensorEvent);

/**
 * Drag stop sensor event
 * @class DragStopSensorEvent
 * @module DragStopSensorEvent
 * @extends SensorEvent
 */


DragMoveSensorEvent.type = 'drag:move';

var DragStopSensorEvent = exports.DragStopSensorEvent = function (_SensorEvent3) {
  (0, _inherits3.default)(DragStopSensorEvent, _SensorEvent3);

  function DragStopSensorEvent() {
    (0, _classCallCheck3.default)(this, DragStopSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragStopSensorEvent.__proto__ || Object.getPrototypeOf(DragStopSensorEvent)).apply(this, arguments));
  }

  return DragStopSensorEvent;
}(SensorEvent);

/**
 * Drag pressure sensor event
 * @class DragPressureSensorEvent
 * @module DragPressureSensorEvent
 * @extends SensorEvent
 */


DragStopSensorEvent.type = 'drag:stop';

var DragPressureSensorEvent = exports.DragPressureSensorEvent = function (_SensorEvent4) {
  (0, _inherits3.default)(DragPressureSensorEvent, _SensorEvent4);

  function DragPressureSensorEvent() {
    (0, _classCallCheck3.default)(this, DragPressureSensorEvent);
    return (0, _possibleConstructorReturn3.default)(this, (DragPressureSensorEvent.__proto__ || Object.getPrototypeOf(DragPressureSensorEvent)).apply(this, arguments));
  }

  return DragPressureSensorEvent;
}(SensorEvent);

DragPressureSensorEvent.type = 'drag:pressure';

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = requestNextAnimationFrame;
function requestNextAnimationFrame(callback) {
  return requestAnimationFrame(function () {
    requestAnimationFrame(callback);
  });
}

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _requestNextAnimationFrame = __webpack_require__(161);

var _requestNextAnimationFrame2 = _interopRequireDefault(_requestNextAnimationFrame);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _requestNextAnimationFrame2.default;

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.default = closest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchFunction = Element.prototype.matches || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector;

/**
 * Get the closest parent element of a given element that matches the given
 * selector string or matching function
 *
 * @param {Element} element The child element to find a parent of
 * @param {String|Function} selector The string or function to use to match
 *     the parent element
 * @return {Element|null}
 */
function closest(element, value) {
  if (!element) {
    return null;
  }

  var selector = value;
  var callback = value;
  var nodeList = value;
  var singleElement = value;

  var isSelector = Boolean(typeof value === 'string');
  var isFunction = Boolean(typeof value === 'function');
  var isNodeList = Boolean(value instanceof NodeList || value instanceof Array);
  var isElement = Boolean(value instanceof HTMLElement);

  function conditionFn(currentElement) {
    if (!currentElement) {
      return currentElement;
    } else if (isSelector) {
      return matchFunction.call(currentElement, selector);
    } else if (isNodeList) {
      return [].concat((0, _toConsumableArray3.default)(nodeList)).includes(currentElement);
    } else if (isElement) {
      return singleElement === currentElement;
    } else if (isFunction) {
      return callback(currentElement);
    } else {
      return null;
    }
  }

  var current = element;

  do {
    current = current.correspondingUseElement || current.correspondingElement || current;

    if (conditionFn(current)) {
      return current;
    }

    current = current.parentNode;
  } while (current && current !== document.body && current !== document);

  return null;
}

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _closest = __webpack_require__(163);

var _closest2 = _interopRequireDefault(_closest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _closest2.default;

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(18);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: __webpack_require__(62) });


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(165);
var $Object = __webpack_require__(6).Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(166), __esModule: true };

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__(26);
var anObject = __webpack_require__(27);
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ': can\'t set as prototype!');
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__(67)(Function.call, __webpack_require__(51).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = __webpack_require__(18);
$export($export.S, 'Object', { setPrototypeOf: __webpack_require__(168).set });


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(169);
module.exports = __webpack_require__(6).Object.setPrototypeOf;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(170), __esModule: true };

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(53)('observable');


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(53)('asyncIterator');


/***/ }),
/* 174 */
/***/ (function(module, exports) {



/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(15);
var gOPN = __webpack_require__(86).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(60);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(61);
var gOPS = __webpack_require__(87);
var pIE = __webpack_require__(52);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(44)('meta');
var isObject = __webpack_require__(26);
var has = __webpack_require__(16);
var setDesc = __webpack_require__(12).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(36)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// ECMAScript 6 symbols shim
var global = __webpack_require__(13);
var has = __webpack_require__(16);
var DESCRIPTORS = __webpack_require__(17);
var $export = __webpack_require__(18);
var redefine = __webpack_require__(92);
var META = __webpack_require__(178).KEY;
var $fails = __webpack_require__(36);
var shared = __webpack_require__(58);
var setToStringTag = __webpack_require__(56);
var uid = __webpack_require__(44);
var wks = __webpack_require__(8);
var wksExt = __webpack_require__(54);
var wksDefine = __webpack_require__(53);
var enumKeys = __webpack_require__(177);
var isArray = __webpack_require__(176);
var anObject = __webpack_require__(27);
var isObject = __webpack_require__(26);
var toIObject = __webpack_require__(15);
var toPrimitive = __webpack_require__(66);
var createDesc = __webpack_require__(35);
var _create = __webpack_require__(62);
var gOPNExt = __webpack_require__(175);
var $GOPD = __webpack_require__(51);
var $DP = __webpack_require__(12);
var $keys = __webpack_require__(61);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(86).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(52).f = $propertyIsEnumerable;
  __webpack_require__(87).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(45)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(28)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(179);
__webpack_require__(174);
__webpack_require__(173);
__webpack_require__(172);
module.exports = __webpack_require__(6).Symbol;


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(180), __esModule: true };

/***/ }),
/* 182 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 183 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var addToUnscopables = __webpack_require__(183);
var step = __webpack_require__(182);
var Iterators = __webpack_require__(33);
var toIObject = __webpack_require__(15);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(93)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(184);
var global = __webpack_require__(13);
var hide = __webpack_require__(28);
var Iterators = __webpack_require__(33);
var TO_STRING_TAG = __webpack_require__(8)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(94);
__webpack_require__(185);
module.exports = __webpack_require__(54).f('iterator');


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(186), __esModule: true };

/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(3);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(2);

var _inherits3 = _interopRequireDefault(_inherits2);

var _utils = __webpack_require__(11);

var _Sensor2 = __webpack_require__(34);

var _Sensor3 = _interopRequireDefault(_Sensor2);

var _SensorEvent = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onContextMenuWhileDragging = Symbol('onContextMenuWhileDragging');
var onMouseDown = Symbol('onMouseDown');
var onMouseMove = Symbol('onMouseMove');
var onMouseUp = Symbol('onMouseUp');

/**
 * This sensor picks up native browser mouse events and dictates drag operations
 * @class MouseSensor
 * @module MouseSensor
 * @extends Sensor
 */

var MouseSensor = function (_Sensor) {
  (0, _inherits3.default)(MouseSensor, _Sensor);

  /**
   * MouseSensor constructor.
   * @constructs MouseSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function MouseSensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, MouseSensor);

    /**
     * Indicates if mouse button is still down
     * @property mouseDown
     * @type {Boolean}
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (MouseSensor.__proto__ || Object.getPrototypeOf(MouseSensor)).call(this, containers, options));

    _this.mouseDown = false;

    /**
     * Mouse down timer which will end up triggering the drag start operation
     * @property mouseDownTimeout
     * @type {Number}
     */
    _this.mouseDownTimeout = null;

    /**
     * Indicates if context menu has been opened during drag operation
     * @property openedContextMenu
     * @type {Boolean}
     */
    _this.openedContextMenu = false;

    _this[onContextMenuWhileDragging] = _this[onContextMenuWhileDragging].bind(_this);
    _this[onMouseDown] = _this[onMouseDown].bind(_this);
    _this[onMouseMove] = _this[onMouseMove].bind(_this);
    _this[onMouseUp] = _this[onMouseUp].bind(_this);
    return _this;
  }

  /**
   * Attaches sensors event listeners to the DOM
   */


  (0, _createClass3.default)(MouseSensor, [{
    key: 'attach',
    value: function attach() {
      document.addEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Detaches sensors event listeners to the DOM
     */

  }, {
    key: 'detach',
    value: function detach() {
      document.removeEventListener('mousedown', this[onMouseDown], true);
    }

    /**
     * Mouse down handler
     * @private
     * @param {Event} event - Mouse down event
     */

  }, {
    key: onMouseDown,
    value: function value(event) {
      var _this2 = this;

      if (event.button !== 0 || event.ctrlKey || event.metaKey) {
        return;
      }

      document.addEventListener('mouseup', this[onMouseUp]);

      var target = document.elementFromPoint(event.clientX, event.clientY);
      var container = (0, _utils.closest)(target, this.containers);

      if (!container) {
        return;
      }

      document.addEventListener('dragstart', preventNativeDragStart);

      this.mouseDown = true;

      clearTimeout(this.mouseDownTimeout);
      this.mouseDownTimeout = setTimeout(function () {
        if (!_this2.mouseDown) {
          return;
        }

        var dragStartEvent = new _SensorEvent.DragStartSensorEvent({
          clientX: event.clientX,
          clientY: event.clientY,
          target: target,
          container: container,
          originalEvent: event
        });

        _this2.trigger(container, dragStartEvent);

        _this2.currentContainer = container;
        _this2.dragging = !dragStartEvent.canceled();

        if (_this2.dragging) {
          document.addEventListener('contextmenu', _this2[onContextMenuWhileDragging]);
          document.addEventListener('mousemove', _this2[onMouseMove]);
        }
      }, this.options.delay);
    }

    /**
     * Mouse move handler
     * @private
     * @param {Event} event - Mouse move event
     */

  }, {
    key: onMouseMove,
    value: function value(event) {
      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragMoveEvent = new _SensorEvent.DragMoveSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragMoveEvent);
    }

    /**
     * Mouse up handler
     * @private
     * @param {Event} event - Mouse up event
     */

  }, {
    key: onMouseUp,
    value: function value(event) {
      this.mouseDown = Boolean(this.openedContextMenu);

      if (this.openedContextMenu) {
        this.openedContextMenu = false;
        return;
      }

      document.removeEventListener('mouseup', this[onMouseUp]);
      document.removeEventListener('dragstart', preventNativeDragStart);

      if (!this.dragging) {
        return;
      }

      var target = document.elementFromPoint(event.clientX, event.clientY);

      var dragStopEvent = new _SensorEvent.DragStopSensorEvent({
        clientX: event.clientX,
        clientY: event.clientY,
        target: target,
        container: this.currentContainer,
        originalEvent: event
      });

      this.trigger(this.currentContainer, dragStopEvent);

      document.removeEventListener('contextmenu', this[onContextMenuWhileDragging]);
      document.removeEventListener('mousemove', this[onMouseMove]);

      this.currentContainer = null;
      this.dragging = false;
    }

    /**
     * Context menu handler
     * @private
     * @param {Event} event - Context menu event
     */

  }, {
    key: onContextMenuWhileDragging,
    value: function value(event) {
      event.preventDefault();
      this.openedContextMenu = true;
    }
  }]);
  return MouseSensor;
}(_Sensor3.default);

exports.default = MouseSensor;


function preventNativeDragStart(event) {
  event.preventDefault();
}

/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _MouseSensor = __webpack_require__(188);

var _MouseSensor2 = _interopRequireDefault(_MouseSensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _MouseSensor2.default;

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(8)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(60);
var TAG = __webpack_require__(8)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(191);
var ITERATOR = __webpack_require__(8)('iterator');
var Iterators = __webpack_require__(33);
module.exports = __webpack_require__(6).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var $defineProperty = __webpack_require__(12);
var createDesc = __webpack_require__(35);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(33);
var ITERATOR = __webpack_require__(8)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(27);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var ctx = __webpack_require__(67);
var $export = __webpack_require__(18);
var toObject = __webpack_require__(55);
var call = __webpack_require__(195);
var isArrayIter = __webpack_require__(194);
var toLength = __webpack_require__(90);
var createProperty = __webpack_require__(193);
var getIterFn = __webpack_require__(192);

$export($export.S + $export.F * !__webpack_require__(190)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(13).document;
module.exports = document && document.documentElement;


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(64);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(15);
var toLength = __webpack_require__(90);
var toAbsoluteIndex = __webpack_require__(198);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(60);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(12);
var anObject = __webpack_require__(27);
var getKeys = __webpack_require__(61);

module.exports = __webpack_require__(17) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var create = __webpack_require__(62);
var descriptor = __webpack_require__(35);
var setToStringTag = __webpack_require__(56);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(28)(IteratorPrototype, __webpack_require__(8)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(64);
var defined = __webpack_require__(63);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(94);
__webpack_require__(196);
module.exports = __webpack_require__(6).Array.from;


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(204), __esModule: true };

/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _toConsumableArray2 = __webpack_require__(25);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base sensor class. Extend from this class to create a new or custom sensor
 * @class Sensor
 * @module Sensor
 */
var Sensor = function () {
  /**
   * Sensor constructor.
   * @constructs Sensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  function Sensor() {
    var containers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Sensor);

    /**
     * Current containers
     * @property containers
     * @type {HTMLElement[]}
     */
    this.containers = [].concat((0, _toConsumableArray3.default)(containers));

    /**
     * Current options
     * @property options
     * @type {Object}
     */
    this.options = Object.assign({}, options);

    /**
     * Current drag state
     * @property dragging
     * @type {Boolean}
     */
    this.dragging = false;

    /**
     * Current container
     * @property currentContainer
     * @type {HTMLElement}
     */
    this.currentContainer = null;
  }

  /**
   * Attaches sensors event listeners to the DOM
   * @return {Sensor}
   */


  (0, _createClass3.default)(Sensor, [{
    key: 'attach',
    value: function attach() {
      return this;
    }

    /**
     * Detaches sensors event listeners to the DOM
     * @return {Sensor}
     */

  }, {
    key: 'detach',
    value: function detach() {
      return this;
    }

    /**
     * Adds container to this sensor instance
     * @param {...HTMLElement} containers - Containers you want to add to this sensor
     * @example draggable.addContainer(document.body)
     */

  }, {
    key: 'addContainer',
    value: function addContainer() {
      for (var _len = arguments.length, containers = Array(_len), _key = 0; _key < _len; _key++) {
        containers[_key] = arguments[_key];
      }

      this.containers = [].concat((0, _toConsumableArray3.default)(this.containers), containers);
    }

    /**
     * Removes container from this sensor instance
     * @param {...HTMLElement} containers - Containers you want to remove from this sensor
     * @example draggable.removeContainer(document.body)
     */

  }, {
    key: 'removeContainer',
    value: function removeContainer() {
      for (var _len2 = arguments.length, containers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        containers[_key2] = arguments[_key2];
      }

      this.containers = this.containers.filter(function (container) {
        return !containers.includes(container);
      });
    }

    /**
     * Triggers event on target element
     * @param {HTMLElement} element - Element to trigger event on
     * @param {SensorEvent} sensorEvent - Sensor event to trigger
     */

  }, {
    key: 'trigger',
    value: function trigger(element, sensorEvent) {
      var event = document.createEvent('Event');
      event.detail = sensorEvent;
      event.initEvent(sensorEvent.type, true, true);
      element.dispatchEvent(event);
      this.lastEvent = sensorEvent;

      return sensorEvent;
    }
  }]);
  return Sensor;
}();

exports.default = Sensor;

/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * All draggable plugins inherit from this class.
 * @abstract
 * @class AbstractPlugin
 * @module AbstractPlugin
 */
var AbstractPlugin = function () {
  /**
   * AbstractPlugin constructor.
   * @constructs AbstractPlugin
   * @param {Draggable} draggable - Draggable instance
   */
  function AbstractPlugin(draggable) {
    (0, _classCallCheck3.default)(this, AbstractPlugin);

    /**
     * Draggable instance
     * @property draggable
     * @type {Draggable}
     */
    this.draggable = draggable;
  }

  /**
   * Override to add listeners
   * @abstract
   */


  (0, _createClass3.default)(AbstractPlugin, [{
    key: 'attach',
    value: function attach() {
      throw new Error('Not Implemented');
    }

    /**
     * Override to remove listeners
     * @abstract
     */

  }, {
    key: 'detach',
    value: function detach() {
      throw new Error('Not Implemented');
    }
  }]);
  return AbstractPlugin;
}();

exports.default = AbstractPlugin;

/***/ }),
/* 208 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(18);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(17), 'Object', { defineProperty: __webpack_require__(12).f });


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(209);
var $Object = __webpack_require__(6).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { 'default': __webpack_require__(210), __esModule: true };

/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _classCallCheck2 = __webpack_require__(1);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(0);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _canceled = Symbol('canceled');

/**
 * All events fired by draggable inherit this class. You can call `cancel()` to
 * cancel a specific event or you can check if an event has been canceled by
 * calling `canceled()`.
 * @abstract
 * @class AbstractEvent
 * @module AbstractEvent
 */

var AbstractEvent = function () {

  /**
   * AbstractEvent constructor.
   * @constructs AbstractEvent
   * @param {object} data - Event data
   */

  /**
   * Event type
   * @static
   * @abstract
   * @property type
   * @type {String}
   */
  function AbstractEvent(data) {
    (0, _classCallCheck3.default)(this, AbstractEvent);

    this[_canceled] = false;
    this.data = data;
  }

  /**
   * Read-only type
   * @abstract
   * @return {String}
   */


  /**
   * Event cancelable
   * @static
   * @abstract
   * @property cancelable
   * @type {Boolean}
   */


  (0, _createClass3.default)(AbstractEvent, [{
    key: 'cancel',


    /**
     * Cancels the event instance
     * @abstract
     */
    value: function cancel() {
      this[_canceled] = true;
    }

    /**
     * Check if event has been canceled
     * @abstract
     * @return {Boolean}
     */

  }, {
    key: 'canceled',
    value: function canceled() {
      return Boolean(this[_canceled]);
    }

    /**
     * Returns new event instance with existing event data.
     * This method allows for overriding of event data.
     * @param {Object} data
     * @return {AbstractEvent}
     */

  }, {
    key: 'clone',
    value: function clone(data) {
      return new this.constructor(Object.assign({}, this.data, data));
    }
  }, {
    key: 'type',
    get: function get() {
      return this.constructor.type;
    }

    /**
     * Read-only cancelable
     * @abstract
     * @return {Boolean}
     */

  }, {
    key: 'cancelable',
    get: function get() {
      return this.constructor.cancelable;
    }
  }]);
  return AbstractEvent;
}();

AbstractEvent.type = 'event';
AbstractEvent.cancelable = false;
exports.default = AbstractEvent;

/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// https://github.com/tc39/Array.prototype.includes
var $export = __webpack_require__(31);
var $includes = __webpack_require__(107)(true);

$export($export.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

__webpack_require__(99)('includes');


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(213);
module.exports = __webpack_require__(7).Array.includes;


/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

var getKeys = __webpack_require__(29);
var toIObject = __webpack_require__(19);
var isEnum = __webpack_require__(38).f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};


/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/tc39/proposal-object-values-entries
var $export = __webpack_require__(31);
var $values = __webpack_require__(215)(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(216);
module.exports = __webpack_require__(7).Object.values;


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(29);
var gOPS = __webpack_require__(69);
var pIE = __webpack_require__(38);
var toObject = __webpack_require__(100);
var IObject = __webpack_require__(108);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(42)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(31);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(218) });


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(219);
module.exports = __webpack_require__(7).Object.assign;


/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(4)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var global = __webpack_require__(5);
var dP = __webpack_require__(21);
var DESCRIPTORS = __webpack_require__(23);
var SPECIES = __webpack_require__(4)('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(30);
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(14);
var isObject = __webpack_require__(20);
var newPromiseCapability = __webpack_require__(97);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),
/* 226 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var macrotask = __webpack_require__(98).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(39)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),
/* 228 */
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(14);
var aFunction = __webpack_require__(47);
var SPECIES = __webpack_require__(4)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(68);
var ITERATOR = __webpack_require__(4)('iterator');
var Iterators = __webpack_require__(37);
module.exports = __webpack_require__(7).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(37);
var ITERATOR = __webpack_require__(4)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(14);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(48);
var call = __webpack_require__(232);
var isArrayIter = __webpack_require__(231);
var anObject = __webpack_require__(14);
var toLength = __webpack_require__(106);
var getIterFn = __webpack_require__(230);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 234 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var LIBRARY = __webpack_require__(40);
var global = __webpack_require__(5);
var ctx = __webpack_require__(48);
var classof = __webpack_require__(68);
var $export = __webpack_require__(31);
var isObject = __webpack_require__(20);
var aFunction = __webpack_require__(47);
var anInstance = __webpack_require__(234);
var forOf = __webpack_require__(233);
var speciesConstructor = __webpack_require__(229);
var task = __webpack_require__(98).set;
var microtask = __webpack_require__(227)();
var newPromiseCapabilityModule = __webpack_require__(97);
var perform = __webpack_require__(226);
var userAgent = __webpack_require__(225);
var promiseResolve = __webpack_require__(224);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(4)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError('Promise can\'t be resolved itself');
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(223)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(46)($Promise, PROMISE);
__webpack_require__(222)(PROMISE);
Wrapper = __webpack_require__(7)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(221)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),
/* 236 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var addToUnscopables = __webpack_require__(99);
var step = __webpack_require__(236);
var Iterators = __webpack_require__(37);
var toIObject = __webpack_require__(19);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(101)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

var $iterators = __webpack_require__(237);
var getKeys = __webpack_require__(29);
var redefine = __webpack_require__(30);
var global = __webpack_require__(5);
var hide = __webpack_require__(22);
var Iterators = __webpack_require__(37);
var wks = __webpack_require__(4);
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(24);
var toObject = __webpack_require__(100);
var IE_PROTO = __webpack_require__(71)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var create = __webpack_require__(105);
var descriptor = __webpack_require__(49);
var setToStringTag = __webpack_require__(46);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(22)(IteratorPrototype, __webpack_require__(4)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(72);
var defined = __webpack_require__(73);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 242 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

var $at = __webpack_require__(241)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(101)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(102);
__webpack_require__(242);
__webpack_require__(238);
__webpack_require__(235);
module.exports = __webpack_require__(7).Promise;


/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(38);
var createDesc = __webpack_require__(49);
var toIObject = __webpack_require__(19);
var toPrimitive = __webpack_require__(75);
var has = __webpack_require__(24);
var IE8_DOM_DEFINE = __webpack_require__(111);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(23) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(19);
var gOPN = __webpack_require__(103).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(21);
var anObject = __webpack_require__(14);
var getKeys = __webpack_require__(29);

module.exports = __webpack_require__(23) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(39);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(72);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 249 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(29);
var gOPS = __webpack_require__(69);
var pIE = __webpack_require__(38);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var core = __webpack_require__(7);
var LIBRARY = __webpack_require__(40);
var wksExt = __webpack_require__(110);
var defineProperty = __webpack_require__(21).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 251 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(41)('meta');
var isObject = __webpack_require__(20);
var has = __webpack_require__(24);
var setDesc = __webpack_require__(21).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(42)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';

// ECMAScript 6 symbols shim
var global = __webpack_require__(5);
var has = __webpack_require__(24);
var DESCRIPTORS = __webpack_require__(23);
var $export = __webpack_require__(31);
var redefine = __webpack_require__(30);
var META = __webpack_require__(251).KEY;
var $fails = __webpack_require__(42);
var shared = __webpack_require__(74);
var setToStringTag = __webpack_require__(46);
var uid = __webpack_require__(41);
var wks = __webpack_require__(4);
var wksExt = __webpack_require__(110);
var wksDefine = __webpack_require__(250);
var enumKeys = __webpack_require__(249);
var isArray = __webpack_require__(247);
var anObject = __webpack_require__(14);
var isObject = __webpack_require__(20);
var toIObject = __webpack_require__(19);
var toPrimitive = __webpack_require__(75);
var createDesc = __webpack_require__(49);
var _create = __webpack_require__(105);
var gOPNExt = __webpack_require__(245);
var $GOPD = __webpack_require__(244);
var $DP = __webpack_require__(21);
var $keys = __webpack_require__(29);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(103).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(38).f = $propertyIsEnumerable;
  __webpack_require__(69).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(40)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(22)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 253 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(252);
__webpack_require__(102);
module.exports = __webpack_require__(7).Symbol;


/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

'use strict';


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Plugins = exports.Sensors = exports.Sortable = exports.Swappable = exports.Droppable = exports.Draggable = exports.BasePlugin = exports.BaseEvent = undefined;

__webpack_require__(253);

__webpack_require__(243);

__webpack_require__(220);

__webpack_require__(217);

__webpack_require__(214);

var _AbstractEvent = __webpack_require__(9);

var _AbstractEvent2 = _interopRequireDefault(_AbstractEvent);

var _AbstractPlugin = __webpack_require__(10);

var _AbstractPlugin2 = _interopRequireDefault(_AbstractPlugin);

var _Sensors = __webpack_require__(65);

var Sensors = _interopRequireWildcard(_Sensors);

var _Plugins = __webpack_require__(153);

var Plugins = _interopRequireWildcard(_Plugins);

var _Draggable = __webpack_require__(43);

var _Draggable2 = _interopRequireDefault(_Draggable);

var _Droppable = __webpack_require__(126);

var _Droppable2 = _interopRequireDefault(_Droppable);

var _Swappable = __webpack_require__(117);

var _Swappable2 = _interopRequireDefault(_Swappable);

var _Sortable = __webpack_require__(114);

var _Sortable2 = _interopRequireDefault(_Sortable);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.BaseEvent = _AbstractEvent2.default;
exports.BasePlugin = _AbstractPlugin2.default;
exports.Draggable = _Draggable2.default;
exports.Droppable = _Droppable2.default;
exports.Swappable = _Swappable2.default;
exports.Sortable = _Sortable2.default;
exports.Sensors = Sensors;
exports.Plugins = Plugins;

/***/ })
/******/ ]);
});