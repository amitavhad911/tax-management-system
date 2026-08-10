package com.taxmanagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    @GetMapping({
            "/tax/history/{userId}",
            "/tax/compute",
            "/users",
            "/dashboard",
            "/reports",
            "/backup",
            "/ai-assistant",
            "/profile",
            "/settings"
    })
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}