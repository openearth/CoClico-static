# Assets
Examples of assets used in the frontend as provided by `coclicodata`
The `type` property of these objects is used to determine the render strategy in the frontend.
The following mask is defined for the `type` property:  

| Asset Type                                                 	| Render Function              	| Output Type                        	|
|------------------------------------------------------------	|------------------------------	|------------------------------------	|
| "application/vnd.apache.parquet"                           	| `buildVectorTileMapboxLayer` 	| Vector Tile Layer                  	|
| "image/tiff; application=geotiff; profile=cloud-optimized" 	| `buildRasterMapboxLayer`     	| Raster Tile Layer                  	|
| "image/png"                                                	| `buildRasterMapboxLayer`     	| Raster Tile Layer                  	|
| "application/png"                                          	| `buildRasterMapboxLayer`     	| Raster Tile Layer                  	|
| "vector"                                                   	| `buildGeojsonMapboxLayer`    	| Geojson Feature (collection) Layer 	|
| "geojson"                                                  	| `buildGeojsonMapboxLayer`    	| Geojson Feature (collection) Layer 	|
```typescript
const ResourceTypeFunctionMask = {
    "application/vnd.apache.parquet": buildVectorTileMapboxLayer,
    "image/tiff; application=geotiff; profile=cloud-optimized": buildRasterMapboxLayer,
    "image/png": buildRasterMapboxLayer,
    "application/png": buildRasterMapboxLayer,
    "vector": buildGeojsonMapboxLayer,
    "geojson": buildGeojsonMapboxLayer,
};
```
## Collections
### `geoserver_link`  
Transparent layer that is used to create clickable polygons on the map.    
#### Example
```json
{
  "geoserver_link": {
    "href": "https://coclico.avi.deltares.nl/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=<workspace>:<layer>&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
    "type": "application/vnd.apache.parquet",
    "title": "Geoserver Parquet link"
  }
}
```

## Items
### `visual`  
Visual layer from a geoserver, which is displayed on the map when a collection is toggled.
Can contain Raster tiles or Vector tiles.    
#### Raster example
```json
{
  "visual": {
    "href": "https://coclico.avi.deltares.nl/geoserver/cfhp/wms?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=cfhp:HIGH_DEFENDED_MAPS_SLR_High_end_2150",
    "type": "application/png",
    "title": "cfhp:HIGH_DEFENDED_MAPS_SLR_High_end_2150",
    "description": "OGS WMS url",
    "roles": [
      "visual"
    ]
  }
}
```

#### Vector example
```json
{
  "visual": {
    "href": "https://coclico.avi.deltares.nl/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=lau:coclico_LAU_CM_LAU_2020_NUTS_2021_01M_3035_CM&STYLE=&TILEMATRIX=EPSG:900913:{z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL={x}&TILEROW={y}",
    "type": "application/vnd.apache.parquet",
    "title": "LAU_CM Background Layer",
    "description": "LAU_CM WMTS url",
    "roles": [ 
      "visual"
    ]
  }
}
```

### `mapbox`
Visual layer from the mapbox api, usually containing Geojson features to show information on the map.  
#### Example
```json
{
  "mapbox": {
    "href": "mapbox://global-data-viewer.5oajrv70",
    "type": "vector",
    "title": "Mapbox",
    "description": "Mapbox url",
    "source": "nuts_regions-b1ics1",
    "roles": [
      "mapbox"
    ]
  }
}
```