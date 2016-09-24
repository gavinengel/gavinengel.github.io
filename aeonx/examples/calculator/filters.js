var _operators = ['+', '-', 'x', '%']

var $equal = function(e) {
	var newValue = ''

	// Get the input and button values
	var input = document.querySelector('.screen')
	// If eval key is pressed, calculate and display the result
	var equation = input.innerHTML
	var lastChar = equation[equation.length - 1]
		
	// Replace all instances of x and % with * and / respectively. This can be done easily using regex and the 'g' tag which will replace all instances of the matched character/substring
	equation = equation.replace(/x/g, '*').replace(/%/g, '/')
		
	// Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
	if(_operators.indexOf(lastChar) > -1 || lastChar == '.')
		equation = equation.replace(/.$/, '')
		
	if(equation)
		newValue = eval(equation)

	// fix for: http://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
	// 3.2 - 3 = 0.20000000000000018
	// 1.2 - 1 = 0.19999999999999996
	big10 = 1000000000000000
	newValue = Math.round(newValue * big10) / big10


	return newValue
}

var $dot = function(e) {
	result = ''

	if(document.querySelector('.screen').innerHTML.indexOf('.') == -1) {
		result = '.'
	}

	return result
}

var $operator = function(e) {
	newOp = e.target.innerHTML

	var screen = document.querySelector('.screen')
	var screenVal = screen.innerHTML
	var lastChar = screenVal[screenVal.length - 1]
	
	// prevent ops on empty screen.
	if (!screenVal && newOp != '-') {
		newOp = ''
	}
	
	// remove the last operator (if exists) from screen 
	else if(_operators.indexOf(lastChar) > -1 && screenVal.length > 1) {
		// Here, '.' matches any character while $ denotes the end of string, 
		// so anything (will be an operator in this case) at the end of string will get replaced by new operator
		screen.innerHTML = screenVal.slice(0, -1);

	}

	return newOp
}



filters = {
	equal: $equal,
	dot: $dot,
 	operator: $operator
}
