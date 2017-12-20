StartTest(function (t) {

    t.expectGlobals('MyTask', 'MyForm');

    Ext.define('MyTask', {
        extend      : 'Gnt.model.Task',
        isEditable  : function(fieldName) {
            if (this.getId() == 117 && 'Name' === fieldName) {
                return false;
            }
            if (this.getId() == 115 && 'Duration' === fieldName) {
                return false;
            }
            if (this.getId() == 118 && (('StartDate' === fieldName) || ('EndDate' === fieldName))) {
                return false;
            }

            return this.callParent(arguments);
        }
    });

    var s = t.getTaskStore({
        model       : 'MyTask'
    });

    var f = new Gnt.widget.TaskForm({
        margin      : 10,
        width       : 500,
        renderTo    : Ext.getBody()
    });

    var startDateField  = f.getForm().findField('StartDate');
    var durationField   = f.getForm().findField('Duration');
    var percentField    = f.getForm().findField('PercentDone');

    var task = s.getById(117);

    t.chain(
        function (next) {
            t.diag('Call form.loadRecord() to load values from task');

            f.loadRecord(task);

            t.is(startDateField.getValue(), new Date(2010, 1, 3), 'Start date value is proper');
            t.is(durationField.getValue(), 6, 'Duration value is proper');
            t.is(durationField.durationUnit, 'd', 'Duration unit is proper');
            t.is(percentField.getValue(), 0, 'Percent value is proper');

            t.diag('Set field values');

            startDateField.setValue(new Date(2010, 1, 2));
            durationField.setValue({ value : 7, unit : 'd' });
            percentField.setValue(10);

            t.is(startDateField.getValue(), new Date(2010, 1, 2), 'Start date value is proper');
            t.is(durationField.getValue(), 7, 'Duration value is proper');
            t.is(durationField.durationUnit, 'd', 'Duration unit is proper');
            t.is(percentField.getValue(), 10, 'Percent value is proper');

            t.diag('Check task values (it should stay unchanged)');

            t.is(task.getStartDate(), new Date(2010, 1, 3), 'Start date value unchanged');
            t.is(task.getDuration(), 6, 'Duration value unchanged');
            t.is(task.getDurationUnit(), 'd', 'Duration unit unchanged');
            t.is(task.getPercentDone(), 0, 'Percent value unchanged');

            t.diag('Call form.updateRecord() to persist values into task');

            f.updateRecord();

            t.diag('Check task values');

            t.is(task.getStartDate(), new Date(2010, 1, 2), 'Start date value changed');
            t.is(task.getDuration(), 7, 'Duration value changed');
            t.is(task.getDurationUnit(), 'd', 'Duration unit changed');
            t.is(task.getPercentDone(), 10, 'Percent value is proper');

            next();
        },

        t.getSubTest('Form loadRecord() takes into account Task.isEditable() result', function (t) {
            var nameField  = f.getForm().findField('Name');

            t.ok(nameField.readOnly, 'Name field is disabled');
            t.notOk(durationField.readOnly, 'Duration field is enabled');

            f.loadRecord(s.getById(115));

            t.notOk(nameField.readOnly, 'Name field is enabled');
            t.ok(durationField.readOnly, 'Duration field is disabled');
        }),

        t.getSubTest('Form constructor takes into account Task.isEditable() result', function (t) {
            var f2 = new Gnt.widget.TaskForm({
                margin      : 10,
                width       : 500,
                renderTo    : Ext.getBody(),
                task        : s.getById(117)
            });

            t.ok(f2.getForm().findField('Name').readOnly, 'Name field is disabled');
            t.notOk(f2.getForm().findField('Duration').readOnly, 'Duration field is enabled');
        }),

        function (next) {

            // #1131 : check if TaskForm handles field having `editable` setting properly

            Ext.define('MyForm', {
                extend  : 'Gnt.widget.taskeditor.TaskForm',
                items   : [
                    {
                        xtype       : 'datefield',
                        fieldLabel  : 'Start',
                        name        : 'StartDate',
                        editable    : false
                    },
                    {
                        xtype       : 'datefield',
                        fieldLabel  : 'End',
                        name        : 'EndDate'
                    }
                ]
            });

            var f = Ext.create('MyForm', {
                title       : 'MyForm',
                margin      : 10,
                width       : 500,
                renderTo    : Ext.getBody(),
                task        : s.getById(118)
            });

            t.it('Form loadRecord() takes into account Task.isEditable() and `editable` mode of fields ', function (t) {

                var startDateField  = f.getForm().findField('StartDate').inputEl.dom;
                var endDateField    = f.getForm().findField('EndDate').inputEl.dom;

                t.ok(startDateField.readOnly, 'StartDate field is disabled');
                t.ok(endDateField.readOnly, 'EndDate field is disabled');

                f.loadRecord(s.getById(115));

                t.ok(startDateField.readOnly, 'StartDate field is still disabled');
                t.notOk(endDateField.readOnly, 'EndDate field is enabled');
            });
        }

    );

});
