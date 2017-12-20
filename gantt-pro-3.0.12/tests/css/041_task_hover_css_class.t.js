StartTest(function(t) {
    // in this test we'll verify, that when mouse hovers the task
    // various elements that appears (resize handlers, dependecy terminals, etc)
    // are "top" elements and accessible by user

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        root    : {
            leaf        : false,
            expanded   : true,
            
            children    : [
                {
                    "Id"            : 11,
                    "Name"          : "Investigate",
                    
                    "StartDate"     : new Date(2010, 0, 17),
                    Duration        : 2,
                    
                    "PercentDone"   : 30,
                    
                    "leaf"          : true
                }
            ]
        }
    });

    var gantt = Ext.create('Gnt.panel.Gantt', {
        height          : 350,
        width           : 1000,
        
        renderTo        : Ext.getBody(),
        
        // purposefully enable various stuff, that causes additional content to be rendered
        // and potentially interfere with hover elements
        leftLabelField          : 'Name',
        rightLabelField         : 'Name',
        highlightWeekends       : true,
        enableProgressBarResize : true,
        
        //snapToIncrement : true,
        cascadeChanges          : false,
        startDate               : new Date(2010, 0, 4),
        endDate                 : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 10),
        viewPreset              : 'weekAndDayLetter',

        columns                 : [
            {
                xtype       : 'treecolumn',
                header      : 'Tasks',
                sortable    : true,
                dataIndex   : 'Name',
                width       : 200
            }
        ],

        taskStore               : taskStore
    });
    
    
    var firstTaskEl
    
    t.chain(
        { waitForRowsVisible : gantt },

        function(next) {
            firstTaskEl     = gantt.getSchedulingView().getElementFromEventRecord(taskStore.getRootNode().firstChild);
    
            // now moving the cursor to the task element - hover should be triggered and resize handlers appear
            t.moveMouseTo(firstTaskEl, next)
        },

        function(next) {
            t.ok(firstTaskEl.hasCls('sch-event-hover'), 'Task el has correct class applied on hover');

            var leftHandle          = firstTaskEl.down('.sch-resizable-handle-start'),
                rightHandle         = firstTaskEl.down('.sch-resizable-handle-end'),
                progressHandle      = firstTaskEl.down('.sch-gantt-progressbar-handle'),
                leftDepTerminal     = firstTaskEl.down('.sch-gantt-terminal-start'),
                rightDepTerminal    = firstTaskEl.down('.sch-gantt-terminal-end');
                
            t.elementIsTopElement(leftHandle, false, "Left resize handle was found")
            t.elementIsTopElement(rightHandle, false, "Right resize handle was found")
            t.elementIsTopElement(progressHandle, false, "Progress bar handle resize handle was found")
            t.elementIsTopElement(leftDepTerminal, false, "Left dependency terminal bar handle resize handle was found")
            t.elementIsTopElement(rightDepTerminal, false, "Right dependency terminal bar handle resize handle was found")
        }
    )

})
