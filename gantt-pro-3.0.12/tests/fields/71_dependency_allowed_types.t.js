describe('Dependency field tests', function(t) {

    // Here we test that Dependency field respects Gnt.data.DependencyStore.allowedDependencyTypes setting

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
        dependencyStore : new Gnt.data.DependencyStore({
            allowedDependencyTypes : [ 'StartToStart' ]
        })
    });

    var invalidDependencyType   = Gnt.locale.En.l10n['Gnt.field.Dependency'].invalidDependencyType;

    var field      = new Gnt.field.Dependency({
        task                : taskStore.getRootNode().firstChild,
        fieldLabel          : 'Dep Field',
        renderTo            : Ext.getBody()
    });

    t.it('Marks dependencies of disabled types as invalid', function(t) {
        t.chain(
            { click      : '.x-form-field'},

            function (next) {
                field.setValue('12');

                t.notOk(field.isValid(), 'field is invalid');
                t.isDeeply(field.getErrors(field.getValue()), [ Ext.String.format(invalidDependencyType, 'FS', 'SS') ], 'proper error message');

                field.setValue('12FF;13');

                t.notOk(field.isValid(), 'field is invalid');
                t.isDeeply(field.getErrors(field.getValue()), [ Ext.String.format(invalidDependencyType, 'FF', 'SS') ], 'proper error message');

                field.setValue('12SS;13');

                t.notOk(field.isValid(), 'field is invalid');
                t.isDeeply(field.getErrors(field.getValue()), [ Ext.String.format(invalidDependencyType, 'FS', 'SS') ], 'proper error message');

                field.setValue('12SF');

                t.notOk(field.isValid(), 'field is invalid');
                t.isDeeply(field.getErrors(field.getValue()), [ Ext.String.format(invalidDependencyType, 'SF', 'SS') ], 'proper error message');

                field.setValue('12SS');

                t.ok(field.isValid(), 'field is valid');
                var errors  = field.getErrors(field.getValue());
                t.notOk(errors && errors.length, 'no error messages');
            }
        )
    });

});
