package com.philharmonic.dto;
import lombok.Data;
@Data
public class OrderRequest {
    private Long eventId;
    private Integer ticketsCount;
}