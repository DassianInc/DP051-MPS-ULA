package bryntum.gantt.jdbc;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import bryntum.gantt.domain.Assignment;

public class AssignmentRowMapper implements RowMapper<Assignment> {
    @Override
    public Assignment mapRow(ResultSet rs, int n) throws SQLException {
        Assignment result = new Assignment();

        result.setId(rs.getInt("Id"));
        result.setTaskId(rs.getInt("TaskId"));
        result.setResourceId(rs.getInt("ResourceId"));
        result.setUnits(rs.getInt("Units"));

        return result;
    }
}
