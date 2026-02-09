package com.iot.smart_room.service.impl;

import com.iot.smart_room.dto.request.ActionHistoryRequest;
import com.iot.smart_room.dto.response.ActionHistoryResponse;
import com.iot.smart_room.entity.ActionHistoryEntity;
import com.iot.smart_room.mapper.ActionHistoryMapper;
import com.iot.smart_room.repo.ActionHistoryRepository;
import com.iot.smart_room.service.ActionHistoryService;
import com.iot.smart_room.service.specification.ActionHistorySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActionHistoryServiceImpl implements ActionHistoryService {

    private final ActionHistoryRepository actionHistoryRepository;
    private final ActionHistorySpecification actionHistorySpecification;
    private final ActionHistoryMapper actionHistoryMapper;

    @Override
    public Page<ActionHistoryResponse> search(ActionHistoryRequest request) {
        Integer page = request.getPage() != null ? request.getPage() : 0;
        Integer size = request.getSize() != null ? request.getSize() : 15;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(request.getSortType() != null ? request.getSortType() : "DESC"), "createdAt")
        );

        Page<ActionHistoryEntity> entityPage = actionHistoryRepository.findAll(actionHistorySpecification.search(request), pageable);

        return entityPage.map(actionHistoryMapper::toResponse);
    }
}
