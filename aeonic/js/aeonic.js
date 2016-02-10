/**
 * Alkahest.js
 * `Alchemy for DOM Events and Attributes` 
 * example usage: aeonic.fetch('/aeon.json', aeonic.mix)
 * Public methods:
 * - fetch
 * - mix
 */
window.aeonic = {
    ver: '0.0.10',
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
aeonic.fetch = function (path, success, error) {
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
aeonic.mix = function(O, p, opts) {
    if (p) { aeonic.priv.selectors.push(p); }

    for (var property in O) {
        var value      = O[property]

        aeonic.proc.opts = opts
        aeonic.proc.src.attr = value
        aeonic.proc.tar.attr = property

        // Array?
        if (Array.isArray(value)) {
            aeonic.priv.mixxers.mixArray(property, value)
        }
    
        // String?
        else if (typeof value === 'string' || value instanceof String) {
            aeonic.priv.set(property, aeonic.priv.unstring(value))
        }
    
        // Function?
        else if (typeof value === 'function') {
            aeonic.priv.set(property, value)    
        }

        // Plain Object?
        else if (typeof value == 'object' && value.constructor == Object) {
            aeonic.priv.mixxers.mixObject(property, value)
        }
        else if (typeof value === 'boolean' || typeof value === 'number') {
            aeonic.priv.set(property, value)    
        }
        else {
            console.error('invalid value', value)
        }
    }
    aeonic.priv.selectors.pop()
}

/**
 *
 */
aeonic.priv.compare = function(lft, oper, rgt, typecast) {
    result = false

    if (aeonic.debug) console.log({lft:lft, oper:oper, rgt:rgt})


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

    if (aeonic.debug) console.log({lft:lft, oper:oper, rgt:rgt, result:result})

    return result
}


/**
 *
 */
aeonic.priv.mixxers.mixObject = function(property, value) {
    if (property.charAt(0) == '@') {
        aeonic.priv.mixxers.mixRule(property, value)
    }
    else if (Object.keys(value).length > 0) {
        aeonic.mix(value, property, aeonic.proc.opts);    
    }
}

/**
 *
 */
aeonic.priv.mixxers.mixArray = function(property, value) {
    newValue = aeonic.priv.unstring(value[1], aeonic.proc.opts)
    newOperator = value[0]
    aeonic.priv.set(property, newValue, newOperator)
}

/**
 *
 */
aeonic.priv.mixxers.mixRule = function(property, value) {
    var selector = aeonic.priv.selectors.join(' ')
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
            eventCond = aeonic.priv.parseCondition(wholeCond)
            if (!eventCond.oper) {
                eventCond = { lft: 'type' , oper: '=' , rgt: eventCond.lft }
            }

            eventConds.push(eventCond)
        }

    }

    if (rule.substr(0, 2) == 'on') {
        aeonic.priv.mixxers.mixOnRule(selector, value, rule, wholeConds, eventConds)
    }
    else if (rule == 'if') {
        aeonic.priv.mixxers.mixIfRule(property, value)
    }
    else if (rule == 'else') {
        aeonic.priv.mixxers.mixElseRule(value)
    }
    else {
        console.error('bad rule', {rule: rule}); debugger
    }
}

/**
 *
 */
aeonic.priv.mixxers.mixOnRule = function (selector, value, rule, wholeConds, eventConds){
    
    if (rule != 'on') {
        // is @onEvent rule.
        eventConds.push({ eventType: rule.slice(2) })
    }

    for( i=0; i < eventConds.length; i++ ) {
        eventType = eventConds[i].eventType || eventConds[i].rgt
        aeonic.priv.addListeners(eventType, eventConds[i], selector, value)
    }
}


/**
 *
 */
aeonic.priv.mixxers.mixIfRule = function (property, value) {
// obtain the the left, op, and right from the condition
        var pieces = property.split('(')
        var pieces = pieces[1].split(')')
        aeonic.proc.cond.raw = pieces[0].trim()
        if ( aeonic.priv.evalIf( aeonic.proc.cond.raw ) ) { 
            aeonic.mix(value, null, aeonic.proc.opts)
        }
}

/**
 *
 */
aeonic.priv.mixxers.mixElseRule = function (value) {
    // obtain the the left, op, and right from the condition
    if (aeonic.proc.cond.result === false) {
        aeonic.mix(value, null, aeonic.proc.opts)
    }
    aeonic.proc.cond.result = null
}


/**
 *
 */
aeonic.priv.addListeners = function (eventType, eventCond, selector, value) {
    // we must add a listener for the current selector + this onEvent.
    var els = document.querySelectorAll( selector )

    for (var i=0; i < els.length; i++ ) {
        newMix = {}
        newMix[selector] = value

        // stash the event data for later use (by saving key to new element attribute)
        var a = document.createAttribute( 'data-' + eventType + '-eid'  )
        var eId = ++aeonic.proc.eId
        aeonic.proc.eData[ eId ] = { aeon: newMix, condition: eventCond }
        a.value = eId
        els[i].setAttributeNode( a )

        els[i].addEventListener(eventType, function(e){
            if (aeonic.debug) console.log(e)
            eAttr = 'data-' + e.type + '-eid'
            eId = e.target.getAttribute( eAttr )
            eData = aeonic.proc.eData[ eId ]

            var condResult = true
            if (eData.condition.lft) { 
                if (eData.condition.oper && eData.condition.rgt) {
                    if (aeonic.debug) console.log('3 part condition found', {e:e, eData: eData})

                    condResult = aeonic.priv.compare(e[eData.condition.lft], eData.condition.oper, eData.condition.rgt)
                }    
                else {
                    if (aeonic.debug) console.log('1 part condition found', {e:e, eData: eData})

                    if (!e[eData.condition.lft]) condResult = false
                }
            }
            else {
                if (aeonic.debug) console.log('no event condition', eventCond)

            }
            
            if (condResult) { 
                if (aeonic.debug) console.log('condition passed', {e:e, eData: eData})
                aeonic.mix(eData.aeon, null, {el: e.target, e: e})

            }
            else {
                if (aeonic.debug) console.log('condition failed', {e:e, eData: eData})
            }
        })
    }
}

/**
 *
 */
aeonic.priv.evalIf = function (expression) {
    result = false; // aka: aeonic.proc.cond.result

    var withoutSel = aeonic.proc.cond.attr = expression
                    
    // is extension-exec?
    if (withoutSel.charAt(0) == '$') {
        // extension-exec
        aeonic.proc.cond.ext = withoutSel.substr(1)    
        // execute it
        var ext = aeonic.ext[ aeonic.proc.cond.ext ]
        var e = {}
        if (aeonic.proc.opts && aeonic.proc.opts.hasOwnProperty('e')) {
            e = aeonic.proc.opts.e
        }

        aeonic.proc.cond.extReturn = ext(e)
        if (aeonic.proc.cond.extReturn === true) aeonic.proc.cond.result = true
    }
    else {
        // not extension-exec
        if (aeonic.proc.cond.raw.indexOf('&') != -1) {
            pieces = aeonic.proc.cond.raw.split('&')
            aeonic.proc.cond.sel = pieces[0].trim()
            aeonic.proc.cond.attr = withoutSel = pieces[1].trim()
        }    

        var trio = aeonic.priv.parseCondition(withoutSel)

        aeonic.proc.cond.lft = aeonic.priv.get(aeonic.proc.cond.attr, aeonic.proc.cond.sel)

        console.log('get cond result from:', aeonic.proc.cond)
        if (aeonic.proc.cond.oper) {
            aeonic.proc.cond.result = aeonic.priv.compare(aeonic.proc.cond.lft, aeonic.proc.cond.oper, aeonic.proc.cond.rgt)
        }
        else if (aeonic.proc.cond.lft) {
            aeonic.proc.cond.result = true
        }

        result = aeonic.proc.cond.result
    }

    return result
}

/**
 *
 */
aeonic.priv.parseCondition = function (condition) {
    var trio = {
        lft: condition,
        oper: '',
        rgt: '',
    }

    for (var i=0; i < aeonic.condOper.length; i++ ) {
        if (condition.indexOf( aeonic.condOper[i] ) != -1) {
            if (aeonic.debug) console.log('found a conditional operator:', aeonic.condOper[i])
            trio.oper = aeonic.proc.cond.oper = aeonic.condOper[i]
            pieces = condition.split( aeonic.proc.cond.oper )
            trio.lft = aeonic.proc.cond.attr = pieces[0].trim()
            trio.rgt = aeonic.proc.cond.rgt = pieces[1].trim()
            break
        }
    }

    return trio
}

/**
 * 
 */
aeonic.priv.unstring = function(value, opts) {
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
            if (aeonic.proc.tar.attr.slice(0, 2) == 'on') {
                value = 'return aeonic.ext.' + value + '(event);'
            }
            // else: extension-exec
            else {
                //value = 'return aeonic.ext.' + value + '(event);'
                ext = aeonic.ext[value]
        
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


            aeonic.proc.src.attr = values[1]
            aeonic.proc.src.sel = values[0]

            value = aeonic.priv.get(values[1], values[0], opts) 
        }
        // c) empty or attribute from same selector:         data-foo
        else {
            if (value.length) {
                value = aeonic.priv.get(value, null, opts)    
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
aeonic.priv.get = function(attribute, differentSelector, opts) {
    var result = ''

    if (differentSelector) {
        selector = differentSelector
    }
    else {
        selector = aeonic.priv.selectors.join(' ')    
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
        if (attribute == 'value' && aeonic.priv.valuables.indexOf(tag) === -1) { // use textcontent
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
aeonic.priv.operate = function (selector, attribute, newOperator, newValue) {
    var existingValue = aeonic.priv.get(attribute, selector)
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
            newValue = 'return aeonic.ext.' + newValue + '(event);'
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
aeonic.priv.set = function(selatts, newValue, newOperator, opts) {
    
    if (selatts.indexOf('&') !== -1) {
        var pieces = selatts.split('&')
        selector = pieces[0].trim()
        attribute = pieces[1].trim()
    }
    else {
        selector = aeonic.priv.selectors.join(' ')
        attribute = selatts
    }

    /// determine final `value`
    if (newOperator) {
        newValue = aeonic.priv.operate(selector, attribute, newOperator, newValue)
    }

    if (!selector) debugger

    /// modify all elements
    var els = document.querySelectorAll( selector )
    var i = 0
    for( i=0; i < els.length; i++ ) {
        aeonic.priv.setAttribute(els[i], attribute, newValue)
    }
    
}

/**
 *
 */
aeonic.priv.setAttribute = function(el, attribute, newValue) {
    tag = el.tagName.toLowerCase()
    if (attribute == 'value' && aeonic.priv.valuables.indexOf(tag) === -1) { 
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