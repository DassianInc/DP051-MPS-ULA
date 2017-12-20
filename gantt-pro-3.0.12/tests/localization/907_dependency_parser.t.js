StartTest(function(t) {

    // #1412. Checks that dependency parser correctly translates dependency strings for different locales

    Ext.Loader.setPath('Sch', '../js/Sch');
    Ext.Loader.setPath('Gnt', '../js/Gnt');

    var DepType     = Gnt.model.Dependency.Type;

    var assertDependencyStrings = function(t, locale) {

        var lang    = locale.split('.').pop(),
            // get translated dependency types
            type    = Gnt.locale[lang].l10n['Gnt.util.DependencyParser'].typeText,
            // get translated 'days'
            days    = Sch.locale[lang].l10n['Sch.util.Date'].unitNames.DAY.plural;

        var DP      = new Gnt.util.DependencyParser({
            parseNumberFn : function () {
                return Gnt.widget.DurationField.prototype.parseValue.apply(this, arguments);
            }
        });

        var assertString    = function (str, expected) {
            t.isDeeply(DP.parse(str), expected, str+' parsed correctly');

            t.isDeeply(DP.parse(str.toLowerCase()), expected, str.toLowerCase()+' parsed correctly');
        };


        assertString('3'+type.FS, [{ taskId : 3, type : DepType.EndToStart }]);

        assertString('13'+type.SF+'+2', [
            {
                taskId  : 13,
                type    : DepType.StartToEnd,
                lag     : 2,
                lagUnit : Sch.util.Date.DAY
            }
        ]);

        assertString('3'+type.SS+'+12'+days, [
            {
                taskId  : 3,
                type    : DepType.StartToStart,
                lag     : 12,
                lagUnit : Sch.util.Date.DAY
            }
        ]);

        assertString('13'+type.FF+'+2', [
            {
                taskId  : 13,
                type    : DepType.EndToEnd,
                lag     : 2,
                lagUnit : Sch.util.Date.DAY
            }
        ]);
    };


    t.describe('Test dependencyparser with localization', function (t) {
        var locales   = [
            'Gnt.locale.En',
            'Gnt.locale.RuRU',
            'Gnt.locale.De',
            'Gnt.locale.Pl',
            'Gnt.locale.SvSE',
            'Gnt.locale.It',
            'Gnt.locale.Nl'
        ];

        var runAssertionsForLang    = function (locale, t) {
            if (!locale) return;

            t.waitFor(100, function () {
                t.requireOk([ locale ], function () {
                    t.it(locale, function(tt) {
                        assertDependencyStrings(tt, locale);

                        // run tests for the next locale
                        runAssertionsForLang(locales.shift(), t);
                    });
                });
            })
        };

        // run tests for the first locale
        runAssertionsForLang(locales.shift(), t);
    });

});
