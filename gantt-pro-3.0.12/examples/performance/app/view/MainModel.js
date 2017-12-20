Ext.define('Gnt.examples.performance.view.MainModel', {
    extend : 'Ext.app.ViewModel',
    alias  : 'viewmodel.main',

    formulas : {
        tasksTotal : function(get) {
            return get('taskStore').getCount();
        }
    }
});
