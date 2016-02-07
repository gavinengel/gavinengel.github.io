/**
 * Process nested json, of DOM objects & events
 */
window.eql = {
	ver: '0.0.1',
	debug: false,
	ext: {},
	private: {}
}

/**
 *
 */
eql.mix = function(O, p, opts) {
	if (p) { this.private.selectors.push(p); }

	for (var property in O) {
		var value 	 = O[property]
	 
	 	// Array?
	 	if (Array.isArray(value)) {
			newValue = this.private.unstring(value[1], opts);
			newOperator = value[0]
			this.private.set(property, newValue, newOperator)
		}
		// String?
		else if (typeof value === 'string' || value instanceof String) {
			this.private.set(property, this.private.unstring(value))
		}
		// Function?
		else if (typeof value === 'function') {
			this.private.set(property, value)	
		}

		// Plain Object?
		else if (typeof value == 'object' && value.constructor == Object) {
			if (property.charAt(0) == '@') {


				var selector = eql.private.selectors.join(' ')
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
						    eql.mix(newMix, null, {el: e.target, e: e});
						});
					}
				}
				else {
					console.error('bad rule', property)
				}
				
				this.private.selectors.pop()
				return;
			}
			else if (Object.keys(value).length > 0) {
				this.mix(value, property, opts);	
			}
			
		}
		else {
			console.error('invalid value', value)
		}
	}
	this.private.selectors.pop()
}

/**
 * 
 */
eql.private.valuables = ['input']

/**
 * 
 */
eql.private.selectors = []


/**
 * 
 */
eql.private.unstring = function(value, opts) {
	if ((typeof value === 'string' || value instanceof String) && value.charAt(0) == '`') {
		// if the VALUE is surrounded by `` marks, remove them.  It shouldn't be seen as a String.
		// remove ` from ends
		value = value.substr(1).slice(0, -1)

		//// a) trigger event
		if (value.charAt(0) == '@') {
			// remove @ from front
			value = value.slice(1)
		}
		//// a) extension stringer
		else if (value.charAt(0) == '%') {
			// remove % from front
			value = value.slice(1)
			value = 'return eql.ext.' + value + '(event);'
		}
		//// a) extension caller
		else if (value.charAt(0) == '$') {
			// remove % from front
			extName = value.slice(1)
			//value = 'return eql.ext.' + value + '(event);'
			ext = eql.ext[extName]
	
			var e = {}
			if (opts && opts.hasOwnProperty('e')) {
    			e = opts.e;
    		}

			value = ext(e)
			//TODO trigger that event!
		}
		// b) new sel & attribute: 	#foo .bar & data-foo
		else if (value.indexOf('&') != -1) {
			var values = value.split('&')
			value = eql.private.get(values[1], values[0], opts) 
		}
		// c) empty or attribute from same selector: 		data-foo
		else {
			if (value.length) {
				value = eql.private.get(value, null, opts)	
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
eql.private.get = function(attribute, differentSelector, opts) {
	var result = ''

	if (differentSelector) {
		selector = differentSelector
	}
	else {
		selector = eql.private.selectors.join(' ')	
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
			if (attribute == 'value' && eql.private.valuables.indexOf(tag) === -1) { // use textcontent
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
eql.private.set = function(attribute, newValue, newOperator, opts) {
	
	/// determine proper `selector`
	if(attribute.indexOf('&') !== -1) {
		var pieces = attribute.split('&')
		selector = pieces[0].trim()
		attribute = pieces[1].trim()
	}
	else {
		selector = eql.private.selectors.join(' ')
	}

	/// determine final `value`
	if (newOperator) {
		var existingValue = eql.private.get(attribute, selector)
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
		        // newValue == 'someExt' == eql.ext.someExt.
		        // what to do?
				newValue = 'return eql.ext.' + newValue + '(event);'
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
			if (attribute == 'value' && eql.private.valuables.indexOf(tag) === -1) { 
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
