StartTest(function(t) {

    t.it('Should filter and sort correctly', function (t) {
        var g = t.getGantt({
            renderTo        : Ext.getBody()
        });
    
        t.waitForRowsVisible(g, function() {
            g.taskStore.getRootNode().firstChild.set({
                leaf : true,
                Name : 'XYZ'
            });
    
            g.taskStore.filterTreeBy(function(node) {
                return node.data.Name === 'XYZ';
            });
    
            t.is(g.normalGrid.view.store.getCount(), 1, 'Should find one record after filtering');
    
            g.taskStore.sort('Name');
    
            t.is(g.normalGrid.view.store.getCount(), 1, 'Should find one record after filtering + sorting');
            
            t.is(g.normalGrid.view.store.getAt(0).data.Name, 'XYZ', 'and this record passes the filtering condition');
        });
    });
    
    t.it('Should filter new nodes', function (t) {
        var g = t.getGantt({
            renderTo        : Ext.getBody(),
            taskStore       : t.getTaskStore({
                DATA    : [{
                    Id : 2,
                    Name : 'Tasks',
                    expanded : true,
                    children : [{
                        Id : 3,
                        Name : 'Task 1',
                        leaf : true
                    }, {
                        Id : 4,
                        Name : 'Task 2',
                        leaf : true
                    }]
                }]
            })
        });
        
        var getNodeCount = function () {
            return g.normalGrid.view.getNodes().length;
        };
    
        t.waitForRowsVisible(g, function() {
            var regexp = /Task 1/;
    
            g.taskStore.filterTreeBy(function(node) {
                return regexp.test(node.getName());
            });
            
            var view = g.normalGrid.view;
            
            var node = g.taskStore.getNodeById(2);
            
            node.appendChild({ leaf : true, Name : 'Test 3' });
            
            t.is(getNodeCount(), 2, 'New node filtered when aded with appendChild');
            
            node.addSubtask({ leaf : true, Name : 'Test 4' });
            
            t.is(getNodeCount(), 2, 'New node filtered when aded with addSubtask');
            
            node = g.taskStore.getNodeById(3);
            
            node.addTaskAbove({ leaf : true, Name : 'Test 5'});
            
            t.is(getNodeCount(), 2, 'New node filtered when aded with addTaskAbove');
            
            node.addTaskBelow({ leaf : true, Name : 'Test 6'});
    
            t.is(getNodeCount(), 2, 'New node filtered when aded with addTaskBelow');
        });
    });
});
