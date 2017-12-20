package bryntum.crud.response;

import bryntum.crud.exception.CrudException;

/**
 * Defines an object to be sent to the client in case of some exception has been thrown.
 * In case of exception the controller creates instance of this class and passes it to the client.
 *
 * For the instances of CrudException this class also has `code` field.
 */
public class ErrorResponse extends GeneralResponse {

    /**
     * Error message.
     */
    public String message;

    /**
     * Error code of thrown CrudException. For other types of exceptions this field is null.
     */
    public Integer code;

    public ErrorResponse(String message, Long requestId, Integer code) {
        super(requestId);
        this.code = code;
        this.message = message;
        this.requestId = requestId;
    }

    public ErrorResponse(Exception e, Long requestId) {
        this(e.getMessage(), requestId, e instanceof CrudException ? ((CrudException) e).getCode() : null);
    }

    @Override
    public Boolean getSuccess() {
        return false;
    }

}
