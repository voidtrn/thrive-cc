/*
 * Mentions Input
 * Version 1.0
 * Written by: Kenneth Auchenberg (Podio)
 *
 * Using underscore.js
 *
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($, _, undefined) {

  // Settings
  var KEY = { BACKSPACE : 8, TAB : 9, RETURN : 13, ESC : 27, LEFT : 37, UP : 38, RIGHT : 39, DOWN : 40, COMMA : 188, SPACE : 32, HOME : 36, END : 35 }; // Keys "enum"
    var defaultSettings = {
      triggerChar   : '@',
      onDataRequest : $.noop,
      minChars      : 0,
      allowRepeat   : true,
      showAvatars   : true,
      elastic       : true,
    display     : 'display',
      classes       : {
        autoCompleteItemActive : "active"
      },
      templates     : {
        wrapper                    : _.template('<div class="mentions-input-box"></div>'),
        autocompleteList           : _.template('<div class="mentions-autocomplete-list"></div>'),
        autocompleteListItem       : _.template('<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><%= content %></li>'),
        autocompleteListItemAvatar : _.template('<img  src="<%= avatar %>" />'),
        autocompleteListItemIcon   : _.template('<div class="icon <%= icon %>"></div>'),
        mentionsOverlay            : _.template('<div class="mentions"><div></div></div>'),
        mentionItemSyntax          : _.template('<%= triggerChar %>[<%= value %>](<%= type %>:<%= id %>)'),
        mentionItemHighlight       : _.template('<strong><span><%= value %></span></strong>')
      }
    };

  var utils = {
    htmlEncode       : function (str) {
      return _.escape(str);
    },
    highlightTerm    : function (value, term) {
      if (!term && !term.length) {
        return value;
      }
      return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    },
    setCaratPosition : function (domNode, caretPos) {
      if (domNode.createTextRange) {
        var range = domNode.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (domNode.selectionStart) {
          domNode.focus();
          domNode.setSelectionRange(caretPos, caretPos);
        } else {
          domNode.focus();
        }
      }
    },
    //Deletes the white spaces
    rtrim: function(string) {
        return string;//.replace(/\s+/g, '');
    }
  };

  var MentionsInput = function (input) {
    var settings;
    var elmInputBox, elmInputWrapper, elmAutocompleteList, elmWrapperBox, elmMentionsOverlay, elmActiveAutoCompleteItem;
    var mentionsCollection = [];
    var inputBuffer = [];
    var currentDataQuery;

    function initTextarea() {
      elmInputBox = $(input);

      if (elmInputBox.attr('data-mentions-input') == 'true') {
        return;
      }

      elmInputWrapper = elmInputBox.parent();
      elmWrapperBox = $(settings.templates.wrapper());
      elmInputBox.wrapAll(elmWrapperBox);
      elmWrapperBox = elmInputWrapper.find('> div');

      elmInputBox.attr('data-mentions-input', 'true');
      elmInputBox.bind('keydown', onInputBoxKeyDown);
      elmInputBox.bind('keypress', onInputBoxKeyPress);
      elmInputBox.bind('input', onInputBoxInput);
      elmInputBox.bind('click', onInputBoxClick);

      if (settings.elastic) {
        elmInputBox.elastic();
      }
    }

    function initAutocomplete() {
      elmAutocompleteList = $(settings.templates.autocompleteList());
      elmAutocompleteList.appendTo(elmWrapperBox);
      elmAutocompleteList.delegate('li', 'click', onAutoCompleteItemClick);
    }

    function initMentionsOverlay() {
      elmMentionsOverlay = $(settings.templates.mentionsOverlay());
      elmMentionsOverlay.prependTo(elmWrapperBox);
    }

    function updateValues() {
      var syntaxMessage = getInputBoxValue();
//console.log('syntaxMessage:' + syntaxMessage);
      _.each(mentionsCollection, function (mention) {
        var textSyntax = settings.templates.mentionItemSyntax({ value : mention.value, type : mention.type, id : mention.id, triggerChar: mention.trigger });
        syntaxMessage = syntaxMessage.replace(mention.value, textSyntax);
      });


//console.log('mentionsCollection:' + mentionsCollection);
      var mentionText = utils.htmlEncode(syntaxMessage);

      _.each(mentionsCollection, function (mention) {
        var textSyntax = settings.templates.mentionItemSyntax({ value : utils.htmlEncode(mention.value), type : mention.type, id : mention.id, triggerChar: mention.trigger  });
        var textHighlight = settings.templates.mentionItemHighlight({ value : utils.htmlEncode(mention.value) });

        mentionText = mentionText.replace(textSyntax, textHighlight);
      });

      mentionText = mentionText.replace(/\n/g, '<br />');
      mentionText = mentionText.replace(/ {2}/g, '&nbsp; ');

      elmInputBox.data('messageText', syntaxMessage);
      elmMentionsOverlay.find('div').html(mentionText);
    }

    function resetBuffer() {
      inputBuffer = [];
    }

    function updateMentionsCollection() {
      var inputText = getInputBoxValue();

      mentionsCollection = _.reject(mentionsCollection, function (mention, index) {
        return !mention.value || inputText.indexOf(mention.value) == -1;
      });
      mentionsCollection = _.compact(mentionsCollection);
    }

//------------------------------------------------------------------------------------------------------------------------


    function addMention(value, id, type) {
//console.log(getInputBoxValue());

      var currentMessage = getInputBoxValue();
console.log('currentMessage:'+currentMessage);
      var currentTriggerChar = elmInputBox.data('triggerChar');
//console.log('currentTriggerChar:'+currentTriggerChar);
      // Using a regex to figure out positions

      if(currentDataQuery ===undefined)
      {
          if(currentTriggerChar == '@')
          {
            currentMessage = '@a';
            currentDataQuery = 'a';
          }
      }
      else if (currentDataQuery =='')
      {
        if(currentTriggerChar == '@')
          {
            currentMessage = currentMessage + 'a';
            currentDataQuery = 'a';
          }
      }

 //console.log('currentMessage modified:'+currentMessage);

 //console.log('currentDataQuery modified:'+currentDataQuery);

      if(currentDataQuery ===undefined)
      {
        currentDataQuery = '';
      }

      currentDataQuery = currentDataQuery.replace(currentTriggerChar,'');

console.log('x currentMessage:'+currentMessage);
console.log('x currentTriggerChar:'+currentTriggerChar);
console.log('x currentDataQuery:'+currentDataQuery);
console.log('x str.lastIndexOf:'+currentMessage.lastIndexOf(currentTriggerChar + currentDataQuery));

      var regex = new RegExp("\\" + currentTriggerChar + currentDataQuery, "gi");
      regex.exec(currentMessage);
 //console.log('regex:'+regex);

 console.log(' regex.lastIndex:'+regex.lastIndex);
 //console.log('currentDataQuery:'+currentDataQuery);
      if(currentDataQuery ===undefined)
      {
console.log(' case a');
        var startCaretPosition = regex.lastIndex - 1; 
      }
      else
      {
console.log(' case b');
        var startCaretPosition = regex.lastIndex - currentDataQuery.length - 1;               
      }


      var str = currentMessage;

      var arr = str.split(currentTriggerChar);
      var lastIndexMax = 0;
console.log('arr.length:'+arr.length);


      for( var i = 0, len = arr.length; i < len; i++ ) {
console.log('index#' + i + ':' + str.lastIndexOf(currentTriggerChar + arr[i]) + ',string:'+currentTriggerChar + arr[i]   );
          if(lastIndexMax < str.lastIndexOf(currentTriggerChar + arr[i]))
          {
              lastIndexMax = str.lastIndexOf(currentTriggerChar + arr[i]);




            currentDataQuery = str.substr(lastIndexMax,str.length).indexOf(arr[i] );

          }
          arr[i] = str.substr(lastIndexMax,str.length).indexOf(arr[i] );
      }

      var tagslistarr = str.match(/#\S+/g);
      console.log(tagslistarr);


console.log('lastIndexOf:' + str.lastIndexOf(currentTriggerChar + currentDataQuery));
console.log('startCaretPosition:'+startCaretPosition);
      ////var currentCaretPosition = regex.lastIndex;  
console.log('lastIndexMax:'+lastIndexMax);
      var currentCaretPosition = regex.lastIndex;




//11 > 0
      if(lastIndexMax > startCaretPosition)
      {
          startCaretPosition = str.lastIndexOf(currentTriggerChar + currentDataQuery);

          if(startCaretPosition < 0 && currentMessage.length > 2)
          {
            startCaretPosition = lastIndexMax;
          }
console.log('startCaretPosition updated:'+startCaretPosition);

          currentCaretPosition = currentMessage.length;
      }


console.log('currentCaretPosition:'+currentCaretPosition);
      var start = currentMessage.substr(0, startCaretPosition);
console.log('start:'+start);
      var end = currentMessage.substr(currentCaretPosition, currentMessage.length);
console.log('currentMessage.length:'+currentMessage.length);
//console.log('end:'+end);
      var startEndIndex = (start + value).length;
//console.log('startEndIndex:'+startEndIndex);
      if(currentDataQuery ==undefined && (end == '@' || end == '#'))
      {
        end ='';
      }
      
      if(currentTriggerChar == '@')
      {
        end = end + ' '; //extra space for user mention case
        startEndIndex+=1;
      }


      var updatedMessageText = start + value + end;
console.log('updatedMessageText:['+updatedMessageText+']');



      mentionsCollection.push({
        id    : id,
        type  : type,
        value : value,
        trigger : currentTriggerChar
      });

      // Cleaning before inserting the value, otherwise auto-complete would be triggered with "old" inputbuffer
      resetBuffer();
      currentDataQuery = '';
      hideAutoComplete();

      // Mentions & syntax message



      //czupdate 20180109 : avoid double @@ / ##
      updatedMessageText = updatedMessageText.replace("@@", "@").replace("##", "#");

      elmInputBox.val(updatedMessageText);
      updateValues();

      // Set correct focus and selection
      elmInputBox.focus();
console.log('elmInputBox[0]:'+elmInputBox[0]);
      utils.setCaratPosition(elmInputBox[0], startEndIndex);
console.log('startEndIndex:'+startEndIndex);
    }

    function getInputBoxValue() {
      return $.trim(elmInputBox.val());
    }

    function onAutoCompleteItemClick(e) {
      var elmTarget = $(this);

      if(elmTarget.attr('data-ref-type') == 'hashtag')
      {
        //alert(elmTarget.attr('data-display'));
          resetBuffer();
          currentDataQuery = '';
          hideAutoComplete();
      }
      else
      {
            addMention(elmTarget.attr('data-display'), elmTarget.attr('data-ref-id'), elmTarget.attr('data-ref-type'));
//console.log('data-display:'+elmTarget.attr('data-display')+',data-ref-id:'+elmTarget.attr('data-ref-id')+',data-ref-type:'+elmTarget.attr('data-ref-type'))
      }
      return false;
    }

    function onInputBoxClick(e) {
 //     console.log('onInputBoxClick');
      resetBuffer();
    }

    function checkTriggerChar(inputBuffer, triggerChar) {
console.log('******************** inputBuffer:' + inputBuffer);
      var triggerCharIndex = _.lastIndexOf(inputBuffer, triggerChar);
console.log('triggerCharIndex:' + triggerCharIndex);  
      if (triggerCharIndex > -1) {
          currentDataQuery = inputBuffer.slice(triggerCharIndex + 1).join('');
          currentDataQuery = utils.rtrim(currentDataQuery);
console.log('case a : currentDataQuery:' + currentDataQuery);
          _.defer(_.bind(doSearch, this, currentDataQuery, triggerChar));
      }
      else
      {
console.log('case b : triggerChar:' + triggerChar);
        currentDataQuery = inputBuffer.slice(triggerCharIndex + 1).join('');  
        currentDataQuery = utils.rtrim(currentDataQuery);    



console.log('case b2 : _currentDataQuery:' + currentDataQuery);
console.log('>>> currentDataQuery.substring(0, 1):' + currentDataQuery.substring(0, 1));
          if(currentDataQuery.substring(0, 1) == '@' && triggerChar == '@')//if(triggerChar=='@')
          {             
console.log('_triggerChar:' + triggerChar);  
console.log('_inputBuffer:' + inputBuffer);               
console.log('_this:' + this); 
              _.defer(_.bind(doSearch, this, currentDataQuery, triggerChar));
          }
          else
          {
              var current_string = getInputBoxValue();
              var getChar = String.fromCharCode(current_string.charCodeAt(current_string.length - currentDataQuery.length - 1));
console.log('getChar:'+getChar);

              if(getChar== '@' && triggerChar == '@') 
              {
                _.defer(_.bind(doSearch, this, currentDataQuery, triggerChar));
              }  
          }
      }
    }
    function onInputBoxInput(e) {
/*
var ua = navigator.userAgent.toLowerCase(); 
                    var isAndroid = ua.indexOf('android') > -1;
                    //&& ua.indexOf(\'mobile\'); 
                    if(isAndroid) { 
                        var char = this.value.charCodeAt(this.value.length - 1); //$scope.data = char; 
                        if(e.keyCode === undefined){ 
                            e.keyCode = char; 
                        } 
                    return true; 
                    } 
*/


var ua = navigator.userAgent.toLowerCase(); 
             var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile"); 
  console.log('__isAndroid:'+isAndroid);
             if (isAndroid) {//certain versions of android mobile browser don't trigger the keypress event. 
                        
                        if(e.keyCode === undefined)
                        { 
                          var char = this.value.charCodeAt(this.value.length - 1); //$scope.data = char; 
  console.log('__char:'+char);
                            e.keyCode = char; 
                        } 
  console.log('__e.keyCode:'+e.keyCode);
                 if (e.keyCode !== KEY.BACKSPACE) { 
                     var typedValue = String.fromCharCode(e.which || e.keyCode); //Takes the string that represent this CharCode 
    console.log('__typedValue:'+typedValue);
                     inputBuffer.push(typedValue); //Push the value pressed into inputBuffer 
                 } 
             } 
 
 

      updateValues();
      updateMentionsCollection();
      hideAutoComplete();

    	  if (_.isArray(settings.triggerChar)) {
      		_.each(settings.triggerChar, function (triggerChar) {
      			checkTriggerChar(inputBuffer, triggerChar);
      		});
    	  } else {
    		  checkTriggerChar(inputBuffer, settings.triggerChar);
    	  }

    }

    function onInputBoxKeyPress(e) {
var ua = navigator.userAgent.toLowerCase(); 
             var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile"); 
             if(!isAndroid) { 
                 if (e.keyCode !== KEY.BACKSPACE) { //If the key pressed is not the backspace 
                     var typedValue = String.fromCharCode(e.which || e.keyCode); //Takes the string that represent this CharCode 
                     inputBuffer.push(typedValue); //Push the value pressed into inputBuffer 
                 } 
             } 

    }

    function onInputBoxKeyDown(e) {

      // This also matches HOME/END on OSX which is CMD+LEFT, CMD+RIGHT
      if (e.keyCode == KEY.LEFT || e.keyCode == KEY.RIGHT || e.keyCode == KEY.HOME || e.keyCode == KEY.END) {
        // Defer execution to ensure carat pos has changed after HOME/END keys
        _.defer(resetBuffer);
        return;
      }

      if (e.keyCode == KEY.BACKSPACE) {
        inputBuffer = inputBuffer.slice(0, -1 + inputBuffer.length); // Can't use splice, not available in IE
        return;
      }

      if (!elmAutocompleteList.is(':visible')) {
        return true;
      }
console.log('e.keyCode:'+e.keyCode);
      switch (e.keyCode) {
        case KEY.UP:
        case KEY.DOWN:
          var elmCurrentAutoCompleteItem = null;
          if (e.keyCode == KEY.DOWN) {
            if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
              elmCurrentAutoCompleteItem = elmActiveAutoCompleteItem.next();
            } else {
              elmCurrentAutoCompleteItem = elmAutocompleteList.find('li').first();
            }
          } else {
            elmCurrentAutoCompleteItem = $(elmActiveAutoCompleteItem).prev();
          }

          if (elmCurrentAutoCompleteItem.length) {
            selectAutoCompleteItem(elmCurrentAutoCompleteItem);
          }

          return false;

        case KEY.RETURN:
        case KEY.TAB:
          if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
            elmActiveAutoCompleteItem.click();
            return false;
          }

          break;
      }

      return true;
    }

    function hideAutoComplete() {
      elmActiveAutoCompleteItem = null;
      elmAutocompleteList.empty().hide();
    }

    function selectAutoCompleteItem(elmItem) {
      elmItem.addClass(settings.classes.autoCompleteItemActive);
      elmItem.siblings().removeClass(settings.classes.autoCompleteItemActive);

      elmActiveAutoCompleteItem = elmItem;
    }

    function populateDropdown(query, results) {
      elmAutocompleteList.show();

      // Filter items that has already been mentioned
      /*var mentionValues = _.pluck(mentionsCollection, 'value');
      results = _.reject(results, function (item) {
        return _.include(mentionValues, item.name);
      });*/



      if (!results.length) {
        hideAutoComplete();
        return;
      }

      elmAutocompleteList.empty();
      var elmDropDownList = $("<ul>").appendTo(elmAutocompleteList).hide();

      _.each(results, function (item) {
        var elmListItem = $(settings.templates.autocompleteListItem({
          'id'      : utils.htmlEncode(item.id),
          'display' : utils.htmlEncode(item[settings.display]),
          'name' : utils.htmlEncode(item.name),
          'type'    : utils.htmlEncode(item.type),
          'content' : utils.highlightTerm(utils.htmlEncode((item.name)), query)
        }));

        if (item.type == 'contact') {
          var elmIcon;

          if (item.avatar) {
            elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar : item.avatar }));
          } else {
            elmIcon = $(settings.templates.autocompleteListItemIcon({ icon : item.icon }));
          }
          elmIcon.prependTo(elmListItem);
        }
        elmListItem = elmListItem.appendTo(elmDropDownList);
      });

      elmAutocompleteList.show();
      elmDropDownList.show();
    }

    function doSearch(query, triggerChar) {
console.log('------------------------------------------------------------------------------------------------------------------------');
console.log('query:'+query+',query.length:'+query.length+',settings.minChars:'+settings.minChars+',triggerChar:'+triggerChar);
//---trick untuk menampilkan hashtag signature dengan trigger vocal e (ganti menjadi huruf vocal lain yang mewakili semau list yang ada)
      if(triggerChar=='#' && query.length == 0)
      {
        query = 'e';
      }
//---/trick
      if (query && query.length && query.length >= settings.minChars) {
        settings.onDataRequest.call(this, triggerChar, query, function (responseData) {
          populateDropdown(query, responseData);
          elmInputBox.data('triggerChar', triggerChar);
        }, triggerChar);
      }
    }

    // Public methods
    return {
      init : function (options) {
        settings = options;

        initTextarea();
        initAutocomplete();
        initMentionsOverlay();
      },

      init_load_user : function (options,query) {
        settings = options;
        

        updateValues();
        doSearch(query, '@');
      },

      init_load_signature : function (options,query) {
        settings = options;
        
        updateValues();
        doSearch(query, '#');
      },

      init_custome : function (options,query) {
        settings = options;
        
        updateValues();
        doSearch(query, '!');
      },

      hideEverything : function (){
        
        mentionsCollection = [];
        updateValues();
        hideAutoComplete();
        
      },

      val : function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }
        var value = mentionsCollection.length ? elmInputBox.data('messageText') : getInputBoxValue();
        callback.call(this, value);
      },

      reset : function () {
        elmInputBox.val('');
        mentionsCollection = [];
        updateValues();
      },

      getMentions : function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        callback.call(this, mentionsCollection);
      }
    };
  };

  $.fn.mentionsInput = function (method, settings) {

    if (typeof method === 'object' || !method) {
      settings = $.extend(true, {}, defaultSettings, method);
    }

    var outerArguments = arguments;

    return this.each(function () {
      var instance = $.data(this, 'mentionsInput') || $.data(this, 'mentionsInput', new MentionsInput(this));

      if (_.isFunction(instance[method])) {
        return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));

      } else if (typeof method === 'object' || !method) {
        return instance.init.call(this, settings);

      } else {
        $.error('Method ' + method + ' does not exist');
      }

    });
  };

})(jQuery, _);
