/*
 * File: app/store/GanttViewStore.js
 *
 * This file was generated by Sencha Architect version 3.0.4.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('MyApp.store.GanttViewStore', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.data.Field'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'GanttViewStore',
            data: [
                {
                    id: '0',
                    name: 'Year',
                    selected:false
                },
                {
                    id: '1',
                    name: 'Month & Year',
                    selected:false
                },
                {
                    id: '2',
                    name: 'Year & Quarter',
                    selected:false
                },
                {
                    id: '3',
                    name: 'Week & Month',
                    selected:false
                },
                {
                    id: '4',
                    name: 'Week & Day',
                    selected:false
                }/*,
                {
                    id: '5',
                    name: 'Day & Week',
                    selected:false
                }*/
            ],
            fields: [
                {
                    name: 'id'
                },
                {
                    name: 'name'
                },
                {
                    name: 'selected'
                }
            ]
        }, cfg)]);
    }
});