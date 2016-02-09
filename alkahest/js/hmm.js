/**
 * Alkahest.js
 * `Alchemist for DOM Events and Attributes` 
 * example usage: alkahest.fetch('/aql.json', alkahest.mix);
 */
window.alkahest = {
	ver: '0.0.3',
	debug: false,
	ext: {},
	proc: {},
	private: {}
}
console.log('begin alkahest')
/**
 *
 */
alkahest.fetch = function (path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

/**
 *
 */
alkahest.mix = function(O, p, opts) {
	if (p) { alkahest.private.selectors.push(p); }

	for (var property in O) {
		var value 	 = O[property]
	 
		/// store current attr
		alkahest.proc.attr = property

	 	// Array?
	 	if (Array.isArray(value)) {
			newValue = alkahest.private.unstring(value[1], opts);
			newOperator = value[0]
			alkahest.private.set(property, newValue, newOperator)
		}
		// String?
		else if (typeof value === 'string' || value instanceof String) {
			alkahest.private.set(property, alkahest.private.unstring(value))
		}
		// Function?
		else if (typeof value === 'function') {
			alkahest.private.set(property, value)	
		}

		// Plain Object?
		else if (typeof value == 'object' && value.constructor == Object) {
			if (property.charAt(0) == '@') {


				var selector = alkahest.private.selectors.join(' ')
				// is a rule.  do not add this to selectors.
				if (property.charAt(1) == 'o' && property.charAt(2) == 'n') {
					// is @onEvent rule.
					// we must add a listener for the current selector + this onEvent.
					var els = document.querySelectorAll( selector )
					var eve = property.slice(3).toLowerCase();

					for(var i=0; i < els.length; i++ ) {
						els[i].addEventListener(eve, function(e, newMix){
							newMix = {}
							newMix[selector] = value;
						    alkahest.mix(newMix, null, {el: e.target, e: e});
						});
					}
				}
				else {
					console.error('bad rule', property)
				}
				
				alkahest.private.selectors.pop()
				return;
			}
			else if (Object.keys(value).length > 0) {
				alkahest.mix(value, property, opts);	
			}
			
		}
		else if (typeof value === 'boolean' || typeof value === 'number') {
			alkahest.private.set(property, value)	
		}
		else {
			console.error('invalid value', value)
		}
	}
	alkahest.private.selectors.pop()
}

/**
 * 
 */
alkahest.private.valuables = ['input']

/**
 * 
 */
alkahest.private.selectors = []


/**
 * 
 */
alkahest.private.unstring = function(value, opts) {
	if ((typeof value === 'string' || value instanceof String) && value.charAt(0) == '`') {
		// if the VALUE is surrounded by `` marks, remove them.  It shouldn't be seen as a String.
		// remove ` from ends
		value = value.substr(1).slice(0, -1)
console.log('unstringing', value)
		// if: event
		if (value.charAt(0) == '@') {
console.log('is event:', {value: value, opts: opts})			
			// remove @ from front
			value = value.slice(1)
		}
		// else if: extension:
		else if (value.charAt(0) == '$') { 
console.log('is extension:', {value: value, opts: opts})
			// if: extension-link
			if (alkahest.proc.attr.slice(0, 2) == 'on') {
				// remove % from front
				value = value.slice(1)
				value = 'return alkahest.ext.' + value + '(event);'
			}
			// else: extension
			else {
				// remove % from front
				extName = value.slice(1)
				//value = 'return alkahest.ext.' + value + '(event);'
				ext = alkahest.ext[extName]
		
				var e = {}
				if (opts && opts.hasOwnProperty('e')) {
	    			e = opts.e;
	    		}

				value = ext(e)
			}
		}
		// b) new sel & attribute: 	#foo .bar & data-foo
		else if (value.indexOf('&') != -1) {
			var values = value.split('&')

			alkahest.proc.attr = values[1]

			value = alkahest.private.get(alkahest.proc.attr, values[0], opts) 
		}
		// c) empty or attribute from same selector: 		data-foo
		else {
			if (value.length) {
				value = alkahest.private.get(value, null, opts)	
			}
			else {
				value = ''
			}
		}
	}

	return value;
}

/**
 * 
 */
alkahest.private.get = function(attribute, differentSelector, opts) {
	var result = ''

	attribute = attribute || alkahest.proc.attr

	if (differentSelector) {
		selector = differentSelector
	}
	else {
		selector = alkahest.private.selectors.join(' ')	
	}
	
	if (opts && opts.hasOwnProperty('el')) {
    	var el = opts.el;
    }
    else {

		var el = document.querySelector( selector )
    }

	if (el) {
		// attr or textcontent?
		///
		tag = el.tagName.toLowerCase()
			if (attribute == 'value' && alkahest.private.valuables.indexOf(tag) === -1) { // use textcontent
				result = el.textContent
			}
			else { // attr, when a=value and tag=input
				result = el.getAttribute( attribute )
			
			}

			if (result === undefined || result === null) {
			result = ''
		}
		///
		
	}
	
	return result;
}

/**
 * 
 */
alkahest.private.set = function(attribute, newValue, newOperator, opts) {
	
	/// determine proper `selector`
	if(attribute.indexOf('&') !== -1) {
		var pieces = attribute.split('&')
		selector = pieces[0].trim()
		attribute = pieces[1].trim()
	}
	else {
		selector = alkahest.private.selectors.join(' ')
	}

	/// determine final `value`
	if (newOperator) {
		var existingValue = alkahest.private.get(attribute, selector)
		switch(newOperator) {
		    case '+':
		        newValue += existingValue;
		        break;
		    case '-':
		        newValue -= existingValue;
		        break;
		    case '*':
		        newValue *= existingValue;
		        break;
		    case '/':
		        newValue /= existingValue;
		        break;
		    case '%':
		        newValue %= existingValue;
		        break;
		    case '&':
		        newValue = existingValue.concat(newValue);
		        break;
		    case '$':
		        // this is calling an extension.
		        // newValue == 'someExt' == alkahest.ext.someExt.
		        // what to do?
				newValue = 'return alkahest.ext.' + newValue + '(event);'
		        break;
	        case '!': // toggle on/off
		        // split value by spaces
		        var existingValues = existingValue.split(' ');
		        // check for value...
		        var key = existingValues.indexOf(newValue) // TODO indexOf missing from IE8

		        if (key > -1) {
		        	// ... exists.  Remove it.
		        	console.debug('removed', existingValues.splice(key, 1))
		        }
		        else {
		        	// ... doesn't exist.  Add it.
		        	existingValues.push(newValue)
		        }
		        // join with spaces
		        newValue = existingValues.join(' ')


		        break;
		    default:
		        console.error('invalid newOperator', newOperator);
		}
	}
    
    /// modify all elements
	var els = document.querySelectorAll( selector )
    var i = 0;
		for( i=0; i < els.length; i++ ) {
			/// save into attr or into innertext?
			tag = els[i].tagName.toLowerCase()
			if (attribute == 'value' && alkahest.private.valuables.indexOf(tag) === -1) { 
				els[i].textContent = newValue;
			}
			else { // attr, when a=value and tag=input
	        if(els[i].hasAttribute( attribute ) == false) {
				var a = document.createAttribute( attribute );
				a.value = newValue;
				els[i].setAttributeNode(a);
	        }
	        else {
	        	$( selector ).attr(attribute, newValue)		
	        	els[i].setAttribute(attribute, newValue);
	        }
			}
		}
	
}
