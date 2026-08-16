package com.taxmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AiAskRequestDTO {

    @NotBlank
    private String question;

    /*
     * Selected taxpayer from the AI Assistant UI.
     *
     * This allows the AI assistant to answer questions
     * using the actual taxpayer's information and tax history.
     */
    @NotNull
    private Long userId;
}