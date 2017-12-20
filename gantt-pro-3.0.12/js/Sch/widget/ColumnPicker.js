/**
 @class Sch.widget.ColumnPicker
 @private
 @extends Ext.form.field.ComboBox

 Columnpicker widget for picking columns from a panel.
 */

Ext.define('Sch.widget.ColumnPicker', {
    extend : 'Ext.form.field.ComboBox',

    requires : [
        'Ext.data.Store',
        'Ext.panel.Table'
    ],

    multiSelect  : true,
    valueField   : 'id',
    displayField : 'name',

    forceSelection : true,

    editable : false,

    listConfig : {
        cls : 'sch-columnpicker-list'
    },

    /**
     * @cfg {[Ext.grid.column.Column]} An array of columns to choose from
     */
    columns : null,


    initComponent : function () {

        this.store = new Ext.data.Store({
            proxy  : 'memory',
            fields : ['id', 'name', 'column'],
            data   : this.processColumns(this.columns)
        });

        this.callParent(arguments);
    },

    processColumns : function (columns) {
        var data = [],
            value = [];

        Ext.Array.forEach(columns, function (column) {

            data.push({
                id     : column.id,
                name   : column.text,
                column : column
            });

            if (!column.isHidden()) {
                value.push(column.id);
            }
        });

        this.value = this.value || value;

        return data;
    },

    getSelectedColumns : function () {

        var me    = this,
            value = me.getValue();

        if (!Ext.isArray(value)) {
            value = [value];
        }

        return Ext.Array.map(value, function (id) {
            return me.store.getById(id).get('column');
        });
    }
});
