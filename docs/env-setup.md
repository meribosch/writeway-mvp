# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno necesarias para el funcionamiento de Writeway.

## Variables requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI configuration
OPENAI_API_KEY=your_openai_api_key
```

## Obtención de las claves

### Supabase

1. Inicia sesión en [Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a "Project Settings" > "API"
4. Copia la URL y la clave anónima para las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copia la clave de servicio para la variable `SUPABASE_SERVICE_KEY`

### OpenAI

1. Inicia sesión en [OpenAI](https://platform.openai.com)
2. Ve a "API Keys"
3. Crea una nueva clave de API
4. Copia la clave para la variable `OPENAI_API_KEY`

## Notas importantes

- Nunca compartas tus claves de API en repositorios públicos
- El archivo `.env.local` está incluido en `.gitignore` para evitar que se suban las claves al repositorio
- En entornos de producción, configura estas variables en el panel de tu proveedor de hosting 