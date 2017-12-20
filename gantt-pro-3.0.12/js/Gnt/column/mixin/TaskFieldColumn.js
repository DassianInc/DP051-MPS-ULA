/**
@class Gnt.column.mixin.TaskFieldColumn
This class implement common logic for fields that have a field mixed with {@link Gnt.field.mixin.TaskField} class as an editor.
Also it makes the column localizable by mixing it with {@link Gnt.mixin.Localizable} class.
*/
Ext.define('Gnt.column.mixin.TaskFieldColumn', {

    extend              : 'Ext.Mixin',

    requires            : [
        'Gnt.patches.TreeColumn'
    ],

    mixins              : [
        'Gnt.mixin.Localizable'
    ],

    /**
     * @cfg {Boolean} instantUpdate Set to `true` to instantly apply any changes in the field to the task.
     * This option is just translated to the {@link Gnt.field.mixin.TaskField#instantUpdate} config option.
     */
    instantUpdate       : false,

    /**
     * @property {Ext.form.field.Field} Reference to the field used by the editor
     */
    field               : null,

    fieldProperty       : '',

    fieldConfigs        : 'instantUpdate,fieldProperty',

    defaultEditor       : 'textfield',

    mixinConfig         : {

        after           : {
            initComponent   : 'afterInitComponent'
        },

        afterIf        : {
            applyColumnCls  : 'applyColumnCls'
        }
    },


    initTaskFieldColumn : function (editorCfg) {
        this.text       = this.config.text || this.L('text');

        this.initColumnEditor(editorCfg);

        this.scope     = this.scope    || this;
        this.renderer  = this.renderer || this.taskFieldRenderer;

        this.mon(this, 'render', this.onColumnRender, this);
    },


    applyColumnCls : function (value, meta, task) {
        if (!task.isEditable(this.dataIndex)) {
            meta.tdCls      = (meta.tdCls || '') + ' sch-column-readonly';
        }
    },


    afterInitComponent : function () {
        // Make sure Ext 'understands' this column has its own renderer which makes sure this column is always updated
        // if any task field is changed
        this.hasCustomRenderer  = true;
    },


    initColumnEditor : function (editorCfg) {
        var editor = this.editor;

        // if editor provided
        if (editor) {
            // xtype provided
            if ('string' == typeof editor) {
                editor  = { xtype : editor };
            }

            // if it's not a made instance yet
            if (!editor.isInstance) {

                if (!editor.xtype && !editor.xclass) {
                    editor.xtype = this.defaultEditor;
                }

                // relay configs listed in "fieldConfigs" to the editor
                var cfg     = Ext.copyTo(Ext.apply({}, editorCfg), this, this.fieldConfigs, true);

                this.editor = Ext.ComponentManager.create(Ext.apply(cfg, editor));
            }

            this.field    = this.editor;
        }

    },


    onColumnRender : function() {
        var tree        = this.up('treepanel');
        var taskStore   = tree.store;

        if (!this.dataIndex) {
            this.dataIndex = taskStore.model.prototype[ this.fieldProperty ];
        }

        // if the column wants to track the gantt readonly state
        if (this.onReadOnlySet) {
            var gantt   = this.up('ganttpanel');
            gantt.mon(gantt, 'setreadonly', this.onReadOnlySet, this);
        }
    },


    getValueToRender : function (value, meta, task) {
        var field   = this.field;

        return field && field.valueToVisible && field.valueToVisible(value, task) || value;
    },


    taskFieldRenderer : function (value, meta, task) {
        var result  = Ext.util.Format.htmlEncode( this.getValueToRender.apply(this, arguments) );

        this.applyColumnCls(value, meta, task);

        return result;
    },


    afterClassMixedIn : function (cls) {
        var mixin       = this.prototype,
            mixinConfig = mixin.mixinConfig,
            befores     = mixinConfig && mixinConfig.beforeIf,
            afters      = mixinConfig && mixinConfig.afterIf;

        befores && Ext.Object.each(befores, function (key, value) {
            if (key in cls.prototype) {

                cls.addMember(key, function () {
                    if (mixin[value].apply(this, arguments) !== false) {
                        return this.callParent(arguments);
                    }
                });

            } else {

                cls.addMember(key, function () {
                    mixin[value].apply(this, arguments);
                });

            }
        });

        afters && Ext.Object.each(afters, function (key, value) {
            if (key in cls.prototype) {

                cls.addMember(key, function () {
                    this.callParent(arguments);
                    mixin[value].apply(this, arguments);
                });

            } else {

                cls.addMember(key, function () {
                    mixin[value].apply(this, arguments);
                });

            }
        });
    }
});
