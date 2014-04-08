# Grub Truck

This web app is designed to show the SF food trucks in proximity to a specific location on a map. 

## Live App:

grub-truck.rhcloud.com

## Libraries, Tools, and Frameworks Utilized:

- jQuery
- NodeJS
- Express
- Connect
- MongoDB
- Leaflet
- Bash (for initializing the db as a deploy script if necessary)
- Mocha/Chai (for testing)

---

The technical track I chose was full-stack, with an emphasis on extensible design for further improvements if time weren't a constraint. 

This app works by allowing the user to type in the address of any location in SF. The closest 10 food trucks will be displayed in both markers on the map as well as a list on the side. Hovering over the marker shows the name and food items of the truck. I have established a bounds for the map so searches and navigation are limited to SF. To change the number of food trucks would require a very simple single variable change in the front-end, but I decided to disallow this for the initial release as more extensive testing would be necessary.

---

## Technical Architecture

Grub Truck stores the food trucks in a MongoDB collection. I decided to go with MongoDB as my database because it provides great geospatial queries that work well with the existing locational attributes of the JSON. 

NodeJS runs the server, which handles the database setup and calls. In the back-end, I expose a RESTful API that renders JSON based on search parameters of the user and their resultant queries on the database. I deliver these routes through the Express framework and use Connect for parsing. 

On the front-end, I use jQuery to handle interfacing with the routes and extracting the necessary data from the back-end. The map itself uses the lightweight Leaflet library, which handles all the map and marker rendering from public/createMarkers.js. I use a Geo-search library to identify locations on the map is implemented through OpenStreetMap. Some CSS is in place for design elements (fonts, sizing, and spacing) and organization.

---

Some tradeoffs I made were choosing Leaflet as a lightweight and less feature-packed alternative to industry options such as Google Maps. I also focused a large amount on the front-end visual experience and haven't needed other links so I chose not to use a framework for organization.
Given more time, I would implement many additional features. To name a few I would allow the user to indicate the number of trucks to display, provide a search-box for looking up food keywords, and pull the hours of service in the back-end.

---

Something else I'm especially proud of is a web app I built called EventYoda. This is a platform to find unique and creative team-building activities targeted specifically for corporate groups.

## Resume: https://db.tt/JFcej9qM.
