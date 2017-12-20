StartTest(function (t) {

    function fieldsAreReadOnly (t, form, fields) {
        for (var i = 0; i < fields.length; i++) {
            t.ok(form.findField(fields[i]).readOnly, fields[i] + ' is readonly');
        }
    }


    t.it('Load Project into form', function (t) {

        var store           = t.getTaskStore({
            autoLoad        : true,
            DATA            : [ t.getProject('Project', false, true) ]
        });

        var projectForm     = new Gnt.widget.ProjectForm({
            margin          : 10,
            width           : 500,
            showCalendar    : true,
            renderTo        : Ext.getBody()
        });

        var taskForm        = new Gnt.widget.TaskForm({
            margin          : 10,
            width           : 500
        });

        t.chain(
            { waitForCQVisible : 'projectform' },

            function (next) {
                t.diag('Call form.loadRecord() to load values from project');

                var project         = store.getNodeById('Project'),
                    form            = projectForm.getForm(),
                    readOnlyField   = form.findField(project.readOnlyField);

                t.firesOk({
                    observable      : projectForm,
                    events          : {
                        afterloadrecord     : 1,
                        beforeupdaterecord  : 1,
                        afterupdaterecord   : 1
                    },
                    during          : function () {
                        projectForm.loadRecord(project);

                        readOnlyField.setValue(true);

                        projectForm.updateRecord(project);
                    },
                    desc            : 'Loading and updating project fires correct events'
                });

                projectForm.loadRecord(project);
                readOnlyField.setValue(true);

                fieldsAreReadOnly(t, form, [
                    project.nameField,
                    project.startDateField,
                    project.endDateField,
                    project.allowDependenciesField
                ]);

                t.notOk(readOnlyField.readOnly, 'Project readOnlyField is not readOnly');

                projectForm.destroy();

                taskForm.render(Ext.getBody());
                next();
            },

            { waitForCQVisible : 'taskform' },

            function (next) {
                var subTask = store.getNodeById('Project_task_1');

                t.firesOk({
                    observable      : taskForm,
                    events          : {
                        afterloadrecord     : 1
                    },
                    during          : function () {
                        taskForm.loadRecord(subTask);
                    },
                    desc            : 'Loading task fires correct events'
                });


                fieldsAreReadOnly(t, taskForm.getForm(), [
                    subTask.nameField,
                    subTask.startDateField,
                    subTask.endDateField,
                    subTask.percentDoneField,
                    subTask.durationField
                ]);


                taskForm.destroy();
            }
        );
    });
});
