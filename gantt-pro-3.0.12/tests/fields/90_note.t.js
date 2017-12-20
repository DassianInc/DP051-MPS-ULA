describe('Note field tests', function(t) {

    function setup (config) {
        var task        = t.getTaskStore({ DATA : [{}] }).getRoot().firstChild;

        var field       = new Gnt.field.Note(Ext.apply({
            task            : task,
            cls             : 'notefield',
            renderTo        : Ext.getBody(),

            pickerConfig    : {
                cls : 'foo'
            }
        }, config));

        return {
            task    : task,
            field   : field
        }
    }

    t.it('Sets value', function(t) {

        t.it('Without previewFn provided', function(t) {
            var called = false;

            var context = setup();

            var task    = context.task,
                field   = context.field;

            t.chain(
                { click : '.notefield'},

                { waitForSelector : '.foo' },

                function (next) {
                    field.setValue('<h1>Test</h1>');
                    next();
                },

                { click : '.notefield'},

                function (next) {
                    t.is(task.getNote(), '<h1>Test</h1>', 'Task is updated');
                    t.is(field.getRawValue(), 'Test', 'Field displays stripped value');
                    next();
                },

                { click : '.notefield'},

                { waitForSelector : '.foo' },

                function (next) {
                    field.setValue('');
                    next();
                },

                { click : '.notefield'},

                function (next) {
                    t.is(task.getNote(), '', 'Task note is empty');
                    t.is(field.getRawValue(), '', 'Field display has no dots');
                    field.destroy();
                }

            );
        });


        t.it('With previewFn provided', function(t) {

            var context = setup({
                previewFn       : function (value) {
                    return Ext.isEmpty(value) ? '' : '...';
                }
            });

            var task    = context.task,
                field   = context.field;

            t.chain(
                { click : '.notefield'},

                { waitForSelector : '.foo' },

                function (next) {
                    field.setValue('<h1>Test</h1>');
                    next();
                },

                { click : '.notefield'},

                function (next) {
                    t.is(task.getNote(), '<h1>Test</h1>', 'Task is updated');
                    t.is(field.getRawValue(), '...', 'Field display has dots');
                    next();
                },

                { click : '.notefield'},

                { waitForSelector : '.foo' },

                function (next) {
                    field.setValue('');
                    next();
                },

                { click : '.notefield'},

                function (next) {
                    t.is(task.getNote(), '', 'Task note is empty');
                    t.is(field.getRawValue(), '', 'Field display has no dots');
                    field.destroy();
                }

            );
        });

    });
});

