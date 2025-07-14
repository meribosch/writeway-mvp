-- Añadir columnas first_name y last_name a la tabla users

-- Verificar si las columnas ya existen
DO $$
BEGIN
  -- Verificar columna first_name
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    -- Añadir la columna first_name si no existe
    ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    RAISE NOTICE 'Columna first_name añadida.';
  ELSE
    RAISE NOTICE 'La columna first_name ya existe.';
  END IF;

  -- Verificar columna last_name
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    -- Añadir la columna last_name si no existe
    ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    RAISE NOTICE 'Columna last_name añadida.';
  ELSE
    RAISE NOTICE 'La columna last_name ya existe.';
  END IF;
END $$; 