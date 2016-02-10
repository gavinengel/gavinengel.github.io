# About

## Write a simple expenses tracker web application

* The user must be able to create an account and log in.
* When logged in, user can see, edit and delete expenses he entered.
* Implement at least two roles with different permission levels (ie: a regular user would only be able to CRUD on his owned records, a user manager would be able to CRUD users, an admin would be able to CRUD on all records and users, etc.)
* When an expense record is entered, each one has: date, time, description, amount, comment
* User can filter expenses.
* User can print expenses per week with total amount and average day spending.
* Minimal UI/UX design is needed.
* I need every client operation done using JavaScript, reloading the page is not an option.
* REST API. Make it possible to perform all user actions via the API, including authentication (If a mobile application and you don’t know how to create your own backend you can use Parse.com, Firebase.com or similar services to create the API).
* You need to be able to pass credentials to both the webpage and the API.
* In any case you should be able to explain how a REST API works and demonstrate that by creating functional tests that use the REST Layer directly.
* Bonus: unit and e2e tests!
* You will not be marked on graphic design, however, do try to keep it as tidy as possible.
* NOTE: Please keep in mind that this is the project that will be used to evaluate your skills. The project will be evaluated as if you are delivering it to a customer. We expect you to make sure that the app is fully functional and doesn’t have any obvious missing pieces. 

## 3-point "Min Stack"

1. GP (Gateway/Proxy) 
  - host: expensediv.gavinengel.com 
  - CNAME: ?
  - using: https://aws.amazon.com/api-gateway/ and Incapsula? 
2. SE (Static Endpoint) 
  - host: stc.expensediv.gavinengel.com
  - CNAME: ?
  - code.gavinengel.com/expensediv/ 
  - using: Github Pages, Jekyll CMS
3. DE (Dynamic Endpoint) 
  - host: dyn.expensediv.gavinengel.com
  - CNAME: ? 
  - using: Docker container, Express.js, MongoDB
