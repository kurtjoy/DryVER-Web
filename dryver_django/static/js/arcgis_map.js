var aquaticLayer, climateLayer, impactLayer, agarLayer, nztabsLayer, abioticLayer, asmaLayer;
// https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/whats-the-deal-with-mapimagelayer/
$(document).ready(function () {
    require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/MapImageLayer",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/LayerList",
        "esri/widgets/Compass",
        "esri/widgets/ScaleBar",
        "dojo/domReady!"
        ], function(
            Map,
            SceneView,
            MapView,
            FeatureLayer,
            ImageryLayer,
            MapImageLayer,
            Legend,
            Expand,
            LayerList,
            Compass,
            ScaleBar,) {
        var map = new Map({
            basemap: "satellite",
            // ground: "world-elevation"
        });
        var view = new MapView({
            container: "map_canvas",  // Reference to the DOM node that will contain the view
            map: map,  // References the map object created in step 3
            center: [162, -77.5],
            zoom: 7,
        });

        // renderers and symbologies
        var green = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                  type: "point-3d", // autocasts as new PointSymbol3D()
                  symbolLayers: [{
                    type: "icon",
                    anchor: "center",
                    outline: {
                        size: 1
                    },
                    material: {
                        color: [0, 255, 0, 0.5]
                    }
                }]
            }
        };

        var yellow = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                  type: "point-3d", // autocasts as new PointSymbol3D()
                  symbolLayers: [{
                    type: "icon",
                    anchor: "center",
                    outline: {
                        size: 1
                    },
                    material: {
                        color: [178, 160, 40, 0.5]
                    }
                }]
            }
        };

        var blue = {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
                  type: "point-3d", // autocasts as new PointSymbol3D()
                  symbolLayers: [{
                    type: "icon",
                    anchor: "center",
                    outline: {
                        size: 1
                    },
                    material: {
                        color: [0, 0, 255, 0.5]
                    }
                }]
            }
        };

        // Popup templates
        var aspaTemp = {title: "{NAME}",
            content: [{
                type: "media",
                mediaInfos: [{type: "image", value: {sourceURL: "{IMAGE}"}}]},
                        {type: "text",
                        text: "{DESC}<br><br>" + "Helicopter Pad: {HELO}<br><br>" + "PDF Map:"}	 
            ]
        };

        var nztabsTemp = {title: "Site: {VALLEY} {FIELD_ID}<br>" + "Predicted Fungal Biodiversity: {FUNGI_S}<br>" + "Predicted Cyanobacterial Biodiversity: {CYANO_S}<br>" + "Predicted Total Biodiversity: {TAXA_S}", content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "ELV_MASL",
                visible: true,
                label: "Elevation (masl)"
            },{
                fieldName: "SLOPE",
                visible: true,
                label: "Slope (degrees)"
            },{
                fieldName: "ASPECT",
                visible: true,
                label: "Aspect (degrees)"
            },{
                fieldName: "COAST_M",
                visible: true,
                label: "Distance to Coast (m)"
             },{
                fieldName: "SOIL_WATER",
                visible: true,
                label: "Soil Water)"
            },{
                fieldName: "PH",
                visible: true,
                label: "Soil pH"
            },{
                fieldName: "S_MEAN_TEMP",
                visible: true,
                label: "Summer Mean Soil Temperature (degrees)"
            },{
                fieldName: "WETNESS_AL",
                visible: true,
                label: "Wetness Index (all)"
            },{
                fieldName: "WETNESS_DJ",
                visible: true,
                label: "Wetness Index (Dec-Jan)"}
            ]}
        ]};

        var	geochemTemp = {title:"Site ID:{FIELD_ID}", content: [{
            type: "text",
            text: "<br>Analysed at the University of Waikato on {ICPMS_DATE}. All measured concentrations in Parts Per Billion"},
                {type: "fields",fieldInfos:[ 
                    {fieldName: "B_10", label: "Boron-10:"},
                    {fieldName: "Na_23",label: "Sodium-23:"},
                    {fieldName: "Mg_24",label: "Magnesium-24:"},
                    {fieldName: "Al_27",label: "Aluminium-27:"},
                    {fieldName: "P_31",label: "Phosphorus-31:"},
                    {fieldName: "S_34",label: "Sulfur-34:"},
                    {fieldName: "K_39",label: "Potassium-39:"},
                    {fieldName: "Ca_43",label: "Calcium-43:"},
                    {fieldName: "V_51",label: "Vanadium-51:"},
                    {fieldName: "Cr_52",label: "Chromium-52:"},
                    {fieldName: "Fe_54",label: "Iron-54:"},
                    {fieldName: "Co_59",label: "Cobalt-59:"},
                    {fieldName: "Ni_60",label: "Nickle-60:"},
                    {fieldName: "Cu_63",label: "Copper-63:"},
                    {fieldName: "Zn_66",label: "Zinc-66:"},
                    {fieldName: "As_75",label: "Arsenic-75:"},
                    {fieldName: "Se_82",label: "Selenium-82:"},
                    {fieldName: "Sr_88",label: "Strontium-88:"},
                    {fieldName: "Ag_109",label: "Silver-109:"},
                    {fieldName: "Cd_111",label: "Cadmium-111:"},
                    {fieldName: "Ba_137",label: "Barium-137:"},
                    {fieldName: "Pb_207",label: "Lead-207:"},
                    {fieldName: "U_238",label: "Uranium-238:"} 
                ]}
            ]
        };

        var geolTemp = {title: "{MAP_UNIT}" + " ({DRYVER_GROUP})", content: [{
            type: "fields",
                    fieldInfos: [{
                        fieldName: "TERRANE",
                        visible: true,
                        label: "Terrane Type:"
                    },{
                        fieldName: "STRAT_UNIT",
                        visible: true,
                        label: "Stratigraphic Name:"
                    },{
                        fieldName: "ROCK_GROUP",
                        visible: true,
                        label: "Rock Group:"
                    },{
                        fieldName: "AGE_INDEX",
                        visible: true,
                        label: "Relative Age:"
                    },{
                        fieldName: "DESCRIPTIO",
                        visible: true,
                        label: "Description:"}
                    ]
                }
            ]
        };

        var agarTemp = {title: "{SID}"};
                            
        // layers

        abioticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer",
            title: "Abiotic",
            sublayers: [
                {
                  id: 1,
                  title: "GNS Ice",
                  visible: false,
                },
                {
                  id: 2,
                  title: "GNS Geology",
                  visible: false,
                },
                {
                  id: 3,
                  title: "Aspect",
                  visible: false,
                },
                {
                  id: 4,
                  title: "Slope",
                  visible: false,
                },
                {
                  id: 5,
                  title: "Lidar Hillshades",
                  visible: false,
                },
            ]
        });

        aquaticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AQUATIC/MapServer",
            title: "Aquatic",
            sublayers: [
                {
                  id: 0,
                  title: "LANDCARE Soils",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Streams",
                  visible: false,
                },
                {
                  id: 2,
                  title: "Wetness Index",
                  visible: false,
                },
            ]
        });

        // continue here
        asmaLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer",
            title: "ASMA",
            sublayers: [
                {
                  id: 0,
                  title: "SCAR Place Names",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Antarctic Managed Area",
                  visible: false,
                },
                {
                  id: 2,
                  title: "McMurdo ASMA",
                  visible: false,
                },
            ]
        });

        agarLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AGAR/MapServer",
            title: "AGAR",
            sublayers: [
                {
                  id: 0,
                  title: "AGAR Sample Points",
                  visible: false,
                },
            ]
        });

        impactLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IMPACT/MapServer",
            title: "Impact",
            sublayers: [
                {
                  id: 0,
                  title: "Disturbance sample sites",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Human Impact Sensitivity",
                  visible: false,
                },
            ]
        });

        var napLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NAP/MapServer",
            title: "NAP",
            sublayers: [
                {
                  id: 0,
                  title: "NZ Events 1968-2002",
                  visible: false,
                },
                {
                  id: 1,
                  title: "MDV_ASMA",
                  visible: false,
                },
                {
                  id: 2,
                  title: "Hillshade",
                  visible: false,
                },
            ]
        });

        nztabsLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NZTABS/MapServer",
            title: "nzTABS",
            sublayers: [
                {
                  id: 0,
                  title: "nzTABS Sample Sites",
                  visible: true,
                //   renderer: rendererToUse
                },
            ]
        });

        var sensitivityLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/SENSITIVITY/MapServer",
            title: "Sensitivity",
            sublayers: [
                {
                  id: 0,
                  title: "MDV_ASMA",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Hillshade",
                  visible: false,
                },
            ]
        });

        var terrestrialLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/TERRESTRIAL/MapServer",
            title: "Terrestrial",
            sublayers: [
                {
                  id: 0,
                  title: "Cyanobacterial Prediction",
                  visible: false,
                //   renderer: rendererToUse
                },
            ]
        });

        climateLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer",
            title: "Climate",
            sublayers: [
                {
                  id: 0,
                  title: "Summer high wind hotspots (>10ms)",
                  visible: false,
                },
                {
                  id: 1,
                  title: "Yearly high wind hotspots (>10ms)",
                  visible: false,
                },
                {
                  id: 2,
                  title: "5 Yr Summer mean wind speed",
                  visible: false,
                },
                {
                  id: 3,
                  title: "5 Yr Annual mean wind speed",
                  visible: false,
                },
                {
                  id: 4,
                  title: "5 Yr Summer max wind speed",
                  visible: false,
                },
                {
                  id: 5,
                  title: "5 Yr Annual max wind speed",
                  visible: false,
                },
            ]
        });

        map.add(abioticLayer);
        map.add(aquaticLayer);
        map.add(asmaLayer);
        map.add(agarLayer);
        map.add(impactLayer);
        map.add(napLayer);
        map.add(nztabsLayer);
        map.add(sensitivityLayer);
        map.add(terrestrialLayer);
        map.add(climateLayer);
        // widgets
        // compass
        var compass = new Compass({
            view: view
        });

        // adds the compass to the top left corner of the MapView
        view.ui.add(compass, "top-right");

        var scaleBar = new ScaleBar({
            view: view
        });

        view.ui.add(scaleBar, "bottom-right");
        

        // legend
        var legendList = new Legend ({
            view: view,
            container: document.createElement("div"),
            layerInfos: [
                {layer: abioticLayer,title: "Abiotic"},
                {layer: climateLayer,title: "Climate"},
                {layer: aquaticLayer,title: "Aquatic"},
                {layer: asmaLayer, title:"ASMA"},
                {layer: agarLayer, title:"AGAR"},
                {layer: impactLayer, title:"Impact"},
                {layer: napLayer, title:"NAP"},
                {layer: nztabsLayer, title:"nzTABS"},
                {layer: sensitivityLayer, title:"Sensitivity"},
                {layer: terrestrialLayer, title:"Terrestrial"},
            ]});
        
        var legendEx = new Expand({
            view: view,
            expandTooltip: "Legend",
            content: legendList.container,
            autoCollapse: false,
            expandIconClass: "esri-icon-collection"
        });
        
        view.ui.add(legendEx,{
            position: "top-right"
        
        });

        var layerList = new LayerList({
            container: document.createElement("div"),
            view: view
        });

        layerListExpand = new Expand({
            expandIconClass: "esri-icon-layer-list",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
            // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
            view: view,
            content: layerList.domNode
        });

        view.ui.add(layerListExpand, "top-right");

    });
})

$('.layer-toggle').click(function(){
    var id = $(this).attr('data-id');
    var layer = $(this).attr('data-layer');
    switch(layer){
        case 'aquatic':
        var sublayer = aquaticLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'climate':
        var sublayer = climateLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'impact':
        var sublayer = impactLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'agar':
        var sublayer = agarLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'nztabs':
        var sublayer = nztabsLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'abiotic':
        var sublayer = abioticLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

        case 'asma':
        var sublayer = asmaLayer.findSublayerById(parseInt(id));
        sublayer.visible = !sublayer.visible;
        break;

    }
    // console.log(id, layer)
});

$('.drop-down').click(function(){
    var target = $(this).attr('data-target');
    $('.'+target).toggleClass('hide');
});