Ext.define('Gnt.examples.advanced.store.CrudManager', {
    extend          : 'Gnt.data.CrudManager',
    alias           : 'store.advanced-crudmanager',
    autoLoad        : true,
    taskStore       : 'Tasks',
    transport       : {
        load : {
            method      : 'GET',
            paramName   : 'q',
            url         : 'ganttcrud/load'
        },
        sync : {
            method      : 'POST',
            url         : 'ganttcrud/sync'
        }
    }
});
