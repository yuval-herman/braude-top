# WIP

- code refactoring
  - improve data flow
    - components shouldn't fetch more data
    - pages also shouldn't fetch data, they should use load functions
  - abstract function
    - components should not change data drastically, they should get it processed
    - use dependency injection where appropriate
  - improve data flow
    - components shouldn't fetch more data
    - pages also shouldn't fetch data, they should use load functions
  - standardize error handling
    - when there is an unexpected error, log as much data as possible for later debugging
    - save errors somewhere for later debugging
  - generalize functions and components where appropriate
  - utilities that are just functions for one page or component should'nt be utilities, they should live next to their component (even if it's a separate file)

# Planned

### testing

- add e2e tests for the rest of the pages
- unify desktop and mobile tests?
- add tests for Item interactivity (click, hover)
- remake unit tests

### db stuff

- add course avg score

### ui stuff

- add custom events to timetable
- custom items in timetable should behave like normal items (remake timetable logic?)
- when hovering in timetable scroll to item location in paginated list (toggle in settings)

- add site info panel (visits, last course update etc...)
- course searching filters
  - add filters to show only courses meant for e.g. תוכנה, חשמל...
  - filters for "my" list and "all" list
- fix table export
- people qa

# Considering

- suggest to add empty rooms to timetable
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
