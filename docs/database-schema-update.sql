-- Actualización del esquema para soportar imágenes Base64
-- Cambia el tipo de datos de profile_image_url de VARCHAR a TEXT para soportar cadenas largas

-- Verificar si la columna ya existe
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_image_url'
  ) THEN
    -- Cambiar el tipo de columna existente a TEXT
    ALTER TABLE users ALTER COLUMN profile_image_url TYPE TEXT;
  ELSE
    -- Añadir la columna si no existe
    ALTER TABLE users ADD COLUMN profile_image_url TEXT;
  END IF;
END $$;

-- Añadir un índice para mejorar el rendimiento de las consultas que usan profile_image_url
CREATE INDEX IF NOT EXISTS idx_users_profile_image_url ON users ((left(profile_image_url, 255)));

-- Comentario para explicar la implementación
COMMENT ON COLUMN users.profile_image_url IS 'Almacena la imagen de perfil del usuario como una cadena Base64'; 