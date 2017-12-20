StartTest(function (t) {

    // Here we check that DependencyEditor supports allowedDependencyTypes setting

    t.it('Combobox shows only allowed dependency types',  function(t) {
        var editor  = new Gnt.plugin.DependencyEditor({
            foo          : 'depEditor',
            constrain    : true
        });

        var g = t.getGantt2({
            width : 400,
            dependencyStore     : t.getDependencyStore({
                allowedDependencyTypes : ['StartToStart', 'EndToStart']
            }),
            viewPreset          : 'weekAndDayLetter',
            renderTo            : Ext.getBody(),
            plugins             : editor,
            forceFit            : true
        });

        t.chain(
            { waitForTasksAndDependenciesToRender : g },
            { waitFor : 500 },

            function (next) {
                editor.show(g.dependencyStore.getAt(0));
                next()
            },

            { click : '>>[name=Type]' },

            {
                desc : 'proper number of records in dropdown list',
                waitFor : function() { return editor.typeField.store.getCount() === 2; }
            },

            function() {
                g.destroy();
            }
        );
    });

    t.it('If only 1 dependency type is allowed combobox gets readOnly',  function(t) {
        var editor  = new Gnt.plugin.DependencyEditor({
            constrain           : true,
            foo                 : 'second'
        });

        var g = t.getGantt({
            dependencyStore     : t.getDependencyStore({
                allowedDependencyTypes : ['EndToStart']
            }),
            lockedGridConfig    : { width : 150 },
            viewPreset          : 'weekAndDayLetter',
            renderTo            : Ext.getBody(),
            forceFit            : true,
            plugins             : editor
        });

        t.chain(
            { waitForTasksAndDependenciesToRender : g },
            { waitFor : 500 },


            function (next) {
                editor.show(g.dependencyStore.getAt(0));
                t.ok(editor.typeField.readOnly, 'field is readOnly');
            }
        );
    });
});
