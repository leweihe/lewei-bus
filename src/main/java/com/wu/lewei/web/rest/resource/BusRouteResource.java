package com.wu.lewei.web.rest.resource;

import com.wu.lewei.dto.BusStationDTO;

import org.springframework.hateoas.ResourceSupport;

import java.util.List;

/**
 * Created by cn40580 at 2016-10-10.
 */
public class BusRouteResource extends ResourceSupport {
    private String routeName;
    private List<BusStationDTO> stations;

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public List<BusStationDTO> getStations() {
        return stations;
    }

    public void setStations(List<BusStationDTO> stations) {
        this.stations = stations;
    }
}
