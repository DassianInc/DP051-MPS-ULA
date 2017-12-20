StartTest(function(t) {

    t.it('Verify model fields', function(t) {
        var mod = Gnt.model.Dependency;

        t.ok(mod.getField('Id'), 'Id ok');
        t.ok(mod.getField('From'), 'From ok');
        t.ok(mod.getField('To'), 'To ok');
        t.ok(mod.getField('Type'), 'Type ok');
        t.ok(mod.getField('Lag'), 'Lag ok');
        t.ok(mod.getField('LagUnit'), 'LagUnit ok');
        t.ok(mod.getField('Cls'), 'Cls ok');
    })

    var dependencyStore = t.getDependencyStore({
        data : [
            {
                Id      : 1,
                From    : 1,
                To      : 2,
                Type    : 2,
                Lag     : 0
            }
        ]
    });
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
            
        root        : {
            expanded    : true,
                
            children    : [
                {
                    Id          : 1,
                    leaf        : true,
                    StartDate   : new Date(2011, 6, 1),
                    EndDate     : new Date(2011, 6, 2)
                },
                {
                    Id          : 2,
                    leaf        : true,
                    StartDate   : new Date(2011, 6, 2),
                    EndDate     : new Date(2011, 6, 3)
                },
                {
                    Id          : 3,
                    leaf        : true,
                    StartDate   : new Date(2011, 6, 2),
                    EndDate     : new Date(2011, 6, 3)
                }
            ]
        }
    });

    var task1 = taskStore.getRootNode().childNodes[0];
    var task2 = taskStore.getRootNode().childNodes[1];
    var task3 = taskStore.getRootNode().childNodes[2];
    
    var dep = dependencyStore.first(),
        Type = Gnt.model.Dependency.Type;

    t.ok(Type, 'Found Type');
    t.ok("StartToStart" in Type, 'Found StartToStart in Type');
    t.ok("StartToEnd" in Type, 'Found StartToEnd in Type');
    t.ok("EndToStart" in Type, 'Found EndToStart in Type');
    t.ok("EndToEnd" in Type, 'Found EndToEnd in Type');

    t.is(dep.getTaskStore(), taskStore, 'Found task store on the dependency model');

    t.is(dep.getSourceTask(), task1, 'Found source task');
    t.is(dep.getTargetTask(), task2, 'Found target task');
    
    t.is(dependencyStore.getSourceTask(dep), task1, 'Found source task');
    t.is(dependencyStore.getTargetTask(dep), task2, 'Found target task');
    

    dep.setTargetTask(task3);
    t.is(dep.getTargetTask(), task3, 'Updated target task ok');

    var task4 = taskStore.getRootNode().appendChild(new Gnt.model.Task());
    dep.setTargetTask(task4);
    t.is(dep.getTargetTask(), task4, 'Phantom task works ok');
    
    dep.setLag(3);
    t.is(dep.getLag(), 3, 'get/set for Lag works ok');

    t.it('should allow creating a dependency using real Task instances', function(t) {
        var dep = new Gnt.model.Dependency({
            From : task1,
            To   : task2
        });

        dependencyStore.add(dep);

        t.is(dep.getSourceTask(), task1, 'From ok');
        t.is(dep.getTargetTask(), task2, 'To ok');
        t.is(dep.getType(), 2, 'Type ok');
    })

    t.it('should adjust affected task after removing a dependency', function(t) {
        var dependencyStore = t.getDependencyStore({
            data : [
                {
                    From    : 1,
                    To      : 3,
                    Type    : 2
                },
                {
                    From    : 2,
                    To      : 3,
                    Type    : 2
                }
            ]
        });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,

            root        : {
                expanded    : true,

                children    : [
                    {
                        Id          : 1,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 4),
                        Duration    : 2
                    },
                    {
                        Id          : 2,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 4),
                        Duration    : 1
                    },
                    {
                        Id          : 3,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 6),
                        Duration    : 2
                    }
                ]
            }
        });

        t.is(taskStore.getById(3).getStartDate(), new Date(2011, 6, 6));

        // After removing, task 3 should snap to task 2 end date
        dependencyStore.removeAt(0);

        t.is(taskStore.getById(3).getStartDate(), new Date(2011, 6, 5));

    })
})    
