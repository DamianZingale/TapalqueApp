package com.tapalque.mercado_pago.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstadoUsuarioDTO {
    private String userName;
    private Boolean licencia;
    private String vencimientoLicencia;
}
