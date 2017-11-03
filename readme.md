#### ULA MPS
Notes:
* Build instructions
  * Development builds will require app.json location to -> resources/app.json after build completes
  * Update app.json file in resources
  * Uploads will need to be production and to update index.html app.json to resources/app.json while moving a copy to resources.

#### Change Log

###### Build 2.0.2.7
* CSS Gantt date color left / right grey to black "sch-gantt-all-debug.css" line 1799
* Bug fix for data dropping below view on variant change and data request
* Removed Gantt timeline tails "gntPlugin.js" line 42403
* Updated main.ganttColumns line 467 - missing fab, s/t, fa, icons