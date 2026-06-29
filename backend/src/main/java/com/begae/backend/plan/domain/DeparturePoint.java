package com.begae.backend.plan.domain;

import com.begae.backend.plan.dto.DeparturePointDto;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class DeparturePoint {

    @Column(name = "departure_point_name")
    private String name;

    @Column(name = "departure_point_address")
    private String address;

    @Column(name = "departure_point_x")
    private Double x;

    @Column(name = "departure_point_y")
    private Double y;

    public static DeparturePoint of(DeparturePointDto dto) {
        return new DeparturePoint(dto.getName(), dto.getAddress(), dto.getX(), dto.getY());
    }

}
