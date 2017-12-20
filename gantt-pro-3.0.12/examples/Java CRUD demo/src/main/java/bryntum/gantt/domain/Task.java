package bryntum.gantt.domain;

import java.util.Date;
import java.util.List;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.Node;

@JsonIgnoreProperties(ignoreUnknown=true)
public class Task extends Node {
    protected String name;
    protected Date startDate;
    protected Date endDate;
    protected Number duration;
    protected String durationUnit;
    protected Number effort;
    protected String effortUnit;
    protected Integer percentDone;
    protected String cls;
    protected Integer calendarId;
    protected String phantomCalendarId;
    protected String schedulingMode;
    protected Date baselineStartDate;
    protected Date baselineEndDate;
    protected Integer baselinePercentDone;
    protected String note;
    protected String constraintType;
    protected Date constraintDate;
    protected Boolean manuallyScheduled;
    protected Boolean draggable = true;
    // In this demo we restrict `Resizable` attribute values to `true`/`false`
    // yet Ext Gantt itself supports wider set of values: "start", "end", `false`, `true` and "" (synonym for `true`)
    protected Boolean resizable = true;
    protected Boolean rollup;
    protected Boolean showInTimeline;
    protected String color;
    protected List<TaskSegment> segments;

    @JsonProperty("Color")
    public String getColor() {
        return color;
    }

    @JsonProperty("Color")
    public void setColor(String color) {
        this.color = color;
    }

    @JsonProperty("ShowInTimeline")
    public Boolean getShowInTimeline() {
        return showInTimeline;
    }

    @JsonProperty("ShowInTimeline")
    public void setShowInTimeline(Boolean showInTimeline) {
        this.showInTimeline = showInTimeline;
    }

    @JsonProperty("Effort")
    public Number getEffort() {
        return effort;
    }
    @JsonProperty("Effort")
    public void setEffort(Number number) {
        this.effort = number;
    }

    @JsonProperty("EffortUnit")
    public String getEffortUnit() {
        return effortUnit;
    }
    @JsonProperty("EffortUnit")
    public void setEffortUnit(String effortUnit) {
        this.effortUnit = effortUnit;
    }

    @JsonProperty("Note")
    public String getNote() {
        return note;
    }
    @JsonProperty("Note")
    public void setNote(String note) {
        this.note = note;
    }

    @JsonProperty("ConstraintType")
    public String getConstraintType() {
        return constraintType;
    }
    @JsonProperty("ConstraintType")
    public void setConstraintType(String constraintType) {
        this.constraintType = constraintType;
    }

    @JsonProperty("ConstraintDate")
    public Date getConstraintDate() {
        return constraintDate;
    }
    @JsonProperty("ConstraintDate")
    public void setConstraintDate(Date constraintDate) {
        this.constraintDate = constraintDate;
    }

    @JsonProperty("ManuallyScheduled")
    public Boolean getManuallyScheduled() {
        return manuallyScheduled;
    }
    @JsonProperty("ManuallyScheduled")
    public void setManuallyScheduled(Boolean manuallyScheduled) {
        this.manuallyScheduled = manuallyScheduled;
    }

    @JsonProperty("Draggable")
    public Boolean getDraggable() {
        return draggable;
    }
    @JsonProperty("Draggable")
    public void setDraggable(Boolean draggable) {
        this.draggable = draggable;
    }

    @JsonProperty("Resizable")
    public Boolean getResizable() {
        return resizable;
    }
    @JsonProperty("Resizable")
    public void setResizable(Boolean resizable) {
        this.resizable = resizable;
    }

    @JsonProperty("Rollup")
    public Boolean getRollup() {
        return rollup;
    }
    @JsonProperty("Rollup")
    public void setRollup(Boolean rollup) {
        this.rollup = rollup;
    }

    @JsonProperty("Segments")
    public List<TaskSegment> getSegments() {
        return segments;
    }
    @JsonProperty("Segments")
    public void setSegments(List<TaskSegment> segments) {
        this.segments = segments;
    }
    @JsonProperty("SchedulingMode")
    public String getSchedulingMode() {
        return schedulingMode;
    }
    @JsonProperty("SchedulingMode")
    public void setSchedulingMode(String schedulingMode) {
        this.schedulingMode = schedulingMode;
    }

    @JsonProperty("BaselineStartDate")
    public Date getBaselineStartDate() {
        return baselineStartDate;
    }
    @JsonProperty("BaselineStartDate")
    public void setBaselineStartDate(Date baselineStartDate) {
        this.baselineStartDate = baselineStartDate;
    }

    @JsonProperty("BaselineEndDate")
    public Date getBaselineEndDate() {
        return baselineEndDate;
    }
    @JsonProperty("BaselineEndDate")
    public void setBaselineEndDate(Date baselineEndDate) {
        this.baselineEndDate = baselineEndDate;
    }

    @JsonProperty("BaselinePercentDone")
    public Integer getBaselinePercentDone() {
        return baselinePercentDone;
    }
    @JsonProperty("BaselinePercentDone")
    public void setBaselinePercentDone(Integer baselinePercentDone) {
        this.baselinePercentDone = baselinePercentDone;
    }

    @JsonProperty("Name")
    public String getName() {
        return name;
    }
    @JsonProperty("Name")
    public void setName(String name) {
        this.name = name;
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

    @JsonProperty("PercentDone")
    public Integer getPercentDone() {
        return percentDone;
    }
    @JsonProperty("PercentDone")
    public void setPercentDone(Object percentDone) {
        if (percentDone instanceof Double) {
            Double perc = (Double) percentDone;
            this.percentDone = perc.intValue();
        } else if (percentDone instanceof Integer) {
            this.percentDone = (Integer) percentDone;
        }
    }

    @JsonProperty("Cls")
    public String getCls() {
        return cls;
    }
    @JsonProperty("Cls")
    public void setCls(String cls) {
        this.cls = cls;
    }

    @JsonProperty("CalendarId")
    public Integer getCalendarId() {
        return calendarId;
    }
    @JsonProperty("CalendarId")
    public void setCalendarId(Object calendarId) {
        if (calendarId instanceof Integer) {
            this.calendarId = (Integer) calendarId;
        } else if (calendarId instanceof String) {
            try {
                this.calendarId = Integer.valueOf((String) calendarId);
            } catch (NumberFormatException e) {
                this.calendarId = null;
            }
            phantomCalendarId = (String) calendarId;
        }
    }

    @JsonIgnore
    public String getPhantomCalendarId() {
        return phantomCalendarId;
    }

    @Override
    public String toString() {
        return "Task { id: "+id+", parentId: "+parentId+", phantomParentId: "+phantomParentId+
            ", name: "+name+", startDate: "+startDate+", endDate: "+endDate+", duration: "+duration+
            ", durationUnit: "+durationUnit+", percentDone: "+percentDone+", cls: "+cls+
            ", calendarId: "+calendarId+", phantomCalendarId: "+phantomCalendarId+
            ", schedulingMode: "+schedulingMode+", baselineStartDate: "+baselineStartDate+
            ", baselineEndDate: "+baselineEndDate+", baselinePercentDone: "+baselinePercentDone+
            ", Segments: "+segments+", children: "+children+", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
