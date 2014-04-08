#!/bin/env node

var fs = require('fs');


//remove food trucks that don't have location defined
var addPosMongoIndex = function ()
{
	var file_content = fs.readFileSync('rqzjsfat.json');
	var content = JSON.parse(file_content);

	for (var i = 0; i < content.length; i++)
	{
		if (typeof content[i].longitude !== 'undefined')
		{
			content[i].pos = [parseFloat(content[i].longitude), parseFloat(content[i].latitude)];
			delete content[i].location;
		}
		else
		{
			content.splice(i, 1);
			i--;
		}
	}
	fs.writeFileSync('truckcoord.json', JSON.stringify(content));
}

addPosMongoIndex();