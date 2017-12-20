StartTest(function(t) {

    var Ext = t.getExt();

    Ext.define('TestModel', {
        extend     : 'Ext.data.Model',
        mixins     : ['Gnt.model.mixin.ProjectableModel'],
        fields     : ['field1', 'field2', 'field3'],
        idProperty : 'id',
        constructor : function() {
            this.callParent(arguments);
            this.initProjectable();
        }
    });

    Ext.define('TestStore', {
        extend : 'Ext.data.Store',
        mixins : ['Gnt.data.mixin.ProjectableStore'],
        model  : 'TestModel',
        proxy  : { type : 'memory' },
        getByInternalModelId : function(id) {
            return this.getByInternalId(id);
        }
    });

    Ext.define('TestTreeStore', {
        extend : 'Ext.data.TreeStore',
        mixins : ['Gnt.data.mixin.ProjectableStore'],
        model  : 'TestModel',
        proxy  : { type : 'memory' },
        getByInternalModelId : function(id) {
            return this.getByInternalId(id);
        }
    });


    /* global TestModel, TestStore, TestTreeStore */
    t.expectGlobals('TestModel', 'TestStore', 'TestTreeStore');

    function withSampleStore(f) {
        var store = new TestStore({
            data  : [{
                id : 1, field1 : '1-1', field2 : '1-2', field3 : '1-3' 
            }, {
                id : 2, field1 : '2-1', field2 : '2-2', field3 : '2-3'
            }]
        });

        f(store);

        Ext.destroy(store);
    }

    function withSampleTreeStore(f) {
        var store = new TestTreeStore({
            root  : {
                expanded : true,
                children : [{
                    id : 1, field1 : '1-1', field2 : '1-2', field3 : '1-3' 
                }, {
                    id : 2, field1 : '2-1', field2 : '2-2', field3 : '2-3'
                }]
            }
        });

        f(store);

        Ext.destroy(store);
    }


    t.describe([
        "TaskStore and Task model are mixed with projectable mixin which provides a kind of transaction functionality", 
        "Those mixins might be mixed into any store and corresponding models"
    ].join(' '), function(t) {

        t.it("Allows to accumulate changes to the store's models and commit them in one bulk", function(t) {
            var test = function(store) {
                var m1 = store.getById(1),
                    m2 = store.getById(2);

                t.is(m1.isProjected(), false, "Non-projected record reporting back it's not projected");
                t.is(m2.isProjected(), false, "Non-projected record reporting back it's not projected");
                t.is(store.areProjected([m1, m2]), false, "Store also reports that both records are unprojected");

                store.startProjection();

                m1.set('field1', '1-1-a');
                m2.set({
                    field2 : '2-2-a',
                    field3 : '2-3-a'
                });

                t.is(m1.isProjected(), true, "Projected record reporting back it's projected");
                t.is(m2.isProjected(), true, "Projected record reporting back it's projected");
                t.is(store.areProjected([m1, m2]), true, "Store also reports that some records are projected");

                t.is(m1.get('field1'), '1-1-a', "In projection field getter returns current data");
                t.is(m2.get('field2'), '2-2-a', "In projection field getter returns current data");
                t.is(m2.get('field3'), '2-3-a', "In projection field getter returns current data");

                store.commitProjection();
               
                t.is(m1.isProjected(), false, "After projection commit projected record reporting back it's not projected");
                t.is(m2.isProjected(), false, "After projection commit projected record reporting back it's not projected");
                t.is(store.areProjected([m1, m2]), false, "Store also reports that both records are not projected");

                t.is(m1.get('field1'), '1-1-a', "After projection commit field getter returns committed data");
                t.is(m2.get('field2'), '2-2-a', "After projection commit field getter returns committed data");
                t.is(m2.get('field3'), '2-3-a', "After projection commit field getter returns committed data");
            };

//            t.diag("Testing on store");
//            withSampleStore(test);
            t.diag("Testing on tree store");
            withSampleTreeStore(test);
        });

        t.it("Allows to accumulate changes to the store's models and reject them in one bulk", function(t) {
            var test = function(store) {
                var m1 = store.getById(1),
                    m2 = store.getById(2);

                store.startProjection();

                m1.set('field1', '1-1-a');
                m2.set({
                    field2 : '2-2-a',
                    field3 : '2-3-a'
                });

                t.is(m1.get('field1'), '1-1-a', "In projection field getter returns current data");
                t.is(m2.get('field2'), '2-2-a', "In projection field getter returns current data");
                t.is(m2.get('field3'), '2-3-a', "In projection field getter returns current data");

                store.rejectProjection();
                
                t.is(m1.get('field1'), '1-1', "After projection reject field getter returns previous data");
                t.is(m2.get('field2'), '2-2', "After projection reject field getter returns previous data");
                t.is(m2.get('field3'), '2-3', "After projection reject field getter returns previous data");

                t.is(m1.isProjected(), false, "After projection reject projected record reporting back it's not projected");
                t.is(m2.isProjected(), false, "After projection reject projected record reporting back it's not projected");
                t.is(store.areProjected([m1, m2]), false, "Store also reports that both records are not projected");
            };

            t.diag("Testing on store");
            withSampleStore(test);
            t.diag("Testing on tree store");
            withSampleTreeStore(test);
        });

        t.it("Allows nesting of projection and supports committing / rejecting nested ones as well", function(t) {
            var test = function(store) {
                var m1 = store.getById(1),
                    m2 = store.getById(2);

                store.startProjection();

                m1.set('field1', '1-1-a');
                m1.set('field2', '1-2-a');

                store.startProjection();

                m1.set('field1', '1-1-b');

                t.is(m1.isProjected(), true, "In inner projection a projected record reports it's projected");

                t.is(m1.get('field1'), '1-1-b', "In projection getter returns proper value set during inner projection");
                t.is(m1.get('field2'), '1-2-a', "In projection getter returns proper value set during outer projection being in inner projection");

                store.rejectProjection();

                t.is(m1.isProjected(), true, "After inner projection reject record still reports it's projected");

                t.is(m1.get('field1'), '1-1-a', "In projection getter returns proper value set during outer projection after inner projection has been rejected");
                t.is(m1.get('field2'), '1-2-a', "In projection getter returns proper value set during outer projection after inner projection has been rejected");

                store.startProjection();

                t.is(m1.get('field1'), '1-1-a', "In projection getter returns proper value set during outer projection being in secondary inner projection");
                t.is(m1.get('field2'), '1-2-a', "In projection getter returns proper value set during outer projection being in secondary inner projection");

                m1.set('field1', '1-1-c');

                t.is(m1.get('field1'), '1-1-c', "In projection getter returns proper value set during secondary inner projection");
                t.is(m1.get('field2'), '1-2-a', "In projection getter returns proper value set during outer projection being in secondary inner projection");

                store.commitProjection();

                t.is(m1.isProjected(), true, "After second inner projection commit record still reports it's projected");

                store.commitProjection();

                t.is(m1.isProjected(), false, "After all projections are committed record reports it's not projected");

                t.is(m1.get('field1'), '1-1-c', "Record field getter returns proper value after both inner and outer projections has been committed");
                t.is(m1.get('field2'), '1-2-a', "Record field getter returns proper value after both inner and outer projections has been committed");
            };

            t.diag("Testing on store");
            withSampleStore(test);
            t.diag("Testing on tree store");
            withSampleTreeStore(test);
        });

        t.it("Should handle the case when projected record has been deleted during projection", function(t) {
            function test(store) {
                var m1 = store.getById(1);

                t.livesOk(function() {
                    store.startProjection();

                    m1.set('field1', '1-1-a');
                    m1.remove && m1.remove() || store.remove(m1);

                    store.commitProjection();
                }, "Removing handled without errors");
            }

            t.diag("Testing on store");
            withSampleStore(test);
            t.diag("Testing on tree store");
            withSampleTreeStore(test);
        });
    });
});
