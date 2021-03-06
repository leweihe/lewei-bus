package com.linde.web.rest.resourceassembler.mapper;

import com.linde.dto.UserDTO;
import com.linde.web.rest.resource.UserResource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

/**
 * Created by cn40580 at 2016-10-10 1:30 PM.
 */
@Mapper
public interface UserResourceMapper {

    @Mappings({
            @Mapping(target = "links", ignore = true)
    })
    UserResource DTOtoResource(UserDTO entity);
}
