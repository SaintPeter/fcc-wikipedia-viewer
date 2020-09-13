let baseURL = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&format=json&exsentences=1&exlimit=max&exintro=&explaintext=&exsectionformat=plain&generator=search&gsrnamespace=0&callback=?&gsrsearch=';
let results;

let autocompleteXHR;

// Launch the ajax request.  Also animates stuff.
function doSearch(query) {
  $('.wiki-img').addClass('spin-away');
  $('.searchContainer').addClass('searchNewLoc');
  return $.ajax( {
    url: baseURL + encodeURIComponent(query),
    dataType: 'json',
    type: 'GET',
    headers: { 'Api-User-Agent': 'FreeCodeCamp-SaintPeter/1.0 (rex.schrader@gmail.com)' },
    success: function(data) {
      results = data;
    }
  } );
}

function displayResults() {
  // Clear any old search results
  $('.searchOutput').html('');

  // Get a list of results and sort them by index
  let pagelist = [];
  if(results.hasOwnProperty('query')) {
    pagelist = Object.keys(results.query.pages);
  }
  let res = pagelist.map(function(key) { return results.query.pages[key]; });
  res.sort(function(a,b) { return a.index - b.index; });

  // Add the results to the search page.
  res.forEach(function(item) {
    let output = '<a class="resultContainer" target="_blank" href="https://en.wikipedia.org?curid='+item.pageid+'">';
    output += '<h2 class="resultHeader">' + item.title + '</h2>';
    output += '<p class="resultExtract">' + item.extract + '</p>';
    /* if(item.hasOwnProperty('thumbnail')) {
      output += '<div class="thumbnail" style="background-image: url(\'' + item.thumbnail.source + '\');"></div>';
    }*/
    output += '</a>';
    $('.searchOutput').append(output);

  });
  $('.searchResults').addClass('slideUp');
  $('.controls').addClass('controlSlideUp');
}

// Document Ready Handler
$(document).ready(function() {
  let search = $('#search');
  // Capture enter key on textbox
  search.keyup(function (e) {
    if (e.keyCode === 13) {
      if(autocompleteXHR) {
        autocompleteXHR.abort();
        console.log("Autocomplete abort attempted")
      }
      let xhr = doSearch($(this).val());

      $.when(xhr).done(function() {
        displayResults();
      });
    }
  });

  // Global clear
/*  $(document).on('keyup', function(event) {
    if(event.keyCode === 27) {
      $('.removeIcon').click();
    }
  });*/

  // Clear Search Button
  $('.removeIcon').click(function() {
    $('.wiki-img').removeClass('spin-away');
    $('.searchContainer').removeClass('searchNewLoc');
    $('.controls').removeClass('controlSlideUp');
    $('.searchResults').removeClass('slideUp');
    $('#search').val('');
    $('.searchOutput').html('');
  });

  // Give focus to the search box by default
  search.focus();

  // Setup autocomplete
  search.autocomplete({
    lookup: function(query, done) {
      autocompleteXHR = $.ajax({
        url: baseURL + encodeURIComponent(query),
        dataType: 'json',
        type: 'GET',
        headers: { 'Api-User-Agent': 'FreeCodeCamp-SaintPeter/1.0 (rex.schrader@gmail.com)' },
        success: function(data) {
          autocompleteXHR = null;
          let pagelist = [];
          if(data.hasOwnProperty('query')) {
            pagelist = Object.keys(data.query.pages);
          }
          let res = pagelist.map(function(key) { return data.query.pages[key]; });
          res.sort(function(a,b) { return a.title.localeCompare(b.title); })

          data = {
            suggestions: res.map(function(item) {
              return { value: item.title, data: item.index };
            })
          };
          done(data);
        }
      });
    },
  });

});