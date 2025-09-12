# Sweet Dreams Bakery - API Integration Setup

## Configuración de la API

Este proyecto está configurado para trabajar tanto con datos locales como con una API externa. La configuración se maneja a través del archivo `config.js`.

### Archivos de Configuración

- **`config.js`**: Contiene todas las configuraciones de la aplicación
- **`api.js`**: Maneja las comunicaciones con la API
- **`script.js`**: Lógica principal de la aplicación (actualizada para usar la API)

### Configuración de Entornos

En el archivo `config.js`, puedes configurar diferentes entornos:

```javascript
const CONFIG = {
    environment: 'development', // 'development' | 'production'
    
    api: {
        baseUrl: {
            development: 'http://localhost:3000', // Servidor local
            production: 'https://api.sweetdreamsbakery.com' // Servidor de producción
        },
        endpoints: {
            products: '/products',
            orders: '/orders'
        }
    },
    
    features: {
        enableApiIntegration: true, // Activar/desactivar integración con API
        enableNotifications: true,
        enableLocalStorage: true,
        enableStockValidation: true
    }
};
```

### Endpoints de la API

La aplicación espera los siguientes endpoints en tu servidor:

#### 1. Productos
- **GET** `/api/products` - Obtener todos los productos
- **GET** `/api/products/:id` - Obtener un producto específico
- **PATCH** `/api/products/:id` - Actualizar stock de un producto

**Formato de respuesta esperado:**
```json
[
    {
        "id": 1,
        "name": "Chocolate Croissant",
        "description": "Buttery, flaky croissant filled with rich dark chocolate",
        "price": 3.99,
        "image": "https://example.com/image.jpg",
        "stock": 10
    }
]
```

#### 2. Órdenes
- **POST** `/orders` - Crear una nueva orden
- **GET** `/orders/:id` - Obtener una orden específica
- **GET** `/orders/user/:userId` - Obtener órdenes de un usuario

**Formato del payload para crear orden:**
```json
{
    "name": "Cliente Prueba integracion",
    "email": "clienteprueba@example.com",
    "phone": "1234567890",
    "delivery_date": "2025-01-05",
    "note": "make it bright",
    "items": [
        { "id_product": 1, "quantity": 2 }
    ]
}
```

### Modos de Operación

#### Modo API (enableApiIntegration: true)
- Los productos se cargan desde la API
- El carrito se maneja localmente (sin sincronización con API)
- Las órdenes se envían a la API al completar el checkout
- Fallback a datos locales si la API no está disponible

#### Modo Local (enableApiIntegration: false)
- Usa los datos locales definidos en `script.js`
- No hay comunicación con la API
- Ideal para desarrollo sin servidor backend

### Configuración para Desarrollo

1. **Para desarrollo local sin API:**
   ```javascript
   features: {
       enableApiIntegration: false
   }
   ```

2. **Para desarrollo con API local:**
   ```javascript
   environment: 'development',
   features: {
       enableApiIntegration: true
   }
   ```

3. **Para producción:**
   ```javascript
   environment: 'production',
   features: {
       enableApiIntegration: true
   }
   ```

### Características Implementadas

- ✅ Carga de productos desde API
- ✅ Fallback a datos locales si la API falla
- ✅ Carrito manejado localmente (sin API)
- ✅ Envío de órdenes a la API al completar checkout
- ✅ Payload de órdenes con estructura correcta del backend
- ✅ Validación de formulario de checkout
- ✅ Estados de carga durante el envío de órdenes
- ✅ Notificaciones de error y éxito
- ✅ Logging de debug
- ✅ Validación de stock
- ✅ Manejo de errores robusto

### Próximos Pasos

1. **Configurar tu servidor backend** con los endpoints de productos y órdenes
2. **Actualizar la URL base** en `config.js` según tu servidor
3. **Probar la integración** cambiando `enableApiIntegration` a `true`
4. **Verificar los logs** en la consola del navegador para debug
5. **Implementar el envío de órdenes** en el proceso de checkout

### Debugging

La aplicación incluye logging detallado. Abre la consola del navegador para ver:
- Llamadas a la API
- Errores de conexión
- Estados de sincronización
- Notificaciones del sistema

### Notas Importantes

- La aplicación funciona completamente sin API (modo offline)
- Los datos se guardan en localStorage como respaldo
- Las notificaciones informan al usuario sobre el estado de la conexión
- El sistema es tolerante a fallos de la API
