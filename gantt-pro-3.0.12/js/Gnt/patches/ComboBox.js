// https://www.sencha.com/forum/showthread.php?295443
// applied workaround from forum post to prevent expanding combobox
Ext.define('Gnt.patches.ComboBox', {
    extend  : 'Sch.util.Patch',

    requires   : ['Ext.form.field.ComboBox'],
    target     : 'Ext.form.field.ComboBox',
    minVersion : '5.1.0',

    overrides   : {
        checkChangeEvents: Ext.isIE10p ? ['change', 'propertychange', 'keyup'] : ['change', 'input', 'textInput', 'keyup', 'dragdrop']
    }
});