package bryntum.gantt.domain;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;

import bryntum.crud.domain.General;

public class Dependency extends General {
    protected Integer fromId;
    protected Integer toId;
    protected Integer type;
    protected String cls;
    protected Integer lag;
    protected String lagUnit;
    protected String phantomFrom;
    protected String phantomTo;

    @JsonIgnore
    public String getPhantomFrom() {
        return phantomFrom;
    }

    @JsonIgnore
    public String getPhantomTo() {
        return phantomTo;
    }

    @JsonProperty("From")
    public Integer getFrom() {
        return fromId;
    }
    @JsonProperty("From")
    public void setFrom(Object from) {
        if (from instanceof Integer) {
            this.fromId = (Integer) from;
        } else if (from instanceof String) {
            try {
                this.fromId = Integer.valueOf((String)from);
            } catch (NumberFormatException e) {
                this.fromId = null;
            }
            phantomFrom = (String)from;
        }
    }

    @JsonProperty("To")
    public Integer getTo() {
        return toId;
    }
    @JsonProperty("To")
    public void setTo(Object to) {
        if (to instanceof Integer) {
            this.toId = (Integer) to;
        } else if (to instanceof String) {
            try {
                this.toId = Integer.valueOf((String)to);
            } catch (NumberFormatException e) {
                this.toId = null;
            }
            phantomTo = (String)to;
        }
    }

    @JsonProperty("Type")
    public Integer getType() {
        return type;
    }
    @JsonProperty("Type")
    public void setType(Integer type) {
        this.type = type;
    }

    @JsonProperty("Cls")
    public String getCls() {
        return cls;
    }
    @JsonProperty("Cls")
    public void setCls(String cls) {
        this.cls = cls;
    }

    @JsonProperty("Lag")
    public Integer getLag() {
        return lag;
    }
    @JsonProperty("Lag")
    public void setLag(Integer lag) {
        this.lag = lag;
    }

    @JsonProperty("LagUnit")
    public String getLagUnit() {
        return lagUnit;
    }
    @JsonProperty("LagUnit")
    public void setLagUnit(String lagUnit) {
        this.lagUnit = lagUnit;
    }

    @Override
    public String toString() {
        return "Dependency { id: "+id+", fromId: "+fromId+", toId: "+toId+", type: "+type+
            ", cls: "+cls+", lag: "+lag+", lagUnit: "+lagUnit+", phantomFrom: "+phantomFrom+
            ", phantomTo: "+phantomTo+", "+getPhantomIdField()+": "+phantomId+" }";
    }
}
