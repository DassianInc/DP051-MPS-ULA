StartTest(function(t) {
    t.expectGlobal('TaskModel');

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    var DATE        = Sch.util.Date
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dependencyStore = Ext.create("Gnt.data.DependencyStore");
    
    Ext.define("TaskModel", {
        extend : "Gnt.model.Task",
            
        // Some custom field definitions
        fields : [
            { name: 'Id', type: 'int', useNull : true},
            { name: 'StartDate', type: 'date', dateFormat: 'MS' },
            { name: 'EndDate', type: 'date', dateFormat: 'MS' },
            { name: 'Priority', defaultValue : 1 }
        ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
        autoSync    : false,
        autoLoad    : false,
        model : 'TaskModel',

        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/crud/create-tasks-root.js',
                update  : 'data/crud/update-tasks-root.js',
                read    : 'data/crud/get-tasks-root.js'
            },
            reader : {
                type : 'json',
                root: function (o) {
                    if (o.d) {
                        return o.d;
                    } else {
                        return o.children;
                    }
                }
            }
        },
        
        root        : {
            expanded    : true
        }
    });
    
    
    t.loadStoresAndThen(taskStore, function () {

        t.is(taskStore.getRootNode().childNodes.length,  5, '5 top-level tasks ')
        t.ok(!taskStore.getNodeById(122), 'No new record yet')
        
        taskStore.getRootNode().appendChild({
            StartDate       : new Date(2010,1,22),
            EndDate         : new Date(2010,1,23),
            Name            : 'New task',
            Duration        : 1,
            DurationUnit    : "d"
        })
        
        var async1 = t.beginAsync()
        // can't use Ext.clone because in IE8 it also clones the non-enumerable properties like "constructor /  toString / valueOf" etc
        var originalData = Ext.apply({}, taskStore.getNewRecords()[0].data);
        
        t.ok(originalData.isLast, 'New record is last')
        
        // CREATE listener
        taskStore.on('write', function (store, operation) {
            var rs = operation.getRecords();
            t.ok(taskStore.getNodeById(122), 'New record appeared')
            t.is(taskStore.getNodeById(122).getName(), 'New task', 'New task has correct name');
            
            t.endAsync(async1)
        }, null, { single : true })
        
        t.diag("Sync (ADD) operation started");
        taskStore.sync()
    })
})    
