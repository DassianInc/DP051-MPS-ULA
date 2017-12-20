StartTest(function (t) {

    function getDataSet() {

        var data = {
            resources : [
                { Id : 33, Name : 'foo' },
                { Id : 44, Name : 'bar' }
            ],
    
            dependencies : [
                { From : 1, To : 2, Id : 1 },
                { From : 3, To : 4, Id : 2 },
                { From : 5, To : 6, Id : 3 }
            ],
    
            assignments : [
                { Id : 11, TaskId : 1, ResourceId : 33, Units : 60 },
                { Id : 22, TaskId : 2, ResourceId : 44, Units : 10 }
            ],
    
            tasks : [
                { Id : 1, leaf : true, Name : 'Task 1' },
                { Id : 2, leaf : true, Name : 'Task 2' },
                { Id : 3, leaf : true, Name : 'Task 3' },
                {
                    Id : 4, expanded : true, Name : 'Task 4', children : [
                        { Id : 5, leaf : true, Name : 'Task 5' },
                        { Id : 6, leaf : true, Name : 'Task 6' }
                    ]
                }
            ]
        };
        
        var importer = new Gnt.data.ux.Importer();

        var resourceStore = Ext.create("Gnt.data.ResourceStore");
        var dependencyStore = Ext.create("Gnt.data.DependencyStore");
        var assignmentStore = Ext.create("Gnt.data.AssignmentStore");

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            resourceStore   : resourceStore,
            proxy           : 'memory',
            root            : {
                expanded : true
            },

            getByName : function (name) {
                var retVal;

                this.getRootNode().cascadeBy(function (rec) {
                    if (rec.data.Name === name) {
                        retVal = rec;

                        return false;
                    }
                });

                return retVal;
            }
        });

        importer.init({
            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            resourceStore   : resourceStore
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            resourceStore   : resourceStore,
            importer        : importer,

            data            : data
        };
    }

    t.describe("Should be possible to take an existing data set with models having Ids " +
    "and import it into the gantt stores, and convert all to phantoms to be saved", function (t) {

        var dataSet = getDataSet(),

            importer = dataSet.importer,
            taskStore = dataSet.taskStore,
            dependencyStore = dataSet.dependencyStore,
            resourceStore = dataSet.resourceStore,
            assignmentStore = dataSet.assignmentStore;

        importer.importData(dataSet.data);

        var task = taskStore.getByName('Task 1');
        t.is(taskStore.getRootNode().childNodes.length, 4, '4 top level tasks');
        t.is(taskStore.getRootNode().lastChild.childNodes.length, 2, '2 nested child tasks');

        t.is(task.getSuccessors().length, 1, "1 successor in total");
        t.is(task.getSuccessors()[0], taskStore.getByName('Task 2'), 'Correct successor');
        t.is(taskStore.getByName('Task 3').getSuccessors()[0], taskStore.getByName('Task 4'), 'Correct successor');
        t.is(taskStore.getByName('Task 5').getSuccessors()[0], taskStore.getByName('Task 6'), 'Correct successor');
        t.is(task.getResources()[0].getName(), 'foo');
        t.is(taskStore.getByName('Task 2').getResources()[0].getName(), 'bar');

        t.is(taskStore.getNewRecords().length, 6, 'Phantom tasks');
        t.is(dependencyStore.getNewRecords().length, 3, 'Phantom deps');
        t.is(resourceStore.getNewRecords().length, 2, 'Phantom resources');
        t.is(assignmentStore.getNewRecords().length, 2, 'Phantom assignments');

        t.is(assignmentStore.first().getUnits(), 60);
        t.is(assignmentStore.last().getUnits(), 10);
    });

    t.describe("Should handle tasks wrapped in a root object", function (t) {

        var dataSet = getDataSet(),

            importer = dataSet.importer,
            taskStore = dataSet.taskStore,
            dependencyStore = dataSet.dependencyStore,
            resourceStore = dataSet.resourceStore,
            assignmentStore = dataSet.assignmentStore;

        importer.importData({
            resources : dataSet.data.resources,

            dependencies : dataSet.data.dependencies,

            assignments : dataSet.data.assignments,

            tasks : {
                Name     : 'The root',
                children : dataSet.data.tasks
            }
        });

        var root = taskStore.getRootNode();

        t.is(root.getName(), 'The root', 'root created ok');
        
        t.is(root.getTreeStore(), taskStore, 'Tree store set');

        var task = taskStore.getByName('Task 1');
        t.is(taskStore.getRootNode().childNodes.length, 4, '4 top level tasks');
        t.is(taskStore.getRootNode().lastChild.childNodes.length, 2, '2 nested child tasks');

        t.is(task.getSuccessors()[0], taskStore.getByName('Task 2'), 'Correct successor');
        t.is(taskStore.getByName('Task 3').getSuccessors()[0], taskStore.getByName('Task 4'), 'Correct successor');
        t.is(taskStore.getByName('Task 5').getSuccessors()[0], taskStore.getByName('Task 6'), 'Correct successor');
        t.is(task.getResources()[0].getName(), 'foo');
        t.is(taskStore.getByName('Task 2').getResources()[0].getName(), 'bar');

        t.is(taskStore.getNewRecords().length, 6, 'Phantom tasks');
        t.is(dependencyStore.getNewRecords().length, 3, 'Phantom deps');
        t.is(resourceStore.getNewRecords().length, 2, 'Phantom resources');
        t.is(assignmentStore.getNewRecords().length, 2, 'Phantom assignments');

        t.is(assignmentStore.first().getUnits(), 60);
        t.is(assignmentStore.last().getUnits(), 10);
    });
});
