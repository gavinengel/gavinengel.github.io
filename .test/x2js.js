
require('magic-globals')
var jade = require('jade')
var fs = require('fs')
var o = console.log

// read index.jade
fs.readFile(__base+'/cv/index.jade', 'utf-8', function(err, read) {
  if(err) return o(err)

  var fn = jade.compile(read)
  var htmlOutput = fn()

  var parseString = require('xml2js').parseString;
  var xml = htmlOutput
  parseString(xml, function (err, result) {
      console.dir(result);
  });  

})


