StartTest(function(t) {

    // {{{ Setup
    var Ext       = t.getExt(),
        monday    = new Date(2014, 7, 25),
        tuesday   = new Date(2014, 7, 26),
        wednesday = new Date(2014, 7, 27),
        thursday  = new Date(2014, 7, 28),
        friday    = new Date(2014, 7, 29),
        saturday  = new Date(2014, 7, 30);

    function getSampleData() {
        return t.getAllStoresDataSet(
            // Tasks
            [
                { Id : 1, StartDate : monday, EndDate : saturday, children : [
                    { Id : 2, StartDate : monday,    EndDate : wednesday, leaf : true },
                    { Id : 3, StartDate : thursday,  EndDate : saturday, leaf : true }
                ] },
                { Id : 4, StartDate : monday, EndDate : wednesday, children : [
                    { Id : 5, StartDate : monday, Effort : 48, SchedulingMode : 'EffortDriven', leaf : true }
                ] },
                { Id : 6, StartDate : monday, EndDate : tuesday, children : [
                    { Id : 7, StartDate : monday, EndDate : tuesday, leaf : true }
                ] },
                { Id : 8, StartDate : tuesday, EndDate : tuesday, children : [
                    { Id : 9, StartDate : tuesday, EndDate : tuesday, leaf : true }
                ] },
                { Id : 10, StartDate : monday, EndDate : saturday, children : [
                    { Id : 11, StartDate : monday, EndDate : saturday, children : [
                        { Id : 12, StartDate : monday,    EndDate : wednesday, leaf : true },
                        { Id : 13, StartDate : wednesday, EndDate : thursday, leaf : true },
                        { Id : 14, StartDate : thursday,  EndDate : saturday, leaf : true }
                    ] },
                    { Id : 15, StartDate : monday, EndDate : tuesday, leaf : true }
                ] }
            ],
            // Dependencies
            [
                { Id : 1, From : 12, To : 13},
                { Id : 2, From : 13, To : 14}
            ],
            // Assignments
            [
                { Id : 1, ResourceId : 1, TaskId : 5, Units  : 100 },
                { Id : 2, ResourceId : 3, TaskId : 12, Units : 100 },
                { Id : 3, ResourceId : 4, TaskId : 13, Units : 100 },
                { Id : 4, ResourceId : 5, TaskId : 14, Units : 100 }
            ],
            // Resources
            [
                { Id : 1, Name : "Resource 1" },
                { Id : 2, Name : "Resource 2" },
                { Id : 3, Name : "Resource 3" },
                { Id : 4, Name : "Resource 4" },
                { Id : 5, Name : "Resource 5" }
            ]
        );
    }
    // }}}

    t.describe([
        "Constraints bring asynchronous behaviour into the API, following methods might affect tasks position",
        "and as the result might start constraints revalidation chain which might have asynchronous behaviour",
        "thus these methods now support `callback` parameter which is called upon revalidation chain completion",
        "or in case a user choosen to cancel all the initial and propagated changes to data model."
    ].join(' '), function(t) {

        // {{{ Task::setStartDate()
        t.describe("Task::setStartDate()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    childTask1 = task(2),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnolaterthan', monday);
                        childTask1.setStartDate(tuesday, true, true, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(childTask1.getStartDate(), monday, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::setEndDate()
        t.describe("Task::setEndDate()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    childTask2 = task(3),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('finishnoearlierthan', saturday);
                        childTask2.setEndDate(friday, true, true, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(childTask2.getEndDate(), saturday, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::setStartEndDate()
        t.describe("Task::setStartEndDate()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    childTask1 = task(2),
                    childTask2 = task(3),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnolaterthan', monday);
                        childTask1.setStartEndDate(tuesday, friday, true, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(childTask1.getStartDate(), monday,    "Start date is reverted");
                        t.is(childTask1.getEndDate(),   wednesday, "End date is reverted");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::shift()
        t.describe("Task::shift()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    childTask2 = task(2),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnolaterthan', monday);
                        childTask2.shift(Sch.util.Date.DAY, 2, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(childTask2.getStartDate(), monday,    "Start date is reverted");
                        t.is(childTask2.getEndDate(),   wednesday, "End date is reverted");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::setEffort()
        t.describe("Task::setEffort()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask       = task(4),
                    effortDrivenTask = task(5),
                    done             = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('finishnolaterthan', wednesday);
                        effortDrivenTask.setEffort(72, null, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(effortDrivenTask.getEffort(), 48, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::setDuration()
        t.describe("Task::setDuration()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    normalTask = task(3),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('finishnolaterthan', saturday);
                        normalTask.setDuration(24, null, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(normalTask.getEndDate(), saturday, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::convertToMilestone()
        t.describe("Task::convertToMilestone()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(6),
                    normalTask = task(7),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnolaterthan', monday);
                        normalTask.convertToMilestone(function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(normalTask.isMilestone(), false, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::convertToRegular()
        t.describe("Task::convertToRegular()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(8),
                    normalTask = task(9),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnoearlierthan', tuesday);
                        normalTask.convertToRegular(function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(normalTask.isMilestone(), true, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::assign()
        t.describe("Task::assign()", function(t) {
            /* global task, resId, taskStore, assignmentStore */
            with (getSampleData()) {
                var parentTask       = task(4),
                    effortDrivenTask = task(5),
                    resource2        = resId(2),
                    assignmentsCount = assignmentStore.getCount(),
                    done             = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('finishnoearlierthan', wednesday);
                        effortDrivenTask.assign(resource2, 100, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(assignmentStore.getCount(), assignmentsCount, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::unAssign()
        t.describe("Task::unAssign()", function(t) {
            /* global task, resId, taskStore, assignmentStore */
            with (getSampleData()) {
                var parentTask       = task(4),
                    effortDrivenTask = task(5),
                    resource1        = resId(1),
                    assignmentsCount = assignmentStore.getCount(),
                    done             = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('finishnoearlierthan', wednesday);
                        effortDrivenTask.unAssign(resource1, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(assignmentStore.getCount(), assignmentsCount, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::linkTo()
        t.describe("Task::linkTo()", function(t) {
            /* global task, resId, taskStore, dependencyStore */
            with (getSampleData()) {
                var task2 = task(2),
                    task3 = task(3),
                    done  = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        task2.setConstraint('finishnolaterthan', wednesday);
                        task3.linkTo(task2, null, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(dependencyStore.areTasksLinked(task2, task3), false, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::unlinkFrom()
        t.describe("Task::unlinkFrom()", function(t) {
            t.todo("Currently unlinking doesn't affect any task, but in future it might.", function(t) {
                t.fail("No test present");
            });
        });
        // }}}

        // {{{ Task::indent()
        t.describe("Task::indent()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    task2      = task(2),
                    task3      = task(3),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        task2.setConstraint('startnolaterthan', monday);
                        task3.indent(function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task3.parentNode === parentTask, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}
   
        // {{{ Task::outdent() 
        t.describe("Task::outdent()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask = task(1),
                    task2      = task(2),
                    done       = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask.setConstraint('startnolaterthan', monday);
                        task2.outdent(function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task2.parentNode === parentTask, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::addSubtask()
        t.describe("Task::addSubtask()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask1 = task(1),
                    parentTask4 = task(4),
                    task3       = task(3),
                    done        = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask4.setConstraint('finishnolaterthan', wednesday);
                        parentTask4.addSubtask(task3, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task3.parentNode === parentTask1, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}
       
        // {{{ Task::insertSubtask()
        t.describe("Task::insertSubtask()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask1 = task(1),
                    parentTask4 = task(4),
                    task3       = task(3),
                    done        = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask4.setConstraint('finishnolaterthan', wednesday);
                        parentTask4.insertSubtask(0, task3, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task3.parentNode === parentTask1, "All changes are canceled");
                        next();
                    }
                );
            }
     
        });
        // }}}

        // {{{ Task::addTaskAbove()
        t.describe("Task::addTaskAbove()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask1 = task(1),
                    parentTask4 = task(4),
                    task3       = task(3),
                    task5       = task(5),
                    done        = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask4.setConstraint('finishnolaterthan', wednesday);
                        task5.addTaskAbove(task3, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task3.parentNode === parentTask1, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::addTaskBelow()
        t.describe("Task::addTaskBelow()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask1 = task(1),
                    parentTask4 = task(4),
                    task3       = task(3),
                    task5       = task(5),
                    done        = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask4.setConstraint('finishnolaterthan', wednesday);
                        task5.addTaskBelow(task3, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.ok(task3.parentNode === parentTask1, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::addMilestone()
        t.describe("Task::addMilestone()", function(t) {
            /* global task, taskStore */
            with (getSampleData()) {
                var parentTask6 = task(6),
                    task7       = task(7),
                    done        = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask6.setConstraint('finishnolaterthan', tuesday);
                        task7.addMilestone({StartDate : wednesday, EndDate : wednesday, Duration : 0 }, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(parentTask6.childNodes.length, 1, "All changes are canceled");
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::addSuccessor()
        t.describe("Task::addSuccessor()", function(t) {
            /* global task, taskStore, dependencyStore */
            with (getSampleData()) {
                var parentTask1       = task(1),
                    task3             = task(3),
                    dependenciesCount = dependencyStore.getCount(),
                    done              = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask1.setConstraint('finishnolaterthan', saturday);
                        task3.addSuccessor(null, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(parentTask1.childNodes.length, 2, "Successor task adding canceled");
                        t.is(dependencyStore.getCount(), dependenciesCount, "Dependency adding canceled"); 
                        next();
                    }
                );
            }

        });
        // }}}

        // {{{ Task::addPredecessor()
        t.describe("Task::addPredecessor()", function(t) {
            /* global task, taskStore, dependencyStore */
            with (getSampleData()) {
                var parentTask1       = task(1),
                    task2             = task(2),
                    dependenciesCount = dependencyStore.getCount(),
                    done              = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask1.setConstraint('startnoearlierthan', monday);
                        task2.addPredecessor(null, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(parentTask1.childNodes.length, 2, "Predecessor task adding canceled");
                        t.is(dependencyStore.getCount(), dependenciesCount, "Dependency adding canceled"); 
                        next();
                    }
                );
            }
        });
        // }}}

        // {{{ Task::removeSubtask()
        t.describe("Task::removeSubtask()", function(t) {
            /* global task, taskStore, dependencyStore, assignmentStore */
            with (getSampleData()) {
                var parentTask10      = task(10),
                    parentTask11      = task(11),
                    task12            = task(12),
                    task13            = task(13),
                    task14            = task(14),
                    dependenciesCount = dependencyStore.getCount(),
                    assignmentsCount  = assignmentStore.getCount(),
                    done              = false;

                taskStore.on('constraintconflict', function(task, resolutionContext) {
                    t.pass("Got constraint conflict");
                    Ext.Function.defer(resolutionContext.cancelAction, 1, resolutionContext);
                }, null, { single : true });

                t.chain(
                    function(next) {
                        parentTask10.setConstraint('finishnoearlierthan', saturday);
                        parentTask10.removeSubtask(parentTask11, function(cancelChanges) {
                            done = true;
                        });

                        t.is(done, false, "Callback should be called asynchronously in this case");

                        t.is(parentTask10.childNodes.length, 1, "Subtask has been removed");
                        t.is(dependencyStore.getCount(), dependenciesCount - 2, "Subtree dependencies has been removed");
                        t.is(assignmentStore.getCount(), assignmentsCount - 3, "Subtree assignments has been removed");

                        next();
                    },

                    { waitFor : function() { return done; }, desc : "Callback's been called" },

                    function(next) {
                        t.is(parentTask10.childNodes.length, 2, "Subtask removing canceled");
                        t.is(dependencyStore.getCount(), dependenciesCount, "Dependencies are restored");
                        t.is(assignmentStore.getCount(), assignmentsCount, "Assignments are restored");
                        next();
                    }
                );
            }
        });
        // }}}
    });
});
