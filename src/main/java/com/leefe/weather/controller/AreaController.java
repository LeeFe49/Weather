package com.leefe.weather.controller;

import com.leefe.weather.domain.Area;
import com.leefe.weather.service.AreaService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping("/read/areas")
    List<Area> readAreas() {
        return areaService.readAreas();
    }

    @GetMapping("/read/area")
    Area readArea(@RequestParam String name) {
        return areaService.readArea(name);
    }

    @PutMapping("/update/area")
    Area updateDiary(@RequestParam String name, @RequestParam String text) {
        return areaService.updateArea(name, text);
    }

    @GetMapping("/find/areas")
    List<Area> findAreas() throws IOException {
        return areaService.findAreas();
    }

    @PostMapping("/update/areas")
    List<Area> updateAreas() throws IOException {
        return areaService.updateAreas();
    }

    @GetMapping("/read/areas/updated")
    List<Area> readAreasUpdated(){
        return areaService.readAreasUpdated();
    }

    @GetMapping("/read/areas/like")
    List<Area> readAreasLike(@RequestParam String name) {
        return areaService.readAreasLike(name);
    }
}
