package bryntum.crud.request;

import org.codehaus.jackson.annotate.JsonProperty;

public class GeneralRequest {

    @JsonProperty("type")
    public String typ;

    public Long requestId;

}
