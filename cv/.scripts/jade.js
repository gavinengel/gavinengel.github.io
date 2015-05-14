#!/usr/bin/env node

require('magic-globals')
var jade = require('jade')
var fs = require('fs')
var o = console.log
var getRepoInfo = require('git-repo-info')
var info = getRepoInfo()

// read index.jade
fs.readFile(__base+'/index.jade', 'utf-8', function(err, jadeTemplate) {
  if(err) return o(err)

  var fn = jade.compile(jadeTemplate)
  var htmlOutput = fn({ hash: info.abbreviatedSha })
  o('new hash: '+info.abbreviatedSha)

  // write index.html
  fs.writeFile(__base + "/index.html", htmlOutput, function(err) {
    if(err) return o(err)
  }) 

})

