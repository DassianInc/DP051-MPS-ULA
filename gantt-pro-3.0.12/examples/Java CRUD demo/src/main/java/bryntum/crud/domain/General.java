package bryntum.crud.domain;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;

public abstract class General {
    protected Integer id;
    protected String phantomId;

    @JsonIgnore
    public String getPhantomIdField() {
        return "$PhantomId";
    }

    @JsonProperty("Id")
    public Integer getId() {
        return id;
    }
    @JsonProperty("Id")
    public void setId(Integer id) {
        this.id = id;
    }

    @JsonIgnore
    public String getPhantomId() {
        return phantomId;
    }
    @JsonProperty("$PhantomId")
    public void setPhantomId(String phantomId) {
        this.phantomId = phantomId;
    }
}
