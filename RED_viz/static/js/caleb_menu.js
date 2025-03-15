(function(RED_viz) {
    'use strict';

    RED_viz.initMenu = function() {
        console.log("initMenu function is being called!");
        // Post Type Dropdown
        var postSelect = d3.select('#post-select select');
        postSelect.selectAll('option')
            .data(RED_viz.POST_TYPES)  // Remove extra array wrapper
            .enter()
            .append('option')
            .attr('value', d => d)
            .html(d => d);

        postSelect.on('change', function() {
            var PostType = d3.select(this).property('value');
            RED_viz.filterByTypes(PostType);
            RED_viz.onDataChange();
        });


        // Tag Dropdown
        var tagSelect = d3.select('#tag-select select');
        tagSelect.selectAll('option')
            .data(RED_viz.POPULAR_TAGS)  // Remove extra array wrapper
            .enter()
            .append('option')
            .attr('value', d => d)
            .html(d => d);

        tagSelect.on('change', function() {
            var tag = d3.select(this).property('value');
            RED_viz.filterByTags(tag);
            RED_viz.onDataChange();
        });

        // IP Dropdown
        var IPSelect = d3.select('#ip-select select');
        IPSelect.selectAll('option')
            .data(RED_viz.IP_GROUPS)  // Remove extra array wrapper
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);

        IPSelect.on('change', function() {
            var ip = d3.select(this).property('value');
            RED_viz.filterByIP(ip);
            RED_viz.onDataChange();
        });
    };

})(window.RED_viz = window.RED_viz || {});
