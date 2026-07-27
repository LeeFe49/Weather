package com.leefe.weather.controller;

import com.leefe.weather.domain.Area;
import com.leefe.weather.service.AreaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @PostMapping("/create/area")
    Area createArea(@RequestParam String findArea, @RequestParam String saveArea) {
        return areaService.createArea(findArea, saveArea);
    }

    @GetMapping("/read/areas")
    List<Area> readAreas() {
        return areaService.readAreas();
    }

    @GetMapping("/read/area")
    Area readArea(@RequestParam String area) {
        return areaService.readArea(area);
    }

    @PutMapping("/update/area")
    Area updateDiary(@RequestParam String area, @RequestParam Double lat, @RequestParam Double lon) {
        return areaService.updateArea(area, lat, lon);
    }

    @GetMapping("/find/area")
    Area findArea(@RequestParam String area) {
        return areaService.findArea(area);
    }

}
