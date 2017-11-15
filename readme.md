#### ULA MPS
Notes:
* Build instructions
  * Development builds will require app.json location to -> resources/app.json after build completes
  * Update app.json file in resources
  * Uploads will need to be production and to update index.html app.json to resources/app.json while moving a copy to resources.

#### Change Log

###### Build 2.0.2.8
* “gaps popping up when pulling up different data/different selection variants, After a few minutes, the gap at the top disappeared on this one and the data was correctly aligned. The same thing happened when I switched over to Delta IV data. It’s like its taking it a while to catch up/fully load. “
  * <b>Action</b> would be to provide user with a loading or rendering as is shown when requesting the data so as to know when such things are happening.
* “Printing issues brought to me by customers this week are that we can no longer collapse some data and have it print the way it was edited/collapsed,”
  * <b>Action</b> Will review, By removing the auto expand upon export the user would be responsible for properly adjusting data each time an export is required, currently the columns and hierarchy is auto adjusted. If user expects to adjust all data prior to export, we will disable auto features.
* “Web Printing Changes – Less data shown that before updates”
  * <b>Action</b> Will review utilizing the margin space shown in red.


###### Build 2.0.2.7
* CSS Gantt date color left / right grey to black "sch-gantt-all-debug.css" line 1799
* Bug fix for data dropping below view on variant change and data request
* Removed Gantt timeline tails "gntPlugin.js" line 42403
* Updated main.ganttColumns line 467 - missing fab, s/t, fa, icons