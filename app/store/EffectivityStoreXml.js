/*
 * File: app/store/EffectivityStoreXml.js
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

Ext.define('MyApp.store.EffectivityStoreXml', {
    extend: 'Ext.data.Store',

    requires: [
        'MyApp.model.NetworkModel',
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Xml'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'MyApp.model.NetworkModel',
            storeId: 'EffectivityStoreXml',
            proxy: {
                type: 'ajax',
                api: {
                    create: '/dsnwebui/dsnwebui_rest/EffectivityStoreXml/create',
                    read: '/dsnwebui/dsnwebui_rest/EffectivityStoreXml/read',
                    update: '/dsnwebui/dsnwebui_rest/EffectivityStoreXml/update',
                    destroy: '/dsnwebui/dsnwebui_rest/EffectivityStoreXml/delete'
                },
                url: '/dsnwebui/dsnwebui_rest/EffectivityStoreXml',
                reader: {
                    type: 'xml',
                    root: 'root',
                    record: 'record'
                }
            }
        }, cfg)]);
    }
});