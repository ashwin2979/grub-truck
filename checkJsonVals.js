#!/bin/env node

var fs = require('fs');

var validateJSON = function()
{
	var file_content = fs.readFileSync('rqzjsfat.json');
	var content = JSON.parse(file_content);
	var count = 0;
	
	for (var i = 0; i < content.length; i++)
	{
		if (typeof content[i].longitude == 'undefined')
		{
			//console.log("Index is " + (i+2));
			count++;
		}
	}
	//console.log("Count of errors is " + count);
}

validateJSON();