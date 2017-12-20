StartTest(function (t) {

    function getGantt(config, storeConfig) {

        var taskStore   = t.getTaskStore(storeConfig);


        return t.getGantt(Ext.apply({
            showProjectLines    : true,
            renderTo            : Ext.getBody(),
            startDate           : new Date(2015, 0, 1),
            endDate             : Sch.util.Date.add(new Date(2015, 0, 1), Sch.util.Date.WEEK, 20),
            taskStore           : taskStore
        }, config));
    }

    t.it('Assert project lines', function (t) {

        var gantt   = getGantt(null, { DATA : [ t.getProject('Project') ] });

        var store   = gantt.taskStore,
            project = store.getNodeById('Project'),
            left;

        t.chain(
            { waitForEventsToRender : gantt },

            { waitForSelector : '.sch-gantt-project-line-Project' },

            function (next) {
                t.is(gantt.getPlugin('gantt_projectlines').store.getCount(), 2, '2 lines in the store');
                t.selectorExists('.sch-header-secondary-canvas .sch-gantt-project-line-start.sch-gantt-project-line-' + project.getId(), 'Project header startline exists');
                t.selectorExists('.sch-header-secondary-canvas .sch-gantt-project-line-end.sch-gantt-project-line-' + project.getId(), 'Project header endline exists');
                t.selectorExists('.sch-gantt-project-line-start .sch-gantt-project-line-text', 'Project text start selector exists');
                t.selectorExists('.sch-gantt-project-line-end .sch-gantt-project-line-text', 'Project text end selector exists');
                t.contentLike('.sch-gantt-project-line-start .sch-gantt-project-line-text', project.getName(), 'Startline has correct label');
                t.contentLike('.sch-gantt-project-line-end .sch-gantt-project-line-text', project.getName(), 'Startline has correct label');

                var firstLabel = Ext.select('.sch-gantt-project-line-start .sch-gantt-project-line-text').first();
                left = firstLabel.getLeft();

                project.beginEdit();
                project.setStartDate(new Date(2015, 0, 5));
                project.setId('newId');
                project.endEdit();

                next();
            },

            { waitForSelector : '.sch-gantt-project-line-newId' },

            function (next) {
                var firstLabel = Ext.select('.sch-gantt-project-line-start .sch-gantt-project-line-text').first();
                t.isGreater(firstLabel.getLeft(), left, 'Label has moved');

                // filter out all project lines
                gantt.getPlugin('gantt_projectlines').store.filterBy(function () { return false; });

                next();
            },

            { waitForSelectorNotFound : '.sch-gantt-project-line-newId', desc : 'Line disappeared' },

            function (next) {
                t.selectorNotExists('.sch-gantt-project-line-start', 'startline doesn not exist');
                t.selectorNotExists('.sch-gantt-project-line-end', 'endline does not exist');

                gantt.destroy();
            }

        );

    });

    t.it('Assert project lines (start only)', function (t) {

        var gantt   = getGantt(
            {
                projectLinesConfig  : { linesFor : 'start' }
            },
            {
                DATA : [ t.getProject('Project') ]
            }
        );

        var store   = gantt.taskStore,
            project = store.getNodeById('Project'),
            left;

        t.chain(
            { waitForEventsToRender : gantt },

            { waitForSelector : '.sch-gantt-project-line-Project' },

            function (next) {
                t.is(gantt.getPlugin('gantt_projectlines').store.getCount(), 1, '1 line in the store');
                t.selectorExists('.sch-header-secondary-canvas .sch-gantt-project-line-start.sch-gantt-project-line-' + project.getId(), 'Project header startline exists');
                t.selectorNotExists('.sch-gantt-project-line-end', 'End line not found');
                t.selectorExists('.sch-gantt-project-line-start .sch-gantt-project-line-text', 'Project text start selector exists');
                t.contentLike('.sch-gantt-project-line-start .sch-gantt-project-line-text', project.getName(), 'Startline has correct label');

                var firstLabel = Ext.select('.sch-gantt-project-line-start .sch-gantt-project-line-text').first();
                left = firstLabel.getLeft();

                project.beginEdit();
                project.setStartDate(new Date(2015, 0, 5));
                project.setId('newId');
                project.endEdit();

                next();
            },

            { waitForSelector : '.sch-gantt-project-line-newId' },

            function (next) {
                var firstLabel = Ext.select('.sch-gantt-project-line-start .sch-gantt-project-line-text').first();
                t.isGreater(firstLabel.getLeft(), left, 'Label has moved');

                // filter out all project lines
                gantt.getPlugin('gantt_projectlines').store.filterBy(function () { return false; });

                next();
            },

            { waitForSelectorNotFound : '.sch-gantt-project-line-newId', desc : 'Line disappeared' },

            function (next) {
                t.selectorNotExists('.sch-gantt-project-line-start', 'startline doesn not exist');
                t.selectorNotExists('.sch-gantt-project-line-end', 'endline does not exist');

                gantt.destroy();
            }

        );

    });

});