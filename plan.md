# WIP

- select proper color for empty rooms
- save added empty rooms in db and local storage
- suggest to add empty rooms to timetable

- add custom events to timetable

# Planned

### testing

- add e2e tests for the rest of the pages
- unify desktop and mobile tests?
- add tests for Item interactivity (click, hover)
- remake unit tests

### db stuff

- add course avg score

### ui stuff

- when hovering in timetable scroll to item location in paginated list (toggle in settings)

- add site info panel (visits, last course update etc...)
- course searching filters
  - add filters to show only courses meant for e.g. תוכנה, חשמל...
  - filters for "my" list and "all" list
- fix table export
- people qa

# Considering

- in course info page, show all years info, show changes between years
- instead of saving the whole course for the timetable, save the id and year as well as selected instances id and fetch needed data from the server (this will keep the data up to date)
- convert selected courses list to store

# Archive (might come back)

- make sure user is aware if he is selecting multiple (unrequired) sessions (such as too many lectures)
- improve mobile friendliness
- full fuzzy search
- automatically try to register to courses using user credentials
- animation when opening side panel
- lunch and 12:20 are the same thing, merge em'
- add instructor pages
- improve analytics (add an Analytics component? use:action?)
