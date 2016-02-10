/**
 * Aeonic.js
 * `Controller for DOM Events and Attributes` 
 * example usage: zeonic.fetch('/aeon.json', zeonic.mix)
 * Public methods:
 * - fetch
 * - mix
 */
window.zeonic = {
    ver: '0.1.0',
    debug: false,
    condOper: ['!=', '>=', '<=', '>', '<', '='], // add single char conditions at end of array
    ext: {},
    // these internal *will* change names frequently, and without notice... 
    priv: {
        mixxers: {},
        valuables: ['input'],
        selectors: []
    },
    // ... as will these data store names.
    proc: {
        opts: {},
        e: {},
        eId: 0,
        eData: {},
        sel: "",
        eventType: "",
        cond: {
            raw: "",
            sel: "",
            attr: "",
            ext: "",
            extReturn: null,
            oper: "",
            lft: "",
            rgt: "",
            result: null
        },
        src: {},
        tar: {}
    }
}

/**
 *
 */
zeonic.fetch = function (path, success, error) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success) success(JSON.parse(xhr.responseText))
            } else {
                if (error) error(xhr)
            }
        }
    }
    xhr.open("GET", path, true)
    xhr.send()
}


/**
 *
 */
zeonic.mix = function(O, p, opts) {
    if (p) { zeonic.priv.selectors.push(p); }

    for (var property in O) {
        var value      = O[property]

        zeonic.proc.opts = opts
        zeonic.proc.src.attr = value
        zeonic.proc.tar.attr = property

        // Array?
        if (Array.isArray(value)) {
            zeonic.priv.mixxers.mixArray(property, value)
        }
    
        // String?
        else if (typeof value === 'string' || value instanceof String) {
            zeonic.priv.set(property, zeonic.priv.unstring(value))
        }
    
        // Function?
        else if (typeof value === 'function') {
            zeonic.priv.set(property, value)    
        }

        // Plain Object?
        else if (typeof value == 'object' && value.constructor == Object) {
            zeonic.priv.mixxers.mixObject(property, value)
        }
        else if (typeof value === 'boolean' || typeof value === 'number') {
            zeonic.priv.set(property, value)    
        }
        else {
            console.error('invalid value', value)
        }
    }
    zeonic.priv.selectors.pop()
}

/**
 *
 */
zeonic.priv.compare = function(lft, oper, rgt, typecast) {
    result = false

    if (zeonic.debug) console.log({lft:lft, oper:oper, rgt:rgt})


    typecast = typecast || typeof lft;

    if (typecast == 'number') {
        lft = parseFloat(lft)
        rgt = parseFloat(rgt)

    }
    else if (typecast == 'boolean') {
        lft = JSON.parse(lft)
        rgt = JSON.parse(rgt)

    }

    switch(oper) {
        case '=':
            if (lft == rgt) result = true
            break
        case '!=':
            if (lft != rgt) result = true
            break
        case '<':
            if (lft < rgt) result = true
            break
        case '>':
            if (lft > rgt) result = true
            break
        case '<=':
            if (lft <= rgt) result = true
            break
        case '>=':
            if (lft >= rgt) result = true
            break
        default:
            console.error('invalid oper', oper)
    }

    if (zeonic.debug) console.log({lft:lft, oper:oper, rgt:rgt, result:result})

    return result
}


/**
 *
 */
zeonic.priv.mixxers.mixObject = function(property, value) {
    if (property.charAt(0) == '@') {
        zeonic.priv.mixxers.mixRule(property, value)
    }
    else if (Object.keys(value).length > 0) {
        zeonic.mix(value, property, zeonic.proc.opts);    
    }
}

/**
 *
 */
zeonic.priv.mixxers.mixArray = function(property, value) {
    newValue = zeonic.priv.unstring(value[1], zeonic.proc.opts)
    newOperator = value[0]
    zeonic.priv.set(property, newValue, newOperator)
}

/**
 *
 */
zeonic.priv.mixxers.mixRule = function(property, value) {
    var selector = zeonic.priv.selectors.join(' ')
    // is a rule.  do not add this to selectors.

    // get `rule`
    var pieces = property.split('(')
    var rule = pieces[0].substr(1).trim().toLowerCase()

    // get `eventConds`
    wholeConds = ''
    eventConds = [] // [{ lft: '', op: '', rgt: '' }]
    if (pieces[1]) {
        pieces = pieces[1].split(')')
        wholeConds = pieces[0].trim()
        condsPieces = wholeConds.split(';')
        
        for (var i = 0; i < condsPieces.length; i++) {
            wholeCond = condsPieces[ i ].trim()
            eventCond = zeonic.priv.parseCondition(wholeCond)
            if (!eventCond.oper) {
                eventCond = { lft: 'type' , oper: '=' , rgt: eventCond.lft }
            }

            eventConds.push(eventCond)
        }

    }

    if (rule.substr(0, 2) == 'on') {
        zeonic.priv.mixxers.mixOnRule(selector, value, rule, wholeConds, eventConds)
    }
    else if (rule == 'if') {
        zeonic.priv.mixxers.mixIfRule(property, value)
    }
    else if (rule == 'else') {
        zeonic.priv.mixxers.mixElseRule(value)
    }
    else {
        console.error('bad rule', {rule: rule}); debugger
    }
}

/**
 *
 */
zeonic.priv.mixxers.mixOnRule = function (selector, value, rule, wholeConds, eventConds){
    
    if (rule != 'on') {
        // is @onEvent rule.
        eventConds.push({ eventType: rule.slice(2) })
    }

    for( i=0; i < eventConds.length; i++ ) {
        eventType = eventConds[i].eventType || eventConds[i].rgt
        zeonic.priv.addListeners(eventType, eventConds[i], selector, value)
    }
}


/**
 *
 */
zeonic.priv.mixxers.mixIfRule = function (property, value) {
// obtain the the left, op, and right from the condition
        var pieces = property.split('(')
        var pieces = pieces[1].split(')')
        zeonic.proc.cond.raw = pieces[0].trim()
        if ( zeonic.priv.evalIf( zeonic.proc.cond.raw ) ) { 
            zeonic.mix(value, null, zeonic.proc.opts)
        }
}

/**
 *
 */
zeonic.priv.mixxers.mixElseRule = function (value) {
    // obtain the the left, op, and right from the condition
    if (zeonic.proc.cond.result === false) {
        zeonic.mix(value, null, zeonic.proc.opts)
    }
    zeonic.proc.cond.result = null
}


/**
 *
 */
zeonic.priv.addListeners = function (eventType, eventCond, selector, value) {
    // we must add a listener for the current selector + this onEvent.
    var els = document.querySelectorAll( selector )

    for (var i=0; i < els.length; i++ ) {
        newMix = {}
        newMix[selector] = value

        // stash the event data for later use (by saving key to new element attribute)
        var a = document.createAttribute( 'data-' + eventType + '-eid'  )
        var eId = ++zeonic.proc.eId
        zeonic.proc.eData[ eId ] = { aeon: newMix, condition: eventCond }
        a.value = eId
        els[i].setAttributeNode( a )

        els[i].addEventListener(eventType, function(e){
            if (zeonic.debug) console.log(e)
            eAttr = 'data-' + e.type + '-eid'
            eId = e.target.getAttribute( eAttr )
            eData = zeonic.proc.eData[ eId ]

            var condResult = true
            if (eData.condition.lft) { 
                if (eData.condition.oper && eData.condition.rgt) {
                    if (zeonic.debug) console.log('3 part condition found', {e:e, eData: eData})

                    condResult = zeonic.priv.compare(e[eData.condition.lft], eData.condition.oper, eData.condition.rgt)
                }    
                else {
                    if (zeonic.debug) console.log('1 part condition found', {e:e, eData: eData})

                    if (!e[eData.condition.lft]) condResult = false
                }
            }
            else {
                if (zeonic.debug) console.log('no event condition', eventCond)

            }
            
            if (condResult) { 
                if (zeonic.debug) console.log('condition passed', {e:e, eData: eData})
                zeonic.mix(eData.aeon, null, {el: e.target, e: e})

            }
            else {
                if (zeonic.debug) console.log('condition failed', {e:e, eData: eData})
            }
        })
    }
}

/**
 *
 */
zeonic.priv.evalIf = function (expression) {
    result = false; // aka: zeonic.proc.cond.result

    var withoutSel = zeonic.proc.cond.attr = expression
                    
    // is extension-exec?
    if (withoutSel.charAt(0) == '$') {
        // extension-exec
        zeonic.proc.cond.ext = withoutSel.substr(1)    
        // execute it
        var ext = zeonic.ext[ zeonic.proc.cond.ext ]
        var e = {}
        if (zeonic.proc.opts && zeonic.proc.opts.hasOwnProperty('e')) {
            e = zeonic.proc.opts.e
        }

        zeonic.proc.cond.extReturn = ext(e)
        if (zeonic.proc.cond.extReturn === true) zeonic.proc.cond.result = true
    }
    else {
        // not extension-exec
        if (zeonic.proc.cond.raw.indexOf('&') != -1) {
            pieces = zeonic.proc.cond.raw.split('&')
            zeonic.proc.cond.sel = pieces[0].trim()
            zeonic.proc.cond.attr = withoutSel = pieces[1].trim()
        }    

        var trio = zeonic.priv.parseCondition(withoutSel)

        zeonic.proc.cond.lft = zeonic.priv.get(zeonic.proc.cond.attr, zeonic.proc.cond.sel)

        console.log('get cond result from:', zeonic.proc.cond)
        if (zeonic.proc.cond.oper) {
            zeonic.proc.cond.result = zeonic.priv.compare(zeonic.proc.cond.lft, zeonic.proc.cond.oper, zeonic.proc.cond.rgt)
        }
        else if (zeonic.proc.cond.lft) {
            zeonic.proc.cond.result = true
        }

        result = zeonic.proc.cond.result
    }

    return result
}

/**
 *
 */
zeonic.priv.parseCondition = function (condition) {
    var trio = {
        lft: condition,
        oper: '',
        rgt: '',
    }

    for (var i=0; i < zeonic.condOper.length; i++ ) {
        if (condition.indexOf( zeonic.condOper[i] ) != -1) {
            if (zeonic.debug) console.log('found a conditional operator:', zeonic.condOper[i])
            trio.oper = zeonic.proc.cond.oper = zeonic.condOper[i]
            pieces = condition.split( zeonic.proc.cond.oper )
            trio.lft = zeonic.proc.cond.attr = pieces[0].trim()
            trio.rgt = zeonic.proc.cond.rgt = pieces[1].trim()
            break
        }
    }

    return trio
}

/**
 * 
 */
zeonic.priv.unstring = function(value, opts) {
    if ((typeof value === 'string' || value instanceof String) && value.charAt(0) == '`') {
        // if the VALUE is surrounded by `` marks, remove them.  It shouldn't be seen as a String.
        // remove ` from ends
        value = value.substr(1).slice(0, -1)

        //// a) trigger event
        if (value.charAt(0) == '@') {
            // remove @ from front
            value = value.slice(1)
        }
        // else if: extension:
        else if (value.charAt(0) == '$') { 
            value = value.slice(1)

            parent = {}
            parentName = ''
            if (typeof zeonic.ext[value] != 'undefined') {
                parent = zeonic.ext
                parentName = 'zeonic.ext'
            }
            else if (typeof window[value] != 'undefined') {
                parent = window
                parentName = 'window'
            }
            else {
                console.error('invalid value:', value); debugger
            }

            // if: extension-link
            if (zeonic.proc.tar.attr.slice(0, 2) == 'on') {
                value = 'return ' + parentName + '.' + value + '(event);'
            }
            // else: extension-exec or extension-value
            else {

                if (typeof parent[value] === 'function') {
                    ext = parent[value]
            
                    var e = {}
                    if (opts && opts.hasOwnProperty('e')) {
                        e = opts.e
                    }

                    value = ext(e)
                }
                // ... or if simple variable, get it
                else {
                    value = parent[value]
                }

            }
        }

        // b) new sel & attribute:     #foo .bar & data-foo
        else if (value.indexOf('&') != -1) {
            var values = value.split('&')

            zeonic.proc.src.attr = values[1]
            zeonic.proc.src.sel = values[0]

            value = zeonic.priv.get(values[1], values[0], opts) 
        }
        // c) empty or attribute from same selector:         data-foo
        else {
            if (value.length) {
                value = zeonic.priv.get(value, null, opts)    
            }
            else {
                value = ''
            }
        }
    }

    return value
}

/**
 * 
 */
zeonic.priv.get = function(attribute, differentSelector, opts) {
    var result = ''

    if (differentSelector) {
        selector = differentSelector
    }
    else {
        selector = zeonic.priv.selectors.join(' ')    
    }
    
    if (opts && opts.hasOwnProperty('el')) {
        var el = opts.el
    }
    else {
        var el = document.querySelector( selector )
    }

    if (el) {
        // attr or textcontent?
        tag = el.tagName.toLowerCase()
        if (attribute == 'value' && zeonic.priv.valuables.indexOf(tag) === -1) { // use textcontent
            result = el.textContent
        }
        else { // attr, when a=value and tag=input
            result = el.getAttribute( attribute )
        }

        if (result === undefined || result === null) {
			result = ''
        }
    }
    
    return result
}


/**
 *
 */
zeonic.priv.operate = function (selector, attribute, newOperator, newValue) {
    var existingValue = zeonic.priv.get(attribute, selector)
    switch(newOperator) {
        case '+':
            newValue += existingValue
            break
        case '-':
            newValue -= existingValue
            break
        case '*':
            newValue *= existingValue
            break
        case '/':
            newValue /= existingValue
            break
        case '%':
            newValue %= existingValue
            break
        case '&':
            newValue = existingValue.concat(newValue)
            break
        case '$':
            // this is calling an extension.
            newValue = 'return zeonic.ext.' + newValue + '(event);'
            break
        case '!': // toggle on/off
            // split value by spaces
            var existingValues = existingValue.split(' ')
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
            newValue = existingValues.join(' ')
            break
        default:
            console.error('invalid newOperator', newOperator)
    }

    return newValue
}

/**
 * 
 */
zeonic.priv.set = function(selatts, newValue, newOperator, opts) {
    
    // if a javascript element...
    if (selatts.charAt(0) == '$') {
        rawTarget = selatts.substr(1)
        // split on dot
        pieces = rawTarget.split('.')

        // first, search in aenic.ext
        extLink = zeonic.ext
        for (var i = 0; i < pieces.length-1; i++) {

            if (typeof extLink[ pieces[i] ] != 'undefined') {
                extLink = extLink[ pieces[i] ]
            }
            else {
                extLink = null
                break
            }
        }

        // else use global
        if (!extLink) {
            extLink = window
            for (var i = 0; i < pieces.length-1; i++) {

                if (typeof extLink[ pieces[i] ] != 'undefined') {
                    extLink = extLink[ pieces[i] ]
                }
                else {
                    extLink = null
                    break
                }
            }
        }
        // final param of pieces is the element to update/call
        if (pieces.length > 1) {

            target = pieces.pop()
        }

        // set the target
        if (extLink !== null) { 
            if (typeof extLink[target] == 'function') {
                ext = extLink[target]
                ext(newValue)
            }
            else {
                if (newOperator) {
                    newValue = zeonic.priv.operate(selector, attribute, newOperator, newValue)
                }

                extLink[target] = newValue
            }
        }
        else {
            console.error('invalid property target', selatts); debugger; 
        }


    }
    // ... else, set DOM object
    else {
        if (selatts.indexOf('&') !== -1) {
            var pieces = selatts.split('&')
            selector = pieces[0].trim()
            attribute = pieces[1].trim()
        }
        else {
            selector = zeonic.priv.selectors.join(' ')
            attribute = selatts
        }

        /// determine final `value`
        if (newOperator) {
            newValue = zeonic.priv.operate(selector, attribute, newOperator, newValue)
        }

        if (!selector) debugger

        /// modify all elements
        var els = document.querySelectorAll( selector )
        var i = 0
        for( i=0; i < els.length; i++ ) {
            zeonic.priv.setAttribute(els[i], attribute, newValue)
        }

    }
    
}

/**
 *
 */
zeonic.priv.setAttribute = function(el, attribute, newValue) {
    tag = el.tagName.toLowerCase()
    if (attribute == 'value' && zeonic.priv.valuables.indexOf(tag) === -1) { 
        el.textContent = newValue
    }
    else { // attr, when a=value and tag=input
        if(el.hasAttribute( attribute ) == false) {
            var a = document.createAttribute( attribute )
            a.value = newValue
            el.setAttributeNode(a)
        }
        else {
            $( selector ).attr(attribute, newValue)        
            el.setAttribute(attribute, newValue)
        }
    }
}