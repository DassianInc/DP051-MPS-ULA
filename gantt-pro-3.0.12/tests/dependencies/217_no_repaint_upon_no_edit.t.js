StartTest(function(t) {

    t.describe('Dependency arrows should not be repainted in case data editing started but no actual edit has been done', function(t) {

        // NOTE: the redraw was happening due to the fact that tasks at week boundaries within task store set to skip
        // weekends are considered to be affected by Task::constrainWithoutPropagation() method, and were added to
        // store's current cascade batch object which was then analyzed at cascade ending and since number of
        // affected records were > 0 the dependencies were forcefully redrawn.
        //
        // The tasks are considered affected since Task::getIncomingDependenciesConstraintContext() method does not take into account
        // skip weekends store's setting and for each task starting at Monday it returns a constraining context
        // starting at the end of previous Friday and since start dates are different such tasks are added into
        // current cascading batch object despite the fact that when such tasks are set to start at the end
        // of Friday they then automatically shifted to the begining of next Monday due to store's skip weekends
        // setting.

        var prevFriday   = new Date(2014, 10, 7),
            prevSaturday = new Date(2014, 10, 8),
            nextMonday   = new Date(2014, 10, 10),
            nextTuesday  = new Date(2014, 10, 11),
            gantt, ganttChartGrid, startDateHeader, startDateColIndex;

        /* global taskStore, depStore */
        /* jshint withstmt:true */
        with (t.getAllStoresDataSet([{
            Id : 1,
            StartDate : prevFriday,
            EndDate   : nextTuesday,
            expanded  : true,
            children  : [{
                Id : 2,
                StartDate : prevFriday,
                EndDate   : prevSaturday,
                leaf      : true
            }, {
                Id : 3,
                StartDate : nextMonday,
                EndDate   : nextTuesday,
                leaf      : true
            }]
        }], [{
            From : 2,
            To   : 3
        }])) {
            taskStore.skipWeekendsDuringDragDrop = true;

            gantt = t.getGantt2({
                renderTo         : document.body,
                width            : 700,
                height           : 200,
                lockedGridConfig : {
                    flex : 0.5
                },
                normalGridConfig : {
                    flex : 0.5
                },
                startDate        : prevFriday,
                endDate          : nextTuesday,
                forceFit         : true,
                taskStore        : taskStore,
                dependencyStore  : depStore,
                plugins          : [{
                    ptype        : 'scheduler_treecellediting',
                    clicksToEdit : 1
                }]
            });

            ganttChartGrid    = gantt.lockedGrid;
            startDateHeader   = ganttChartGrid.down('startdatecolumn'),
            startDateColIndex = ganttChartGrid.headerCt.items.indexOf(startDateHeader);

            t.chain({
                waitFor : 'waitForTasksAndDependenciesToRender',
                args    : [gantt]
            }, function(next) {
                t.wontFire(gantt.getDependencyView(), 'refresh');
                next();
            }, {
                action : 'click',
                target :  function () {
                    return t.getCell(ganttChartGrid, 0, startDateColIndex);
                }
            }, {
                action : 'click',
                target :  function () {
                    return t.getCell(ganttChartGrid, 1, startDateColIndex);
                }
            }, {
                action : 'click',
                target :  function () {
                    return t.getCell(ganttChartGrid, 2, startDateColIndex);
                }
            });
        }
    });
});
