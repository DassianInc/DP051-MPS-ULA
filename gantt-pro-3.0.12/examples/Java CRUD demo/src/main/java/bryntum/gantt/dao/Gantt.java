package bryntum.gantt.dao;

import static bryntum.gantt.exception.Codes.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import bryntum.crud.dao.Util;
import bryntum.crud.exception.CrudException;
import bryntum.gantt.jdbc.*;
import bryntum.gantt.domain.*;
import bryntum.gantt.request.CalendarSyncRequest;

public class Gantt {

    /**
     * Object providing interface to interact with the database.
     */
    protected JdbcTemplate tmpl;
    /**
     * Object providing interface to interact with the database using named parameters.
     */
    protected NamedParameterJdbcTemplate namedTmpl;
    /**
     *
     */
    public Util util;

    // JdbcTemplate row mappers to extract data from the database and put into models
    private static RowMapper<Assignment> ASSIGNMENT_ROW_MAPPER = new AssignmentRowMapper();
    private static RowMapper<Resource> RESOURCE_ROW_MAPPER = new ResourceRowMapper();
    private static RowMapper<Dependency> DEPENDENCY_ROW_MAPPER = new DependencyRowMapper();
    private static RowMapper<CalendarDay> CALENDAR_DAY_ROW_MAPPER = new CalendarDayRowMapper();
    private static RowMapper<Calendar> CALENDAR_ROW_MAPPER = new CalendarRowMapper();
    private static RowMapper<Task> TASK_ROW_MAPPER;
    private static RowMapper<TaskSegment> TASK_SEGMENT_ROW_MAPPER = new TaskSegmentRowMapper();
    private static RowMapper<CalendarSyncRequest> SYNC_CALENDAR_MAPPER = new CalendarSyncRowMapper();

    public static Logger log = Logger.getLogger(Gantt.class.getName());

    public Gantt (JdbcTemplate tmpl, Util util) {
        this.tmpl = tmpl;
        namedTmpl = new NamedParameterJdbcTemplate(tmpl);
        this.util = util;
        TASK_ROW_MAPPER = new TaskRowMapper(this);
    }

    public void initPhantomIdMaps() {
        ThreadLocal<Map<String, Map<String, Integer>>> local = new ThreadLocal<Map<String,Map<String,Integer>>>();
        local.set(new HashMap<String, Map<String,Integer>>());

        Map<String, Map<String, Integer>> map = local.get();
        map.put("tasks", new HashMap<String, Integer>());
        map.put("calendars", new HashMap<String, Integer>());
        map.put("resources", new HashMap<String, Integer>());
        map.put("task_segments", new HashMap<String, Integer>());
        util.setPhantomIdMap(map);

        ThreadLocal<Map<String, Map<Integer, Map<String, Object>>>> localUpdated = new ThreadLocal<Map<String, Map<Integer, Map<String, Object>>>>();
        localUpdated.set(new HashMap<String, Map<Integer, Map<String, Object>>>());

        Map<String, Map<Integer, Map<String, Object>>> updated = localUpdated.get();
        updated.put("tasks", new HashMap<Integer, Map<String, Object>>());
        updated.put("calendars", new HashMap<Integer, Map<String, Object>>());
        updated.put("resources", new HashMap<Integer, Map<String, Object>>());

        util.setUpdatedRows(updated);

        ThreadLocal<Map<String, Map<Integer, Map<String, Object>>>> localRemoved = new ThreadLocal<Map<String, Map<Integer, Map<String, Object>>>>();
        localRemoved.set(new HashMap<String, Map<Integer, Map<String, Object>>>());

        Map<String, Map<Integer, Map<String, Object>>> removed = localRemoved.get();
        removed.put("tasks", new HashMap<Integer, Map<String, Object>>());
        removed.put("calendars", new HashMap<Integer, Map<String, Object>>());
        removed.put("calendardays", new HashMap<Integer, Map<String, Object>>());
        removed.put("resources", new HashMap<Integer, Map<String, Object>>());
        removed.put("assignments", new HashMap<Integer, Map<String, Object>>());
        removed.put("dependencies", new HashMap<Integer, Map<String, Object>>());

        util.setRemovedRows(removed);
    }

    /**
     * Gets the project calendar identifier.
     * @return Identifier of the project calendar.
     * @throws CrudException
     */
    public int getProjectCalendarId() throws CrudException {
        return Integer.parseInt(util.getOption("projectCalendar"));
    }

    /**
     * Gets real task identifier by specified phantom one.
     * @param phantomId Task phantom identifier.
     * @return Task real identifier.
     */
    public Integer getTaskIdByPhantom(String phantomId) {
        return util.getIdByPhantom("tasks", phantomId);
    }

    /**
     * Gets real resource identifier by specified phantom one.
     * @param phantomId Resource phantom identifier.
     * @return Resource real identifier.
     */
    public Integer getResourceIdByPhantom(String phantomId) {
        return util.getIdByPhantom("resources", phantomId);
    }

    /**
     * Gets real calendar identifier by specified phantom one.
     * @param phantomId Calendar phantom identifier.
     * @return Calendar real identifier.
     */
    public Integer getCalendarIdByPhantom(String phantomId) {
        return util.getIdByPhantom("calendars", phantomId);
    }

    /**
     * Gets a calendar day by its identifier.
     * @param id Calendar day identifier.
     * @return Calendar day.
     */
    public CalendarDay getCalendarDay(int id) {
        return tmpl.queryForObject("select * from calendar_days where Id = ?", new Object[] { id }, CALENDAR_DAY_ROW_MAPPER);
    }

    /**
     * Saves a calendar day.
     * Either creates a new record (if day identifier is null) or updates
     * existing one (if identifier is provided).
     * @param calendarDay The day to save.
     * @throws CrudException
     */
    public void saveCalendarDay(CalendarDay calendarDay) throws CrudException {
        Integer id = calendarDay.getId();

        // update existing record
        if (id != null) {
            try {
                tmpl.update("update calendar_days set "+
                    "CalendarId = ?, "+
                    "Cls = ?, "+
                    "Dt = ?, "+
                    "Name = ?, "+
                    "Typ = ?, "+
                    "OverrideStartDate = ?, "+
                    "OverrideEndDate = ?, "+
                    "Weekday = ?, "+
                    "Availability = ? "+
                    "where Id = ?",
                    new Object[] {
                        calendarDay.getCalendarId(),
                        calendarDay.getCls(),
                        calendarDay.getDate(),
                        calendarDay.getName(),
                        calendarDay.getType(),
                        calendarDay.getOverrideStartDate(),
                        calendarDay.getOverrideEndDate(),
                        calendarDay.getWeekday(),
                        util.implode("|", calendarDay.getAvailability()),
                        calendarDay.getId()
                    }
                );
            } catch (Exception e) {
                throw new CrudException("Cannot update calendar day #" + Integer.toString(id), UPDATE_CALENDAR_DAY);
            }

        // create new record
        } else {
            try {
                tmpl.update("insert into calendar_days ("+
                    "CalendarId, "+
                    "Cls, "+
                    "Dt, "+
                    "Name, "+
                    "Typ, "+
                    "OverrideStartDate, "+
                    "OverrideEndDate, "+
                    "Weekday, "+
                    "Availability "+
                    ") values (?,?,?,?,?,?,?,?,?)",
                    new Object[] {
                        calendarDay.getCalendarId(),
                        calendarDay.getCls(),
                        calendarDay.getDate(),
                        calendarDay.getName(),
                        calendarDay.getType(),
                        calendarDay.getOverrideStartDate(),
                        calendarDay.getOverrideEndDate(),
                        calendarDay.getWeekday(),
                        util.implode("|", calendarDay.getAvailability())
                    }
                );
                calendarDay.setId(util.getLastInsertId());
            } catch (Exception e) {
                throw new CrudException("Cannot create calendar day.", ADD_CALENDAR_DAY);
            }
        }

        util.updateRevision();
    }

    /**
     * Removes a calendar day.
     * @param calendarDay Day to remove.
     * @throws CrudException
     */
    public void removeCalendarDay(CalendarDay calendarDay) throws CrudException {
        int id = calendarDay.getId();

        try {
            tmpl.update("delete from calendar_days where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove calendar day #" + Integer.toString(id) + ".", REMOVE_CALENDARDAYS);
        }

        util.updateRevision();
    }

    public void removeCalendarDays(Integer calendarId) throws CrudException {
        try {
            tmpl.update("delete from calendar_days where calendarId = ?", new Object[] { calendarId });
        } catch (Exception e) {
            throw new CrudException("Cannot remove calendar #" + Integer.toString(calendarId) + " days.", REMOVE_CALENDARDAYS);
        }

        util.updateRevision();
    }

    /**
     * Gets list of days for a specific calendar.
     * @param calendarId The calendar identifier.
     * @return List of calendar days.
     * @throws CrudException
     */
    public List<CalendarDay> getCalendarDays(String calendarId) throws CrudException {
        if (calendarId == null || "".equals(calendarId)) {
            throw new CrudException("Calendar identifier is not specified.", GET_CALENDAR_DAYS);
        }

        return tmpl.query("select * from calendar_days where calendarId = ?", new Object[] { calendarId }, CALENDAR_DAY_ROW_MAPPER);
    }

    /**
     * Gets a calendar request by its identifier.
     * Note: This method is used during sync request deserializing only.
     * @param id The calendar request identifier.
     * @return The calendar.
     */
    public CalendarSyncRequest getSyncCalendarRequest(int id) {
        return tmpl.queryForObject("select * from calendars where Id = ?", new Object[] { id }, SYNC_CALENDAR_MAPPER);
    }

    /**
     * Gets a calendar by its identifier.
     * @param id The calendar identifier.
     * @return The calendar.
     */
    public Calendar getCalendar(int id) {
        return tmpl.queryForObject("select * from calendars where Id = ?", new Object[] { id }, CALENDAR_ROW_MAPPER);
    }

    /**
     * Saves a calendar.
     * Either creates a new record (if calendar identifier is null) or updates
     * existing one (if identifier is provided).
     * @param calendar The calendar.
     * @throws CrudException
     */
    public void saveCalendar(Calendar calendar) throws CrudException {
        Integer id = calendar.getId();

        // update existing record
        if (id != null) {
            try {
                tmpl.update("update calendars set "+
                    "parentId = ?, "+
                    "Name = ?, "+
                    "DaysPerMonth = ?, "+
                    "DaysPerWeek = ?, "+
                    "DefaultAvailability = ?, "+
                    "HoursPerDay = ?, "+
                    "WeekendsAreWorkdays = ?, "+
                    "WeekendFirstDay = ?, "+
                    "WeekendSecondDay = ? "+
                    "where Id = ?",
                    new Object[] {
                        calendar.getParentId(),
                        calendar.getName(),
                        calendar.getDaysPerMonth(),
                        calendar.getDaysPerWeek(),
                        util.implode("|", calendar.getDefaultAvailability()),
                        calendar.getHoursPerDay(),
                        calendar.isWeekendsAreWorkdays() ? 1 : 0,
                        calendar.getWeekendFirstDay(),
                        calendar.getWeekendSecondDay(),
                        calendar.getId()
                    }
                );
            } catch (Exception e) {
                throw new CrudException("Cannot update calendar #" + Integer.toString(id), UPDATE_CALENDAR);
            }

        // create new record
        } else {
            try {
                tmpl.update("insert into calendars ("+
                    "parentId, "+
                    "Name, "+
                    "DaysPerMonth, "+
                    "DaysPerWeek, "+
                    "DefaultAvailability, "+
                    "HoursPerDay, "+
                    "WeekendsAreWorkdays, "+
                    "WeekendFirstDay, "+
                    "WeekendSecondDay "+
                    ") values (?,?,?,?,?,?,?,?,?)",
                    new Object[] {
                        calendar.getParentId(),
                        calendar.getName(),
                        calendar.getDaysPerMonth(),
                        calendar.getDaysPerWeek(),
                        util.implode("|", calendar.getDefaultAvailability()),
                        calendar.getHoursPerDay(),
                        calendar.isWeekendsAreWorkdays() ? 1 : 0,
                        calendar.getWeekendFirstDay(),
                        calendar.getWeekendSecondDay()
                    }
                );
                id = util.getLastInsertId();

                calendar.setId(id);

                // let's keep mapping from phantom to real Id
                util.getPhantomIdMap("calendars").put(calendar.getPhantomId(), id);
            } catch (Exception e) {
                throw new CrudException("Cannot create calendar.", ADD_CALENDAR);
            }
        }

        util.updateRevision();
    }

    public void removeCalendar(Calendar calendar) throws CrudException {
        removeCalendar(calendar, false);
    }

    /**
     * Removes a calendar.
     * @param calendar A calendar to remove.
     * @throws CrudException
     */
    public void removeCalendar(Calendar calendar, Boolean force) throws CrudException {
        Integer id = calendar.getId();
        if (id == null) return;

        List<Calendar> subCalendars = getSubCalendars(calendar);
        List<Resource> resources = getCalendarResources(calendar);
        List<Task> tasks = getCalendarTasks(calendar);

        if (force) {
            for (Calendar child : subCalendars) {
                child.setParentId(null);
                saveCalendar(child);

                Map<String, Object> cal = new HashMap<String, Object> ();
                cal.put("Id", child.getId());
                cal.put("parentId", null);
                util.addUpdatedRow("calendars", child.getId(), cal);
            }

            for (Resource resource : resources) {
                resource.setCalendarId(null);
                saveResource(resource);

                Map<String, Object> res = new HashMap<String, Object> ();
                res.put("Id", resource.getId());
                res.put("CalendarId", null);
                util.addUpdatedRow("resources", resource.getId(), res);
            }

            for (Task task : tasks) {
                task.setCalendarId(null);
                saveTask(task);

                Map<String, Object> tsk = new HashMap<String, Object> ();
                tsk.put("Id", task.getId());
                tsk.put("CalendarId", null);
                util.addUpdatedRow("tasks", task.getId(), tsk);
            }

        } else {

            if (subCalendars.size() > 0)
                throw new CrudException("Cannot remove calendar #" + calendar.getId() + " it has child calendars", CALENDAR_HAS_CALENDARS);

            if (resources.size() > 0)
                throw new CrudException("Cannot remove calendar #" + calendar.getId() + " it's used by a resource", CALENDAR_USED_BY_RESOURCE);

            if (tasks.size() > 0)
                throw new CrudException("Cannot remove calendar #" + calendar.getId() + " it's used by a task", CALENDAR_USED_BY_TASK);

        }

        // drop calendar days
        removeCalendarDays(id);

        try {
            tmpl.update("delete from calendars where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove calendar #" + Integer.toString(id) + ".", REMOVE_CALENDAR);
        }

        util.updateRevision();
    }

    private List<Task> getCalendarTasks(Calendar calendar) {
        return tmpl.query("select * from tasks where CalendarId = ? order by idx", new Object[] { calendar.getId() }, TASK_ROW_MAPPER);
    }

    private List<Resource> getCalendarResources(Calendar calendar) {
        return tmpl.query("select * from resources where CalendarId = ?", new Object[] { calendar.getId() }, RESOURCE_ROW_MAPPER);
    }

    private List<Calendar> getSubCalendars(Calendar calendar) {
        return tmpl.query("select * from calendars where parentId = ?", new Object[] { calendar.getId() }, CALENDAR_ROW_MAPPER);
    }

    /**
     * Gets list of calendars.
     * @param forResponse Flag saying that we collect calendars to respond them to a client.
     * In this case instead of Calendar domain instances this method will return list of LoadCalendarResponse instances.
     * @return List of calendars.
     */
    public List<Calendar> getCalendars(Boolean forResponse) {
        Map<Integer, List<Calendar>> byParent = new HashMap<Integer, List<Calendar>>();

        tmpl.query("select * from calendars", new CalendarRowCallbackHandler(byParent, this, forResponse));

        return util.buildTree(byParent, 0);
    }

    /**
     * Gets a task by its identifier.
     * @param id Task identifier.
     * @return Task.
     */
    public Task getTask(int id) {
        return tmpl.queryForObject("select * from tasks where Id = ?", new Object[] { id }, TASK_ROW_MAPPER);
    }

    /**
     * Saves a task.
     * Either creates a new record (if task identifier is null) or updates
     * existing one (if identifier is provided).
     * @param task Task to save.
     * @throws CrudException
     */
    public void saveTask(Task task) throws CrudException {
        Integer id = task.getId();

        // update existing record
        if (id != null) {
            try {
                Task t = getTask(id);
                if (t == null) throw new CrudException("Cannot find task.", UPDATE_TASK);
            } catch (Exception e) {
                throw new CrudException("Cannot find task.", UPDATE_TASK);
            }

            try {
                tmpl.update("update tasks set "+
                    "parentId = ?, "+
                    "Name = ?, "+
                    "StartDate = ?, "+
                    "EndDate = ?, "+
                    "Effort = ?, "+
                    "EffortUnit = ?, "+
                    "Duration = ?, "+
                    "DurationUnit = ?, "+
                    "PercentDone = ?, "+
                    "SchedulingMode = ?, "+
                    "BaselineStartDate = ?, "+
                    "BaselineEndDate = ?, "+
                    "BaselinePercentDone = ?, "+
                    "Note = ?, "+
                    "ConstraintType = ?, "+
                    "ConstraintDate = ?, "+
                    "ManuallyScheduled = ?, "+
                    "Draggable = ?, "+
                    "Resizable = ?, "+
                    "Rollup = ?, "+
                    "Cls = ?, "+
                    "CalendarId = ?, "+
                    "idx = ?, "+
                    "expanded = ?, "+
                    "ShowInTimeline = ?, "+
                    "Color = ? "+
                    "where Id = ?",
                    new Object[] {
                        task.getParentId(),
                        task.getName(),
                        task.getStartDate(),
                        task.getEndDate(),
                        task.getEffort(),
                        task.getEffortUnit(),
                        task.getDuration(),
                        task.getDurationUnit(),
                        task.getPercentDone(),
                        task.getSchedulingMode(),
                        task.getBaselineStartDate(),
                        task.getBaselineEndDate(),
                        task.getBaselinePercentDone(),
                        task.getNote(),
                        task.getConstraintType(),
                        task.getConstraintDate(),
                        task.getManuallyScheduled(),
                        task.getDraggable(),
                        task.getResizable(),
                        task.getRollup(),
                        task.getCls(),
                        task.getCalendarId(),
                        task.getIndex(),
                        task.getExpanded() ? 1 : 0,
                        task.getShowInTimeline(),
                        task.getColor(),
                        task.getId()
                    }
                );
            } catch (Exception e) {
                throw new CrudException("Cannot update task #" + Integer.toString(id), UPDATE_TASK);
            }

        // create new record
        } else {
            try {
                tmpl.update("insert into tasks ("+
                    "parentId, "+
                    "Name, "+
                    "StartDate, "+
                    "EndDate, "+
                    "Effort, "+
                    "EffortUnit, "+
                    "Duration, "+
                    "DurationUnit, "+
                    "PercentDone, "+
                    "SchedulingMode, "+
                    "BaselineStartDate, "+
                    "BaselineEndDate, "+
                    "BaselinePercentDone, "+
                    "Note, "+
                    "ConstraintType, "+
                    "ConstraintDate, "+
                    "ManuallyScheduled, "+
                    "Draggable, "+
                    "Resizable, "+
                    "Rollup, "+
                    "Cls, "+
                    "CalendarId, "+
                    "idx, "+
                    "expanded, "+
                    "ShowInTimeline, "+
                    "Color "+
                    ") values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    new Object[] {
                        task.getParentId(),
                        task.getName(),
                        task.getStartDate(),
                        task.getEndDate(),
                        task.getEffort(),
                        task.getEffortUnit(),
                        task.getDuration(),
                        task.getDurationUnit(),
                        task.getPercentDone(),
                        task.getSchedulingMode(),
                        task.getBaselineStartDate(),
                        task.getBaselineEndDate(),
                        task.getBaselinePercentDone(),
                        task.getNote(),
                        task.getConstraintType(),
                        task.getConstraintDate(),
                        task.getManuallyScheduled(),
                        task.getDraggable(),
                        task.getResizable(),
                        task.getRollup(),
                        task.getCls(),
                        task.getCalendarId(),
                        task.getIndex(),
                        task.getExpanded() ? 1 : 0,
                        task.getShowInTimeline(),
                        task.getColor()
                    }
                );

                id = util.getLastInsertId();

                task.setId(id);

                // let's keep mapping from phantom Id to actual Id
                util.getPhantomIdMap("tasks").put(task.getPhantomId(), id);
            } catch (Exception e) {
                throw new CrudException("Cannot create task.", ADD_TASK);
            }
        }

        this.saveTaskSegments(task, task.getSegments());

        util.updateRevision();
    }

    /**
     * Removes task.
     * @param task Task to remove.
     * @throws CrudException
     */
    public void removeTask(Task task) throws CrudException {
        Integer id = task.getId();

        List<Task> children = getSubTasks(task);

        for (Task child : children) {
            removeTask(child);

            Map<String, Object> tsk = new HashMap<String, Object>();
            tsk.put("Id", child.getId());
            util.addRemovedRow("tasks", child.getId(), tsk);
        }

        try {
            tmpl.update("delete from tasks where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove task #" + Integer.toString(id) + ".", REMOVE_TASK);
        }

        util.updateRevision();
    }

    public List<Dependency> getSuccessors(Task task) {
        return tmpl.query("select * from dependencies where FromId = ?", new Object[] { task.getId() }, DEPENDENCY_ROW_MAPPER);
    }

    public List<Dependency> getPredecessors(Task task) {
        return tmpl.query("select * from dependencies where ToId = ?", new Object[] { task.getId() }, DEPENDENCY_ROW_MAPPER);
    }

    public List<Assignment> getTaskAssignments(Task task) {
        return tmpl.query("select * from assignments where TaskId = ?", new Object[] { task.getId() }, ASSIGNMENT_ROW_MAPPER);
    }

    /**
     * Gets full list of tasks.
     * @return List of tasks.
     */
    public List<Task> getTasks() {
        Map<Integer, List<Task>> byParent = new HashMap<Integer, List<Task>>();

        tmpl.query("select * from tasks order by idx", new TaskRowCallbackHandler(byParent, this));

        return util.buildTree(byParent, 0);
    }

    public List<Task> getSubTasks(Task task) {
        return tmpl.query("select * from tasks where ParentId = ? order by idx", new Object[] { task.getId() }, TASK_ROW_MAPPER);
    }

    /**
     * Gets a task by its identifier.
     * @param id Task identifier.
     * @return Task.
     */
    public TaskSegment getTaskSegment(int id) {
        return tmpl.queryForObject("select * from task_segments where Id = ?", new Object[] { id }, TASK_SEGMENT_ROW_MAPPER);
    }

    /**
     * Get list of a task segments.
     * @param task Task segment of which to retrieve.
     * @return List of segments.
     */
    public List<TaskSegment> getTaskSegments(Task task) {
        return tmpl.query("select * from task_segments where TaskId = ? order by StartDate", new Object[] { task.getId() }, TASK_SEGMENT_ROW_MAPPER);
    }

    /**
     * Saves a task segment.
     * Either creates a new record (if segment identifier is null) or updates
     * existing one (if identifier is provided).
     * @param segment A segment to save.
     * @throws CrudException
     */
    public void saveTaskSegment(TaskSegment segment) throws CrudException {
        Integer id = segment.getId();

        // update existing record
        if (id != null) {
            try {
                TaskSegment t = getTaskSegment(id);
                if (t == null) throw new CrudException("Cannot find task segment.", UPDATE_TASK);
            } catch (Exception e) {
                throw new CrudException("Cannot find task segment.", UPDATE_TASK);
            }

            try {
                tmpl.update("update task_segments set "+
                    "TaskId = ?, "+
                    "StartDate = ?, "+
                    "EndDate = ?, "+
                    "Duration = ?, "+
                    "DurationUnit = ?, "+
                    "Cls = ? "+
                    "where Id = ?",
                    new Object[] {
                        segment.getTaskId(),
                        segment.getStartDate(),
                        segment.getEndDate(),
                        segment.getDuration(),
                        segment.getDurationUnit(),
                        segment.getCls(),
                        segment.getId()
                    }
                );
            } catch (Exception e) {
                throw new CrudException("Cannot update task segment #" + Integer.toString(id), UPDATE_TASK_SEGMENT);
            }

        // create new record
        } else {
            try {
                tmpl.update("insert into task_segments ("+
                    "TaskId, "+
                    "StartDate, "+
                    "EndDate, "+
                    "Duration, "+
                    "DurationUnit, "+
                    "Cls "+
                    ") values (?,?,?,?,?,?)",
                    new Object[] {
                        segment.getTaskId(),
                        segment.getStartDate(),
                        segment.getEndDate(),
                        segment.getDuration(),
                        segment.getDurationUnit(),
                        segment.getCls()
                    }
                );

                id = util.getLastInsertId();

                segment.setId(id);

                // let's keep mapping from phantom Id to actual Id
                util.getPhantomIdMap("task_segments").put(segment.getPhantomId(), id);
            } catch (Exception e) {
                throw new CrudException("Cannot create task segment.", ADD_TASK_SEGMENT);
            }
        }

        util.updateRevision();
    }

    public void removeTaskSegments(Task task) throws CrudException {
        Integer id = task.getId();

        try {
            tmpl.update("delete from task_segments where TaskId = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove task segments #" + Integer.toString(id) + ".", REMOVE_TASK_SEGMENTS);
        }

        util.updateRevision();
    }

    public void removeTaskSegment(TaskSegment segment) throws CrudException {
        Integer id = segment.getId();

        try {
            tmpl.update("delete from task_segments where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove task segment #" + Integer.toString(id) + ".", REMOVE_TASK_SEGMENT);
        }

        util.updateRevision();
    }

    private void saveTaskSegments(Task task, List<TaskSegment> segments) throws CrudException {
        // if list of segments is not empty
        if (segments != null && segments.size() > 0) {
            List<Integer> ids = new ArrayList<Integer>();

            // persist each segment
            for (TaskSegment segment : segments) {
                segment.setTaskId(task.getId());
                saveTaskSegment(segment);
                // remember id of persisted segment
                ids.add(segment.getId());
            }

            // and finally cleanup all segments except passed ones
            try {
                MapSqlParameterSource parameters = new MapSqlParameterSource();
                parameters.addValue("id", task.getId());
                parameters.addValue("ids", ids);
                namedTmpl.update("delete from task_segments where TaskId = :id and Id not in (:ids)", parameters);
            } catch (Exception e) {
                throw new CrudException("Cannot remove task segments #" + Integer.toString(task.getId()) + ".", REMOVE_TASK_SEGMENTS);
            }

        // if passed list is empty we remove existing records
        } else {
            removeTaskSegments(task);
        }

        util.updateRevision();
    }

    /**
     * Gets resource by its identifier.
     * @param id Resource identifier.
     * @return Resource.
     */
    public Resource getResource(int id) {
        return tmpl.queryForObject("select * from resources where Id = ?", new Object[] { id }, RESOURCE_ROW_MAPPER);
    }

    /**
     * Saves a resource.
     * Either creates a new record (if resource identifier is null) or updates
     * existing one (if identifier is provided).
     * @param resource Resource to save.
     * @throws CrudException
     */
    public void saveResource(Resource resource) throws CrudException {
        Integer id = resource.getId();

        // update existing record
        if (id != null) {
            try {
                tmpl.update("update resources set Name = ?, CalendarId = ? where Id = ?", new Object[] {
                    resource.getName(), resource.getCalendarId(), id
                });
            } catch (Exception e) {
                throw new CrudException("Cannot update resource #" + Integer.toString(id), UPDATE_RESOURCE);
            }

        } else {
            try {
                tmpl.update("insert into resources (Name, CalendarId) values (?, ?)", new Object[] {
                    resource.getName(), resource.getCalendarId()
                });
                id = util.getLastInsertId();

                resource.setId(id);

                // let's keep mapping from phantom Id to actual Id
                util.getPhantomIdMap("resources").put(resource.getPhantomId(), id);
            } catch (Exception e) {
                throw new CrudException("Cannot create resource.", ADD_RESOURCE);
            }
        }

        util.updateRevision();
    }

    public void removeResource(Resource resource) throws CrudException {
        removeResource(resource, false);
    }
    /**
     * Removes resource.
     * @param resource Resource to remove.
     * @throws CrudException
     */
    public void removeResource(Resource resource, Boolean force) throws CrudException {
        Integer id = resource.getId();

        List<Assignment> assignments = getResourceAssignments(resource);

        if (assignments.size() > 0 && !force)
            throw new CrudException("Cannot remove resource being used #" + resource.getId(), REMOVE_USED_RESOURCE);

        for (Assignment assignment : assignments) removeAssignment(assignment);

        try {
            tmpl.update("delete from resources where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove resource #" + Integer.toString(id) + ".", REMOVE_RESOURCE);
        }

        util.updateRevision();
    }

    private List<Assignment> getResourceAssignments(Resource resource) {
        return tmpl.query("select * from assignments where ResourceId = ?", new Object[] { resource.getId() }, ASSIGNMENT_ROW_MAPPER);
    }

    /**
     * Gets list of resources.
     * @return List of resources.
     */
    public List<Resource> getResources() {
        return tmpl.query("select * from resources", RESOURCE_ROW_MAPPER);
    }

    /**
     * Gets assignment by its identifier.
     * @param id Assignment identifier.
     * @return Assignment.
     */
    public Assignment getAssignment(int id) {
        return tmpl.queryForObject("select * from assignments where Id = ?", new Object[] { id }, ASSIGNMENT_ROW_MAPPER);
    }

    /**
     * Saves an assignment.
     * Either creates a new record (if assignment identifier is null) or updates
     * existing one (if identifier is provided).
     * @param assignment Assignment to save.
     * @throws CrudException
     */
    public void saveAssignment(Assignment assignment) throws CrudException {
        Integer id = assignment.getId();

        // update existing record
        if (id != null) {
            try {
                tmpl.update("update assignments set ResourceId = ?, TaskId = ?, Units = ? where Id = ?", new Object[] {
                    assignment.getResourceId(), assignment.getTaskId(), assignment.getUnits(), id
                });
            } catch (Exception e) {
                throw new CrudException("Cannot update assignment #" + Integer.toString(id), UPDATE_ASSIGNMENT);
            }

        } else {
            try {
                tmpl.update("insert into assignments (ResourceId, TaskId, Units) values (?, ?, ?)", new Object[] {
                    assignment.getResourceId(), assignment.getTaskId(), assignment.getUnits()
                });
                assignment.setId(util.getLastInsertId());
            } catch (Exception e) {
                throw new CrudException("Cannot create assignment.", ADD_ASSIGNMENT);
            }
        }

        util.updateRevision();
    }

    /**
     * Removes assignment.
     * @param assignment Assignment to remove.
     * @throws CrudException
     */
    public void removeAssignment(Assignment assignment) throws CrudException {
        int id = assignment.getId();

        try {
            tmpl.update("delete from assignments where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove assignment #" + Integer.toString(id) + ".", REMOVE_ASSIGNMENT);
        }

        util.updateRevision();
    }

    /**
     * Gets full list of assignments.
     * @return List of assignment.
     */
    public List<Assignment> getAssignments() {
        return tmpl.query("select * from assignments", ASSIGNMENT_ROW_MAPPER);
    }

    /**
     * Gets a dependency by its identifier.
     * @param id Dependency identifier.
     * @return Dependency.
     */
    public Dependency getDependency(int id) {
        return tmpl.queryForObject("select * from dependencies where Id = ?", new Object[] { id }, DEPENDENCY_ROW_MAPPER);
    }

    /**
     * Gets list of dependencies.
     * @return List of dependencies.
     */
    public List<Dependency> getDependencies() {
        return tmpl.query("select * from dependencies", DEPENDENCY_ROW_MAPPER);
    }

    /**
     * Saves a dependency.
     * Either creates a new record (if dependency identifier is null) or updates
     * existing one (if identifier is provided).
     * @param dependency Dependency to save.
     * @throws CrudException
     */
    public void saveDependency(Dependency dependency) throws CrudException {

        Integer id = dependency.getId();

        // update existing record
        if (id != null) {

            try {
                tmpl.update("update dependencies set FromId = ?, ToId = ?, Typ = ?, Lag = ?, LagUnit = ? where Id = ?", new Object[] {
                    dependency.getFrom(), dependency.getTo(), dependency.getType(), dependency.getLag(), dependency.getLagUnit(), id
                });
            } catch (Exception e) {
                throw new CrudException("Cannot update dependency #" + Integer.toString(id), UPDATE_DEPENDENCY);
            }

        } else {
            try {
                tmpl.update("insert into dependencies (FromId, ToId, Typ, Lag, LagUnit) values (?, ?, ?, ?, ?)", new Object[] {
                    dependency.getFrom(), dependency.getTo(), dependency.getType(), dependency.getLag(), dependency.getLagUnit()
                });

                dependency.setId(util.getLastInsertId());
            } catch (Exception e) {
                throw new CrudException("Cannot create dependency.", ADD_DEPENDENCY);
            }
        }

        util.updateRevision();
    }

    /**
     * Removes a dependency.
     * @param dependency A dependency to remove.
     * @throws CrudException
     */
    public void removeDependency(Dependency dependency) throws CrudException {
        int id = dependency.getId();

        try {
            tmpl.update("delete from dependencies where Id = ?", new Object[] { id });
        } catch (Exception e) {
            throw new CrudException("Cannot remove dependency #" + Integer.toString(id) + ".", REMOVE_DEPENDENCY);
        }

        util.updateRevision();
    }

    /**
     * Clears the database.
     * TODO: this method is used for testing purposes only. Please remove it before deploy to production version.
     * @throws CrudException
     */
    public void reset() throws CrudException {
        tmpl.update("alter table assignments drop foreign key fk_assignments_resources");
        tmpl.update("alter table assignments drop foreign key fk_assignments_tasks");
        tmpl.update("alter table calendar_days drop foreign key fk_calendardays_calendars");
        tmpl.update("alter table calendars drop foreign key fk_calendars_calendars");
        tmpl.update("alter table dependencies drop foreign key fk_dependencies_tasks");
        tmpl.update("alter table dependencies drop foreign key fk_dependencies_tasks1");
        tmpl.update("alter table resources drop foreign key fk_resources_calendars");
        tmpl.update("alter table task_segments drop foreign key fk_task_segments_tasks");
        tmpl.update("alter table tasks drop foreign key fk_tasks_calendars");
        tmpl.update("alter table tasks drop foreign key fk_tasks_tasks");

        tmpl.update("truncate table dependencies");
        tmpl.update("truncate table calendar_days");
        tmpl.update("truncate table assignments");
        tmpl.update("truncate table resources");
        tmpl.update("truncate table calendars");
        tmpl.update("truncate table task_segments");
        tmpl.update("truncate table tasks");
        tmpl.update("truncate table options");

        tmpl.update("alter table assignments add constraint fk_assignments_resources foreign key(ResourceId) references resources (Id)");
        tmpl.update("alter table assignments add constraint fk_assignments_tasks foreign key(TaskId) references tasks (Id)");
        tmpl.update("alter table calendar_days add constraint fk_calendardays_calendars foreign key(CalendarId) references calendars (Id)");
        tmpl.update("alter table calendars add constraint fk_calendars_calendars foreign key(parentId) references calendars (Id)");
        tmpl.update("alter table dependencies add constraint fk_dependencies_tasks foreign key(FromId) references tasks (Id)");
        tmpl.update("alter table dependencies add constraint fk_dependencies_tasks1 foreign key(ToId) references tasks (Id)");
        tmpl.update("alter table resources add constraint fk_resources_calendars foreign key(CalendarId) references calendars (Id)");
        tmpl.update("alter table task_segments add constraint fk_task_segments_tasks foreign key(TaskId) references tasks (Id)");
        tmpl.update("alter table tasks add constraint fk_tasks_calendars foreign key(CalendarId) references calendars (Id)");
        tmpl.update("alter table tasks add constraint fk_tasks_tasks foreign key(parentId) references tasks (Id)");

        // initialize server revision stamp
        util.setOption("revision", "1");
        util.setOption("projectCalendar", "1");
    }

}
