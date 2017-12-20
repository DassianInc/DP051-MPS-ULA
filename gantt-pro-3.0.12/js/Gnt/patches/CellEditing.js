// https://www.sencha.com/forum/showthread.php?301772-Wrong-value-selected-in-combobox-editor
Ext.define('Gnt.patches.CellEditing', {
    extend : 'Sch.util.Patch',

    requires   : ['Ext.grid.plugin.CellEditing'],
    target     : 'Ext.grid.plugin.CellEditing',
    minVersion : '5.1.1',

    overrides : {
        showEditor: function(ed, context, value) {
            // clean lastSelectedRecords cache for combobox if record was changed
            if (ed.context && ed.context.record !== context.record && 
                ed.field instanceof Ext.form.field.ComboBox) {
                ed.field.lastSelectedRecords = null;
            }
            this.callParent(arguments);
        }
    }
});