Ext.define('Sch.patches.TreePanel', {
    extend: 'Sch.util.Patch',

    requires: ['Ext.tree.Panel'],
    target: 'Ext.tree.Panel',
    minVersion: '5.1.2',
    maxVersion: '6.0.0',

    overrides   : {
        // https://www.sencha.com/forum/showthread.php?308033-startEdit-doesn-t-work-for-tree
        ensureVisible : function (path) {
            if (Ext.isNumber(path)) {
                return Ext.panel.Table.prototype.ensureVisible.apply(this, arguments);
            } else {
                return this.callParent(arguments);
            }
        }
    }
});