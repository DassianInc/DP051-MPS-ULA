# Localizing Scheduler and Gantt

## Introduction

Localization is the process of presenting the same user interface in multiple languages.

In the codebase, it usually is achieved by referring to "dictionary" entries instead of using hard-coded
strings. Such dictionaries are called "locales".

Localizing an application that uses the Bryntum components is a task that can be split in 3 subtasks:

1. Localizing the underlying library (Ext JS or Sencha Touch). This sets the generic set of words - date formats, day/month names etc.
2. Localizing the Bryntum component itself.
3. Localizing the application - you can use any approach for this (ours, Sencha's or you can of course use your own homecooked solution)

At the moment of writing this guide, the Ext Gantt and Ext Scheduler components each have their localization files for the following languages:
English, German, Russian, Swedish and Polish.

Each language is represented with a separate locale file. All locale files are placed in the 'locale' sub-folder of the
corresponding namespace folder ('js/Sch/locale' for Scheduler namespace and 'js/Gnt/locale' for Gantt).


## Localizing ExtJS / Sencha Touch

To localize the underlying library you need to include the desired locale file in your web page - after the library file.
In Ext JS, locale files are located in the `/locale` folder, in Sencha Touch - in the `/src/locale`. For example:

    <!-- Library -->
    <script src="http://cdn.sencha.com/ext/gpl/4.2.0/ext-all.js" type="text/javascript"></script>

    <!-- Locale -->
    <script type="text/javascript" src="http://cdn.sencha.com/ext/gpl/4.2.0/locale/ext-lang-de.js"></script>


## Localizing Bryntum components - Scheduler and Gantt

### Locale classes

Bryntum locales are _classes_. They all subclass a common base class - {@link Sch.locale.Locale}. This means that locales can be added to
the page using regular &lt;script&gt; tags (statically), or they can be required by other classes or loaded with `Ext.Loader` (dynamically).

#### Extending of locale classes

Normally every application has it's own set of phrases to localize. A developer can create a custom application specific locale classes.
Locales are singletons so they cannot be directly extended. Instead the one can use `require` instruction to setup locale dependencies and override {@link Sch.locale.Locale#apply} method to force applying of other locale classes. For example:

    Ext.define('MyApp.locale.De', {
        extend    : 'Sch.locale.Locale',
        singleton : true,

        // MyApp.locale.De extends set of phrases provided by Sch.locale.De
        requires  : 'Sch.locale.De',

        l10n : {
            'MyApp.SomeComponent' : {
                ....
            }
        },

        apply : function () {
            // first let's apply Sch.locale.De translation
            Sch.locale.De.apply(Sch.locale.De, arguments);
            // now let's apply translations provided by this class
            this.callParent(arguments);
        }
    })

### Static Scheduler localization

    <!-- Library -->
    <script src="scheduler-2.2.5/sch-all-debug.js" type="text/javascript"></script>

    <!-- Locale -->
    <script src="scheduler-2.2.5/js/Sch/locale/De.js" type="text/javascript"></script>

### Static Gantt localization

The only difference from Scheduler is that Gantt needs to include the corresponding Scheduler locale as well:

    <!-- Library -->
    <script src="gantt-2.2.5/gnt-all-debug.js" type="text/javascript"></script>

    <!-- Locales -->
    <script src="gantt-2.2.5/js/Sch/locale/De.js" type="text/javascript"></script>
    <script src="gantt-2.2.5/js/Gnt/locale/De.js" type="text/javascript"></script>


### Dynamic Scheduler localization

Dynamic localization can be used in an MVC application where you don't usually load static bundles, but instead use on-demand loading of your classes
in development and optimized builds with Sencha Cmd in production.

Don't forget to setup the paths to the scheduler source files in `Ext.Loader`:

    Ext.Loader.setConfig({
        paths       : {
            Sch         : 'scheduler-2.2.5/js/lib/Sch'
        }
    })


By default, the scheduler already requires the "Sch.locale.En" class. To change that, you can just specify some other locale
as required class somewhere in your application. Sencha Cmd will detect it as a dependency and include it in the optimized build of your application:

    Ext.define('MyScheduler', {
        extend      : 'Sch.panel.SchedulerGrid',

        requires    : [
            'Sch.locale.De',
            ...
        ]
    })


### Dynamic Gantt localization

Dynamic localization of Ext Gantt can be done the same way as for Ext Scheduler. There's no need to require corresponding
scheduler locale - it is already required by the gantt locale, but **make sure that you've configured paths for both Sch and Gnt namespaces**:

    Ext.Loader.setConfig({
        paths       : {
            Sch         : 'gantt-2.2.5/js/lib/Sch',
            Gnt         : 'gantt-2.2.5/js/lib/Gnt'
        }
    })

As with Ext Scheduler, you may want to explicitly include the locale as a required class for one of your own classes.

## Creating locales for new languages

Our default (and hence the most up-to-date locale) is the English one. So whenever you decide to add a new translation you should always use
the English version as your base.
All you need to do to add a new locale is:

1. Copy the existing English locale file (`js/Sch/locale/En.js` or `js/Gnt/locale/En.js` for gantt).
2. Rename it according to the new language name.
3. Edit the file content and give a proper name to locale class (according to the given file name) and enter the phrase translations.
4. Put it in the 'locale' sub-folder (if it's not there already).

Note, that all locale classes are singletons. Also, Gantt locales must include the corresponding Scheduler locales in their "requires" section.


## Localizable mixin

Now we've covered the ground work of how to handle localization. Let's check how UI classes can retrieve and use the translation of a specific phrase.

To be able to do that, those classes need to consume the {@link Sch.mixin.Localizable} mixin.
This mixin provides a method called {@link Sch.mixin.Localizable#localize localize} which accepts a phrase "id" and returns the text from the current locale.

For example:

    Ext.define('My.Toolbar', {
        extend      : 'Ext.Toolbar',
        mixins      : [ 'Sch.mixin.Localizable' ],

        initComponent   : function () {
            Ext.apply(this, {
                items   : [
                    {
                        xtype       : 'button',

                        // get the button label from the current locale
                        text        : this.localize('loginText')
                    }
                ]
            });

            this.callParent(arguments);
        }
    });


