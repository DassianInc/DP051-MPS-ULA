StartTest(function (t) {

    t.subTestTimeout = 3000;

    var resourceStore = new Gnt.data.ResourceStore({
        proxy : {
            method        : 'GET',
            type          : 'ajax',
            actionMethods : { create : 'GET' },
            api           : {
                create : 'resource/create'
            },
            reader        : 'json',
            writer        : 'json'
        }
    });

    var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
        autoSync      : true,
        proxy         : {
            method        : 'GET',
            type          : 'ajax',
            actionMethods : { read : 'GET', destroy : 'POST', create : 'GET' },
            api           : {
                create : 'assignment/create'
            },
            reader        : 'json',
            writer        : 'json'
        }
    });

    Ext.ux.ajax.SimManager.init({
        delay : 1000
    }).register(
        {
            'assignment/create' : {
                stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                data  : [
                    { Id : 1, TaskId : 1, ResourceId : 1 }
                ]
            }
        }
    );

    var gantt = t.getGantt({
        renderTo        : Ext.getBody(),
        columns         : [
            { xtype : 'namecolumn' }
        ],
        taskStore       : new Gnt.data.TaskStore({
            proxy : {
                method        : 'GET',
                type          : 'ajax',
                actionMethods : { read : 'GET', destroy : 'POST', create : 'GET' },
                api           : {
                    create : 'task/create'
                },
                reader        : 'json',
                writer        : 'json'
            },
            root  : {
                expanded : true,
                children : []
            }
        }),
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore
    });

    var root = gantt.taskStore.getRootNode();

    t.it('Step 1. Assignment store should not try to sync as long as either its task or resource is phantom', function (t) {
        t.wontFire(assignmentStore, 'beforesync');

        Ext.ux.ajax.SimManager.init({
            delay : 10
        }).register(
            {
                'task/create' : {
                    stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                    data  : [
                        { Id : 1, name : 'Task' }
                    ]
                }
            }
        );

        resourceStore.add({ Name : 'Bob' });

        // Here task store will sync due to autoSync
        root.appendChild({
            Name : 'Task', leaf : true
        });

        root.firstChild.assign(resourceStore.first());

        t.waitForEvent(gantt.taskStore, 'write', function () {
            t.notOk(root.firstChild.phantom, 'Task was created ok');
        });

        var s = t.beginAsync();
        gantt.taskStore.sync({
            callback : function () {
                t.endAsync(s);
            }
        });
    });

    t.it('Step 2. Both task and resource are now "realized" - no longer phantom', function (t) {

        t.firesOnce(assignmentStore, 'beforesync');
        t.firesOnce(assignmentStore, 'write');

        t.waitForEvent(assignmentStore, 'write', function () {
            t.notOk(resourceStore.first().phantom, 'Resource was created ok');
            t.notOk(assignmentStore.first().phantom, 'Assignment was created ok');
        });

        Ext.ux.ajax.SimManager.init({
            delay : 300
        }).register(
            {
                'resource/create' : {
                    stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                    data  : [
                        { Id : 1, Name : 'Bob' }
                    ]
                }
            }
        );
        var s = t.beginAsync();
        resourceStore.sync({
            callback : function () {
                t.endAsync(s);
            }
        });
    });
});
