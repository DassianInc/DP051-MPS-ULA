/**

@class Gnt.widget.calendar.CalendarManager
@extends Ext.panel.Panel
@aside guide gantt_calendars

{@img gantt/images/calendar_manager.png}

This widget can be used to manage calendars. As the input it should receive an instance of the {@link Gnt.data.CalendarManager} class.
Displays hierarchy of calendars attached to this CalendarManager and allows to edit calendar itself using {@link Gnt.data.widget.calendar.Calendar}.
Once the editing is done and user is happy with the result the {@link #applyChanges} method should be called. It will apply
all the changes user made in UI to the calendar.
This widget also checks changes in calendar when user navigates through the tree. In case changes were made widget displays confirmation
window with buttons "yes", "no", "cancel".

Note, this widget does not have the "Ok", "Apply changes" etc button intentionally, as you might want to combine it with your widgets.
See {@link Gnt.widget.calendar.CalendarManagerWindow} for this widget embedded in the Ext.window.Window instance.

    calendarManager = Ext.create('Gnt.data.CalendarManager', {});

    calendarManagerWidget = new Gnt.widget.calendar.CalendarManager({
        calendarManager : calendarManager
    });

*/
Ext.define('Gnt.widget.calendar.CalendarManager', {
    extend              : 'Ext.panel.Panel',

    requires            : [
        'Ext.tree.Panel',
        'Ext.menu.Menu',
        'Ext.tree.plugin.TreeViewDragDrop',
        'Gnt.widget.calendar.Calendar',
        'Gnt.data.calendar.BusinessTime'
    ],

    mixins              : ['Gnt.mixin.Localizable'],

    alias               : 'widget.calendarmanager',

    /**
     * @cfg {Object} treePanelConfig A configuration for the underlying tree panel
     */
    treePanelConfig     : null,

    /**
     * @property {Ext.tree.Panel} treePanel Underlying tree panel
     */
    treePanel           : null,

    /**
     * @cfg {Object} calendarPanelConfig A configuration for the underlying {@link Gnt.widget.calendar.Calendar calendar widget instance}
     */
    calendarPanelConfig : null,

    /**
     * @cfg {Gnt.data.CalendarManager} calendarManager Store keeping calendars to be shown in the component
     */
    calendarManager     : null,

    /**
     * @property {Gnt.widget.calendar.Calendar} calendarPanel Underlying {@link Gnt.widget.calendar.Calendar calendar widget instance}
     */
    calendarPanel       : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - addText         : 'Add',
            - removeText      : 'Remove',
            - add_child       : 'Add child',
            - add_node        : 'Add calendar',
            - add_sibling     : 'Add sibling',
            - remove          : 'Remove',
            - calendarName    : 'Calendar',
            - confirm_action  : 'Confirm action',
            - confirm_message : 'Calendar has unsaved changes. Would you like to save your changes?'
     */

    layout      : 'border',
    width       : 800,
    height      : 600,

    initComponent : function () {
        var me = this;

        me.cls              = me.cls + ' gnt-calendarmanager';

        me.treePanel        = me.buildTreePanel();

        me.calendarPanel    = new Gnt.widget.calendar.Calendar(Ext.apply({
            region          : 'center',
            calendar        : me.calendar,
            split           : true,
            calendarManager : me.calendarManager
        }, me.calendarPanelConfig));

        me.items            = [me.treePanel, me.calendarPanel];

        me.callParent(arguments);

        me.contextMenu      = me.buildContextMenu();

        var calendarManager = me.calendarManager;

        me.setCalendar(me.calendar || calendarManager.getProjectCalendar() || calendarManager.getRoot().firstChild);

        // for debug purposes
        me.counter = 1;
    },


    buildTreePanel : function () {
        var me = this;

        return new Ext.tree.Panel(Ext.apply({
            split           : true,
            region          : 'west',
            width           : 200,
            store           : me.calendarManager,
            displayField    : me.calendarManager.model.prototype.nameField,
            rootVisible     : false,
            tbar            : [
                {
                    itemId  : 'btnAdd',
                    text    : me.L('addText'),
                    action  : 'add',
                    iconCls : 'gnt-action-add',
                    handler : me.doAddRootNode,
                    scope   : me
                },
                {
                    itemId  : 'btnRemove',
                    text    : me.L('removeText'),
                    action  : 'remove',
                    iconCls : 'gnt-action-remove',
                    handler : me.doRemoveCalendar,
                    scope   : me
                }
            ],
            viewConfig  : {
                plugins     : {
                    ptype               : 'treeviewdragdrop',
                    allowContainerDrops : true,
                    dropZone            : {
                        // we want to always append child node to the hovered one
                        // this behavior isn't supported out of the box by the plugin
                        // so we override a template "onNodeDrop" method
                        onNodeDrop : function (node) {
                            this.valid              = true;
                            this.currentPosition    = 'append';
                            this.overRecord         = this.view.getRecord(node);
                            // call overridden method
                            return this.self.prototype.onNodeDrop.apply(this, arguments);
                        }
                    }
                },
                getRowClass : function (record) {
                    if (me.calendarManager.getProjectCalendar() == record.calendar) {
                        return 'gnt-project-calendar-row';
                    }
                },
                listeners   : {
                    drop    : me.onDrop,
                    scope   : me
                }
            },
            listeners   : {
                containercontextmenu    : me.onContainerContextMenu,
                itemcontextmenu         : me.onItemContextMenu,
                selectionchange         : me.onSelectionChange,
                scope                   : me
            }
        }, me.treePanelConfig));
    },


    buildContextMenu : function () {
        return new Ext.menu.Menu({
            margin  : '0 0 10 0',
            items   : [
                {
                    text    : this.L('add_node'),
                    handler : this.doAddRootNode,
                    itemId  : 'add-node',
                    scope   : this
                },
                {
                    text    : this.L('add_child'),
                    handler : this.doAddChildNode,
                    scope   : this
                },
                {
                    text    : this.L('add_sibling'),
                    handler : this.doAddSiblingCalendar,
                    scope   : this
                },
                {
                    text    : this.L('remove'),
                    handler : this.doRemoveCalendar,
                    itemId  : 'remove-node',
                    scope   : this
                }
            ]
        });
    },


    showContextMenu : function (e, calendar) {
        var menuItems = this.contextMenu.query('menuitem');

        if (calendar) {
            Ext.Array.each(menuItems, function (x) { x.show(); });
            this.contextMenu.down('#add-node').hide();
        } else {
            Ext.Array.each(menuItems, function (x) { x.hide(); });
            this.contextMenu.down('#add-node').show();
        }

        e.stopEvent();
        this.contextMenu.showAt(e.getXY());
    },

    onContainerContextMenu : function (view, e) {
        this.showContextMenu(e);
    },

    onItemContextMenu : function (view, calendar, item, index, e) {
        this.showContextMenu(e, calendar);
    },


    hasChanges : function () {
        return this.calendarPanel.hasChanges();
    },


    onSelectionChange : function (treePanelView, selected, eOpts) {
        // Note, that when this method is called, the selection in the tree actually has already been changed.
        // But, the calendar in the center region has not been updated yet (we do it manually below with
        // calendarPanel.setCalendar() call
        // that is why `calendarPanel.calendar` still contains the data calendar from previously(!) selected calendar row in tree
        var me              = this,
            calendarManager = me.calendarManager,
            calendarPanel   = me.calendarPanel;

        if (selected.length > 0) {
            var selectedNode      = selected[ 0 ];
            var selectedCalendar  = selectedNode.getCalendar();
            var isProjectCalendar = selectedCalendar === calendarManager.getProjectCalendar();

            // if project calendar selected we disable remove button/menu entry
            me.treePanel.down('#btnRemove').setDisabled(isProjectCalendar);
            me.contextMenu.down('#remove-node').setDisabled(isProjectCalendar);

            if (calendarPanel.calendar && calendarPanel.hasChanges()) {
                Ext.Msg.show({
                    title      : me.L('confirm_action'),
                    msg        : me.L('confirm_message'),
                    buttons    : Ext.Msg.YESNOCANCEL,
                    icon       : Ext.Msg.QUESTION,
                    fn         : function (btn) {
                        // changes were accepted
                        if (btn == 'yes') {
                            me.applyChanges();
                            calendarPanel.setCalendar(selectedCalendar);

                        // changes were ignored
                        } else if (btn == 'no') {
                            calendarPanel.setCalendar(selectedCalendar);

                        // cancel selection change
                        } else {
                            treePanelView.suspendEvents();
                            // select previous active node
                            treePanelView.select(calendarManager.getNodeByCalendar(calendarPanel.calendar));
                            treePanelView.resumeEvents();
                        }
                    }
                });
            } else {
                calendarPanel.setCalendar(selectedCalendar);
            }
        }
    },


    onDrop : function (node, data, overModel, dropPosition) {
        overModel   = overModel || this.calendarManager.getRootNode();
        // let's expand the node in which we're dropping
        overModel.expand();
    },


    onDestroy : function () {
        this.contextMenu.destroy();
        this.callParent(arguments);
    },


    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     * @method applyChanges
     */
    applyChanges : function () {
        this.calendarPanel.applyChanges();
    },


    doAddRootNode : function () {
        this.addCalendar();
    },


    doAddChildNode : function () {
        var selection = this.treePanel.getSelectionModel().getSelection();

        this.addCalendar(selection[0]);
    },


    doAddSiblingCalendar  : function () {
        var selection = this.treePanel.getSelectionModel().getSelection();

        this.addCalendar(selection[0] && selection[0].parentNode);
    },


    doRemoveCalendar : function () {
        var selection   = this.treePanel.getSelectionModel().getSelection();

        this.removeCalendar(selection[0]);
    },


    addCalendar : function (parent) {
        // calendar class prototype
        var calendarProto   = Ext.ClassManager.get(this.calendarManager.calendarClass).prototype;
        // node class prototype
        var nodeProto   = this.calendarManager.model.prototype;
        // extract calendar data to new node config
        var config      = nodeProto.getModelConfig(calendarProto);

        config[nodeProto.nameField] = this.L('calendarName') + this.counter++;
        config.expanded             = true;
        config.leaf                 = true;

        parent = parent || this.treePanel.getRootNode();

        // expand parent node
        parent.data.expanded = true;
        parent.appendChild(config);
    },


    removeCalendar : function (node) {
        var root        = this.treePanel.getRootNode();

        if (node) {
            var next = node.nextSibling || node.previousSibling || (node.parentNode == root ? root.firstChild : node.parentNode);

            if (next) {
                this.treePanel.getSelectionModel().select(next);
            }

            node.remove();
        }
    },


    setCalendar : function (calendar) {
        if (calendar instanceof Gnt.model.Calendar) {
            // set focus in tree
            this.treePanel.setSelection(calendar);
        } else {
            // set focus in tree
            this.treePanel.setSelection(this.calendarManager.getNodeByCalendar(calendar));
        }
    }
});
