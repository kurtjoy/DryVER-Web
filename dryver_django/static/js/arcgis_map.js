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
            Compass) {
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
        // var asmaLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/asma_aspa/MapServer/3",
        //     title: "ASMA Boundary"
        // });

        var abioticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer",
            title: "Abiotic",
        });

        var aquaticLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AQUATIC/MapServer",
            title: "Aquatic",
        });

        var asmaLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer",
            title: "ASMA",
        });

        var agarLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AGAR/MapServer",
            title: "AGAR",
        });

        var impactLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IMPACT/MapServer",
            title: "Impact",
        });

        var napLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NAP/MapServer",
            title: "NAP",
        });

        var nztabsLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/NZTABS/MapServer",
            title: "NZTABS",
        });

        var sensitivityLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/SENSITIVITY/MapServer",
            title: "Sensitivity",
        });

        var terrestrialLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/TERRESTRIAL/MapServer",
            title: "Terrestrial",
        });

        // var landcareLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/0",
        //     title: "LANDCARE Soils",
        //     visible: false,
        // });

        // var linzLakesLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/1",
        //     title: "LINZ Lakes",
        //     visible: false,
        // });

        // var GNSiceLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/2",
        //     title: "GNS Ice",
        //     visible: false,
        // });

        // var GNSgeologyLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/3",
        //     title: "GNS Geology",
        //     visible: false,
        // });

        // var AspectLayer = new ImageryLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/4",
        //     title: "Aspect",
        //     visible: false,
        // });

        // var SlopeLayer = new ImageryLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/5",
        //     title: "Slope",
        //     visible: false,
        // });

        // var MDV_ASMALayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/6",
        //     title: "MDV_ASMA",
        //     // visible: false,
        // });

        // var hillshadeLayer = new ImageryLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ABIOTIC/MapServer/7",
        //     title: "Hillshade",
        //     visible: false,
        // });

        // var agarSamplePointsLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AGAR/MapServer/0",
        //     title: "AGAR Sample Points",
        //     visible: false,
        // });

        // var aquaticConnectivityLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/AQUATIC/MapServer/0",
        //     title: "Aquatic Connectivity",
        //     visible: false,
        // });

        // var mdvAsmaLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/ASMA/MapServer/0",
        //     title: "MDV_ASPA_MERGE",
        // });

        var climateLayer = new MapImageLayer({
            url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer",
            title: "Climate",
            visible: false,
        });

        // var summerHighWindHotspotLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer/0",
        //     title: "Summer high wind hotspots",
        //     visible: false,
        // });

        // var yearlyHighWindHotspotLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer/1",
        //     title: "Yearly high wind hotspots",
        //     visible: false,
        // });

        // var yearlyHighWindHotspotLayer = new ImageryLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/CLIMATE/MapServer/2",
        //     title: "Yearly high wind hotspots",
        //     visible: false,
        // });

        // var aspaLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/asma_aspa/MapServer/2",
        //     title: "Managed Zones",
        //     popupTemplate: aspaTemp,
        // });

        // var nztabsLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/point_data/MapServer/2",
        //     title: "nzTABS Sites",
        //     id: "nztabsData",
        //     popupTemplate: nztabsTemp,
        //     //featureReduction: "selection",
        //     visible: false,
        //     renderer: green
        // });

        // var agarLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/point_data/MapServer/1",
        //     title: "AGAr Samples",
        //     id: "agarData",
        //     popupTemplate: agarTemp,
        //     visible: false,
        //     renderer: yellow
        // });

        // var impactLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/point_data/MapServer/3",
        //     title: "DryVER Impact Sites",
        //     id: "impactData",
        //     visible: false,
        //     renderer: blue
        // });

        // var iirLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IIR/MapServer/1",
        //     title: "DryVER nfiltration Impact Ratio",
        //     id: "iirData",
        //     visible: false
        // });

        // var riverLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/IIR/MapServer/0",
        //     title: "DryVER River Classification",
        //     id: "riverData",
        //     visible: false
        // });

        // var geochemLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/point_data/MapServer/4",
        //     title: "nzTABS Geochemistry",
        //     id: "geochemData",
        //     popupTemplate: geochemTemp,
        //     visible: false,
        //      //featureReduction: "selection",
        //     //renderer: renderer
        // });

        // var geologyLayer = new FeatureLayer({
        //     url: "https://trugis.sci.waikato.ac.nz/arcgis/rest/services/DRYVER/point_data/MapServer/5",
        //     title: "GNS Geology",
        //     id: "gns",
        //     visible: false,
        //     opacity: 0.4,
        //     popupTemplate: geolTemp,
        //     minScale: 400000
        // });

        // map.add(asmaLayer);
        map.add(abioticLayer);
        map.add(aquaticLayer);
        map.add(asmaLayer);
        map.add(agarLayer);
        map.add(impactLayer);
        map.add(napLayer);
        map.add(nztabsLayer);
        map.add(sensitivityLayer);
        map.add(terrestrialLayer);
        // map.add(landcareLayer);
        // map.add(linzLakesLayer);
        // map.add(GNSiceLayer);
        // map.add(GNSgeologyLayer);
        // map.add(AspectLayer);
        // map.add(SlopeLayer);
        // map.add(MDV_ASMALayer);
        // map.add(hillshadeLayer);
        // map.add(agarSamplePointsLayer);
        map.add(climateLayer);
        // map.add(aquaticConnectivityLayer);
        // map.add(mdvAsmaLayer);
        // map.add(summerHighWindHotspotLayer);
        // map.add(yearlyHighWindHotspotLayer);
        // map.add(aspaLayer);
        // map.add(nztabsLayer);
        // map.add(agarLayer);
        // map.add(impactLayer);
        // map.add(iirLayer);
        // map.add(riverLayer);
        // map.add(geochemLayer);
        // map.add(geologyLayer);
        // widgets
        // compass
        var compass = new Compass({
            view: view
        });

        // adds the compass to the top left corner of the MapView
        view.ui.add(compass, "top-right");
        

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
                {layer: nztabsLayer, title:"NzTabs"},
                {layer: sensitivityLayer, title:"Sensitivity"},
                {layer: terrestrialLayer, title:"Terrestrial"},
                // {layer: landcareLayer, title: "LANDCARE Soils"},
                // {layer: linzLakesLayer, title: "LINZ Lakes"},
                // {layer: GNSiceLayer, title: "GNS Ice"},
                // {layer: GNSgeologyLayer, title: "GNS Geology"},
                // {layer: AspectLayer, title: "Aspect"},
                // {layer: SlopeLayer, title: "Slope"},
                // {layer: MDV_ASMALayer, title: "MDV_ASMA"},
                // {layer: hillshadeLayer, title: "Hillshade"},
                // {layer: agarSamplePointsLayer, title: "AGAR Sample Points"},
                // {layer: aquaticConnectivityLayer, title: "Aquatic Connectivity"},
                // {layer: mdvAsmaLayer, title: "MDV_ASPA_MERGE"},
                // {layer: summerHighWindHotspotLayer, title: "Summer high wind hotspots"},
                // {layer: yearlyHighWindHotspotLayer, title: "Yearly high wind hotspots"},
                // {layer: aspaLayer,title: "Managed Zones"},
                // {layer: riverLayer,title: "DryVER River and Streams"},
                // {layer: nztabsLayer,title: "nzTABS Sample Sites"},
                // {layer: geochemLayer,title: "nzTABS Geochemistry"},
                // {layer: impactLayer,title: "DryVER Impact Sites"},
                // {layer: iirLayer,title: "DryVER Infiltration Impact Ratio"},
                // {layer: agarLayer,title: "AGAr Sample Sites"},
                // {layer: geologyLayer,title: "Dryver Geology Layer"},
                // {layer: eventLayer,title: "Prior NZ events"}
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