package com.leefe.weather.repository;

import com.leefe.weather.domain.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {

    Area getAreaByArea(String area);
}
