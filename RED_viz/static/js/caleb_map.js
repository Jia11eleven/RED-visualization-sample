(function(RED_viz) {
    'use strict';

    RED_viz.IP_TO_PROVINCE = {
        "北京": "Beijing",
        "天津": "Tianjin",
        "上海": "Shanghai",
        "重庆": "Chongqing",
        "河北": "Hebei",
        "山西": "Shanxi",
        "辽宁": "Liaoning",
        "吉林": "Jilin",
        "黑龙江": "Heilongjiang",
        "江苏": "Jiangsu",
        "浙江": "Zhejiang",
        "安徽": "Anhui",
        "福建": "Fujian",
        "江西": "Jiangxi",
        "山东": "Shandong",
        "河南": "Henan",
        "湖北": "Hubei",
        "湖南": "Hunan",
        "广东": "Guangdong",
        "广西": "Guangxi",
        "海南": "Hainan",
        "四川": "Sichuan",
        "贵州": "Guizhou",
        "云南": "Yunnan",
        "陕西": "Shaanxi",
        "甘肃": "Gansu",
        "青海": "Qinghai",
        "宁夏": "Ningxia",
        "新疆": "Xinjiang",
        "内蒙古": "Inner Mongolia",
        "西藏": "Tibet"
    };
    
    // DIMENSIONS AND SVG
    var mapContainer = d3.select('#creator-map');
    var boundingRect = mapContainer.node().getBoundingClientRect();
    var width = boundingRect.width;
    var height = boundingRect.height;

    var svg = mapContainer.append('svg');

    //OUR CHOSEN PROJECTION
    var projection = d3.geoEquirectangular()
                           .scale(1.05 * Math.min(width, height))
                           .center([104,35])
                           .translate([width/2,height/2])
                           .precision(.1);
    
    //CREATE PATH WITH PROJECTION
    var path = d3.geoPath()
                     .projection(projection); //generate d attribute in SVG
    

    //INITIAL MAP CREATION, USING DOWNLOADED MAP DATA
    RED_viz.initMap = function(ChinaMap) {
        // Extract province features from TopoJSON
        var provinces = ChinaMap.features;

        // Ensure SVG and projection are used from global scope (defined earlier)
        var svg = d3.select("#creator-map svg"); // Select the existing SVG

        // Add province paths
        var provinceGroup = svg.append("g").attr("class", "province");

        provinceGroup.selectAll("path")
            .data(provinces)
            .enter().append("path")
            .attr("class", "province-path")
            .attr("d", path);  // Use the global path variable  
    };


    //DRAW MAP ON DATA LOAD
    let tooltip = d3.select("#map-tooltip");
    RED_viz.groupDataByIP = function(data) {
        let groupedData = d3.rollups(
            data,
            v => v.length,  // Count the number of posts (or creators)
            d => d.ip_location_grouped // Group by IP address
        );
        return new Map(groupedData);
    };


    RED_viz.updateMap = function(data) {
        if (!data || data.length === 0) {
            console.error("No valid data provided for updateMap.");
            return;
        }
    
        // Group Data by IP
        let groupedData = d3.rollup(data, v => v.length, d => d.ip_location);
    
        // Store non-mappable IPs
        let nonMappedIPs = [];
    
        // Define a color scale for creator counts
        let maxCount = d3.max([...groupedData.values()]);  // Get the highest creator count
        let colorScale = d3.scaleSequential(d3.interpolateBlues)
                           .domain([0, maxCount || 1]);  // Avoid domain issues if maxCount is 0
    
        // Update Map Colors Based on Creator Count
        d3.selectAll(".province-path")
            .transition()
            .duration(1000)
            .style("fill", function(d) {
                let provinceName = d.properties.NAME_1; // English province name from TopoJSON
                let matchedIP = Object.entries(RED_viz.IP_TO_PROVINCE).find(([ip, prov]) => prov === provinceName);
                
                if (!matchedIP) return "#dcdcdc"; // Default color for unmatched provinces
    
                let creatorCount = groupedData.get(matchedIP[0]) || 0;
                return creatorCount > 0 ? colorScale(creatorCount) : "#dcdcdc";
            });

            d3.selectAll(".province-path")
        .on("mouseover", function(event, d) {
            let provinceNameEN = d.properties.NAME_1;  // English name
            let provinceNameCN = d.properties.NL_NAME_1 
            let matchedIP = Object.keys(RED_viz.IP_TO_PROVINCE).find(ip => RED_viz.IP_TO_PROVINCE[ip] === provinceNameEN);
            let creatorCount = groupedData.get(matchedIP) || 0;

            // Get mouse position
            let mouseX = event.pageX;
            let mouseY = event.pageY;

            // Adjust position dynamically to prevent overflow
            let tooltipWidth = 120; // Approximate width of the tooltip
            let tooltipHeight = 50; // Approximate height
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;

            let leftPos = mouseX - 0;
            let topPos = mouseY + 0;

            if (mouseX + tooltipWidth > windowWidth) {
                leftPos = mouseX - tooltipWidth; // Move left if close to edge
            }
            if (mouseY + tooltipHeight > windowHeight) {
                topPos = mouseY - tooltipHeight; // Move up if close to bottom
            }

            // Show Tooltip
            tooltip.style("visibility", "visible")
                .html(`<strong>${provinceNameCN}</strong><br>Posts: ${creatorCount}`)
                .style("left", `${leftPos}px`)
                .style("top", `${topPos}px`);})
                .on("mousemove", function(event) {
                    let mouseX = event.pageX;
                    let mouseY = event.pageY;

                    let tooltipWidth = 120; 
                    let tooltipHeight = 50;
                    let windowWidth = window.innerWidth;
                    let windowHeight = window.innerHeight;

                    let leftPos = mouseX - 0;
                    let topPos = mouseY + 0;

                    if (mouseX + tooltipWidth > windowWidth) {
                        leftPos = mouseX - tooltipWidth ;
                    }
                    if (mouseY + tooltipHeight > windowHeight) {
                        topPos = mouseY - tooltipHeight ;
                    }

                    tooltip.style("left", `${leftPos}px`)
                        .style("top", `${topPos}px`);
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });
        
        // Collect non-mapped IPs
        groupedData.forEach((count, ip) => {
            if (!RED_viz.IP_TO_PROVINCE[ip]) {
                nonMappedIPs.push({ ip, count });
            }
        });

        nonMappedIPs.sort((a, b) => b.count - a.count);
    
        // Update Text Box with Non-Mapped IPs
        var nonMappedContainer = d3.select("#non-mapped-ips");
        nonMappedContainer.html(""); // Clear previous content
    
        nonMappedContainer.append("h3").text("Non-Mapped IPs");
    
        if (nonMappedIPs.length > 0) {
            nonMappedIPs.forEach(({ ip, count }) => {
                nonMappedContainer.append("p").text(`${ip}: ${count}`);
            });
        } else {
            nonMappedContainer.append("p").text("All IPs are mapped.");
        }
    };
    
    
}(window.RED_viz = window.RED_viz || {}));