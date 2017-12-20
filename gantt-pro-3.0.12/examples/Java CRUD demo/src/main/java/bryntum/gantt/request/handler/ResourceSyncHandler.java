package bryntum.gantt.request.handler;

import java.util.HashMap;
import java.util.Map;

import bryntum.crud.exception.CrudException;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.domain.Resource;
import bryntum.gantt.dao.Gantt;

public class ResourceSyncHandler extends SyncStoreRequestHandler<Resource> {

    private final Gantt app;

    public ResourceSyncHandler(Gantt app) {
        this.app = app;
    }

    @Override
    public Resource getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;

        Resource record = app.getResource(id);
        if (record == null) return null;

        if (changes.containsKey("Name")) {
            record.setName((String) changes.get("Name"));
        }
        if (changes.containsKey("CalendarId")) {
            record.setCalendarId(changes.get("CalendarId"));
        }
        return record;
    }

    protected Map<String, Object> prepareData(Resource resource) {
        Map<String, Object> result = new HashMap<String, Object>();

        String phantomCalendarId = resource.getPhantomCalendarId();
        if (resource.getCalendarId() == null && phantomCalendarId != null && !phantomCalendarId.equals("")) {
            Integer calendarId = app.getCalendarIdByPhantom(phantomCalendarId);
            resource.setCalendarId(calendarId);
            result.put("CalendarId", calendarId);
        }

        return result;
    }

    @Override
    public Map<String, Object> add(Resource resource) throws CrudException {
        Map<String, Object> result = prepareData(resource);
        app.saveResource(resource);
        return result;
    }

    @Override
    public Map<String, Object> update(Resource resource, Map<String, Object> changes) throws CrudException {
        Map<String, Object> result = prepareData(resource);
        app.saveResource(resource);
        return result;
    }

    @Override
    public Map<String, Object> remove(Resource resource) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        app.removeResource(resource);
        return result;
    }
}
