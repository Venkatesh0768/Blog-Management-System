package org.blog.backend.exception;

public class UsernameAlreadyExitsException extends RuntimeException {
    public UsernameAlreadyExitsException(String message) {
        super(message);
    }
}
