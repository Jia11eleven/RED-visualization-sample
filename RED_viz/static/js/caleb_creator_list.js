(function(RED_viz){
    'use strict';

    RED_viz.groupDataByCreator = function(data) {
        // Group data by user_id
        let groupedData = d3.rollup(data,
            v => ({
                total_likes: d3.sum(v, d => +d.liked_count_parsed),
                total_collects: d3.sum(v, d => +d.collected_count_parsed),
                total_comments: d3.sum(v, d => +d.comment_count_parsed),
                total_shares: d3.sum(v, d => +d.share_count_parsed),
                avg_likes: d3.mean(v, d => +d.liked_count_parsed),
                avg_collects: d3.mean(v, d => +d.collected_count_parsed),
                avg_comments: d3.mean(v, d => +d.comment_count_parsed),
                avg_shares: d3.mean(v, d => +d.share_count_parsed),
                post_count: v.length, // Counting posts per user
                nickname: v[0].nickname, // Assuming nickname remains constant per user
                ip_location: v[0].ip_location, // Assuming IP location remains constant per user
                posts: v
            }),
            d => d.user_id // Grouping by user_id
        );
    
        // Convert the Map into an array of objects
        let creatorData = Array.from(groupedData, ([user_id, values]) => ({
            user_id,
            post_count: values.post_count,
            nickname: values.nickname,
            ip_location: values.ip_location,
            total_likes: values.total_likes,
            total_collects: values.total_collects,
            total_comments: values.total_comments,
            total_shares: values.total_shares,
            avg_likes: values.avg_likes,
            avg_collects: values.avg_collects,
            avg_comments: values.avg_comments,
            avg_shares: values.avg_shares,
            posts: values.posts || []
        }));
    
        // Sort by avg_likes in descending order
        creatorData.sort((a, b) => b.avg_likes - a.avg_likes);
        return creatorData.slice(0, 15);
    }

    RED_viz.updateList = function(data) {
        
        //sort the creator's data by popularity
        var CreatorData = RED_viz.groupDataByCreator(data)
        
        var rows = d3.select('#creator-list tbody')
                 .selectAll('tr')
                 .data(CreatorData);

        // Fade out excess rows over 2 seconds
        rows.exit()
            .transition().duration(RED_viz.TRANS_DURATION)
            .style('opacity', 0)
            .remove();


        var rowsEnter = rows.enter().append('tr')
                            .on('click', function(event, d) {
                                RED_viz.displayCreator(d);
                            });
        var rows = rowsEnter.merge(rows)
        rows.html(function(d) {
            return `<td>${d.nickname}</td><td>${d.ip_location}</td>`; 
        });
        
        var cells = rows.selectAll('td')
                    .data(function(d) {
                        return [d.nickname, d.ip_location];
                    });
        cells.exit().remove();

        // Append new cells (for any missing ones)
        var cellsEnter = cells.enter().append('td')
            .text(d => d);

        var cells = cellsEnter.merge(cells);
        cells.exit().remove();

        //display a random winner if there is one or more
        if (CreatorData.length){
            let randomCreator = CreatorData[Math.floor(Math.random() * CreatorData.length)];
            RED_viz.displayCreator(randomCreator);
        }
    };

    RED_viz.displayCreator = function(data){
        var pc=d3.select('#popular-creator');
        pc.select('#user-name').text(data.nickname);

        let mostPopularPost = data.posts.reduce((max, post) => 
            +post.liked_count_parsed > +max.liked_count_parsed ? post : max, data.posts[0]);

        pc.selectAll('.property span')
          .text(function() {
            var property = d3.select(this).attr('name');  // Get 'name' attribute
            return mostPopularPost[property];  // Use corresponding value or fallback
        });

        // Update Post Link
        pc.select("#link a")
        .attr('href', mostPopularPost.note_url || "#")
        .text(mostPopularPost.note_url ? "Click to go to the post" : "No link available");
    };



}(window.RED_viz = window.RED_viz|| {}));