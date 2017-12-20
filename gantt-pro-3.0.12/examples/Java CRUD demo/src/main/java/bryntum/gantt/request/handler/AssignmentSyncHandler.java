package bryntum.gantt.request.handler;

import java.util.HashMap;
import java.util.Map;

import bryntum.crud.exception.CrudException;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.domain.Assignment;
import bryntum.gantt.dao.Gantt;

public class AssignmentSyncHandler extends SyncStoreRequestHandler<Assignment> {

    private final Gantt app;

    public AssignmentSyncHandler(Gantt app) {
        this.app = app;
    }

    @Override
    public Assignment getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;

        Assignment record = app.getAssignment(id);
        if (record == null) return null;

        if (changes.containsKey("ResourceId")) {
            record.setResourceId(changes.get("ResourceId"));
        }
        if (changes.containsKey("TaskId")) {
            record.setTaskId(changes.get("TaskId"));
        }
        if (changes.containsKey("Units")) {
            record.setUnits((Integer) changes.get("Units"));
        }
        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }

        return record;
    }

    protected Map<String, Object> prepareData(Assignment assignment) {
        // initialize returning hash
        Map<String, Object> result = new HashMap<String, Object>();

        String phantomTaskId = assignment.getPhantomTaskId();
        if (assignment.getTaskId() == null && phantomTaskId != null) {
            Integer taskId = app.getTaskIdByPhantom(phantomTaskId);
            assignment.setTaskId(taskId);
            result.put("TaskId", taskId);
        }

        String phantomResourceId = assignment.getPhantomResourceId();
        if (assignment.getResourceId() == null && phantomResourceId != null) {
            Integer resourceId = app.getResourceIdByPhantom(phantomResourceId);
            assignment.setResourceId(resourceId);
            result.put("ResourceId", resourceId);
        }

        return result;
    }

    @Override
    public Map<String, Object> add(Assignment assignment) throws CrudException {
        Map<String, Object> result = prepareData(assignment);

        app.saveAssignment(assignment);

        return result;
    }

    @Override
    public Map<String, Object> update(Assignment assignment, Map<String, Object> changes) throws CrudException {
        Map<String, Object> result = prepareData(assignment);

        app.saveAssignment(assignment);

        return result;
    }

    @Override
    public Map<String, Object> remove(Assignment assignment) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();

        app.removeAssignment(assignment);

        return result;
    }
}
