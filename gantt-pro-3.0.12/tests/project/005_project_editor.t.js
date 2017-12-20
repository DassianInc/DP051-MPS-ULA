StartTest(function (t) {

    t.it('Open project editor', function (t) {

        var store           = t.getTaskStore({
            DATA            : [ t.getProject('Project', false, true) ]
        });

        var editor          = new Gnt.widget.ProjectEditor({
            margin          : 10,
            width           : 600,
            renderTo        : Ext.getBody()
        });

        t.waitForCQVisible('projecteditor', function () {
            t.firesOk({
                observable      : editor,
                events          : {
                    loadproject         : 1,
                    afterupdateproject  : 1,
                    beforeupdateproject : 1,
                    validate            : 1
                },
                during : function () {
                    var project = store.getNodeById('Project');

                    editor.loadProject(project);
                    editor.setActiveTab(1);
                    editor.descriptionEditor.setValue('Foo');

                    t.ok(editor.validate(), 'Validate');

                    editor.updateProject();

                    t.is(project.getDescription(), 'Foo', 'Description is updated');
                },
                desc : 'Loading and updating fires correct event'
            });

            // some browsers are caching iframes, so we want to add this to exceptions to pass the globals check
            t.expectGlobals(editor.el.down('iframe').getAttribute('name'));
            Ext.isGecko && t.expectGlobals('0');
        });

    });

});