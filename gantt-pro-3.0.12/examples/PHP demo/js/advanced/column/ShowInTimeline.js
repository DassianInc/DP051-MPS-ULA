Ext.define("Gnt.examples.advanced.column.ShowInTimeline", {
    extend          : "Ext.grid.column.Check",
    alias           : [
        "widget.showintimelinecolumn",
        "widget.ganttcolumn.showintimeline"
    ],

    mixins          : ['Gnt.mixin.Localizable'],

    fieldProperty   : 'showInTimelineField',

    constructor : function (config) {
        config      = config || {};

        this.text   = config.text || this.L('text');


        this.callParent([ config ]);

        this.tdCls = (this.tdCls || '') + ' gnt-showintimeline-cell';
    },

    afterRender : function() {

        if (!this.dataIndex) {
            var tree    = this.up('treepanel');

            this.dataIndex = tree.store.model.prototype[ this.fieldProperty ];
        }

        this.callParent(arguments);
    }
});
