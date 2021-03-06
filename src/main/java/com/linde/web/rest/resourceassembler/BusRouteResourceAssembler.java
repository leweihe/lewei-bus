package com.linde.web.rest.resourceassembler;

import javax.validation.constraints.NotNull;

import org.springframework.hateoas.ResourceAssembler;

import com.linde.dto.BusRouteDTO;
import com.linde.web.rest.resource.BusRouteResource;

/**
 * Created by cn40580 at 2016-10-10 10:00 AM.
 */
public interface BusRouteResourceAssembler extends ResourceAssembler<BusRouteDTO, BusRouteResource> {

    public BusRouteResource toResource(@NotNull BusRouteDTO entity);

    public BusRouteDTO toDto(@NotNull BusRouteResource entity);
}
