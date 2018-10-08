$(document).ready(function () {
    require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/FeatureLayer",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/widgets/LayerList",
        "esri/widgets/Compass",
        "dojo/domReady!"
        ], function(
            Map,
            SceneView,
            FeatureLayer,
            Legend,
            Expand,
            LayerList,
            Compass) {
        var map = new Map({
            basemap: "satellite",
            ground: "world-elevation"
        });
        var view = new SceneView({
            container: "map_canvas",  // Reference to the DOM node that will contain the view
            map: map,  // References the map object created in step 3
            center: [162, -77.5],
            zoom: 7,
        });
        // layers
        var asmaLayer = new FeatureLayer({
            url: "https://trugis.sci.waikato.ac.nz:6443/arcgis/rest/services/DRYVER/asma_aspa/MapServer/3",
            title: "ASMA Boundary"
        });
        map.add(asmaLayer);
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
                {layer: asmaLayer,title: "Boundary"},
                // {layer: aspaLayer,title: "Managed Zones"},
                // {layer: riverLayer,title: "DryVER River and Streams"},
                // {layer: nztabsLayer,title: "nzTABS Sample Sites"},
                // {layer: geochemLayer,title: "nzTABS Geochemistry"},
                // {layer: impactLayer,title: "DryVER Impact Sites"},
                // {layer: iirLayer,title: "DryVER Infiltration Impact Ratio"},
                // {layer: agarLayer,title: "AGAr Sample Sites"},
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