# WIP

# Planned

### db stuff

- add course avg score
- add recommendation (1-5 start)
- people qa
- add ratings for courses

### ui stuff

- move year, semester into layout load function to be available everywhere
- in course info page, show all years info, show changes between years
- add site info panel (visits, last course update etc...)
- make sure user is aware if he is selecting multiple (unrequired) sessions (such as too many lectures)
- course searching filters
  - add filters to show only courses meant for e.g. תוכנה, חשמל...
  - filters for "my" list and "all" list
- add custom events to timetable
- suggest to add empty sessions to timetable

### scraper or data gathering stuff

- add if lab mandatory

# Considering

- instead of saving the whole course for the timetable, save the id and year as well as selected instances id and fetch needed data from the server (this will keep the data up to date)
- convert selected courses list to store

# Archive (might come back)

- improve mobile friendliness
- full fuzzy search
- automatically try to register to courses using user credentials
- animation when opening side panel
- lunch and 12:20 are the same thing, merge em'
- add instructor pages
- improve analytics (add an Analytics component? use:action?)
