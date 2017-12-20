StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Sorting of the task store itself')
    
    var taskStore       = t.getTaskStore();
    
    t.livesOk(function () {
        
        taskStore.sort('EndDate', 'ASC');
        
    }, 'Can sort the store w/o exceptions');
    
    

    //======================================================================================================================================================================================================================================================
    t.diag('Sorting from the grid');

    
    var gantt   = t.getGantt({
        renderTo        : Ext.getBody()
    });

    t.livesOk(function () {
        
        gantt.lockedGrid.headerCt.getGridColumns()[ 2 ].toggleSortState()
        
    }, 'Can sort the grid w/o exceptions');
    
    
})    
