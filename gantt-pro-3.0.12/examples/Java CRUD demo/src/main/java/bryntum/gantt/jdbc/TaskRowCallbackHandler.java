package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.RowCallbackHandler;

import bryntum.gantt.dao.Gantt;
import bryntum.gantt.domain.Task;

public class TaskRowCallbackHandler implements RowCallbackHandler {

    public Map<Integer, List<Task>> byParent;
    public Gantt gantt;

    public TaskRowCallbackHandler(Map<Integer, List<Task>> byParent, Gantt gantt) {
        super();
        this.byParent = byParent;
        this.gantt = gantt;
    }

    @Override
    public void processRow(ResultSet rs) throws SQLException {
        Task result = new Task();

        result.setId(rs.getInt("Id"));
        result.setName(rs.getString("Name"));
        int parentId = rs.getInt("parentId");
        result.setParentId(rs.wasNull() ? null : parentId);
        result.setStartDate(rs.getTimestamp("StartDate"));
        result.setEndDate(rs.getTimestamp("EndDate"));
        Number effort = rs.getDouble("Effort");
        result.setEffort(rs.wasNull() ? null : effort);
        result.setEffortUnit(rs.getString("EffortUnit"));
        Number duration = rs.getDouble("Duration");
        result.setDuration(rs.wasNull() ? null : duration);
        result.setDurationUnit(rs.getString("DurationUnit"));
        result.setPercentDone(rs.getInt("PercentDone"));
        result.setCls(rs.getString("Cls"));
        Integer calendarId = rs.getInt("CalendarId");
        result.setCalendarId(rs.wasNull() ? null : calendarId);
        result.setBaselineStartDate(rs.getTimestamp("BaselineStartDate"));
        result.setBaselineEndDate(rs.getTimestamp("BaselineEndDate"));
        result.setBaselinePercentDone(rs.getInt("BaselinePercentDone"));
        result.setNote(rs.getString("Note"));
        result.setConstraintType(rs.getString("ConstraintType"));
        result.setConstraintDate(rs.getTimestamp("ConstraintDate"));
        result.setManuallyScheduled(rs.getInt("ManuallyScheduled") == 1);
        result.setDraggable(rs.getInt("Draggable") == 1);
        result.setResizable(rs.getInt("Resizable") == 1);
        result.setRollup(rs.getInt("Rollup") == 1);
        result.setSegments(gantt.getTaskSegments(result));
        result.setIndex(rs.getInt("idx"));
        result.setExpanded(rs.getInt("expanded") == 1);
        result.setShowInTimeline(rs.getInt("ShowInTimeline") == 1);
        result.setColor(rs.getString("Color"));
        result.setSchedulingMode(rs.getString("SchedulingMode"));

        if (!byParent.containsKey(parentId)) {
            byParent.put(parentId, new ArrayList<Task>());
        }

        byParent.get(parentId).add(result);
    }
}
