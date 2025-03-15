(function (RED_viz) {
    'use strict';
    
    async function loadDataAndInitialize() {
        try {
            // Wait for all data to be loaded simultaneously using Promise.all
            const [CleanedRaw, ChinaMap] = await Promise.all([
                d3.csv("data/cleaned_raw.csv"),  // Cleaned social media posts info
                d3.json("data/china_province_map.json"),  // Nobel winners data
            ]);

            // Call the ready function after all data is loaded
            ready(CleanedRaw, ChinaMap);
    
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }
    
    loadDataAndInitialize();

    function ready(CleanedRaw, ChinaMap){
        //STORE POSTS DATASET
        RED_viz.data.CleanedData = CleanedRaw;
        //MAKE FILTER AND ITS DIMENSIONS
        RED_viz.makeFilterAndDimensions(CleanedRaw);
        RED_viz.populateTagDropdown(); 
        //INITIALIZE MENU AND MAP
        RED_viz.initMenu();
        RED_viz.initMap(ChinaMap);
        //TRIGGER UPDATE WHEN FILTER SELECTED
        RED_viz.onDataChange();
    };
    

    
}(window.RED_viz = window.RED_viz || {}));