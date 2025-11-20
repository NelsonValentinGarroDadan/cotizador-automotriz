-- Ensure every quotation has a vehicleVersionId and drop legacy vehicleData

-- 1) Backfill vehicleVersionId for existing quotations without value
UPDATE `quotations`
SET `vehicleVersionId` = (
  SELECT `idversion` FROM `autos_versiones` ORDER BY `idversion` ASC LIMIT 1
)
WHERE `vehicleVersionId` IS NULL;

-- 2) Drop old free text vehicleData
ALTER TABLE `quotations`
  DROP COLUMN `vehicleData`;

-- 3) Make vehicleVersionId mandatory
--    Primero ajustamos la FK para que no intente hacer SET NULL,
--    luego marcamos la columna como NOT NULL y recreamos la FK.

-- 3.1) Eliminar la constraint vieja que permite SET NULL
--      (creada originalmente como fk_quotations_vehicle_version)
ALTER TABLE `quotations`
  DROP FOREIGN KEY `fk_quotations_vehicle_version`;

-- 3.2) Hacer vehicleVersionId NOT NULL
ALTER TABLE `quotations`
  MODIFY `vehicleVersionId` INT NOT NULL;

-- 3.3) Volver a crear la FK sin SET NULL
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_vehicleVersionId_fkey`
  FOREIGN KEY (`vehicleVersionId`) REFERENCES `autos_versiones`(`idversion`)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
