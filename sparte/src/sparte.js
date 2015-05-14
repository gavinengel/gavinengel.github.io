/**
 * @author gavin@engel.com
 * @homepage http://gavinengel.github.io/sparte/
 *
 * Options: 
 * - link_pattern: the jquery selector pattern that will call Spartee routing
 * - prepend: the directory on your server that holds for partials
 * - target: the id of the tag to push the html content into
 * - callback: your function to call after Spartee has handled a page load
 *
 * Ex:
 *   jQuery(document).ready( function($) {
 *     sparte({'link_pattern':'a[href^="/"]','prepend':'pages', 'target':'page', 'callback':'aftersparteedone'});  
 *   });
 *
 *   function aftersparteedone(Sparte) {
 *     alert("Sparte just finished loading this page: "+Sparte.source);
 *   }
 *
 */
 //TODO test callback, rename to callafter... add a callfirst
 //TODO pass list of pages to precache?
var Sparte = {};
Sparte.cache = [];
Sparte.source = '';
Sparte.options = {};

function sparte(options) {
  Sparte.options = options;

  sparte_pull_remote();

  // kill all a-tags clicks if they begin with passed pattern
  jQuery(Sparte.options.link_pattern).click( function($) {
  	var href = jQuery(this).attr('href');
  	window.history.pushState(null, null, href);
      
    $.preventDefault();
    sparte_pull_remote();

    if (Sparte.hasOwnProperty("callback")) {
    	window[Sparte.callback](Sparte);
    } 

  } );

}

/*
function sparte_load() {

    // found in cache?
    if (typeof Sparte.cache[Sparte.source] == 'undefined') {
    	// does not exist
		$.get(Sparte.source, sparte_cache_page());
    }

	return Sparte.cache[Sparte.source];
}

function sparte_cache_page(data) {
    Sparte.cache[Sparte.source] = data;
}
*/
function sparte_pull_remote() {


	// pull a partial on the url
	var pathname = window.location.pathname;

	// TODO remove the `/#!/` from the start
	//if (pathname.substr(0, 4)=='/#!/') pathname = pathname.substr(4, pathname.length());


	// harp doesn't require `.html` to resolve to a file that actually is named with `.html`
	Sparte.source = "/"+Sparte.options.prepend+pathname;

	// if source ends in `/`, then tack on a `index`
	if (Sparte.source.substr(-1)=='/') Sparte.source = Sparte.source.concat('index');


    // found in cache?
    if (typeof Sparte.cache[Sparte.source] == 'undefined') {
    	// does not exist
		$("#"+Sparte.options.target).load(Sparte.source, function() {
			// add to cache
			Sparte.cache[Sparte.source] = $("#"+Sparte.options.target).html();
		});
    }
    else {
	    // does exist, so load it right from the cache
		$("#"+Sparte.options.target).html(Sparte.cache[Sparte.source]);
	}

    ////$("#"+Sparte.options.target).html(sparte_load());

    // fix the title, if new one is available
	var new_document_title = $('#'+Sparte.options.target+' title').html();
	if (new_document_title) document.title = new_document_title;

}
