StartTest(function(t) {

    var gantt, dependencyStore, lockedView;

    t.beforeEach(function () {
        gantt && gantt.destroy();

        dependencyStore && dependencyStore.destroy();

        gantt   = t.getGantt({
            renderTo    : Ext.getBody(),
            taskStore   : t.getTaskStore({
                DATA    : [
                    { Id : 3, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                    { Id : 4, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                    { Id : 5, leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 }
                ]
            }),

            dependencyStore : new Gnt.data.DependencyStore({
                data    : [
                    { Id : 1, From : 4, To : 3 }
                ]
            }),

            columns : [
                {
                    xtype       : 'treecolumn',
                    dataIndex   : 'Id'
                },
                {
                    xtype       : 'predecessorcolumn',
                    tdCls       : 'pred',
                    text        : 'Predecessor'
                },
                {
                    xtype       : 'successorcolumn',
                    tdCls       : 'succ',
                    text        : 'Successor'
                }
            ],

            eventRenderer : function (taskRec) {
                var incoming = taskRec.getIncomingDependencies(),
                    outgoing = taskRec.getOutgoingDependencies(),
                    cls = ['dep'];

                if (incoming.length) {
                    cls.push(incoming[0].getSourceId());
                }

                if (outgoing.length) {
                    cls.push(outgoing[0].getTargetId());
                }

                return {
                    cls   : cls.join('-')
                };
            }
        });

        dependencyStore = gantt.dependencyStore;

        lockedView      = gantt.lockedGrid.getView();
    });

    t.it('Columns are not dirty initially', function (t) {
        t.waitForRowsVisible(gantt, function () {
            for (var i = 0; i < 3; i++) {
                t.hasNotCls(lockedView.getCellByPosition({ row : i, column : 1 }), lockedView.dirtyCls, 'cell '+i+',1 is not dirty');
                t.hasNotCls(lockedView.getCellByPosition({ row : i, column : 2 }), lockedView.dirtyCls, 'cell '+i+',2 is not dirty');
            }
        });
    });

    t.it('Column get dirty after dependency removal', function (t) {

        dependencyStore.remove(dependencyStore.getAt(0));

        t.waitForRowsVisible(gantt, function () {
            t.hasCls(lockedView.getCellByPosition({ row : 0, column : 1 }), lockedView.dirtyCls, 'cell 0,1 is dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 0, column : 2 }), lockedView.dirtyCls, 'cell 0,2 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 1, column : 1 }), lockedView.dirtyCls, 'cell 1,1 is not dirty');
            t.hasCls(lockedView.getCellByPosition({ row : 1, column : 2 }), lockedView.dirtyCls, 'cell 1,2 is dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 1 }), lockedView.dirtyCls, 'cell 2,1 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 2 }), lockedView.dirtyCls, 'cell 2,2 is not dirty');
        });
    });

    t.it('Column get dirty after dependency update', function (t) {

        dependencyStore.getAt(0).setType(1);

        t.waitForRowsVisible(gantt, function () {
            t.hasCls(lockedView.getCellByPosition({ row : 0, column : 1 }), lockedView.dirtyCls, 'cell 0,1 is dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 0, column : 2 }), lockedView.dirtyCls, 'cell 0,2 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 1, column : 1 }), lockedView.dirtyCls, 'cell 1,1 is not dirty');
            t.hasCls(lockedView.getCellByPosition({ row : 1, column : 2 }), lockedView.dirtyCls, 'cell 1,2 is dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 1 }), lockedView.dirtyCls, 'cell 2,1 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 2 }), lockedView.dirtyCls, 'cell 2,2 is not dirty');
        });
    });

    t.it('Column get dirty after dependency add', function (t) {

        dependencyStore.add({ From : 3, To : 5, Lag : -1 });

        t.waitForRowsVisible(gantt, function () {
            t.hasNotCls(lockedView.getCellByPosition({ row : 0, column : 1 }), lockedView.dirtyCls, 'cell 0,1 is dirty');
            t.hasCls(lockedView.getCellByPosition({ row : 0, column : 2 }), lockedView.dirtyCls, 'cell 0,2 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 1, column : 1 }), lockedView.dirtyCls, 'cell 1,1 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 1, column : 2 }), lockedView.dirtyCls, 'cell 1,2 is dirty');
            t.hasCls(lockedView.getCellByPosition({ row : 2, column : 1 }), lockedView.dirtyCls, 'cell 2,1 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 2 }), lockedView.dirtyCls, 'cell 2,2 is not dirty');

            t.selectorExists('.sch-gantt-item.dep-4-5', 'Record in normal view updated');
            t.selectorExists('.sch-gantt-item.dep-3', 'Record in normal view updated');

            dependencyStore.commitChanges();

            t.hasNotCls(lockedView.getCellByPosition({ row : 0, column : 2 }), lockedView.dirtyCls, 'cell 0,2 is not dirty');
            t.hasNotCls(lockedView.getCellByPosition({ row : 2, column : 1 }), lockedView.dirtyCls, 'cell 2,1 is not dirty');

            t.selectorExists('.sch-gantt-item.dep-4-5', 'Record in normal view updated');
            t.selectorExists('.sch-gantt-item.dep-3', 'Record in normal view updated');
        });
    });
});
