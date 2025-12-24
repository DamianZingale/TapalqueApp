// Conectar a la base de datos pedidos
db = db.getSiblingDB('pedidos');

// Crear la colección orders (aunque Mongoose la creará automáticamente)
db.createCollection('orders');

// Crear índices para optimizar las consultas
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "dateCreated": -1 });
db.orders.createIndex({ "dateUpdated": -1 });
db.orders.createIndex({ "restaurant.restaurantId": 1 });
db.orders.createIndex({ "paidWithMercadoPago": 1 });
db.orders.createIndex({ "items.productId": 1 });

// Índice compuesto para consultas frecuentes
db.orders.createIndex({ "status": 1, "dateCreated": -1 });
db.orders.createIndex({ "restaurant.restaurantId": 1, "status": 1 });

// Validación de esquema (opcional, pero recomendado)
db.runCommand({
    collMod: "orders",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["totalPrice", "status", "dateCreated", "items", "restaurant"],
            properties: {
                totalPrice: {
                    bsonType: "double",
                    description: "Precio total del pedido - requerido"
                },
                paidWithMercadoPago: {
                    bsonType: "bool",
                    description: "Indica si se pagó con Mercado Pago"
                },
                paidWithCash: {
                    bsonType: "bool",
                    description: "Indica si se pagó en efectivo"
                },
                status: {
                    enum: ["PENDING", "PAID", "READY", "DELIVERED", "FAILED"],
                    description: "Estado del pedido - requerido"
                },
                dateCreated: {
                    bsonType: "date",
                    description: "Fecha de creación - requerido"
                },
                dateUpdated: {
                    bsonType: "date",
                    description: "Fecha de última actualización"
                },
                paymentReceiptPath: {
                    bsonType: "string",
                    description: "Ruta del comprobante de pago"
                },
                items: {
                    bsonType: "array",
                    minItems: 1,
                    items: {
                        bsonType: "object",
                        required: ["productId", "itemName", "itemPrice", "itemQuantity"],
                        properties: {
                            productId: {
                                bsonType: "string",
                                description: "ID del producto - requerido"
                            },
                            itemName: {
                                bsonType: "string",
                                description: "Nombre del producto - requerido"
                            },
                            itemPrice: {
                                bsonType: "double",
                                description: "Precio del producto - requerido"
                            },
                            itemQuantity: {
                                bsonType: "int",
                                minimum: 1,
                                description: "Cantidad del producto - requerido"
                            }
                        }
                    }
                },
                restaurant: {
                    bsonType: "object",
                    required: ["restaurantId", "restaurantName"],
                    properties: {
                        restaurantId: {
                            bsonType: "string",
                            description: "ID del restaurante - requerido"
                        },
                        restaurantName: {
                            bsonType: "string",
                            description: "Nombre del restaurante - requerido"
                        }
                    }
                }
            }
        }
    },
    validationLevel: "moderate"
});

print('✅ Base de datos pedidos inicializada');
print('✅ Colección orders creada con índices');
print('✅ Validaciones de esquema aplicadas');