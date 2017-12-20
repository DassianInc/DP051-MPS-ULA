StartTest(function (t) {
    t.diag('Creating 2 records');

    var dependencyStore = Ext.create("Gnt.data.DependencyStore");

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        autoSync : true,
        autoLoad : false,

        proxy : {
            type : 'ajax',

            api    : {
                create : 'data/crud/create-tasks2-leaves.js',
                read   : 'data/crud/get-tasks.js'
            },
            reader : {
                type : 'json'
            }
        },

        root : {
            expanded : true
        }
    });

    t.getGantt({
        dependencyStore : dependencyStore,
        taskStore       : taskStore,
        renderTo        : Ext.getBody()
    });

    var originalData;
    var originalData2;

    t.chain(
        { waitForStoresToLoad : taskStore },

        function (next) {

            t.is(taskStore.getRootNode().childNodes.length, 5, '5 top-level tasks ')
            t.ok(!taskStore.getNodeById(122), 'No new record yet')

            // CREATE listener
            taskStore.on('write', next, null, { single : true });
            taskStore.suspendAutoSync();
            taskStore.getRootNode().appendChild({
                StartDate    : new Date(2010, 1, 22),
                EndDate      : new Date(2010, 1, 23),
                Name         : 'New task',
                Duration     : 1,
                DurationUnit : "d",
                leaf         : true
            })
            taskStore.getRootNode().appendChild({
                StartDate    : new Date(2010, 1, 24),
                EndDate      : new Date(2010, 1, 25),
                Name         : 'New task',
                Duration     : 1,
                DurationUnit : "d",
                leaf         : true
            })
            taskStore.resumeAutoSync();
            taskStore.sync();
            t.diag("Sync (ADD) operation started");

            // can't use Ext.clone because in IE8 it also clones the non-enumerable properties like "constructor /  toString / valueOf" etc
            originalData = Ext.apply({ Id : 122 }, taskStore.getNewRecords()[0].data);
            originalData2 = Ext.apply({ Id : 123 }, taskStore.getNewRecords()[1].data);

            t.is(taskStore.getNewRecords().length, 2, '2 records has been added')
        },

        function (next, store, operation) {

            t.is(operation.action, 'create', 'Correct operation completed')
            t.is(operation.getRecords().length, 2, 'A single record was created')

            t.ok(taskStore.getNodeById(122), 'New record 122 appeared')
            t.ok(taskStore.getNodeById(123), 'New record 123 appeared')

            // Id should not be part of original data, add it to be able to easily compare both objects
            originalData.Id = operation.getRecords()[0].get('Id');
            originalData2.Id = operation.getRecords()[1].get('Id');
            t.isDeeply(originalData, taskStore.getNodeById(122).data, 'Created task 122 data intact');
            t.isDeeply(originalData2, taskStore.getNodeById(123).data, 'Created task 123 data intact');
        }
    );
})
