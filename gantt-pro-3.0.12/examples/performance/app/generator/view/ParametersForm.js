Ext.define('Gnt.examples.performance.generator.view.ParametersForm', {
    extend       : 'Ext.tab.Panel',
    xtype        : 'generator-parameters-form',
    componentCls : 'generator-parameters-form',
    requires     : [
        'Gnt.examples.performance.generator.view.ParametersFormController'
    ],

    controller : 'generator-parameters-form',

    config : {
        generators : null,
        seed       : null
    },

    bind : {
        generators : '{generators}'
    },

    title : 'Available generators',

    tools : [{
        type    : 'gear'
    }],

    header : {
        items : [{
            xtype : 'title',
            bind  : {
                text : 'Seed: {seed}'
            },
            updateText : function(newText, oldText) {
                Ext.panel.Title.prototype.updateText.call(this, newText, oldText);
                this.up().doLayout();
            }
        }]
    },

    dockedItems : [{
        xtype  : 'toolbar',
        dock   : 'bottom',
        layout : { pack  : 'center' },
        items  : {
            xtype : 'button', reference : 'generateBtn', itemId : 'generateBtn', text : 'Generate data', width : 150, scale : 'medium'
        }
    }],

    initComponent : function() {
        var me = this;
        me.callParent(arguments);
        me.on('render', me.onFormPanelRender, me, { single : true });
    },

    updateGenerators : function(newGenerators, oldGenerators) {
        var me = this;

        if (me.rendered) {
            me.buildGeneratorForms(newGenerators);
        }
    },

    onFormPanelRender : function(me) {
        me.buildGeneratorForms(me.getGenerators());
    },

    buildGeneratorForms : function(generators) {
        var me    = this,
            meta  = Gnt.examples.performance.Functions.meta,
            model = me.lookupViewModel(),
            generateBtn = me.lookupReference('generateBtn'),
            tabs  = [];

        me.removeAll();

        generators && Ext.Object.each(generators, function(generatorName, generator) {
            var tabItems = [],
                groups   = {};

            function getParameterBindPath(parameterName) {
                return Gnt.examples.performance.generator.view.ParametersForm.getGeneratorParameterBindPath(generatorName, parameterName);
            }

            function parameterGetter(parameterName) {
                return model.get(getParameterBindPath(parameterName));
            }

            // Extracting groups and combining params
            // Iterate like this since generator might be a simple object literal or an object created with new
            // in later case Ext.Object.each() won't work, since the properties will be in prototype and will be
            // cut off by hasOwnProperty() check in Ext.Object.each()
            Ext.Array.each(Ext.Object.getAllKeys(generator), function(prop) {
                var val     = generator[prop],
                    valMeta = meta(val),
                    group   = valMeta && groups[valMeta.group];

                if (valMeta && group) {
                    group.params = Ext.apply(group.params || {}, valMeta.params || {});
                }
                else if (valMeta) {
                    groups[valMeta.group] = valMeta;
                }
            });

            // For each group extracted creating a fieldset with corresponding title and items to input parameters
            Ext.Object.each(groups, function(title, group) {
                var fieldset,
                    fieldsetItems = [];

                Ext.Object.each(group.params, function(paramName, param) {
                    var control     = Ext.clone(param),
                        bindPath    = getParameterBindPath(paramName),
                        validatorFn = control.validator;

                    control.bind   = {
                        value : '{' + bindPath + '}'
                    };
                    model.set(bindPath, param.value || undefined);

                    if (validatorFn) {
                        control.validator = function(value) {
                            return validatorFn(value, parameterGetter);
                        };
                    }

                    fieldsetItems.push(control);
                });

                if (fieldsetItems.length) {
                    tabItems.push({
                        xtype    : 'fieldset',
                        title    : title,
                        items    : fieldsetItems,
                        margin   : 5,
                        defaults : {
                            labelWidth : 150,
                            anchor     : '-0',
                            margin     : '0 0 7 3'
                        }
                    });
                }
            });

            tabs.push({
                xtype         : 'form',
                title         : generator.title,
                generatorName : generatorName,
                scrollable    : 'vertical',
                items         : tabItems
            });
        });

        me.add(tabs);

        if (tabs.length) {
            me.setActiveTab(0);
            generateBtn.enable();
        }
        else {
            generateBtn.disable();
        }
    },

    statics : {
        getGeneratorParametersBindPath : function(generatorName) {
            return ['genparam', generatorName].join('.');
        },

        getGeneratorParameterBindPath : function(generatorName, parameterName) {
            return ['genparam', generatorName, parameterName].join('.');
        }
    }
});
