-- Migration 20251125150000_cleanup_autos_modelos
-- Paso 2: migrar autos_versiones a esquema minimo y eliminar autos_modelos/campos legacy

-- 1) Agregar columna idlinea (NULL temporalmente)
ALTER TABLE autos_versiones ADD COLUMN idlinea INT NULL;

-- 2) Poblar idlinea desde autos_modelos
UPDATE autos_versiones v
JOIN autos_modelos m ON v.idmodelo = m.idmodelo
SET v.idlinea = m.idlinea;

-- 3) Hacer idlinea NOT NULL
ALTER TABLE autos_versiones MODIFY idlinea INT NOT NULL;

-- 4) Eliminar columnas legacy que no se usan
ALTER TABLE autos_versiones DROP FOREIGN KEY fk_autos_versiones_marca;
ALTER TABLE autos_versiones DROP FOREIGN KEY fk_autos_versiones_modelo;
ALTER TABLE autos_versiones DROP INDEX idx_autos_versiones_idmarca;
ALTER TABLE autos_versiones DROP INDEX idx_autos_versiones_idmodelo;

ALTER TABLE autos_versiones
  DROP COLUMN descrip_nadin,
  DROP COLUMN descrip_otra,
  DROP COLUMN idmarca,
  DROP COLUMN idmodelo,
  DROP COLUMN inactivo,
  DROP COLUMN cod_ph,
  DROP COLUMN codigo_viejo,
  DROP COLUMN codigo_acara,
  DROP COLUMN nueva_descrip,
  DROP COLUMN paquetes,
  DROP COLUMN paquetes2,
  DROP COLUMN paquetes3,
  DROP COLUMN ajuste,
  DROP COLUMN incentivo_tactico,
  DROP COLUMN incentivo_tactico_ph,
  DROP COLUMN adicional_pl_valor,
  DROP COLUMN adicional_pl_porcentaje,
  DROP COLUMN no_tomar_usado,
  DROP COLUMN txt_otro_sistema,
  DROP COLUMN iibb_cordoba_origen,
  DROP COLUMN iibb_cordoba_marca,
  DROP COLUMN iibb_cordoba_tipo,
  DROP COLUMN iibb_cordoba_modelo,
  DROP COLUMN iva,
  DROP COLUMN equipamiento,
  DROP COLUMN sfx_ventas,
  DROP COLUMN sfx_produccion,
  DROP COLUMN idtasa,
  DROP COLUMN gear_box_type,
  DROP COLUMN connected_car,
  DROP COLUMN servicios_conectados,
  DROP COLUMN precio_especial;

-- 5) Agregar constraint a autos_lineas
ALTER TABLE autos_versiones
  ADD CONSTRAINT fk_autos_versiones_linea_min FOREIGN KEY (idlinea) REFERENCES autos_lineas(idlinea);

-- 6) Eliminar tabla autos_modelos
DROP TABLE IF EXISTS autos_modelos;

