StartTest(function (t) {

    // Various assertions for dependency store methods

    var getDataSet = function (dependencies, tasks, taskStoreCfg, depStoreCfg) {

        var dependencyStore = new Gnt.data.DependencyStore(Ext.apply({
            data    : dependencies || [
                { Id: 123, From: 1, To: 2, Type: 2 },
                { Id: 124, From: 2, To: 3, Type: 2 }
            ],
            transitiveDependencyValidation  : true
        }, depStoreCfg));

        var taskStore       = new Gnt.data.TaskStore(Ext.apply({
            dependencyStore : dependencyStore,

            root            : {
                expanded    : false,

                children    : tasks || [
                    {
                        Id: 1,
                        leaf: true,
                        StartDate: new Date(2011, 6, 1),
                        EndDate: new Date(2011, 6, 2)
                    },
                    {
                        Id: 2,
                        leaf: true,
                        StartDate: new Date(2011, 6, 2),
                        EndDate: new Date(2011, 6, 3)
                    },
                    {
                        Id: 3,
                        leaf: true,
                        StartDate: new Date(2011, 6, 3),
                        EndDate: new Date(2011, 6, 4)
                    },
                    {
                        Id: 4,
                        leaf: true,
                        StartDate: new Date(2011, 6, 3),
                        EndDate: new Date(2011, 6, 4)
                    },
                    {
                        Id: 5,
                        leaf: true,
                        StartDate: new Date(2011, 6, 3),
                        EndDate: new Date(2011, 6, 4)
                    },
                    {
                        Id: 6,
                        leaf: true,
                        StartDate: new Date(2011, 6, 3),
                        EndDate: new Date(2011, 6, 4)
                    }
                ]
            }
        }, taskStoreCfg));

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        };
    };

    t.it('Basic functionality',  function (t) {
        // create stores
        var ds = getDataSet();
        var taskStore = ds.taskStore;
        var dependencyStore = ds.dependencyStore;

        t.verifyCachedDependenciesState(taskStore);

        var dep = dependencyStore.first();

        t.ok(dep.isPersistable(), 'Dep is ok to persist');

        var newTask = new Gnt.model.Task();

        t.isDeeply(dependencyStore.getDependenciesForTask(newTask), [], 'getDependenciesForTask returns empty array');

        taskStore.getRootNode().appendChild(newTask);

        t.verifyCachedDependenciesState(taskStore);

        dep.setTargetTask(newTask);

        t.verifyCachedDependenciesState(taskStore);

        t.notOk(dep.isPersistable(), 'Dep is no longer ok to persist');

        t.isDeeply(dependencyStore.getDependenciesForTask(newTask), [ dep ], 'getDependenciesForTask');
        t.isDeeply(dependencyStore.getIncomingDependenciesForTask(newTask), [ dep ], 'getIncomingDependenciesForTask');
        t.isDeeply(dependencyStore.getOutgoingDependenciesForTask(newTask), [], 'getOutgoingDependenciesForTask empty');
        t.isDeeply(dependencyStore.getOutgoingDependenciesForTask(taskStore.getRootNode().firstChild), [ dep ], 'getOutgoingDependenciesForTask empty');

        dep.reject();

        t.verifyCachedDependenciesState(taskStore);

        t.ok(dependencyStore.hasTransitiveDependency(1, 2), 'hasTransitiveDependency works on directly depended tasks');
        // checking methodsCache
        var cacheKey = dependencyStore.buildCacheKey(1, 2, null, null, { visitedTasks : {}});
        t.ok(dependencyStore.isCachedResultAvailable('hasTransitiveDependency', cacheKey), 'Method result is cached');

        t.ok(dependencyStore.hasTransitiveDependency(1, 3), 'hasTransitiveDependency');
        cacheKey = dependencyStore.buildCacheKey(1, 3, null, null, { visitedTasks : {}});
        t.ok(dependencyStore.isCachedResultAvailable('hasTransitiveDependency', cacheKey), 'Method result is cached');

        t.notOk(dependencyStore.hasTransitiveDependency(3, 1), 'hasTransitiveDependency returns empty');
        cacheKey = dependencyStore.buildCacheKey(3, 1, null, null, { visitedTasks : {}});
        t.ok(dependencyStore.isCachedResultAvailable('hasTransitiveDependency', cacheKey), 'Method result is cached');

        t.ok(dependencyStore.isValidDependency(dep), 'isValidDependency called with dependency');

        // Creates circular link
        dep.setSourceId(3);

        t.verifyCachedDependenciesState(taskStore);

        t.notOk(dependencyStore.isValidDependency(dep), 'isValidDependency called with dependency - bad dependency');
        dep.reject();

        t.verifyCachedDependenciesState(taskStore);

        t.notOk(dependencyStore.isValidDependency(3, 1), 'isValidDependency called with ids - bad dependency - cycle');
        t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency called with ids - bad dependency - transitivity');

        t.ok(dependencyStore.areTasksLinked(1, 2), 'areTasksLinked');
        t.notOk(dependencyStore.areTasksLinked(1, 3), 'areTasksLinked falsy');
        t.notOk(dependencyStore.areTasksLinked(4, 1), 'areTasksLinked bad first task');
        t.notOk(dependencyStore.areTasksLinked(1, 4), 'areTasksLinked bad second task');

        var newDependency       = new Gnt.model.Dependency({
            From        : 2,
            To          : 1,
            Type        : 2
        });

        t.notOk(dependencyStore.isValidDependency(newDependency), "Dependency is not valid, since its will form a circular structure 1->2->1");

        newDependency           = new Gnt.model.Dependency({
            From        : 1,
            To          : 1,
            Type        : 2
        });

        t.notOk(dependencyStore.isValidDependency(newDependency), "Dependency from itself is not valid");

        newDependency           = new Gnt.model.Dependency({
            From        : "1",
            To          : 1,
            Type        : 2
        });

        t.notOk(dependencyStore.isValidDependency(newDependency), "Dependency from itself is not valid");
    });

    t.it('Should append dependency for empty tasks', function (t) {
        var checkDependencies = function (ds, t) {
            var taskStore = ds.taskStore;
            var dependencyStore = ds.dependencyStore;
            var root = taskStore.getRootNode();

            var successor = root.appendChild({
                Name    : 'New Task 1',
                leaf    : true
            });

            var predecessor = new Gnt.model.Task({
                Name    : 'New task 2',
                leaf    : true
            });

            successor.addPredecessor(predecessor);

            var startDate   = taskStore.getProjectStartDate();

            t.is(predecessor.getStartDate(), startDate, 'Predecessor start date set correctly');
            t.is(predecessor.getEndDate(), new Date(2011, 6, 2), 'Predecessor end date set correctly');
            t.is(predecessor.getDuration(), 1, 'Predecessor duration is correct');

            t.is(successor.getStartDate(), new Date(2011, 6, 4), 'Successor start date set correct');
            t.is(successor.getEndDate(), new Date(2011, 6, 5), 'Successor end date set correctly');
            t.is(successor.getDuration(), 1, 'Successor duration is correct');

            var newSuccessor = root.appendChild({
                Name    : 'New succesor',
                leaf    : true
            });

            var newPredecessor = root.appendChild({
                Name    : 'New predecessor',
                leaf    : true
            });

            var dependency = dependencyStore.last();
            dependency.setTargetTask(newSuccessor);
            dependency.setSourceTask(newPredecessor);

            t.is(newPredecessor.getStartDate(), startDate, 'Predecessor start date set correctly');
            t.is(newPredecessor.getEndDate(), new Date(2011, 6, 2), 'Predecessor end date set correctly');
            t.is(newPredecessor.getDuration(), 1, 'Predecessor duration is correct');

            t.is(newSuccessor.getStartDate(), new Date(2011, 6, 4), 'Successor start date set correct');
            t.is(newSuccessor.getEndDate(), new Date(2011, 6, 5), 'Successor end date set correctly');
            t.is(newSuccessor.getDuration(), 1, 'Successor duration is correct');

            predecessor = taskStore.getRootNode().appendChild({
                Name    : 'New Task 3',
                leaf    : true
            });

            successor = new Gnt.model.Task({
                Name    : 'New task 4',
                leaf    : true
            });

            predecessor.addSuccessor(successor);

            t.is(predecessor.getStartDate(), startDate, 'Predecessor start date set correctly');
            t.is(predecessor.getEndDate(), new Date(2011, 6, 2), 'Predecessor end date set correctly');
            t.is(predecessor.getDuration(), 1, 'Predecessor duration is correct');

            t.is(successor.getStartDate(), new Date(2011, 6, 4), 'Successor start date set correct');
            t.is(successor.getEndDate(), new Date(2011, 6, 5), 'Successor end date set correctly');
            t.is(successor.getDuration(), 1, 'Successor duration is correct');

            newSuccessor = root.appendChild({
                Name    : 'New succesor',
                leaf    : true
            });

            newPredecessor = root.appendChild({
                Name    : 'New predecessor',
                leaf    : true
            });

            dependency = dependencyStore.last();
            dependency.setTargetTask(newSuccessor);
            dependency.setSourceTask(newPredecessor);

            t.is(newPredecessor.getStartDate(), startDate, 'Predecessor start date set correctly');
            t.is(newPredecessor.getEndDate(), new Date(2011, 6, 2), 'Predecessor end date set correctly');
            t.is(newPredecessor.getDuration(), 1, 'Predecessor duration is correct');

            t.is(newSuccessor.getStartDate(), new Date(2011, 6, 4), 'Successor start date set correct');
            t.is(newSuccessor.getEndDate(), new Date(2011, 6, 5), 'Successor end date set correctly');
            t.is(newSuccessor.getDuration(), 1, 'Successor duration is correct');
        }

        t.it('Should work w/ cascadeChanges', function (t) {
            checkDependencies(getDataSet(false, false, {
                cascadeChanges  : true
            }), t);
        });

        t.it('Should work w/o cascadeChanges', function (t) {
            checkDependencies(getDataSet(), t);
        });
    });

    // assertions for #1159

    t.it('isValidDependency() treats 2->3 dependency as invalid if we have 1->2,1->3 dependencies (transitivity)',  function (t) {
        // create stores
        var dependencyStore = getDataSet([{ Id : 1, From : 1, To : 2 }, { Id : 2, From : 1, To : 3 }]).dependencyStore;

        t.notOk(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid since we already have such dependency');
        t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since we already have such dependency');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 1->2 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 1->3 valid');
        t.notOk(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid (transitivity)');

        t.it('Doesn`t take transitivity cases into account when transitiveDependencyValidation=false', function (t) {
            var dependencyStore = getDataSet([{ Id : 1, From : 1, To : 2 }, { Id : 2, From : 1, To : 3 }], null, null, { transitiveDependencyValidation : false }).dependencyStore;

            t.notOk(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid since we already have such dependency');
            t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since we already have such dependency');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 1->2 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 1->3 valid');
            t.ok(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid (transitivity)');
        });
    });

    t.it('isValidDependency() treats 1->2 dependency as invalid if we have 2->3,1->3 dependencies (transitivity)',  function (t) {
        // create stores
        var dependencyStore = getDataSet([{ Id : 1, From : 2, To : 3 }, { Id : 2, From : 1, To : 3 }]).dependencyStore;

        t.notOk(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid since we already have such dependency');
        t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since we already have such dependency');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 2->3 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 1->3 valid');
        t.notOk(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid (transitivity)');

        t.it('Doesn`t take transitivity cases into account when transitiveDependencyValidation=false', function (t) {
            var dependencyStore = getDataSet([{ Id : 1, From : 2, To : 3 }, { Id : 2, From : 1, To : 3 }], null, null, { transitiveDependencyValidation : false }).dependencyStore;

            t.notOk(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid since we already have such dependency');
            t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since we already have such dependency');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 2->3 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 1->3 valid');
            t.ok(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid (transitivity)');
        });
    });

    t.it('isValidDependency should handle non existing id as input',  function (t) {

        var store = getDataSet().dependencyStore;

        t.notOk(store.isValidDependency(22, 'foo'), 'predecessorsHaveTransitiveDependency');
    });

    // #1159 end

    t.it('isValidDependency accepts list of extra added/removed dependencies to be taken into account', function (t) {
        var dependencyStore = getDataSet([{ Id : 1, From : 1, To : 2 }]).dependencyStore;

        t.notOk(dependencyStore.isValidDependency(2, 3, 2, [{ Id : 2, From : 1, To : 3 }]), 'isValidDependency 2->3 invalid since we plan to add 1->3 dependency');
        t.notOk(dependencyStore.isValidDependency(1, 3, 2, [{ Id : 2, From : 2, To : 3 }]), 'isValidDependency 1->3 invalid since we plan to add 2->3 dependency');
        t.ok(dependencyStore.isValidDependency(1, 2, 2, null, [dependencyStore.getAt(0)]), 'isValidDependency 1->2 valid since we plan to remove existing 1->2 dependency');
        t.ok(dependencyStore.isValidDependency(2, 1, 2, null, [dependencyStore.getAt(0)]), 'isValidDependency 1->2 valid since we plan to remove existing 1->2 dependency');

        t.it('Doesn`t take transitivity cases into account when transitiveDependencyValidation=false', function (t) {
            var dependencyStore = getDataSet([{ Id : 1, From : 1, To : 2 }], null, null, { transitiveDependencyValidation : false }).dependencyStore;

            t.ok(dependencyStore.isValidDependency(2, 3, 2, [{ Id : 2, From : 1, To : 3 }]), 'isValidDependency 2->3 invalid since we plan to add 1->3 dependency');
            t.ok(dependencyStore.isValidDependency(1, 3, 2, [{ Id : 2, From : 2, To : 3 }]), 'isValidDependency 1->3 invalid since we plan to add 2->3 dependency');
            t.ok(dependencyStore.isValidDependency(1, 2, 2, null, [dependencyStore.getAt(0)]), 'isValidDependency 1->2 valid since we plan to remove existing 1->2 dependency');
            t.ok(dependencyStore.isValidDependency(2, 1, 2, null, [dependencyStore.getAt(0)]), 'isValidDependency 1->2 valid since we plan to remove existing 1->2 dependency');
        });
    });

    t.it('isValidDependency() treats 3->4 dependency as invalid if we have 1->2->3,4->5->6,1->6 dependencies (transitivity)',  function (t) {
        // create stores
        var dependencyStore     = getDataSet([
            { Id : 1, From : 1, To : 2 },
            { Id : 2, From : 2, To : 3 },
            { Id : 3, From : 4, To : 5 },
            { Id : 4, From : 5, To : 6 },
            { Id : 5, From : 1, To : 6 }
        ]).dependencyStore;

        t.notOk(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid since we already have such dependency');
        t.notOk(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid since we already have such dependency');
        t.notOk(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since it`s transitivity (we have 1->2->3)');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 1->2 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 2->3 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(3)), 'isValidDependency existing 4->5 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(4)), 'isValidDependency existing 5->6 valid');
        t.ok(dependencyStore.isValidDependency(dependencyStore.getById(5)), 'isValidDependency existing 1->6 valid');
        t.notOk(dependencyStore.isValidDependency(3, 4), 'isValidDependency 3->4 invalid (transitivity)');

        t.it('Doesn`t take transitivity cases into account when transitiveDependencyValidation=false', function (t) {
            // create stores
            var dependencyStore     = getDataSet([
                { Id : 1, From : 1, To : 2 },
                { Id : 2, From : 2, To : 3 },
                { Id : 3, From : 4, To : 5 },
                { Id : 4, From : 5, To : 6 },
                { Id : 5, From : 1, To : 6 }
            ], null, null, {
                transitiveDependencyValidation : false
            }).dependencyStore;

            t.notOk(dependencyStore.isValidDependency(2, 3), 'isValidDependency 2->3 invalid since we already have such dependency');
            t.notOk(dependencyStore.isValidDependency(1, 2), 'isValidDependency 1->2 invalid since we already have such dependency');
            t.ok(dependencyStore.isValidDependency(1, 3), 'isValidDependency 1->3 invalid since it`s transitivity (we have 1->2->3)');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(1)), 'isValidDependency existing 1->2 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(2)), 'isValidDependency existing 2->3 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(3)), 'isValidDependency existing 4->5 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(4)), 'isValidDependency existing 5->6 valid');
            t.ok(dependencyStore.isValidDependency(dependencyStore.getById(5)), 'isValidDependency existing 1->6 valid');
            t.ok(dependencyStore.isValidDependency(3, 4), 'isValidDependency 3->4 invalid (transitivity)');
        });
    });

    t.it('isValidDependency() should check allowParentTaskDependencies flag',  function (t) {

        var dependencyStore     = t.getDependencyStore({
            allowParentTaskDependencies : false,
            data                        : [
                {Id : 1, From : 1, To : 2},
                {Id : 1, From : 2, To : 1}
            ]
        });

        var taskStore = new Gnt.data.TaskStore({
            dependencyStore : dependencyStore,
            root            : {
                expanded : true,
                children : [
                    {
                        Id        : 1,
                        leaf      : false
                    },
                    {
                        Id        : 2,
                        leaf      : false
                    }
                ]
            }
        });

        t.notOk(dependencyStore.isValidDependency(dependencyStore.getAt(0)), 'Should not allow parent task dependencies')
        t.notOk(dependencyStore.isValidDependency(dependencyStore.getAt(1)), 'Should not allow parent task dependencies')
    });
});
