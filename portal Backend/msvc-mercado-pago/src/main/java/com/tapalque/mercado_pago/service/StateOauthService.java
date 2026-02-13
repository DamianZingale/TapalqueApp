package com.tapalque.mercado_pago.service;

import org.springframework.stereotype.Service;

import com.tapalque.mercado_pago.dto.TipoServicioEnum;
import com.tapalque.mercado_pago.entity.StateOauth;
import com.tapalque.mercado_pago.repository.StateOauthRepository;


@Service
public class StateOauthService {
    private final StateOauthRepository stateOauthRepository;

    public StateOauthService(StateOauthRepository stateOauthRepository) {
        this.stateOauthRepository = stateOauthRepository;
    }

    public void guardarStateOauth(Long idUsuarioLogueado, String state,
                                   Long externalBusinessId, TipoServicioEnum tipoServicio) {
        StateOauth entity = new StateOauth(idUsuarioLogueado, state, externalBusinessId, tipoServicio);
        stateOauthRepository.save(entity);
    }

    public StateOauth obtenerStateOauthPorState(String state) {
        return stateOauthRepository.findByState(state)
                .orElseThrow(() -> new RuntimeException("state no encontrado"));
    }

    public Long obtenerIdUsuarioPorState(String state) {
        return obtenerStateOauthPorState(state).getUsuarioId();
    }
}
