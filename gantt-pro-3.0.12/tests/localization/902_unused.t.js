StartTest(function(t) {
    Ext.Loader.setPath('Sch', '../../ExtScheduler3.x/js/Sch');
    Ext.Loader.setPath('Gnt', '../js/Gnt');

    // This test grab 1st level phrases from each locale class and tries to find its
    // usage in gnt-all-debug.js. Purpose is to detect unused locales.

    // list specifying phrases that should NOT be searched in gnt-all-debug.js
    var ignoreList = {
    };

    var ignoreClasses = { 'Sch.mixin.Localizable' : 1, 'Gnt.mixin.Localizable' : 1 };

    var getFile     = function (url, callback) {
        var as  = t.beginAsync();

        Ext.Ajax.request({
            url         : url,
            callback    : function(options, success, response) {
                t.endAsync(as);

                if (!success) t.fail('File [' + url + '] failed to load');

                success && callback && callback(response.responseText);
            }
        });
    };

    var localePhraseFoundInClass = function (phrase, classData, className) {
        var len     = classData.array.length,
            entry   = classData.byName[ className ];

        if (!entry) return false;

        var index   = entry.index,
            pos     = searchLocale(gntAllDebugText, phrase, entry.pos);

        // fail - if it's not found or found in another class
        return pos >= entry.pos && ((index < len - 1 && pos < classData.array[ index + 1 ].pos) || index == len - 1);
    };

    var localePhraseFoundInClassOrItsParents = function (phrase, classData, className, localeClass) {
        var cls = Ext.ClassManager.get(className);
        for (
            var classCons = cls;
            classCons && classCons.$className in localeClass.l10n;
            classCons = classCons.superclass
        ) {
            if (localePhraseFoundInClass(phrase, classData, classCons.$className)) return true;
        }

        // phrase usage might be placed in a mixin
        if (cls.prototype && cls.prototype.mixins) {
            for (var mixin in cls.prototype.mixins) {
                if (localePhraseFoundInClass(phrase, classData, cls.prototype.mixins[mixin].$className)) return true;
            }
        }

        for (var i = 0; classData.subClassesByName[ className ] && i < classData.subClassesByName[ className ].length; i++) {
            if (localePhraseFoundInClass(phrase, classData, classData.subClassesByName[ className ][ i ])) return true;
        }

        return false;
    };

    var searchLocale = function (text, phrase, pos) {
        // we are looking for .L("phrase") call
        var str = '\\.L\\(\\s*["\']' + Ext.String.escapeRegex(phrase) + '["\']';

        var reg     = new RegExp(str, 'g'),
            match   = reg.exec(text),
            index   = match ? match.index : -1;
        while (index < pos && match) {
            match   = reg.exec(text);
            index   = match ? match.index : -1;
        }
        return index;
    };


    var initClassEntry = function (className, classData) {
        // get class definition start position
        var pos = gntAllDebugText.search(new RegExp('\\nExt\\.define\\(\\s*[\'"]' + className.replace('.', '\\.') + '["\']\\s*,')),
            entry;

        if (pos > -1) {
            // keep position
            entry   = { name : className, pos : pos, index : null };

            if (!classData.byName[ className ]) {
                classData.array.push(entry);
                classData.byName[ className ] = entry;
            }
        }

        return entry;
    };

    var isRelevantClass = function (className) {
        return !ignoreClasses[className] && className.match(/(?:Sch|Gnt)\.(?:[A-Za-z]+\.)*(?:[A-Z][A-Za-z]+)/);
    };

    var testLocale = function (t, localeClass) {
        var classData           = {
            array               : [],
            byName              : {},
            subClassesByName    : {}
        };

        // loop over classes supported by locale
        for (var className in localeClass.l10n) {

            if (initClassEntry(className, classData)) {

                var classCons       = Ext.ClassManager.get(className);
                var superClassName  = classCons.superclass && classCons.superclass.$className;

                // if superclass is listed in the locale
                if (superClassName && isRelevantClass(superClassName)) {//(superClassName in localeClass.l10n)) {

                    // collect all the superclass entry
                    if (!classData.byName[ superClassName ]) {
                        initClassEntry(superClassName, classData);
                    }

                    if (!classData.subClassesByName[ superClassName ]) {
                        classData.subClassesByName[ superClassName ] = [];
                    }

                    classData.subClassesByName[ superClassName ].push(className);
                }

                // collect all the class mixins entries
                var mixins      = classCons.prototype && classCons.prototype.mixins;

                for (var mixin in mixins) {
                    isRelevantClass(mixins[mixin].$className) && initClassEntry(mixins[mixin].$className, classData);
                }

            } else {
                t.fail(className + ' not found');
            }
        }

        var classEntries    = classData.array;

        // sort classes by their position
        classEntries.sort(function (a, b) { return a.pos - b.pos; });

        Ext.Array.forEach(classEntries, function (entry, index) { entry.index = index; });

        // loop over collected classes
        Ext.Array.forEach(classEntries, function (entry) {
            var className   = entry.name;
            var ignore      = ignoreList[entry.name];

            // loop over their localized phrases
            for (var phrase in localeClass.l10n[ className ]) {
                if (!localePhraseFoundInClassOrItsParents(phrase, classData, className, localeClass) && (!ignore || (ignore.indexOf && ignore.indexOf(phrase) < 0) || (ignore.test && !ignore.test(phrase)) ))
                    t.fail(className + ': ' + phrase + ' not found');
            }
        });
    };

    var gntAllDebugText;

    getFile('../gnt-all-debug.js', function (text) {

        gntAllDebugText = text;

        t.requireOk(
            [
                'Gnt.locale.En',
                'Gnt.locale.De',
                'Gnt.locale.RuRU',
                'Gnt.locale.Pl',
                'Gnt.locale.SvSE',
                'Gnt.locale.It',
                'Gnt.locale.Nl'
            ],
            function() {
                t.it('Gnt.locale.En', function(t) {
                    testLocale(t, Gnt.locale.En);
                });

                t.it('Gnt.locale.De', function (t) {
                    testLocale(t, Gnt.locale.De);
                });

                t.it('Gnt.locale.RuRU', function (t) {
                    testLocale(t, Gnt.locale.RuRU);
                });

                t.it('Gnt.locale.Pl', function (t) {
                    testLocale(t, Gnt.locale.Pl);
                });

                t.it('Gnt.locale.SvSE', function (t) {
                    testLocale(t, Gnt.locale.SvSE);
                });

                t.it('Gnt.locale.It', function (t) {
                    testLocale(t, Gnt.locale.It);
                });

                t.it('Gnt.locale.Nl', function (t) {
                    testLocale(t, Gnt.locale.Nl);
                });

            }
        );
    });
});
