package bryntum.gantt.domain;

import java.util.Date;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.General;

@JsonIgnoreProperties(ignoreUnknown=true)
public class TaskSegment extends General {
    protected Integer taskId;
    protected Date startDate;
    protected Date endDate;
    protected Number duration;
    protected String durationUnit;
    protected String cls;

    @Override
    @JsonIgnore
    public String getPhantomIdField() {
        return "PhantomId";
    }

    @Override
    @JsonProperty("PhantomId")
    public void setPhantomId(String phantomId) {
        super.setPhantomId(phantomId);
    }

    @JsonIgnore
    public Integer getTaskId() {
        return taskId;
    }
    public void setTaskId(Integer taskId) {
        this.taskId = taskId;
    }
    @JsonProperty("StartDate")
    public Date getStartDate() {
        return startDate;
    }
    @JsonProperty("StartDate")
    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }
    @JsonProperty("EndDate")
    public Date getEndDate() {
        return endDate;
    }
    @JsonProperty("EndDate")
    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
    @JsonProperty("Duration")
    public Number getDuration() {
        return duration;
    }
    @JsonProperty("Duration")
    public void setDuration(Number number) {
        this.duration = number;
    }
    @JsonProperty("DurationUnit")
    public String getDurationUnit() {
        return durationUnit;
    }
    @JsonProperty("DurationUnit")
    public void setDurationUnit(String durationUnit) {
        this.durationUnit = durationUnit;
    }
    @JsonProperty("Cls")
    public String getCls() {
        return cls;
    }
    @JsonProperty("Cls")
    public void setCls(String cls) {
        this.cls = cls;
    }

    @Override
    public String toString() {
        return "TaskSegment { id: "+id+", startDate: "+startDate+", endDate: "+endDate+", duration: "+duration+
            ", durationUnit: "+durationUnit+", cls: "+cls+", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
