package org.blog.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExitsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExitsException(EmailAlreadyExitsException exception , WebRequest request){
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                exception.getMessage(),
                request.getDescription(false).replace("uri" , "")
        );

        return new ResponseEntity<>(response , HttpStatus.CONFLICT);
    }


    @ExceptionHandler(UsernameAlreadyExitsException.class)
    public ResponseEntity<ErrorResponse> handleUsernameAlreadyExitsException(UsernameAlreadyExitsException exception , WebRequest request){
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                "Conflict",
                exception.getMessage(),
                request.getDescription(false).replace("uri" , "")
        );

        return new ResponseEntity<>(response , HttpStatus.CONFLICT);
    }


    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException exception , WebRequest request){
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found Exception",
                exception.getMessage(),
                request.getDescription(false).replace("uri" , "")
        );

        return new ResponseEntity<>(response , HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePostNotFoundException(PostNotFoundException exception , WebRequest request){
        ErrorResponse response = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found Exception",
                exception.getMessage(),
                request.getDescription(false).replace("uri" , "")
        );

        return new ResponseEntity<>(response , HttpStatus.NOT_FOUND);
    }
}
