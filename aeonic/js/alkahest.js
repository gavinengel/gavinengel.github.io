/**
 * Alkahest.js
 * `Alchemy for DOM Events and Attributes` 
 * example usage: alkahest.fetch('/aeon.json', alkahest.mix)
 */
window.alkahest = {
    ver: '0.0.9',
    debug: false,
    condOper: ['!=', '>=', '<=', '>', '<', '='], // add single char conditions at end of array
    ext: {},
    priv: {
        mixxers: {},
        valuables: ['input'],
        selectors: []
    },
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
alkahest.fetch = function (path, success, error) {
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
alkahest.compare = function(lft, oper, rgt, typecast) {
    result = false

    if (alkahest.debug) console.log({lft:lft, oper:oper, rgt:rgt})


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

    if (alkahest.debug) console.log({lft:lft, oper:oper, rgt:rgt, result:result})

    return result
}

/**
 *
 */
alkahest.mix = function(O, p, opts) {
    if (p) { alkahest.priv.selectors.push(p); }

    for (var property in O) {
        var value      = O[property]

        alkahest.proc.opts = opts
        alkahest.proc.src.attr = value
        alkahest.proc.tar.attr = property

        // Array?
        if (Array.isArray(value)) {
            alkahest.priv.mixxers.mixArray(property, value)
        }
    
        // String?
        else if (typeof value === 'string' || value instanceof String) {
            alkahest.priv.set(property, alkahest.priv.unstring(value))
        }
    
        // Function?
        else if (typeof value === 'function') {
            alkahest.priv.set(property, value)    
        }

        // Plain Object?
        else if (typeof value == 'object' && value.constructor == Object) {
            alkahest.priv.mixxers.mixObject(property, value)
        }
        else if (typeof value === 'boolean' || typeof value === 'number') {
            alkahest.priv.set(property, value)    
        }
        else {
            console.error('invalid value', value)
        }
    }
    alkahest.priv.selectors.pop()
}

/**
 *
 */
alkahest.priv.mixxers.mixObject = function(property, value) {
    if (property.charAt(0) == '@') {
        alkahest.priv.mixxers.mixRule(property, value)
    }
    else if (Object.keys(value).length > 0) {
        alkahest.mix(value, property, alkahest.proc.opts);    
    }
}

/**
 *
 */
alkahest.priv.mixxers.mixArray = function(property, value) {
    newValue = alkahest.priv.unstring(value[1], alkahest.proc.opts)
    newOperator = value[0]
    alkahest.priv.set(property, newValue, newOperator)
}

/**
 *
 */
alkahest.priv.mixxers.mixRule = function(property, value) {
    var selector = alkahest.priv.selectors.join(' ')
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
            eventCond = alkahest.priv.parseCondition(wholeCond)
            if (!eventCond.oper) {
                eventCond = { lft: 'type' , oper: '=' , rgt: eventCond.lft }
            }

            eventConds.push(eventCond)
        }

    }

    if (rule.substr(0, 2) == 'on') {
        alkahest.priv.mixxers.mixOnRule(selector, value, rule, wholeConds, eventConds)
    }
    else if (rule == 'if') {
        alkahest.priv.mixxers.mixIfRule(property, value)
    }
    else if (rule == 'else') {
        alkahest.priv.mixxers.mixElseRule(value)
    }
    else {
        console.error('bad rule', {rule: rule}); debugger
    }
}

/**
 *
 */
alkahest.priv.mixxers.mixOnRule = function (selector, value, rule, wholeConds, eventConds){
    
    if (rule != 'on') {
        // is @onEvent rule.
        eventConds.push({ eventType: rule.slice(2) })
    }

    for( i=0; i < eventConds.length; i++ ) {
        eventType = eventConds[i].eventType || eventConds[i].rgt
        alkahest.priv.addListeners(eventType, eventConds[i], selector, value)
    }
}


/**
 *
 */
alkahest.priv.mixxers.mixIfRule = function (property, value) {
// obtain the the left, op, and right from the condition
        var pieces = property.split('(')
        var pieces = pieces[1].split(')')
        alkahest.proc.cond.raw = pieces[0].trim()
        if ( alkahest.priv.evalIf( alkahest.proc.cond.raw ) ) { 
            alkahest.mix(value, null, alkahest.proc.opts)
        }
}

/**
 *
 */
alkahest.priv.mixxers.mixElseRule = function (value) {
    // obtain the the left, op, and right from the condition
    if (alkahest.proc.cond.result === false) {
        alkahest.mix(value, null, alkahest.proc.opts)
    }
    alkahest.proc.cond.result = null
}


/**
 *
 */
alkahest.priv.addListeners = function (eventType, eventCond, selector, value) {
    // we must add a listener for the current selector + this onEvent.
    var els = document.querySelectorAll( selector )

    for (var i=0; i < els.length; i++ ) {
        newMix = {}
        newMix[selector] = value

        // stash the event data for later use (by saving key to new element attribute)
        var a = document.createAttribute( 'data-' + eventType + '-eid'  )
        var eId = ++alkahest.proc.eId
        alkahest.proc.eData[ eId ] = { aeon: newMix, condition: eventCond }
        a.value = eId
        els[i].setAttributeNode( a )

        els[i].addEventListener(eventType, function(e){
            if (alkahest.debug) console.log(e)
            eAttr = 'data-' + e.type + '-eid'
            eId = e.target.getAttribute( eAttr )
            eData = alkahest.proc.eData[ eId ]

            var condResult = true
            if (eData.condition.lft) { 
                if (eData.condition.oper && eData.condition.rgt) {
                    if (alkahest.debug) console.log('3 part condition found', {e:e, eData: eData})

                    condResult = alkahest.compare(e[eData.condition.lft], eData.condition.oper, eData.condition.rgt)
                }    
                else {
                    if (alkahest.debug) console.log('1 part condition found', {e:e, eData: eData})

                    if (!e[eData.condition.lft]) condResult = false
                }
            }
            else {
                if (alkahest.debug) console.log('no event condition', eventCond)

            }
            
            if (condResult) { 
                if (alkahest.debug) console.log('condition passed', {e:e, eData: eData})
                alkahest.mix(eData.aeon, null, {el: e.target, e: e})

            }
            else {
                if (alkahest.debug) console.log('condition failed', {e:e, eData: eData})
            }
        })
    }
}

/**
 *
 */
alkahest.priv.evalIf = function (expression) {
    result = false; // aka: alkahest.proc.cond.result

    var withoutSel = alkahest.proc.cond.attr = expression
                    
    // is extension-exec?
    if (withoutSel.charAt(0) == '$') {
        // extension-exec
        alkahest.proc.cond.ext = withoutSel.substr(1)    
        // execute it
        var ext = alkahest.ext[ alkahest.proc.cond.ext ]
        var e = {}
        if (alkahest.proc.opts && alkahest.proc.opts.hasOwnProperty('e')) {
            e = alkahest.proc.opts.e
        }

        alkahest.proc.cond.extReturn = ext(e)
        if (alkahest.proc.cond.extReturn === true) alkahest.proc.cond.result = true
    }
    else {
        // not extension-exec
        if (alkahest.proc.cond.raw.indexOf('&') != -1) {
            pieces = alkahest.proc.cond.raw.split('&')
            alkahest.proc.cond.sel = pieces[0].trim()
            alkahest.proc.cond.attr = withoutSel = pieces[1].trim()
        }    

        var trio = alkahest.priv.parseCondition(withoutSel)

        alkahest.proc.cond.lft = alkahest.priv.get(alkahest.proc.cond.attr, alkahest.proc.cond.sel)

        console.log('get cond result from:', alkahest.proc.cond)
        if (alkahest.proc.cond.oper) {
            alkahest.proc.cond.result = alkahest.compare(alkahest.proc.cond.lft, alkahest.proc.cond.oper, alkahest.proc.cond.rgt)
        }
        else if (alkahest.proc.cond.lft) {
            alkahest.proc.cond.result = true
        }

        result = alkahest.proc.cond.result
    }

    return result
}

/**
 *
 */
alkahest.priv.parseCondition = function (condition) {
    var trio = {
        lft: condition,
        oper: '',
        rgt: '',
    }

    for (var i=0; i < alkahest.condOper.length; i++ ) {
        if (condition.indexOf( alkahest.condOper[i] ) != -1) {
            if (alkahest.debug) console.log('found a conditional operator:', alkahest.condOper[i])
            trio.oper = alkahest.proc.cond.oper = alkahest.condOper[i]
            pieces = condition.split( alkahest.proc.cond.oper )
            trio.lft = alkahest.proc.cond.attr = pieces[0].trim()
            trio.rgt = alkahest.proc.cond.rgt = pieces[1].trim()
            break
        }
    }

    return trio
}

/**
 * 
 */
alkahest.priv.unstring = function(value, opts) {
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

            // if: extension-link
            if (alkahest.proc.tar.attr.slice(0, 2) == 'on') {
                value = 'return alkahest.ext.' + value + '(event);'
            }
            // else: extension-exec
            else {
                //value = 'return alkahest.ext.' + value + '(event);'
                ext = alkahest.ext[value]
        
                var e = {}
                if (opts && opts.hasOwnProperty('e')) {
                    e = opts.e
                }

                value = ext(e)
            }
        }

        // b) new sel & attribute:     #foo .bar & data-foo
        else if (value.indexOf('&') != -1) {
            var values = value.split('&')


            alkahest.proc.src.attr = values[1]
            alkahest.proc.src.sel = values[0]

            value = alkahest.priv.get(values[1], values[0], opts) 
        }
        // c) empty or attribute from same selector:         data-foo
        else {
            if (value.length) {
                value = alkahest.priv.get(value, null, opts)    
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
alkahest.priv.get = function(attribute, differentSelector, opts) {
    var result = ''

    if (differentSelector) {
        selector = differentSelector
    }
    else {
        selector = alkahest.priv.selectors.join(' ')    
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
        if (attribute == 'value' && alkahest.priv.valuables.indexOf(tag) === -1) { // use textcontent
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
alkahest.priv.operate = function (selector, attribute, newOperator, newValue) {
    var existingValue = alkahest.priv.get(attribute, selector)
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
            newValue = 'return alkahest.ext.' + newValue + '(event);'
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
alkahest.priv.set = function(selatts, newValue, newOperator, opts) {
    
    if (selatts.indexOf('&') !== -1) {
        var pieces = selatts.split('&')
        selector = pieces[0].trim()
        attribute = pieces[1].trim()
    }
    else {
        selector = alkahest.priv.selectors.join(' ')
        attribute = selatts
    }

    /// determine final `value`
    if (newOperator) {
        newValue = alkahest.priv.operate(selector, attribute, newOperator, newValue)
    }

    if (!selector) debugger

    /// modify all elements
    var els = document.querySelectorAll( selector )
    var i = 0
    for( i=0; i < els.length; i++ ) {
        alkahest.priv.setAttribute(els[i], attribute, newValue)
    }
    
}

/**
 *
 */
alkahest.priv.setAttribute = function(el, attribute, newValue) {
    tag = el.tagName.toLowerCase()
    if (attribute == 'value' && alkahest.priv.valuables.indexOf(tag) === -1) { 
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