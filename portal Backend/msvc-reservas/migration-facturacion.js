// Migración: Agregar soporte para facturación y estadía mínima
// Fecha: 2026-02-22
// Descripción: Agrega campos para facturación en reservas y estadía mínima en políticas
// Ejecutar en la base de datos de reservas

// Conectar a la base de datos
use reservasDB;

// 1. Agregar campo estadiaMinima a todas las políticas existentes
db.politica_reservas.updateMany(
  { estadiaMinima: { $exists: false } },
  {
    $set: {
      estadiaMinima: 1,
      fechaActualizacion: new Date()
    }
  }
);

print("✓ Actualizado campo estadiaMinima en politica_reservas");

// 2. Agregar campos de facturación a todas las reservas existentes
db.reservations.updateMany(
  { cantidadHuespedes: { $exists: false } },
  {
    $set: {
      cantidadHuespedes: 2,  // Asumir 2 huéspedes por defecto para reservas antiguas
      requiereFacturacion: false,
      billingInfo: null
    }
  }
);

print("✓ Actualizado campos de facturación en reservations");

// 3. Verificar resultados
var politicasActualizadas = db.politica_reservas.countDocuments({ estadiaMinima: { $exists: true } });
var reservasActualizadas = db.reservations.countDocuments({ cantidadHuespedes: { $exists: true } });

print("Políticas con estadiaMinima: " + politicasActualizadas);
print("Reservas con campos de facturación: " + reservasActualizadas);

print("\n✓ Migración completada exitosamente");
