//bounding box for the city
var southWest = new L.LatLng(37.62, -122.57);
var northEast = new L.LatLng(37.9, -122.33);

//restriction to SF
var restrictBounds = new L.LatLngBounds(southWest, northEast);

//represents the number of trucks to display nearby
var numMarkers = 10;

//in case need to bounce back
var currLoc, currZoom;
//checks whether in/out of bounds
var outOfBounds = false;

//initialize map centered on SF and restrict the bounds
var map = L.map( 'map', {
    center: [37.77, -122.38],
    minZoom: 2,
    zoom: 11,
	maxBounds: restrictBounds
});

//set up marker data struct and add the custom map
var markerLayerGroup = L.layerGroup().addTo(map);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

//initialize search bar
var search = new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.OpenStreetMap({
	//add search options here
}),
		//zoomLevel: 16,
		showMarker: false
    }).addTo(map);

//RESTful call to filter nearest trucks
function getTrucks(result)
{
	url = "ws/trucks/near?lat=" + result.Location.Y + "&lon=" + result.Location.X;
	$.get(url, addPins, "json");
}

//actually adds the pins to the map along with the popups and basic event-handling
function addPins(data)
{
	//checks for locations that don't have food items defined
	//var noFood = false;
	//remove previous markers and sidebar
	map.removeLayer(markerLayerGroup);
	$("#trucklist .items").html('');
	
	var markerArray = new Array(numMarkers);
	for (var i = 0; i < numMarkers; i++)
	{
		markerArray[i] = L.marker([data[i].pos[1], data[i].pos[0]]);
		//replace colons with commas in sidebar
		if (typeof data[i].fooditems === 'undefined')
		{
			i--;
			continue;
		}
		var foodModOne = data[i].fooditems.split(':').join(',');
		$("#trucklist .items").append('<div class="item"><strong>' + data[i].applicant + '</strong><p class="info">' 
		+ foodModOne + '</p></div>');
	}

	var group = new L.featureGroup(markerArray);
	//fit the markers and popup to screen
	map.fitBounds(group.getBounds().pad(0.5));
	markerLayerGroup = L.layerGroup(markerArray).addTo(map);
	for (var i = 0; i < numMarkers; i++)
	{
		//replaces colons with commas in food list
		if (typeof data[i].fooditems === 'undefined') break;
		var foodModTwo = data[i].fooditems.split(':').join(',');
		var content = '<div class="item"><strong>' + data[i].applicant + "</strong>" + ": " + foodModTwo + '</div>';
		for (var j = i; j < numMarkers; j++)
		{
			//in case multiple food trucks at same location, append to popup
			if ((data[j].pos[0] == data[j+1].pos[0]) && (data[j].pos[1] == data[j+1].pos[1]))
			{
				///replace duplicate trucks food items' colons with commas
				var dupFoodMod = data[j+1].fooditems.split(':').join(',');
				var duplicate = '<div class="item"><strong>' + data[j+1].applicant + '</strong>' + ": " + dupFoodMod + '</div>';
				content += duplicate;
				i++;
			}
			else break;
		}

		//show the popup when you hover over the marker
		markerArray[i].on('mouseover', function(content, evt) {
	 	 		evt.target.bindPopup(content).openPopup();
	  	}.bind(this, content));	
	
		//hide the popup whem you leave the marker
		markerArray[i].on('mouseout', function(evt) {
	 	 		evt.target.closePopup();
			});
	}
}

//Handles when map starts to move to found location and returns that loc data
map.on('geosearch_showlocation', function(result) {
	//if search results is out of bounds, go back to prior view
  	if (outOfBounds == true)
  	{
		map.setView(currLoc, currZoom);
	}
	else
	{
		getTrucks(result);
	}
	outOfBounds = false;
});

//Handles when map first finds a list of potential locations based on search
map.on('geosearch_foundlocations', function(results) {
	//store current state before searching just in case it needs to bounce back
	currLoc = map.getCenter();
	currZoom = map.getZoom();
	//console.log("Location of point is " + results.Locations[0].Y + ", "  + results.Locations[0].X);
	//check if the searched location is in the city
	if (!restrictBounds.contains(L.latLng(results.Locations[0].Y, results.Locations[0].X)))
	{
		//console.log("Not in bounds!");
		outOfBounds = true;
	}
});