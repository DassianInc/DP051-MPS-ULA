StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup');
    
    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        plugins : editing
    });
    
    t.waitForEventsToRender(g, function () {
        
        var taskStore    = g.taskStore,
            firstTask    = taskStore.getRootNode().childNodes[0].childNodes[0],
            lockedGrid   = g.lockedGrid;
        
        var endDateHeader       = lockedGrid.down('enddatecolumn'),
            endDateColIndex     = lockedGrid.headerCt.items.indexOf(endDateHeader),
            startDateColIndex   = lockedGrid.headerCt.items.indexOf(lockedGrid.down('startdatecolumn'));

        var view        = lockedGrid.getView();
        
        var steps = [
            {
                action  : 'click',
                target  : function() { return view.getCellByPosition({ row : 1, column : endDateColIndex }); }
            },
            
            function (next) {
                t.waitForSelectorAtCursor('.x-form-field', next)
            },

            function(next) { 
                var startDate       = firstTask.getStartDate();

                editing.getActiveEditor().setValue('');
                editing.completeEdit();
                
                t.is(firstTask.getStartDate(), startDate, 'StartDate not modified if nulling end date');
                t.is(firstTask.getEndDate(), null, 'EndDate could be nulled');
                t.is(firstTask.getDuration(), null, 'Duration should be nulled after nulling end date');
                next();
            },
            { waitFor : 200 },
            {
                action  : 'click',
                target  : Ext.grid.View.prototype.itemSelector + ':nth-child(2) .x-grid-cell:nth-child(2) .x-grid-cell-inner'
            },
            
            function (next) {
                t.waitForSelectorAtCursor('.x-form-field', next)
            },
            
            function(next) { 
                editing.getActiveEditor().setValue('');
                editing.completeEdit();
                
                t.is(firstTask.getStartDate(), null, 'StartDate not modified if nulling end date');
                t.is(firstTask.getEndDate(), null, 'EndDate could be nulled');
                t.is(firstTask.getDuration(), null, 'Duration should be nulled after nulling end date');
                next();
            }
        ];

        t.chain(
            steps.concat(

                // Repeat for milestone task which has some special cases
                function(next) {
                    firstTask.setStartEndDate(new Date(2010, 1, 1), new Date(2010, 1, 1));
                    next();
                }
            
            ).concat(steps)
        )
    })
});
