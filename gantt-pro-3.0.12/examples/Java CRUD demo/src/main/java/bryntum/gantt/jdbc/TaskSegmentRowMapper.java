package bryntum.gantt.jdbc;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;
import bryntum.gantt.domain.TaskSegment;

public class TaskSegmentRowMapper implements RowMapper<TaskSegment> {

    @Override
    public TaskSegment mapRow(ResultSet rs, int n) throws SQLException {
        TaskSegment result = new TaskSegment();

        result.setId(rs.getInt("Id"));
        result.setStartDate(rs.getTimestamp("StartDate"));
        result.setEndDate(rs.getTimestamp("EndDate"));
        result.setDuration(rs.getDouble("Duration"));
        result.setDurationUnit(rs.getString("DurationUnit"));
        result.setCls(rs.getString("Cls"));

        return result;
    }

}
