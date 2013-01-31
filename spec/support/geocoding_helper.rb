module GeocodingHelper
  nominatim_response = <<-JSON
[

    {
        "place_id": "30632629",
        "licence": "Data Copyright OpenStreetMap Contributors, Some Rights Reserved. CC-BY-SA 2.0.",
        "osm_type": "way",
        "osm_id": "24801588",
        "boundingbox": [
            "40.749828338623",
            "40.7511596679688",
            "-73.9943389892578",
            "-73.9926528930664"
        ],
        "lat": "40.7504928942",
        "lon": "-73.9934664923",
        "display_name": "Madison Square Garden, West 31st Street, Long Island City, New York City, New York, 10001, United States of America",
        "class": "leisure",
        "type": "stadium",
        "address": {
            "stadium": "Madison Square Garden",
            "road": "West 31st Street",
            "suburb": "Long Island City",
            "city": "New York City",
            "county": "New York",
            "state": "New York",
            "postcode": "10001",
            "country": "United States of America",
            "country_code": "us"
        }
    }

]
JSON

  FakeWeb.register_uri(:any, %r|nominatim\.openstreetmap\.org|, body: nominatim_response)
end
