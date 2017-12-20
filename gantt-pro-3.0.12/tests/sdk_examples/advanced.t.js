StartTest(function(t) {

    var testConfig = t.harness.getScriptDescriptor(t.url);

    // retrieve active locale Id
    var locale = testConfig.hostPageUrl.split('#').pop();

    t.it('Hit all buttons and try filter (locale '+locale+')', function(t) {
        t.waitForRowsVisible('ganttpanel', function() {

            var decimalSeparators = {
                'en'    : '.',
                'sv_SE' : ',',
                'ru'    : ',',
                'de'    : ',',
                'it'    : ',',
                'pl'    : ',',
                'nl'    : ','
            };

            // Checks that extjs locale was applied before panel got created #1964
            t.is(t.cq1('durationcolumn').field.decimalSeparator, decimalSeparators[locale], 'correct decimal separator found');

            var buttonsToSkip = ['addTask', 'manageCalendars', 'saveChanges', 'removeSelected', 'indentTask', 'outdentTask', 'tryMore', 'print'];

            var monkeyButtons = function () {

                var str = 'gantt-primary-toolbar button' + Ext.Array.map(buttonsToSkip, function (item) {
                        return '[reference!=' + item + ']';
                    }).join('');

                return str;
            }

            t.chain(
                Ext.Array.map(t.cq(monkeyButtons()), function (cmp) {
                    return { click : cmp };
                }),

                { click : '.sch-gantt-project-name' },

                { click : '>>gantt-primary-toolbar button[reference=addTask]' },

                { waitForTarget : 'input:focus' },

                { type : '[ENTER]' },

                { click : '>>gantt-primary-toolbar button[reference=outdentTask]' },

                { click : '>>gantt-primary-toolbar button[reference=removeSelected]' },

                { click : '>>advanced-viewport button[reference=manageCalendars]' },

                { waitForCQVisible : 'calendarmanager', desc : 'Calendar manager window showed' },

                { type : '[ESCAPE]' }, // type ESC to hide calendar manager window

                { click : '>>advanced-viewport button[reference=saveChanges]' },

                { waitForCQVisible : 'messagebox', desc : 'Error alert showed' },

                { type : '[ESCAPE]' }, // type ESC to hide calendar manager window

                { click : '>>advanced-viewport button[reference=print]' },

                { waitForCQVisible : 'exportdialog', desc : 'Print window showed' },

                { type : '[ESCAPE]' }, // type ESC to hide exportdialog window

                { click : '>>advanced-viewport button[reference=tryMore]' },

                Ext.Array.map(t.cq('gantt-secondary-toolbar button'), function (cmp) {
                    return {click : cmp};
                }),

                { click : '>> namecolumn textfield' },

                { type : 'foo', target : '>> namecolumn textfield' },

                {
                    waitFor : function() {
                        return t.cq1('ganttpanel treeview').store.getCount() === 0;
                    }
                },

                { type : '[ESCAPE]', target : '>> namecolumn textfield' }
            )
        })
    })
});


