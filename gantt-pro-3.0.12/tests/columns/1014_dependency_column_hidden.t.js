StartTest(function (t) {
    var gantt;
    
    var setup = function (cfg) {
        gantt && gantt.destroy();
        
        gantt = t.getGantt(Ext.apply({
            renderTo    : Ext.getBody(),
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2010, 2, 1),
            width       : 600,
            columns : [
                {
                    xtype               : 'treecolumn',
                    dataIndex           : 'Id'
                },
                {
                    xtype               : 'predecessorcolumn',
                    hidden              : true,
                    useSequenceNumber   : true
                },
                {
                    xtype               : 'successorcolumn',
                    hidden              : true,
                    useSequenceNumber   : true
                }
            ],
            taskStore   : t.getTaskStore({}, true)
        }, cfg));
    }
    
    t.it('Gantt should be rendered without exception with dependency columns hidden', function (t) {
        setup();
        
        gantt.taskStore.load();
    });
});