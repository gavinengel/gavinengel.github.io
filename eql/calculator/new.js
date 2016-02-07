var operators = ['+', '-', 'x', '%'];

eql.ext.onClickEqFilter = function(e) {
	var newValue = ''

	// Get the input and button values
	var input = document.querySelector('.screen');
	// Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
	// If eval key is pressed, calculate and display the result
	var equation = input.innerHTML;
	var lastChar = equation[equation.length - 1];
		
	// Replace all instances of x and % with * and / respectively. This can be done easily using regex and the 'g' tag which will replace all instances of the matched character/substring
	equation = equation.replace(/x/g, '*').replace(/%/g, '/');
		
	// Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
	if(operators.indexOf(lastChar) > -1 || lastChar == '.')
		equation = equation.replace(/.$/, '');
		
	if(equation)
		newValue = eval(equation);

	return newValue;
}

eql.ext.onClickDecimal = function(e) {
	result = '';

	if(document.querySelector('.screen').innerHTML.indexOf('.') == -1) {
		result = '.';
	}

	return result;
}

eql.ext.onClickOperatorFilter = function(e) {
	newOp = e.target.innerHTML;

	var screenEL = document.querySelector('.screen');
	var screenVal = screenEL.innerHTML;
	var lastChar = screenVal[screenVal.length - 1];
	
	// prevent ops on empty screen.
	if (!screenVal && btnVal != '-') {
		btnVal = ''
	}
	
	// remove the last operator (if exists) from screen 
	else if(operators.indexOf(lastChar) > -1 && screenVal.length > 1) {
		// Here, '.' matches any character while $ denotes the end of string, 
		// so anything (will be an operator in this case) at the end of string will get replaced by new operator
		screenEL.innerHTML = screenVal.replace(/.$/, btnVal);
	}

	return newOp;
}
