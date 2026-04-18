package org.blog.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class TestingController {

    @GetMapping("/check" )
    public String getBackend(){
        return "Hello The backend is working";
    }
}
