package bryntum.crud.response;

import org.codehaus.jackson.annotate.JsonProperty;

/**
 * This abstract class implements common response structure.
 */
public abstract class GeneralResponse {

    /**
     * Identifier of request as reaction on which this respond is sent.
     */
    protected Long requestId;

    public GeneralResponse() {
        this(null);
    }

    public GeneralResponse(Long requestId) {
        super();
        this.requestId = requestId;
    }

    /**
     * Gets status of request processing.
     * @return True if request was processed successfully and False otherwise.
     */
    @JsonProperty("success")
    public abstract Boolean getSuccess();

    /**
     * Gets identifier of request as reaction to which this respond is created.
     * @return Request identifier.
     */
    @JsonProperty("requestId")
    public Long getRequestId() {
        return requestId;
    }

    /**
     * Sets identifier of request as reaction to which this respond is created.
     * @param requestId Request identifier.
     */
    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

}
