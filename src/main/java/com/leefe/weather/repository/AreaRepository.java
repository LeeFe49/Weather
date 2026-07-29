package com.leefe.weather.repository;

import com.leefe.weather.domain.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {

    Area getAreaByName(String name);

    List<Area> findAllByTextIsNotNull();

    List<Area> findByNameContaining(String name);
}
