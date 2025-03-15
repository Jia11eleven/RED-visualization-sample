(function(RED_viz){
    'user strict';
    RED_viz.data = {}; //our main data object
    RED_viz.activePostType = null;
    RED_viz.ALL_TAGS = 'All Tags';
    RED_viz.TRANS_DURATION = 2000; // length in ms for transitions
    RED_viz.MAX_CENTROID_RADIUS = 30;
    RED_viz.MIN_CENTROID_RADIUS = 2;
    RED_viz.COLORS = {palegold:'#E6BE8A'}
    RED_viz.POST_TYPES = ["Caleb Post","General Post"];
    RED_viz.POPULAR_TAGS = ["夏以昼","恋与深空","恋与深空夏以昼","夏以昼回航","夏以昼x你"]
    RED_viz.IP_GROUPS = [ '安徽','北京','重庆','福建','甘肃','广东','广西',
        '贵州','海南','河北','河南','黑龙江','辽宁','湖北','湖南',
        '吉林','江苏','江西','内蒙古','陕西','山东','山西','上海','四川', 
        '天津','新疆','云南','浙江','中国澳门', 
        '中国台湾',  '中国香港', '澳大利亚', '加拿大', '马来西亚','美国',
        '挪威', '日本','新加坡', '意大利','英国', 'Others']

    //see whether need to remove later 
    RED_viz.PostTypeFill = function(PostType){   //this is for color fill
        var i = RED_viz.POST_TYPES.indexOf(PostType);
        return d3.hcl(i/RED_viz.POST_TYPES.length * 360, 60, 70);
    };
    //end of attention section

    RED_viz.nestDataByType = function(entries) {
        RED_viz.data.nestedByType = d3.group(entries, d => d.post_type);
        return RED_viz.data.nestedByType;
    };
    

    RED_viz.makeFilterAndDimensions = function(CleanedRaw) {
        RED_viz.filter = crossfilter(CleanedRaw);

        RED_viz.TypeDim = RED_viz.filter.dimension(d => d.post_type);
        RED_viz.TagDim = RED_viz.filter.dimension(d => d.tags);
        RED_viz.IPDim = RED_viz.filter.dimension(d => d.ip_location);

        // Store cleaned dataset
        RED_viz.data.CleanedData = CleanedRaw;
    };

    RED_viz.filterByTypes = function(PostType) {
        console.log("Applying Post Type Filter:", PostType);
    
        // Check raw post types in data
        let uniqueTypes = [...new Set(RED_viz.data.CleanedData.map(d => d.post_type))];
        console.log("Unique Post Types in Data:", uniqueTypes);
    
        if (!PostType.length) {
            RED_viz.TypeDim.filterAll();  // Clear filter if empty
        } else {
            RED_viz.TypeDim.filter(type => PostType.includes(type));
        }
    
        // Check filtered results
        let filteredData = RED_viz.TypeDim.top(Infinity);
        console.log("Filtered Data Count:", filteredData.length);
        
        RED_viz.onDataChange();
    };


    RED_viz.filterByTags = function(selectedTags) {  
        if (!selectedTags.length || selectedTags.includes(RED_viz.ALL_TAGS)) {
            RED_viz.TagDim.filterAll();
        } else {
            RED_viz.TagDim.filter(function(postTags) {
                if (!postTags) return false; // Avoid errors if undefined/null
    
                // Remove square brackets and extra spaces, then split into an array
                let cleanedTags = postTags.replace(/^\[|\]$/g, '')  // Remove surrounding brackets
                                          .split(',')  // Split by comma
                                          .map(tag => tag.replace(/^['"]|['"]$/g, '').trim()); // Remove both ' and "
                return cleanedTags.some(tag => selectedTags.includes(tag));
            });
        }
        RED_viz.onDataChange();
    };
    
    


    RED_viz.filterByIP = function(selectedIP) {
        if (!selectedIP.length || selectedIP === "All IPs") {
            RED_viz.IPDim.filterAll();  // Reset filter when selecting "All IPs"
        } else {
            RED_viz.IPDim.filter(ip => ip === selectedIP);
        }
    };

    // Populate tag dropdown dynamically
    RED_viz.populateTagDropdown = function() {
        let dropdown = document.getElementById("tag-select");
        dropdown.innerHTML = "";  // Clear existing options

        // Add "All Tags" option
        let allOption = document.createElement("option");
        allOption.value = RED_viz.ALL_TAGS;
        allOption.textContent = "All Tags";
        dropdown.appendChild(allOption);

        // Add popular tags
        RED_viz.POPULAR_TAGS.forEach(tag => {
            let option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            dropdown.appendChild(option);
        });
    };

    RED_viz.populateIPDropdown = function() {
        let dropdown = document.getElementById("ip-select");
        dropdown.innerHTML = "";  // Clear existing options
    
        // Separate "Others" and sort the rest alphabetically
        let sortedIPs = RED_viz.IP_GROUPS.filter(ip => ip !== "Others")  // Remove "Others" before sorting
        sortedIPs.push("Others");  // Add "Others" at the end
    
    
        // Add "All IPs" option
        let allOption = document.createElement("option");
        allOption.value = "All IPs";
        allOption.textContent = "All IPs";
        dropdown.appendChild(allOption);
    
        // Populate sorted IP options
        sortedIPs.forEach(ip => {
            let option = document.createElement("option");
            option.value = ip;
            option.textContent = ip;
            dropdown.appendChild(option);
        });
    };
    

    document.addEventListener("DOMContentLoaded", function() {
        RED_viz.populateTagDropdown();
        RED_viz.populateIPDropdown();

        document.getElementById("tag-select").addEventListener("change", function() {
            let selectedTag = this.value;
            RED_viz.filterByTags(selectedTag === "All Tags" ? [] : [selectedTag]);
            RED_viz.onDataChange();
        });

        document.getElementById("ip-select").addEventListener("change", function() {
            let selectedIP = this.value;
            RED_viz.filterByIP(selectedIP);
            RED_viz.onDataChange();
        });
    });
        
    
    RED_viz.onDataChange = function(){
        var data = RED_viz.IPDim.top(Infinity);  // Always use the last dimension applied
        console.log("Filtered Data Count:", data.length);  // Debugging
        RED_viz.updateBarChart(data);
        RED_viz.updateList(data);
        RED_viz.updateMap(data);
        RED_viz.updateKPI(data);

    };
    
}(window.RED_viz = window.RED_viz || {}));