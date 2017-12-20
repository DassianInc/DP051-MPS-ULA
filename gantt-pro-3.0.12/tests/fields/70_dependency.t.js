describe('Dependency field tests', function(t) {

    var taskStore = t.getTaskStore({
        DATA            : [
            {
                Id : 11
            },
            {
                Id : 12
            },
            {
                Id : 13
            }
        ],
        dependencyStore : new Gnt.data.DependencyStore()
    });

    var root  = taskStore.getRootNode(),
        task  = root.firstChild,
        task2 = task.nextSibling,
        task3 = root.lastChild;
        
    var field      = new Gnt.field.Dependency({
        task                : task,
        fieldLabel          : 'Dep Field',
        renderTo            : Ext.getBody()
    });

    t.it('Search by ID', function(t) {
        t.chain(
            { click      : '.x-form-field'},

            function (next) {
                field.setValue('12');

                // This should process the field content and update the dependency store
                field.applyChanges();

                t.is(taskStore.dependencyStore.getCount(), 1, 'Should find 1 new record in the dependency store');
                t.is(taskStore.dependencyStore.first().getSourceTask(), task2, 'Should find task2 as source task');
                t.is(taskStore.dependencyStore.first().getTargetTask(), task, 'Should find task1 as target task');
                t.is(taskStore.dependencyStore.first().getType(), Gnt.model.Dependency.Type.EndToStart, 'Should find end-to-start as the type');

                field.setValue('12SS');

                field.applyChanges();

                t.is(taskStore.dependencyStore.first().getType(), Gnt.model.Dependency.Type.StartToStart, 'Should find start-to-start as the type');

                field.setValue();

                // This should clear the dependency store contents
                field.applyChanges();

                t.is(taskStore.dependencyStore.getCount(), 0, 'Should find no records in the dependency store with an empty field');
            }
        )
    })

    t.it('Search by sequence number', function(t) {
        t.chain(
            { click      : '.x-form-field'},

            function (next) {
                field.useSequenceNumber = true;
                field.setValue('3');

                // This should process the field content and update the dependency store
                field.applyChanges();

                t.is(taskStore.dependencyStore.getCount(), 1, 'Should find 1 new record in the dependency store');
                t.is(taskStore.dependencyStore.first().getSourceTask(), task3, 'Should find task3 as source task');
                t.is(taskStore.dependencyStore.first().getTargetTask(), task, 'Should find task1 as target task');
                t.is(taskStore.dependencyStore.first().getType(), Gnt.model.Dependency.Type.EndToStart, 'Should find end-to-start as the type');

                field.setValue();

                // This should clear the dependency store contents
                field.applyChanges();

                t.is(taskStore.dependencyStore.getCount(), 0, 'Should find no records in the dependency store with an empty field');
            }
        );
    });
});
