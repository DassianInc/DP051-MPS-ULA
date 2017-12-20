Ext.define('Gnt.examples.performance.view.Main', {
    extend     : 'Ext.Viewport',

    requires   : [
        'Gnt.examples.performance.view.MainModel',
        'Gnt.examples.performance.view.MainController',
        'Gnt.examples.performance.perfmon.view.Monitor',
        'Gnt.examples.performance.generator.view.ParametersForm'
    ],

    controller : 'main',
    viewModel  : 'main',

    layout : {
        type  : 'vbox',
        align : 'stretch',
        pack  : 'start'
    },

    items : [{
        xtype  : 'component',
        height : 50,
        margin : '0 5 10 5',
        html  : [
            '<p>',
               'This is an example showcasing a buffered view capable of rendering thousands of row without bringing the browser to a halt.',
            '</p>',
            '<p>',
                'Note that the js for the example code is not minified so it is readable. See <a href="app/">source</a>.',
            '</p>'
        ]
    }, {
        xtype  : 'container',
        flex   : 1,
        layout : {
            type  : 'hbox',
            align : 'stretch',
            pack  : 'start'
        },
        items : [{
            xtype     : 'container',
            flex      : 1,
            reference : 'gantt-container',
            layout    : 'fit'
        }, {
            xtype  : 'splitter'
        }, {
            xtype : 'generator-parameters-form',
            width : 350
        }]
    }, {
        xtype : 'splitter'
    }, {
        xtype     : 'perfmon-monitor',
        reference : 'perfmon',
        height    : 250,
        layout    : {
            type  : 'hbox',
            align : 'stretch',
            pack  : 'start'
        }
    }]
});
