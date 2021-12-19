# data-visualization
Data analysis and visualization project - SNU
The whole project is available on Github at: https://github.com/Marguerite7/data-visualization

## Goal of the project
This project aims to provide a smooth and intuitive interface for users that need a movie recommendation system
or just want to learn more about their favorite movies and discover new ones.
Find the project presentation at: https://docs.google.com/presentation/d/1vgSazZwg6h2EzWk-AbI_2P6s1B5YyajMf9TWLLiMuHQ/edit?usp=sharing

## Rendered interface
- Movie search
- Global search
- Full screen mode
### Clustering
The data displayed on the graph is clustered according to a special formula taking into account its director and cast.
### Filters
The data displayed on the graph can be filtered according to continents, platforms, year of release, duration and popularity.

## Structure of the whole project
### Data
The folder "Antoine" regroups all data obtained with the API.
links3.csv: source, target, value
nodes3.csv: name, group (genre), popularity, year, label (name), duration, platform (list), country, poster link
The other files are the previous versions of the data used from the folder "Antoine" with more movies (4729 movies).
Since it slows down the loading of the interface, we kept this number below 1500 movies for the rendered graph.
### Static
JS and CSS files called in the "Templates" folder.
### Templates
HTML file loaded by App.py and using JS and CSS files in the "Static" folder.
### App.py
Definition of the API to get the data from the "Data" folder and rendering of the HTML file in the "Templates" folder.

## Launching the website locally
In a terminal opened to the proper path (project folder "data-visualization"), run:
- set FLASK_ENV = environnement
- set FLASK_APP = app
- flask run

And then go the mentioned local ip address.

## Launching the website on the Internet
Go to: http://flowbigby.pythonanywhere.com