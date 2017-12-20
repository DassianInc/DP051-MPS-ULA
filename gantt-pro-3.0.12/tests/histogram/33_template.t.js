StartTest(function (t) {
    t.it('Should apply custom template and data to resource histogram', function (t) {
        var resourceStore   = t.getResourceStore({
            data    : [{
                Id      : 'r1',
                Name    : 'test'
            }]
        });
        
        var assignmentStore = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : []
        });
        
        var taskStore   = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA    : [{
                Id          : 1,
                Name        : 'Task',
                StartDate   : new Date(2010, 2, 2),
                EndDate     : new Date(2010, 2, 6)
            }]
        });
        
        var histogram   = new Gnt.panel.ResourceHistogram({
            resourceStore           : resourceStore,
            taskStore               : taskStore,
            assignmentStore         : assignmentStore,
            renderTo                : Ext.getBody(),
            viewPreset              : 'weekAndDayLetter',
            startDate               : new Date(2010, 2, 1),
            endDate                 : new Date(2010, 3, 1),
            
            height                  : 300,
            width                   : 800,
            
            barTpl                  : new Ext.XTemplate(
                '<tpl for=".">',
                    '<div id="{id}" class="gnt-resourcehistogram-bar {cls}" gnt-bar-index="{index}" ' +
                    'style="left:{left}px;top:{top}px;height:{height}px;width:{width}px">' +
                    '<span class="{testCls}">{testValue}</span></div>',
                    '<tpl if="text !== \'\'">',
                        '<span class="gnt-resourcehistogram-bar-text" style="left:{left}px;">{text}</span>',
                    '</tpl>',
                '</tpl>'
            ),
            
            barRenderer             : function (resourceId, allocations) {
                return {
                    testValue   : resourceId,
                    testCls     : 'my-test-cls'
                };
            }
        });
        
        t.chain(
            { waitForRowsVisible : histogram },
            function (next) {
                assignmentStore.add({
                    Id          : 1,
                    TaskId      : 1,
                    ResourceId  : 'r1',
                    Units       : 60
                });
                
                t.selectorExists('.my-test-cls', 'Span with custom class rendered');
                t.contentLike(histogram.el, 'r1', 'Value rendered');
                next();
            }
        );
    });
});