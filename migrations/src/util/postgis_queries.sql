
INSERT INTO app(p_id, the_geom)
VALUES(2, ST_GeomFromText('POINT(-71.060316 48.432044)', 4326));

UPDATE next_entries set geom = ST_SetSRID(ST_MakePoint(longitude::decimal, latitude::decimal), 4326);

SELECT ST_SetSRID(ST_MakePoint(-71.1043443253471, 42.3150676015829),4326);

SELECT AddGeometryColumn('next_entries', 'geom', 4326, 'POINT',2);

SELECT json_build_object(
    'type', 'Feature',
    'geometry', ST_AsGeoJSON(geom) :: json,
    'properties', json_build_object(
        'id',  id,
        'name', name
    )
)
from next_entries;
