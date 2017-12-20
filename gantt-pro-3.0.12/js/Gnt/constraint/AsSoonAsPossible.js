// This class is not part of the build, Gantt default scheduling behaviour is as soon as possible by default,
// thus we do not need this constraint
Ext.define('Gnt.constraint.AsSoonAsPossible', {
    extend  : 'Gnt.constraint.Base',

    singleton   : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:

            - "name" : "As soon as possible"
     */

    isSatisfied : function (task) {
        throw "Abstract method";
    }
});
