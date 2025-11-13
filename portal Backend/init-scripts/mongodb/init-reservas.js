// Conectar a la base de datos reservas
db = db.getSiblingDB('reservas');

// Crear la colección reservations
db.createCollection('reservations');

// Crear índices para optimizar las consultas
db.reservations.createIndex({ "customer.customerId": 1 });
db.reservations.createIndex({ "hotel.hotelId": 1 });
db.reservations.createIndex({ "isActive": 1 });
db.reservations.createIndex({ "isCancelled": 1 });
db.reservations.createIndex({ "dateCreated": -1 });
db.reservations.createIndex({ "dateUpdated": -1 });
db.reservations.createIndex({ "stayPeriod.checkInDate": 1 });
db.reservations.createIndex({ "stayPeriod.checkOutDate": 1 });
db.reservations.createIndex({ "payment.isPaid": 1 });
db.reservations.createIndex({ "payment.hasPendingAmount": 1 });
db.reservations.createIndex({ "payment.paymentType": 1 });

// Índices compuestos para consultas frecuentes
db.reservations.createIndex({ "hotel.hotelId": 1, "isActive": 1 });
db.reservations.createIndex({ "customer.customerId": 1, "isActive": 1 });
db.reservations.createIndex({ "isActive": 1, "dateCreated": -1 });
db.reservations.createIndex({ "hotel.hotelId": 1, "stayPeriod.checkInDate": 1 });
db.reservations.createIndex({ "payment.isPaid": 1, "payment.hasPendingAmount": 1 });

// Validación de esquema (opcional, pero recomendado)
db.runCommand({
    collMod: "reservations",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["customer", "hotel", "stayPeriod", "payment", "totalPrice", "isActive", "isCancelled", "dateCreated"],
            properties: {
                customer: {
                    bsonType: "object",
                    required: ["customerId", "customerName"],
                    properties: {
                        customerId: {
                            bsonType: "string",
                            description: "ID del cliente - requerido"
                        },
                        customerName: {
                            bsonType: "string",
                            description: "Nombre del cliente - requerido"
                        }
                    }
                },
                hotel: {
                    bsonType: "object",
                    required: ["hotelId", "hotelName"],
                    properties: {
                        hotelId: {
                            bsonType: "string",
                            description: "ID del hotel - requerido"
                        },
                        hotelName: {
                            bsonType: "string",
                            description: "Nombre del hotel - requerido"
                        }
                    }
                },
                stayPeriod: {
                    bsonType: "object",
                    required: ["checkInDate", "checkOutDate"],
                    properties: {
                        checkInDate: {
                            bsonType: "date",
                            description: "Fecha de check-in - requerido"
                        },
                        checkOutDate: {
                            bsonType: "date",
                            description: "Fecha de check-out - requerido"
                        }
                    }
                },
                payment: {
                    bsonType: "object",
                    required: ["isPaid", "hasPendingAmount", "isDeposit", "paymentType", "amountPaid", "totalAmount", "remainingAmount"],
                    properties: {
                        isPaid: {
                            bsonType: "bool",
                            description: "Indica si está totalmente pagado - requerido"
                        },
                        hasPendingAmount: {
                            bsonType: "bool",
                            description: "Indica si tiene saldo pendiente - requerido"
                        },
                        isDeposit: {
                            bsonType: "bool",
                            description: "Indica si es seña o pago total - requerido"
                        },
                        paymentType: {
                            enum: ["MERCADO_PAGO", "TARJETA_CREDITO", "TARJETA_DEBITO", "EFECTIVO", "TRANSFERENCIA"],
                            description: "Tipo de pago - requerido"
                        },
                        paymentReceiptPath: {
                            bsonType: ["string", "null"],
                            description: "Ruta del comprobante de pago"
                        },
                        amountPaid: {
                            bsonType: "double",
                            minimum: 0,
                            description: "Monto abonado - requerido"
                        },
                        totalAmount: {
                            bsonType: "double",
                            minimum: 0,
                            description: "Monto total de la reserva - requerido"
                        },
                        remainingAmount: {
                            bsonType: "double",
                            minimum: 0,
                            description: "Saldo restante - requerido"
                        }
                    }
                },
                totalPrice: {
                    bsonType: "double",
                    minimum: 0,
                    description: "Precio total - requerido"
                },
                isActive: {
                    bsonType: "bool",
                    description: "Indica si la reserva está activa - requerido"
                },
                isCancelled: {
                    bsonType: "bool",
                    description: "Indica si la reserva está cancelada - requerido"
                },
                dateCreated: {
                    bsonType: "date",
                    description: "Fecha de creación - requerido"
                },
                dateUpdated: {
                    bsonType: "date",
                    description: "Fecha de última actualización"
                }
            }
        }
    },
    validationLevel: "moderate"
});

print('✅ Base de datos reservas inicializada');
print('✅ Colección reservations creada con índices');
print('✅ Validaciones de esquema aplicadas');