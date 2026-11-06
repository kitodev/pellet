-- 006: new product structure (2026-11, "Pelletcentrum weboldal váz.xlsx")
--   Tüzelőanyagok · Takarmányok · Fűtési megoldások (the old Kályhák és kandallók + Kiegészítők)
-- Products of categories that no longer exist are moved to the closest new category and
-- HIDDEN (published = 0) – check them in the admin and publish / move / delete them.

-- Tüzelőanyagok (area key stays: futoanyagok)
UPDATE products SET category = 'a1-fapellet'
  WHERE area = 'futoanyagok' AND category IN ('fa-pellet', 'premium-pellet', 'zsakos-pellet', 'raklapos-pellet');
UPDATE products SET category = 'brikett', published = 0
  WHERE area = 'futoanyagok' AND category IN ('tuzifa', 'apritek');

-- Takarmányok
UPDATE products SET category = 'lucerna-pellet' WHERE area = 'takarmanyok' AND category = 'lo-takarmany';
UPDATE products SET category = 'szena-pellet', published = 0
  WHERE area = 'takarmanyok'
    AND category IN ('szarvasmarha-takarmany', 'sertes-takarmany', 'baromfi-takarmany', 'nyul-es-egyeb');

-- Kályhák és kandallók → Fűtési megoldások
UPDATE products SET area = 'futesi-megoldasok', category = 'levegos-pellet-kalyhak'
  WHERE area = 'kalyhak-kandallok' AND category = 'pellet-kalyhak';
UPDATE products SET area = 'futesi-megoldasok', category = 'vizteres-pellet-kalyhak'
  WHERE area = 'kalyhak-kandallok' AND category = 'vizteres-kalyhak';
UPDATE products SET area = 'futesi-megoldasok', category = 'ipari-vizteres', published = 0
  WHERE area = 'kalyhak-kandallok' AND category = 'ipari-berendezesek';
UPDATE products SET area = 'futesi-megoldasok', category = 'levegos-pellet-kalyhak', published = 0
  WHERE area = 'kalyhak-kandallok';

-- Kiegészítők → Fűtési megoldások / Kiegészítők
UPDATE products SET area = 'futesi-megoldasok', category = 'fustcsovek'
  WHERE area = 'kiegeszitok' AND category = 'fustcsovek';
UPDATE products SET area = 'futesi-megoldasok', category = 'hamu-porszivok'
  WHERE area = 'kiegeszitok' AND category = 'tisztito-eszkozok';
UPDATE products SET area = 'futesi-megoldasok', category = 'alkatreszek'
  WHERE area = 'kiegeszitok' AND category = 'alkatreszek';
UPDATE products SET area = 'futesi-megoldasok', category = 'fustcsovek', published = 0
  WHERE area = 'kiegeszitok' AND category = 'kemeny-elemek';
UPDATE products SET area = 'futesi-megoldasok', category = 'alkatreszek', published = 0
  WHERE area = 'kiegeszitok';
