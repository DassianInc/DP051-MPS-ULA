package bryntum.gantt.domain;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.General;

public class Assignment extends General {
    protected String phantomTaskId;
    protected String phantomResourceId;
    protected Integer taskId;
    protected Integer resourceId;
    protected Integer units;

    @JsonProperty("ResourceId")
    public Integer getResourceId() {
        return resourceId;
    }

    @JsonProperty("ResourceId")
    public void setResourceId(Object resourceId) {
        if (resourceId instanceof Integer) {
            this.resourceId = (Integer)resourceId;
        } else if (resourceId instanceof String) {
            try {
                this.resourceId = Integer.valueOf((String)resourceId);
            } catch (NumberFormatException e) {
                this.resourceId = null;
            }
            phantomResourceId = (String)resourceId;
        }
    }

    @JsonIgnore
    public String getPhantomResourceId() {
        return phantomResourceId;
    }

    @JsonProperty("TaskId")
    public Integer getTaskId() {
        return taskId;
    }

    @JsonProperty("TaskId")
    public void setTaskId(Object taskId) {
        if (taskId instanceof Integer) {
            this.taskId = (Integer) taskId;
        } else if (taskId instanceof String) {
            try {
                this.taskId = Integer.valueOf((String)taskId);
            } catch (NumberFormatException e) {
                this.taskId = null;
            }
            phantomTaskId = (String) taskId;
        }
    }

    @JsonIgnore
    public String getPhantomTaskId() {
        return phantomTaskId;
    }

    @JsonProperty("Units")
    public Integer getUnits() {
        return units;
    }

    @JsonProperty("Units")
    public void setUnits(Integer units) {
        this.units = units;
    }

    @Override
    public String toString() {
        return "Assignment { id: "+id+", taskId: "+taskId+", resourceId: "+resourceId+", units: "+units+
            ", phantomTaskId: "+phantomTaskId+", phantomResourceId: "+phantomResourceId+
            ", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
