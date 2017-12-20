StartTest(function (t) {
    var gantt;

    t.beforeEach(function () {
        gantt && gantt.destroy();
    })
    //ticket #2173
    t.it('Task editor should fire events', function (t) {
        var taskEditor = new Gnt.plugin.TaskEditor();

        var Ext = t.getExt();

        gantt = t.getGantt2({
            renderTo      : Ext.getBody(),
            resourceStore : t.getResourceStore(),
            forceFit      : true,
            plugins       : taskEditor
        });

        var taskStore = gantt.getTaskStore();
        var task      = taskStore.getNodeById(117);

        t.firesOk({
            observable : taskEditor,
            events     : {
                show             : 1,
                loadtask         : 1,
                beforeupdatetask : 1,
                afterupdatetask  : 1,
                validate         : 1
            }
        });

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                var durationField = taskEditor.down('[$className=Gnt.field.Duration]');
                durationField.setValue({ value : 7, unit : 'd' });
                taskEditor.completeEditing();
                next();
            },

            function (next) {
                taskEditor.close();
            }
        );
    });


    t.it('Task editor assertions', function (t) {
        var taskEditor = new Gnt.plugin.TaskEditor();

        var Ext = t.getExt();

        gantt = t.getGantt2({
            renderTo      : Ext.getBody(),
            resourceStore : t.getResourceStore(),
            forceFit      : true,
            plugins       : taskEditor
        });

        var taskStore = gantt.getTaskStore();
        var task      = taskStore.getNodeById(117);

        var newTask = new Gnt.model.Task({
            Name        : 'Phantom task',
            PercentDone : 30,
            StartDate   : new Date(2010, 1, 1),
            EndDate     : new Date(2010, 1, 7),
            leaf        : true
        });

        task.addTaskAbove(newTask);

        var startDateField, durationField;

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                startDateField = taskEditor.down('[$className=Gnt.field.StartDate]');
                durationField  = taskEditor.down('[$className=Gnt.field.Duration]');

                t.diag('Change start date & duration');

                startDateField.setValue(new Date(2010, 1, 1));
                durationField.setValue({ value : 7, unit : 'd' });
                taskEditor.completeEditing();

                t.is(task.getStartDate(), new Date(2010, 1, 1), 'Start date changed');
                t.is(task.getDuration(), 7, 'Duration changed');
                t.is(task.getDurationUnit(), 'd', 'Duration unit is right');

                next();
            },

            function (next) {
                t.diag('Edit phantom task');
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(newTask), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                var percentField = taskEditor.down('[$className=Gnt.field.Percent]');
                var endDateField = taskEditor.down('[$className=Gnt.field.EndDate]');

                t.is(startDateField.getRawValue(), '02/01/2010', 'Correct start date');
                t.is(endDateField.getRawValue(), '02/06/2010', 'Correct end date');
                t.is(percentField.getValue(), 30, 'Correct percent completion value');

                t.diag('Change start date & duration');

                startDateField.setValue(new Date(2010, 1, 3));
                durationField.setValue({ value : 7, unit : 'd' });

                next();
            },

            function (next) {
                var assignmentGrid = taskEditor.down('[$className=Gnt.widget.AssignmentEditGrid]');

                t.is(assignmentGrid.taskId, newTask.getId(), 'Assignment grid got phantom task id');

                taskEditor.completeEditing();

                t.is(newTask.getStartDate(), new Date(2010, 1, 3), 'Start date changed');
                t.is(newTask.getDuration(), 7, 'Duration changed');
                t.is(newTask.getDurationUnit(), 'd', 'Duration unit is right');

                next();
            },
            function (next) {
                t.diag('Hide nodes');
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },
            { waitForComponentVisible : taskEditor },
            function (next) {
                taskEditor.taskEditor.setActiveTab(1);
                // have to render combobox to fill store
                taskEditor.taskEditor.dependencyGrid.insertDependency();
                next();
            },
            function (next) {
                var store = taskEditor.taskEditor.dependencyGrid.tasksCombo.getStore();

                t.ok(store.getById(120), 'Record #120 is in combo');
                t.ok(store.getById(121), 'Record #121 is in combo');

                taskStore.hideNodesBy(function (node) {
                    return node.get('Id') == 120 || node.get('Id') == 121;
                });

                next();
            },
            { waitFor : 100 },
            function (next) {
                var store = taskEditor.taskEditor.dependencyGrid.tasksCombo.getStore();

                t.notOk(store.getById(120), 'Record #120 is NOT in combo');
                t.notOk(store.getById(121), 'Record #121 is NOT in combo');
                taskEditor.close();
            }
        );
    });

    t.it('Dependency grid shows task IDs', function (t) {

        var taskEditor = new Gnt.plugin.TaskEditor();

        gantt = t.getGantt2({
            title         : 'ID',
            renderTo      : Ext.getBody(),
            resourceStore : t.getResourceStore(),
            forceFit      : true,
            plugins       : taskEditor
        });

        var task = gantt.taskStore.getNodeById(115),
            grid,
            store;

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },
            { waitForComponentVisible : taskEditor },
            function (next) {
                taskEditor.taskEditor.setActiveTab(1);
                grid  = taskEditor.taskEditor.dependencyGrid;
                grid.insertDependency();
                store = grid.tasksCombo.getStore();

                for (var i = 0; i < store.getCount(); i++) {
                    var record = store.getAt(i);
                    grid.tasksCombo.select(record);
                    grid.cellEditing.completeEdit();

                    t.matchGridCellContent(grid, 0, 0, record.getId(), 'Rendered value is correct');
                    grid.insertDependency();
                }

                taskEditor.close();
            }
        );
    });

    t.it('Dependency grid shows task sequence numbers', function (t) {

        var taskEditor = new Gnt.plugin.TaskEditor({
            dependencyGridConfig : { useSequenceNumber : true }
        });

        gantt = t.getGantt2({
            title         : 'SN',
            renderTo      : Ext.getBody(),
            resourceStore : t.getResourceStore(),
            forceFit      : true,
            plugins       : taskEditor
        });

        var task = gantt.taskStore.getNodeById(115),
            grid,
            store;

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                taskEditor.taskEditor.setActiveTab(1);
                grid  = taskEditor.taskEditor.dependencyGrid;
                grid.insertDependency();
                store = grid.tasksCombo.getStore();

                for (var i = 0; i < store.getCount(); i++) {
                    var record = store.getAt(i);
                    grid.tasksCombo.select(record);
                    grid.cellEditing.completeEdit();

                    t.matchGridCellContent(grid, 0, 0, record.originalRecord.getSequenceNumber(), 'Rendered value is correct');
                    grid.insertDependency();
                }

                taskEditor.close();
            }
        );
    });

    t.it('ReadOnly field should set readonly mode', function (t) {

        var taskEditor = new Gnt.plugin.TaskEditor({});

        gantt = t.getGantt2({
            title         : 'SN',
            renderTo      : Ext.getBody(),
            resourceStore : t.getResourceStore(),
            forceFit      : true,
            plugins       : taskEditor
        });

        var task = gantt.taskStore.getNodeById(115);

        function assertReadOnlyFields(tab, value, query, exclude) {

            t.diag(tab.title);

            var items = tab.query(query);

            Ext.Array.forEach(items, function (field) {
                var assertValue = Ext.Array.contains(exclude || [], field.name) ? !value : value;
                t.is(field.readOnly, assertValue, field.fieldLabel + ' readonly ' + assertValue);
            });
        }

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.doubleClick(gantt.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {

                var tab = taskEditor.taskEditor.setActiveTab(3);
                //make sure these field were readonly before
                assertReadOnlyFields(tab, false, 'field', ['wbsCode', task.calendarIdField]);

                next();
            },

            function (next) {

                var tab           = taskEditor.taskEditor.setActiveTab(3);
                var readOnlyField = tab.down('readonlyfield');

                readOnlyField.setValue(true);
                assertReadOnlyFields(tab, true, 'field', [readOnlyField.name]);

                tab = taskEditor.taskEditor.setActiveTab(4);
                assertReadOnlyFields(tab, true, 'htmleditor');

                tab = taskEditor.taskEditor.setActiveTab(0);
                assertReadOnlyFields(tab, true, 'field');

                tab = taskEditor.taskEditor.setActiveTab(1);
                t.is(tab.down('toolbar').isVisible(), false, 'Predecessor buttons not visible');

                tab = taskEditor.taskEditor.setActiveTab(2);
                t.is(tab.down('toolbar').isVisible(), false, 'Assignment buttons not visible');

                next();
            },

            function (next) {

                var tab           = taskEditor.taskEditor.setActiveTab(3);
                var readOnlyField = tab.down('readonlyfield');
                readOnlyField.setValue(false);
                assertReadOnlyFields(tab, false, 'field', ['wbsCode', task.calendarIdField]);

                tab = taskEditor.taskEditor.setActiveTab(4);
                assertReadOnlyFields(tab, false, 'htmleditor');

                tab = taskEditor.taskEditor.setActiveTab(0);
                assertReadOnlyFields(tab, false, 'field');

                tab = taskEditor.taskEditor.setActiveTab(1);
                t.is(tab.down('toolbar').isVisible(), true, 'Predecessor buttons are visible');

                tab = taskEditor.taskEditor.setActiveTab(2);
                t.is(tab.down('toolbar').isVisible(), true, 'Assignment buttons are visible');

                taskEditor.close();
            }
        );
    })

    //ticket #2357
    t.it('Dependency grid in successor mode', function (t) {

        var taskStore  = new Gnt.data.TaskStore({
            dependencyStore : new Gnt.data.DependencyStore({
                data : [{From : 1, To : 2}]
            }),
            root : {
                children : [
                    { Id : 1,  Name : 'One' },
                    { Id : 2,  Name : 'Two' }
                ]
            }
        });

        var task             = taskStore.getNodeById(1);
        var taskEditorPlugin = new Gnt.plugin.TaskEditor({
            taskStore            : t.getTaskStore(),
            task                 : task,
            dependencyGridConfig : {
                direction : 'successors'
            }
        });

        gantt = t.getGantt2({
            renderTo      : Ext.getBody(),
            forceFit      : true,
            plugins       : taskEditorPlugin
        });

        var depGrid = taskEditorPlugin.down('dependencygrid');

        taskEditorPlugin.show();
        taskEditorPlugin.down('taskeditor').setActiveItem(depGrid);

        t.is(depGrid.title, 'Successors');

        t.chain(
            { waitForSelector : '.gnt-dependencygrid .x-grid-cell-inner:textEquals(2)' }
        );
    });


});
