/*$(function () {

  $('textarea.mention-example2').mentionsInput({
    onDataRequest:function (mode, query, callback) {
      $.getJSON('assets/data.json', function(responseData) {
        responseData = _.filter(responseData, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
        callback.call(this, responseData);
      });
    }

  });

});*/


$('textarea.bebas').mentionsInput({
		triggerChar   : ['@','#'],
        onDataRequest:getDataMention,
        minChars: -1,
        templates     : {
            wrapper                    : _.template('<div class="mentions-input-box"></div>'),
            autocompleteList           : _.template('<div class="mentions-autocomplete-list"></div>'),
            autocompleteListItem       : _.template('<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><%= content %></li>'),
            autocompleteListItemAvatar : _.template('<img src="<%= avatar %>" />'),
            autocompleteListItemIcon   : _.template('<div class="icon <%= icon %>"></div>'),
            mentionsOverlay            : _.template('<div class="mentions-hide-value"><div></div></div>'),
            mentionItemSyntax          : _.template('@[<%= value %>](<%= type %>:<%= id %>)'),
            mentionItemHighlight       : _.template('<%= value %>')
        }
      });

		function getDataMention(mode, query, callback){

      if(mode=='@')
      {
              var path = 'http://localhost:8080/thrive-resources/mentions_mixed/json.php?id='+query.toLowerCase();
      }
      else if(mode='#')
      {
              var path = 'http://localhost:8080/thrive-resources/mentions_mixed/hashtag.php?id='+query.toLowerCase();
      }

        
      $.ajax({
            url: path,
             dataType: 'json', // Choosing a JSON datatype
          }).done(function(retdata) 
          {
           var data = retdata;
           data = _.filter(data, function(item) {
              return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 
            });
           callback.call(this, data);
          });                      
}
