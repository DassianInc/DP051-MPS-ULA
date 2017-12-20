package bryntum.gantt.request.handler;

import java.text.DateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.type.TypeReference;

import bryntum.crud.exception.CrudException;
import bryntum.crud.jackson.CrudObjectMapper;
import bryntum.crud.request.Rows;
import bryntum.crud.request.SyncStoreRequest;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.request.CalendarSyncRequest;
import bryntum.gantt.dao.Gantt;
import bryntum.gantt.domain.CalendarDay;

public class CalendarSyncHandler extends SyncStoreRequestHandler<CalendarSyncRequest> {

    private final Gantt app;
    private final CalendarDaySyncHandler calendarDayHandler;

    /**
     * A Jackson ObjectMapper instance used to encode/decode JSON.
     */
    protected final CrudObjectMapper objectMapper;

    public CalendarSyncHandler(Gantt app, DateFormat dateFormat, CrudObjectMapper objectMapper) {
        super(dateFormat);
        this.app = app;
        this.objectMapper = objectMapper;

        calendarDayHandler = new CalendarDaySyncHandler(app, dateFormat);
    }

    @SuppressWarnings("unchecked")
    @Override
    public CalendarSyncRequest getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;

        CalendarSyncRequest record = app.getSyncCalendarRequest(id);
        if (record == null) return null;

        if (changes.containsKey("DaysPerMonth")) {
            record.setDaysPerMonth((Integer) changes.get("DaysPerMonth"));
        }
        if (changes.containsKey("DaysPerWeek")) {
            record.setDaysPerWeek((Integer) changes.get("DaysPerWeek"));
        }
        if (changes.containsKey("DefaultAvailability")) {
            record.setDefaultAvailability((List<String>) changes.get("DefaultAvailability"));
        }
        if (changes.containsKey("HoursPerDay")) {
            record.setHoursPerDay((Integer) changes.get("HoursPerDay"));
        }
        if (changes.containsKey("Name")) {
            record.setName((String) changes.get("Name"));
        }
        if (changes.containsKey("parentId")) {
            record.setParentId(changes.get("parentId"));
        }
        if (changes.containsKey("PhantomParentId")) {
            record.setPhantomParentId((String) changes.get("PhantomParentId"));
        }
        if (changes.containsKey("WeekendFirstDay")) {
            record.setWeekendFirstDay((Integer) changes.get("WeekendFirstDay"));
        }
        if (changes.containsKey("WeekendSecondDay")) {
            record.setWeekendSecondDay((Integer) changes.get("WeekendSecondDay"));
        }
        if (changes.containsKey("WeekendsAreWorkdays")) {
            record.setWeekendsAreWorkdays((Boolean) changes.get("WeekendsAreWorkdays"));
        }
        // if Days field passed then its nested request to change corresponding calendar data
        // we need to decode it to a proper SyncStoreRequest instance and put it to daysRequest field
        if (changes.containsKey("Days")) {
            record.daysRequest = objectMapper.convertValue(changes.get("Days"), new TypeReference<SyncStoreRequest<CalendarDay>>(){});
        }
        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }

        return record;
    }

    protected Map<String, Object> prepareData(CalendarSyncRequest calendar) {
        // initialize response part related to the change
        Map<String, Object> response = new HashMap<String, Object>();

        String phantomCalendarId = calendar.getPhantomParentId();
        if (calendar.getParentId() == null && phantomCalendarId != null && !phantomCalendarId.equalsIgnoreCase("root") && !phantomCalendarId.equals("")) {
            Integer calendarId = app.getCalendarIdByPhantom(phantomCalendarId);
            calendar.setParentId(calendarId);
            response.put("parentId", calendarId);
        }

        return response;
    }

    @Override
    public Map<String, Object> add(CalendarSyncRequest calendar) throws CrudException {
        Map<String, Object> response = prepareData(calendar);
        app.saveCalendar(calendar);

        if (calendar.daysRequest != null) {
            calendarDayHandler.setCalendarId(calendar.getId());
            response.put("Days", calendarDayHandler.handle(calendar.daysRequest, Rows.ALL));
        }

        return response;
    }

    @Override
    public Map<String, Object> update(CalendarSyncRequest calendar, Map<String, Object> changes) throws CrudException {
        Map<String, Object> response = prepareData(calendar);
        app.saveCalendar(calendar);

        if (calendar.daysRequest != null) {
            calendarDayHandler.setCalendarId(calendar.getId());
            response.put("Days", calendarDayHandler.handle(calendar.daysRequest, Rows.ALL));
        }

        return response;
    }

    @Override
    public Map<String, Object> remove(CalendarSyncRequest calendar) throws CrudException {
        app.removeCalendar(calendar);
        return new HashMap<String, Object>();
    }
}
