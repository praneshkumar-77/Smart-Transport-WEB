package com.smarttransport.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.HttpStatus;

@Controller
public class SpaErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null) {
            Integer statusCode = Integer.valueOf(status.toString());

            // If the error is 404 and it's not an API request, forward to React's
            // index.html
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                String requestUri = (String) request.getAttribute(RequestDispatcher.FORWARD_REQUEST_URI);
                if (requestUri == null) {
                    requestUri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
                }
                if (requestUri != null && !requestUri.startsWith("/api/")) {
                    return "forward:/index.html";
                }
            }
        }
        return "error"; // fallback
    }
}
