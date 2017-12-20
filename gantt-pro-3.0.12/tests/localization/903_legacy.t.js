StartTest(function(t) {

    // Test legacy locales definition support.
    // Below we use some pieces of old way locales definition
    // and check if they are correctly returned by L() method

    var comp;

    if (Gnt.util.DurationParser) {
        t.diag("Check Gnt.util.DurationParser class");

        Gnt.util.DurationParser.prototype.unitsRegex = {
            MILLI       : /^мс$|^мил/i,
            SECOND      : /^с$|^сек/i,
            MINUTE      : /^м$|^мин/i,
            HOUR        : /^ч$|^час/i,
            DAY         : /^д$|^ден|^дне/i,
            WEEK        : /^н$|^нед/i,
            MONTH       : /^мес/i,
            QUARTER     : /^к$|^квар|^квр/i,
            YEAR        : /^г$|^год|^лет/i
        };

        comp = new Gnt.util.DurationParser();

        var unitsRegex = comp.L('unitsRegex');

        t.is(unitsRegex.MILLI.toString(), '/^мс$|^мил/i', 'L("unitsRegex").MILLI gives correct value');
        t.is(unitsRegex.SECOND.toString(), '/^с$|^сек/i', 'L("unitsRegex").SECOND gives correct value');
        t.is(unitsRegex.MINUTE.toString(), '/^м$|^мин/i', 'L("unitsRegex").MINUTE gives correct value');
        t.is(unitsRegex.HOUR.toString(), '/^ч$|^час/i', 'L("unitsRegex").HOUR gives correct value');
        t.is(unitsRegex.DAY.toString(), '/^д$|^ден|^дне/i', 'L("unitsRegex").DAY gives correct value');
        t.is(unitsRegex.WEEK.toString(), '/^н$|^нед/i', 'L("unitsRegex").WEEK gives correct value');
        t.is(unitsRegex.MONTH.toString(), '/^мес/i', 'L("unitsRegex").MONTH gives correct value');
        t.is(unitsRegex.QUARTER.toString(), '/^к$|^квар|^квр/i', 'L("unitsRegex").QUARTER gives correct value');
        t.is(unitsRegex.YEAR.toString(), '/^г$|^год|^лет/i', 'L("unitsRegex").YEAR gives correct value');
    }

    if (Gnt.feature.DependencyDragDrop) {
        t.diag("Check Gnt.feature.DependencyDragDrop class");

        Gnt.feature.DependencyDragDrop.prototype.fromText       = 'От: <strong>{0}</strong> {1}<br/>';
        Gnt.feature.DependencyDragDrop.prototype.toText         = 'К: <strong>{0}</strong> {1}';
        Gnt.feature.DependencyDragDrop.prototype.startText      = 'Начало';
        Gnt.feature.DependencyDragDrop.prototype.endText        = 'Конец';

        // this feature reqires rendered Gantt instance
        var gantt = t.getGantt({
            renderTo : Ext.getBody()
        });

        comp = new Gnt.feature.DependencyDragDrop({
            ganttView : gantt.getSchedulingView(),
            el        : gantt.getSchedulingView().el
        });

        t.is(comp.L('fromText'), 'От: <strong>{0}</strong> {1}<br/>', 'L("fromText") gives correct value');
        t.is(comp.L('toText'), 'К: <strong>{0}</strong> {1}', 'L("toText") gives correct value');
        t.is(comp.L('startText'), 'Начало', 'L("startText") gives correct value');
        t.is(comp.L('endText'), 'Конец', 'L("endText") gives correct value');
    }

    if (Gnt.plugin.TaskContextMenu) {
        t.diag("Check Gnt.plugin.TaskContextMenu class");

        Gnt.plugin.TaskContextMenu.prototype.texts = {
            newTaskText         : 'Новая задача',
            newMilestoneText    : 'Новая веха',
            deleteTask          : 'Удалить задачу(и)',
            editLeftLabel       : 'Редактировать левую метку',
            editRightLabel      : 'Редактировать правую метку',
            add                 : 'Добавить...',
            deleteDependency    : 'Удалить зависимость...',
            addTaskAbove        : 'Задачу выше',
            addTaskBelow        : 'Задачу ниже',
            addMilestone        : 'Веху',
            addSubtask          : 'Под-задачу',
            addSuccessor        : 'Последующую задачу',
            addPredecessor      : 'Предшествующую задачу'
        };

        comp = new Gnt.plugin.TaskContextMenu();

        t.is(comp.L('newTaskText', 'texts'), 'Новая задача', 'L("newTaskText") gives correct value');
        t.is(comp.L('newMilestoneText', 'texts'), 'Новая веха', 'L("newMilestoneText") gives correct value');
        t.is(comp.L('deleteTask', 'texts'), 'Удалить задачу(и)', 'L("deleteTask") gives correct value');
        t.is(comp.L('editLeftLabel', 'texts'), 'Редактировать левую метку', 'L("editLeftLabel") gives correct value');
        t.is(comp.L('editRightLabel', 'texts'), 'Редактировать правую метку', 'L("editRightLabel") gives correct value');
        t.is(comp.L('add', 'texts'), 'Добавить...', 'L("add") gives correct value');
        t.is(comp.L('deleteDependency', 'texts'), 'Удалить зависимость...', 'L("deleteDependency") gives correct value');
        t.is(comp.L('addTaskAbove', 'texts'), 'Задачу выше', 'L("addTaskAbove") gives correct value');
        t.is(comp.L('addTaskBelow', 'texts'), 'Задачу ниже', 'L("addTaskBelow") gives correct value');
        t.is(comp.L('addMilestone', 'texts'), 'Веху', 'L("addMilestone") gives correct value');
        t.is(comp.L('addSubtask', 'texts'), 'Под-задачу', 'L("addSubtask") gives correct value');
        t.is(comp.L('addSuccessor', 'texts'), 'Последующую задачу', 'L("addSuccessor") gives correct value');
        t.is(comp.L('addPredecessor', 'texts'), 'Предшествующую задачу', 'L("addPredecessor") gives correct value');

        t.diag("..and without legacyHolderProp specified");

        t.is(comp.L('newTaskText'), 'Новая задача', 'L("newTaskText") gives correct value');
        t.is(comp.L('newMilestoneText'), 'Новая веха', 'L("newMilestoneText") gives correct value');
        t.is(comp.L('deleteTask'), 'Удалить задачу(и)', 'L("deleteTask") gives correct value');
        t.is(comp.L('editLeftLabel'), 'Редактировать левую метку', 'L("editLeftLabel") gives correct value');
        t.is(comp.L('editRightLabel'), 'Редактировать правую метку', 'L("editRightLabel") gives correct value');
        t.is(comp.L('add'), 'Добавить...', 'L("add") gives correct value');
        t.is(comp.L('deleteDependency'), 'Удалить зависимость...', 'L("deleteDependency") gives correct value');
        t.is(comp.L('addTaskAbove'), 'Задачу выше', 'L("addTaskAbove") gives correct value');
        t.is(comp.L('addTaskBelow'), 'Задачу ниже', 'L("addTaskBelow") gives correct value');
        t.is(comp.L('addMilestone'), 'Веху', 'L("addMilestone") gives correct value');
        t.is(comp.L('addSubtask'), 'Под-задачу', 'L("addSubtask") gives correct value');
        t.is(comp.L('addSuccessor'), 'Последующую задачу', 'L("addSuccessor") gives correct value');
        t.is(comp.L('addPredecessor'), 'Предшествующую задачу', 'L("addPredecessor") gives correct value');
    }

    if (Gnt.plugin.DependencyEditor) {
        t.diag("Check Gnt.plugin.DependencyEditor class");

        Gnt.plugin.DependencyEditor.override({
            fromText            : 'От',
            toText              : 'К',
            typeText            : 'Тип',
            lagText             : 'Задержка',
            endToStartText      : 'Конец-К-Началу',
            startToStartText    : 'Начало-К-Началу',
            endToEndText        : 'Конец-К-Концу',
            startToEndText      : 'Начало-К-Концу'
        });

        comp = new Gnt.plugin.DependencyEditor();

        t.is(comp.L('fromText'), 'От', 'L("fromText") gives correct value');
        t.is(comp.L('toText'), 'К', 'L("toText") gives correct value');
        t.is(comp.L('typeText'), 'Тип', 'L("typeText") gives correct value');
        t.is(comp.L('lagText'), 'Задержка', 'L("lagText") gives correct value');
        t.is(comp.L('endToStartText'), 'Конец-К-Началу', 'L("endToStartText") gives correct value');
        t.is(comp.L('startToStartText'), 'Начало-К-Началу', 'L("startToStartText") gives correct value');
        t.is(comp.L('endToEndText'), 'Конец-К-Концу', 'L("endToEndText") gives correct value');
        t.is(comp.L('startToEndText'), 'Начало-К-Концу', 'L("startToEndText") gives correct value');
    }

    if (Gnt.plugin.TaskEditor) {
        t.diag("Check Gnt.plugin.TaskEditor class");

        comp = new Gnt.plugin.TaskEditor();

        t.is(Gnt.plugin.TaskEditor.prototype.title,        'Task Information', 'Gnt.plugin.TaskEditor.prototype.title is correct');
        t.is(Gnt.plugin.TaskEditor.prototype.alertCaption, 'Information', 'Gnt.plugin.TaskEditor.prototype.alertCaption is correct');
        t.is(Gnt.plugin.TaskEditor.prototype.alertText,    'Please correct marked errors to save changes', 'Gnt.plugin.TaskEditor.prototype.alertText is correct');
        t.is(Gnt.plugin.TaskEditor.prototype.okText,       'Ok', 'Gnt.plugin.TaskEditor.prototype.okText is correct');
        t.is(Gnt.plugin.TaskEditor.prototype.cancelText,   'Cancel', 'Gnt.plugin.TaskEditor.prototype.cancelText is correct');
    }

});
