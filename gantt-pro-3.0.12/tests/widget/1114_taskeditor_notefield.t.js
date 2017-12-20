StartTest(function (t) {

    // Here we check that task `isEditable` method affects task editor Notes field readOnly state (#1547)

    var widget;

    Ext.define('Gnt.model.MyTask', {
        extend  : 'Gnt.model.Task',

        isEditable  : function (fieldName) {
            if (fieldName === this.noteField) {
                return this.getNote() === 'editable';
            }

            return this.callParent(arguments);
        }
    })

    var setup = function (cfg) {
        widget && widget.destroy();

        widget = new Gnt.widget.TaskEditor({
            taskStore       : t.getTaskStore({
                model   : 'Gnt.model.MyTask',
                DATA    : [{
                    Id          : 1,
                    Note        : 'non editable'
                },
                {
                    Id          : 2,
                    Note        : 'editable'
                }]
            }),
            width           : 500,
            renderTo        : Ext.getBody()
        })
    }

    t.it('Should apply isEditable for noteField', function (t) {
        setup();

        widget.loadTask(widget.taskStore.getById(1));
        widget.setActiveTab(3);

        t.ok(widget.notesEditor.readOnly, 'Notes are read only');

        widget.loadTask(widget.taskStore.getById(2));
        t.notOk(widget.notesEditor.readOnly, 'Notes are not read only');

        // some browsers are caching iframes, so we want to add this to exceptions to pass the globals check
        t.expectGlobals(widget.notesEditor.el.down('iframe').getAttribute('name'));
        Ext.isGecko && t.expectGlobals('0');
    });
});
