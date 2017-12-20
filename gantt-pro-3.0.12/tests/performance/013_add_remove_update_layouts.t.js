StartTest(function(t) {

    t.describe('Add/update/remove should not cause any slow layouts.', function(t) {
        var gantt = t.getGantt({
            cascadeChanges : false,

            taskStore       : new Gnt.data.TaskStore({
                proxy : 'memory',
                root : {
                    expanded : true,
                    children : [
                        { Name : 'foo' }
                    ]
                }
            }),
            renderTo        : Ext.getBody()
        });


        t.chain(
            { waitFor : 1000 },

            function( ){

                // http://www.sencha.com/forum/showthread.php?290942-View-refreshed-fully-when-adding-single-record-to-grid-store&p=1062942#post1062942
                t.todo(function(t) {

                    t.wontFire(gantt.normalGrid.view, 'refresh', 'scheduling view refresh should not be triggered when adding/removing/editing a single record')
                    t.wontFire(gantt.lockedGrid.view, 'refresh', 'locked view refresh should not be triggered when adding/removing/editing a single record')

                    t.assertNoLayoutTriggered(function() {
                        gantt.taskStore.getRootNode().appendChild({});
                    }, null, 'Adding task');

                }, 'Adding task')

                t.assertNoLayoutTriggered(function() {
                    gantt.taskStore.getRootNode().firstChild.set('Name', 'QWERTY');
                }, null, 'Updating task');

                t.todo(function(t) {
                    t.assertNoLayoutTriggered(function() {
                        gantt.taskStore.getRootNode().firstChild.remove();
                    }, null, 'Removing task');
                }, 'Removing task')

            }
        )
    })
})
