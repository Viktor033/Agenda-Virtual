package com.saas.shifty.exception;

import lombok.Getter;

@Getter
public class PlanLimitExceededException extends RuntimeException {
    
    private final String errorTitle;
    private final String errorMessage;

    public PlanLimitExceededException(String errorTitle, String errorMessage) {
        super(errorMessage);
        this.errorTitle = errorTitle;
        this.errorMessage = errorMessage;
    }
}
