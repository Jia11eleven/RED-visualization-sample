(function (RED_viz) {
    'use strict';

    RED_viz.updateKPI = function (data) {
        if (!data || data.length === 0) {
            console.error("No valid data provided for KPI.");
            return;
        }

        // Group data by post type and sum likes/comments
        let aggregatedData = d3.rollup(data,
            v => ({
                total_comments: d3.sum(v, d => +d.comment_count_parsed),
                total_likes: d3.sum(v, d => +d.liked_count_parsed)
            }),
            d => d.post_type
        );

        // Compute the overall comment-like ratio for each post type
        let kpiData = Array.from(aggregatedData, ([post_type, values]) => ({
            post_type,
            comment_like_ratio: values.total_likes > 0 ? values.total_comments / values.total_likes : 0
        }));

        // Select KPI container
        var kpiContainer = d3.select("#like-comment-ratio");
        kpiContainer.html(""); // Clear previous content

        // Append Title
        kpiContainer.append("h3").text("Comment-to-Like Ratio by Post Type");

        // Append each KPI value
        kpiData.forEach(({ post_type, comment_like_ratio }) => {
            let displayText = post_type + ": " + comment_like_ratio.toFixed(2);
            kpiContainer.append("p").attr("class", "kpi-metric").text(displayText);
        });
    };

}(window.RED_viz = window.RED_viz || {}));