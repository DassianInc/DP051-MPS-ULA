package bryntum.gantt.request.handler;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import bryntum.crud.exception.CrudException;
import bryntum.crud.request.SyncStoreRequestHandler;
import bryntum.gantt.domain.Task;
import bryntum.gantt.domain.TaskSegment;
import bryntum.gantt.dao.Gantt;

public class TaskSyncHandler extends SyncStoreRequestHandler<Task> {

    private final Gantt app;
    /**
     * Flag saying that segments changes are provided to the task being updated
     */
    private boolean isSegmentsProvided = false;

    public TaskSyncHandler(Gantt app, DateFormat dateFormat) {
        super(dateFormat);
        this.app = app;
    }

    protected TaskSegment getTaskSegment(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");

        TaskSegment record;

        if (id != null) {
            record = app.getTaskSegment(id);
            if (record == null) return null;
        } else {
            record = new TaskSegment();
        }

        if (changes.containsKey("Cls")) {
            record.setCls((String) changes.get("Cls"));
        }
        if (changes.containsKey("Duration")) {
            record.setDuration((Number) changes.get("Duration"));
        }
        if (changes.containsKey("DurationUnit")) {
            record.setDurationUnit((String) changes.get("DurationUnit"));
        }
        if (changes.containsKey("StartDate")) {
            try {
                record.setStartDate(strToDate((String) changes.get("StartDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("EndDate")) {
            try {
                record.setEndDate(strToDate((String) changes.get("EndDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }

        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }
        return record;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Task getRecord(Map<String, Object> changes) {
        Integer id = (Integer) changes.get("Id");
        if (id == null) return null;

        Task record = app.getTask(id);
        if (record == null) return null;

        if (changes.containsKey("Color")) {
            record.setColor((String)changes.get("Color"));
        }
        if (changes.containsKey("ShowInTimeline")) {
            record.setShowInTimeline((Boolean)changes.get("ShowInTimeline"));
        }
        if (changes.containsKey("index")) {
            record.setIndex((Integer)changes.get("index"));
        }
        if (changes.containsKey("expanded")) {
            record.setExpanded((Boolean)changes.get("expanded"));
        }
        if (changes.containsKey("CalendarId")) {
            record.setCalendarId(changes.get("CalendarId"));
        }
        if (changes.containsKey("Cls")) {
            record.setCls((String) changes.get("Cls"));
        }
        if (changes.containsKey("Duration")) {
            record.setDuration((Number) changes.get("Duration"));
        }
        if (changes.containsKey("DurationUnit")) {
            record.setDurationUnit((String) changes.get("DurationUnit"));
        }
        if (changes.containsKey("StartDate")) {
            try {
                record.setStartDate(strToDate((String) changes.get("StartDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("EndDate")) {
            try {
                record.setEndDate(strToDate((String) changes.get("EndDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }

        if (changes.containsKey("Effort")) {
            record.setEffort((Number) changes.get("Effort"));
        }

        if (changes.containsKey("EffortUnit")) {
        	record.setEffortUnit((String) changes.get("EffortUnit"));
        }

        if (changes.containsKey("Note")) {
        	record.setNote((String) changes.get("Note"));
        }

        if (changes.containsKey("ConstraintType")) {
        	record.setConstraintType((String) changes.get("ConstraintType"));
        }

        if (changes.containsKey("ConstraintDate")) {
        	try {
				record.setConstraintDate(strToDate((String) changes.get("ConstraintDate")));
			} catch (Exception e) {
				// TODO Auto-generated catch block
				log.error(e);
			}
        }

        if (changes.containsKey("Draggable")) {
        	record.setDraggable((Boolean) changes.get("Draggable"));
        }

        if (changes.containsKey("Resizable")) {
        	record.setResizable((Boolean) changes.get("Resizable"));
        }

        if (changes.containsKey("Rollup")) {
        	record.setRollup((Boolean) changes.get("Rollup"));
        }

        if (changes.containsKey("ManuallyScheduled")) {
        	record.setManuallyScheduled((Boolean) changes.get("ManuallyScheduled"));
        }

        if (changes.containsKey("Name")) {
            record.setName((String) changes.get("Name"));
        }
        if (changes.containsKey("parentId")) {
            record.setParentId(changes.get("parentId"));
        }
        if (changes.containsKey("PercentDone")) {
            record.setPercentDone(changes.get("PercentDone"));
        }
        if (changes.containsKey("PhantomParentId")) {
            record.setPhantomParentId((String) changes.get("PhantomParentId"));
        }
        if (changes.containsKey("SchedulingMode")) {
            record.setSchedulingMode((String) changes.get("SchedulingMode"));
        }
        if (changes.containsKey("BaselinePercentDone")) {
            record.setBaselinePercentDone((Integer) changes.get("BaselinePercentDone"));
        }
        if (changes.containsKey("BaselineStartDate")) {
            try {
                record.setBaselineStartDate(strToDate((String) changes.get("BaselineStartDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("BaselineEndDate")) {
            try {
                record.setBaselineEndDate(strToDate((String) changes.get("BaselineEndDate")));
            } catch (Exception e) {
                log.error(e);
            }
        }
        if (changes.containsKey("Segments")) {
            isSegmentsProvided = true;

            List<Map<String, Object>> segmentsChanges = (List<Map<String, Object>>) changes.get("Segments");
            List<TaskSegment> segments = new ArrayList<TaskSegment>();

            for (Map<String, Object> segmentChanges : segmentsChanges) {
                segments.add(getTaskSegment(segmentChanges));
            }

            record.setSegments(segments);
        } else {
            isSegmentsProvided = false;
        }

        if (changes.containsKey(record.getPhantomIdField())) {
            record.setPhantomId((String) changes.get(record.getPhantomIdField()));
        }

        return record;
    }

    protected Map<String, Object> prepareData(Task task) {
        // initialize returning hash
        Map<String, Object> result = new HashMap<String, Object>();

        String phantomTaskId = task.getPhantomParentId();
        if (task.getParentId() == null && phantomTaskId != null && !phantomTaskId.equalsIgnoreCase("root") && !phantomTaskId.equals("")) {
            Integer taskId = app.getTaskIdByPhantom(phantomTaskId);
            task.setParentId(taskId);
            result.put("parentId", taskId);
        }

        String phantomCalendarId = task.getPhantomCalendarId();
        if (task.getCalendarId() == null && phantomCalendarId != null && !phantomCalendarId.equals("")) {
            Integer calendarId = app.getCalendarIdByPhantom(phantomCalendarId);
            task.setCalendarId(calendarId);
            result.put("CalendarId", calendarId);
        }

        return result;
    }

    /**
     * Fills response with segments data.
     * Used to return identifiers of newly created segments.
     * @param response Whole task related response.
     * @param segments List of segments to return.
     */
    protected void addSegmentsResponse(Map<String, Object> response, List<TaskSegment> segments) {
        List<Map<String, Object>> segmentsResponse = new ArrayList<Map<String, Object>>();

        if (segments != null) {
            Map<String, Object> segmentResponse;

            for (TaskSegment segment : segments) {
                segmentResponse = new HashMap<String, Object>();
                segmentResponse.put("Id", segment.getId());
                segmentResponse.put(segment.getPhantomIdField(), segment.getPhantomId());
                segmentsResponse.add(segmentResponse);
            }

            response.put("Segments", segmentsResponse);
        } else {
            response.put("Segments", null);
        }
    }

    @Override
    public Map<String, Object> add(Task task) throws CrudException {
        Map<String, Object> result = prepareData(task);

        app.saveTask(task);

        // for a new task we always return segments response
        addSegmentsResponse(result, task.getSegments());

        return result;
    }

    @Override
    public Map<String, Object> update(Task task, Map<String, Object> changes) throws CrudException {
        Map<String, Object> result = prepareData(task);

        app.saveTask(task);

        // if segments changes were provided for the task being updated
        if (isSegmentsProvided) {
            addSegmentsResponse(result, task.getSegments());
        }

        return result;
    }

    @Override
    public Map<String, Object> remove(Task task) throws CrudException {
        Map<String, Object> result = new HashMap<String, Object>();
        app.removeTask(task);
        return result;
    }
}
