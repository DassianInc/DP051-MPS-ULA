Ext.define('Gnt.examples.performance.generator.view.ParametersFormController', function(thisClass) {

    var control = {
        '#' : {
            'tabchange' : onTabChange$
        },
        'tool[type=gear]' : {
            'click' : onSeedSetupClick$
        },
        'form' : {
            'validitychange' : onFormTabValidityChange$
        },
        '#generateBtn' : {
            'click' : onGenerateButtonClick$
        }
    };

    function onTabChange$(formPanel, newCard, oldCard) {
        var me          = this,
            generateBtn = me.lookupReference('generateBtn');

        newCard && generateBtn && generateBtn.setDisabled(!newCard.isValid());
    }

    function onFormTabValidityChange$(formTab, valid) {
        var me          = this,
            generateBtn = me.lookupReference('generateBtn');

        formTab.owner.isVisible() && generateBtn && generateBtn.setDisabled(!valid);
    }

    function onSeedSetupClick$(tool) {
        var me    = this,
            model = me.getViewModel();

        Ext.MessageBox.prompt(
            "Seed configure", "Please input a new seed value",
            function(btnId, text) {
                if (btnId == 'ok') {
                    model.set('seed', Ext.String.trim(text));
                }
            },
            null,
            false,
            model.get('seed')
        );
    }

    function onGenerateButtonClick$(btn) {
        var FORMCLASS = Gnt.examples.performance.generator.view.ParametersForm,
            me        = this,
            form      = me.getView(),
            model     = me.getViewModel(),
            generatorName, generatorParams, generator;

        generatorName   = form.getActiveTab().generatorName;
        generatorParams = model.get(FORMCLASS.getGeneratorParametersBindPath(generatorName));
        generator       = model.get('generators.' + generatorName);

        me.fireViewEvent('generate', form, generatorName, generator, generatorParams, model.get('seed'));
    }

    return {
        extend  : 'Ext.app.ViewController',
        alias   : 'controller.generator-parameters-form',
        control : control
    };
});
