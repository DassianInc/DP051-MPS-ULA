package bryntum.gantt.request.handler;

import java.util.HashMap;
import java.util.Map;

import bryntum.crud.exception.CrudException;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.domain.Dependency;
import bryntum.gantt.dao.Gantt;

public class DependencySyncHandler extends SyncStoreRequestHandler<Dependency> {

    private final Gantt app;

    public DependencySyncHandler(Gantt app) {
        this.app = app;
    }

    @Override
    public Dependency getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;
        Dependency record = app.getDependency(id);
        if (record == null) return null;

        if (changes.containsKey("Cls")) {
            record.setCls((String) changes.get("Cls"));
        }
        if (changes.containsKey("From")) {
            record.setFrom(changes.get("From"));
        }
        if (changes.containsKey("To")) {
            record.setTo(changes.get("To"));
        }
        if (changes.containsKey("Type")) {
            record.setType((Integer) changes.get("Type"));
        }
        if (changes.containsKey("Lag")) {
            record.setLag((Integer) changes.get("Lag"));
        }
        if (changes.containsKey("LagUnit")) {
            record.setLagUnit((String) changes.get("LagUnit"));
        }
        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }

        return record;
    }

    protected Map<String, Object> prepareData(Dependency dependency) {
        Map<String, Object> result = new HashMap<String, Object>();

        String phantomFrom = dependency.getPhantomFrom();
        if (dependency.getFrom() == null && phantomFrom != null) {
            Integer from = app.getTaskIdByPhantom(phantomFrom);
            dependency.setFrom(from);
            result.put("From", from);
        }

        String phantomTo = dependency.getPhantomTo();
        if (dependency.getTo() == null && phantomTo != null) {
            Integer to = app.getTaskIdByPhantom(phantomTo);
            dependency.setTo(to);
            result.put("To", to);
        }

        return result;
    }

    @Override
    public Map<String, Object> add(Dependency dependency) throws CrudException {
        Map<String, Object> result = prepareData(dependency);
        app.saveDependency(dependency);
        return result;
    }

    @Override
    public Map<String, Object> update(Dependency dependency, Map<String, Object> changes) throws CrudException {
        Map<String, Object> result = prepareData(dependency);
        app.saveDependency(dependency);
        return result;
    }

    @Override
    public Map<String, Object> remove(Dependency dependency) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        app.removeDependency(dependency);
        return result;
    }
}
