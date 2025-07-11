# Configuración de Supabase Storage para Writeway

Este documento explica cómo configurar el almacenamiento de imágenes en Supabase para la aplicación Writeway.

## Requisitos

- Una cuenta en Supabase
- Un proyecto creado en Supabase
- Acceso a la consola de administración de Supabase

## Pasos para configurar el bucket de almacenamiento

### 1. Acceder a la consola de Supabase

1. Inicia sesión en [Supabase](https://app.supabase.io/)
2. Selecciona tu proyecto

### 2. Crear un bucket para imágenes de perfil

1. En el menú lateral, haz clic en "Storage"
2. Haz clic en el botón "New Bucket"
3. Ingresa el nombre del bucket: `user-content`
4. Marca la opción "Public bucket" para permitir acceso público a las imágenes
5. Haz clic en "Create bucket"

### 3. Configurar políticas de acceso (RLS)

Para permitir que los usuarios suban y accedan a sus propias imágenes, necesitamos configurar políticas de Row Level Security (RLS):

#### Política para subir imágenes

1. En la sección Storage, selecciona el bucket `user-content`
2. Ve a la pestaña "Policies"
3. Haz clic en "Add Policy"
4. Selecciona "Create custom policy"
5. Configura la política con los siguientes valores:
   - **Policy name**: `allow_uploads`
   - **Allowed operations**: `INSERT`
   - **Policy definition**:
     ```sql
     (bucket_id = 'user-content') AND 
     (auth.uid() IS NOT NULL) AND
     (storage.foldername(name))[1] = auth.uid()::text
     ```
   - Esto permite a los usuarios autenticados subir archivos a una carpeta con su ID de usuario

#### Política para acceso público a las imágenes

1. Añade otra política con:
   - **Policy name**: `public_read`
   - **Allowed operations**: `SELECT`
   - **Policy definition**:
     ```sql
     bucket_id = 'user-content'
     ```
   - Esto permite a cualquier persona ver las imágenes (necesario para mostrarlas en la web)

### 4. Configuración de CORS (opcional pero recomendado)

Para permitir solicitudes desde tu dominio:

1. Ve a la sección "Settings" del proyecto
2. Selecciona "API"
3. Desplázate hasta "CORS"
4. Añade tu dominio (por ejemplo, `https://tu-app.vercel.app`) a "Allowed origins"

## Verificación

Para verificar que la configuración funciona correctamente:

1. Accede a la aplicación Writeway
2. Inicia sesión con tu cuenta
3. Ve a la página de perfil
4. Intenta subir una imagen de perfil
5. Verifica que la imagen se muestre correctamente después de subirse

## Solución de problemas

### Error "Bucket not found"

Si ves este error, verifica:
- Que el bucket `user-content` existe en Supabase Storage
- Que el nombre del bucket en el código coincide exactamente con el creado en Supabase
- Que las credenciales de Supabase (URL y API key) son correctas

### Error de permisos al subir

Si no puedes subir imágenes:
- Verifica que las políticas RLS están configuradas correctamente
- Asegúrate de que el usuario está autenticado antes de intentar subir
- Comprueba los logs en la consola de Supabase para ver errores específicos

## Límites del plan Free

El plan gratuito de Supabase incluye:
- 1 GB de almacenamiento
- Archivos de hasta 50 MB (aunque recomendamos limitar las imágenes a 2 MB)
- Sin límite de operaciones

Cuando el uso se acerque al límite, considera:
- Implementar compresión de imágenes antes de subir
- Actualizar a un plan de pago
- Limpiar archivos antiguos o no utilizados 