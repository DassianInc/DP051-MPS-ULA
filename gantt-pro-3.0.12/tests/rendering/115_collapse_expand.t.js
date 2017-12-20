StartTest(function(t) {

    t.it('Should collapse/expand all nodes', function (t) {
        var gantt = t.getGantt({
	        renderTo                : Ext.getBody(),
	        enableAnimations        : false
	    });
	    
	    t.waitForEventsToRender(gantt, function () {
	        gantt.collapseAll();
	        gantt.expandAll();
	        t.pass('collapseAll/expandAll executed ok');
	    });
    });
    
    t.it('Should keep locked & normal grids synced', function (t) {

        var gantt = t.getGantt({
            renderTo                : Ext.getBody(),
            enableAnimations        : false,
            leftLabelField          : {
                dataIndex : 'Name',
                editor    : { xtype : 'textfield' }
            }
        });
        
        var id = t.getLocatorById(gantt.taskStore);
        
        t.chain(
            { waitForEventsToRender: gantt },

            function (next) {
                var task = id(114);

                task.collapse();
                t.is(gantt.lockedGrid.getView().getNodes().length, gantt.getSchedulingView().el.select(Ext.grid.View.prototype.itemSelector).elements.length, 'Rows synced');
            }
        );
    });
    
    t.it('Should render left label editor correctly', function (t) {
        var gantt = t.getGantt({
            enableAnimations        : false,
            leftLabelField          : {
                dataIndex : 'Name',
                editor    : { xtype : 'textfield' }
            }
        });

        gantt.on('beforerender', function () {
            t.throwsOk(function () { gantt.normalGrid.view.getSecondaryCanvasEl(); }, 'Calling this method too early', 'Method throws an exception when should');
        });

        gantt.render(Ext.getBody());

        t.chain(

            { waitForRowsVisible : gantt },

            function (next) {
                t.livesOk(function () { gantt.normalGrid.view.getSecondaryCanvasEl(); }, 'Method doesn\'t an exception when shouldn\'t');
            }
        );
    });
})    

