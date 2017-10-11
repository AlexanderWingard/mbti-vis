function mbti_vis(svg_id, people) {
    var types = [[""],["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];

    var svg = d3
        .select(svg_id);
    var main = svg
        .append("g");

    var force = d3
        .layout
        .force()
        .nodes(people)
        .links([])
        .gravity(0)
        .on("tick", on_tick);

    var color = d3
        .scale
        .ordinal()
        .domain(["" ,"E", "I", "S", "N", "T", "F", "J", "P"])
        .range(["#ffffff",
                "#2c7fb8",
                "#7fcdbb",
                "#f03b20",
                "#feb24c",
                "#31a354",
                "#addd8e",
                "#c51b8a",
                "#fa9fb5"]);
    var sort = 1;
    var tree = d3
        .layout
        .tree()
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; })
        .sort(function(a, b) { return sort = sort * -1; });

    var person;
    var nodes;
    var links;

    var diagonal = d3
        .svg
        .diagonal
        .radial()
        .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    var shuffle = main
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", "-15")
        .text("shuffle")
        .on("click", on_update);

    var locate_node = function(friend, node) {
        if(node.children == undefined) {
            friend.tx = node.x;
            friend.ty = node.y;
            friend.x = friend.x || 0;
            friend.y = friend.y || 0;
            return;
        }
        for(var i = 0; i < node.children.length; i++) {
            if(friend.result.indexOf(node.children[i].name) > -1) {
                locate_node(friend, node.children[i]);
            }
        }
    };

    function shuffle_types() {
        types.shift();
        d3.shuffle(types);
        types.unshift([""]);
    }

    function generate_tree(types) {
        var elem = types[0];
        return elem ? elem.map(function(d) {
            return {"name": d, "children" : generate_tree(types.slice(1))};
        }) : [];
    }

    var update_tree = function() {
        sort = 1;
        nodes = tree.nodes(generate_tree(types)[0]);
        links = tree.links(nodes);
        people.forEach(function(d) { locate_node(d, nodes[0]); });
        force.start();
    };

    function on_tick(e) {
        var k = 0.1 * e.alpha;
        people.forEach(function(o, i) {
            o.y += (((o.ty + 35) * Math.sin((o.tx-90) / 180 * Math.PI)) - o.y) * k;
            o.x += (((o.ty + 35) * Math.cos((o.tx-90) / 180 * Math.PI)) - o.x) * k;
        });

        person.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    };

    function on_update() {
        shuffle_types();
        update_tree();
        on_resize();
    }

    var on_resize = function() {
        var rect = svg
            .node()
            .getBoundingClientRect();
        var diameter = Math.min(rect.height, rect.width);

        main
            .attr("transform", "translate(" + rect.width / 2 + "," + rect.height / 2 + ")");
        force
            .size([diameter, diameter]);
        tree
            .size([360, diameter / 2 - 120]);
        update_tree();

        var link = main.selectAll(".link")
            .data(links);
        var link_enter = link
            .enter()
            .append("path")
            .attr("class", "link");
        var link_update = link
            .attr("d", diagonal);

        var node = main.selectAll(".node")
            .data(nodes);
        var node_enter = node
            .enter()
            .append("g")
            .attr("class", "node");
        var node_update = node
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        node_enter
            .append("circle")
            .attr("r", 5);
        node
            .select("circle")
            .transition()
            .attr("fill", function(d) { return color(d.name); });

        node_enter
            .append("text")
            .attr("dy", ".31em")
            .attr("text-anchor", function(d) {
                return d.x < 180 ? "start" : "end";
            })
            .attr("transform", function(d) {
                return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
            });
        node
            .select("text")
            .text(function(d) { return d.name; });

        person = main.selectAll(".person")
            .data(people);
        var person_enter = person
            .enter()
            .append("g")
            .attr("class", "person")
            .call(force.drag);
        person_enter
            .append("circle")
            .attr("r", 10);

        person_enter
            .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "translate(0, 25)"; })
            .text(function(d) { return d.name; });

        force.start();
    };
    on_resize();
    window.addEventListener("resize", on_resize);
    return {force: force};
}

var people = [{name: "Alex", result: ["E", "N", "T", "P"]},
               {name: "Amanda", result: ["E", "N" , "T", "J"]},
               {name: "Andrej", result: ["I", "N" , "F", "P"]},
               {name: "André", result: ["I", "N" , "T", "J"]},
               {name: "Malin", result: ["E", "N" , "F", "P"]},
               {name: "Asik", result: ["E", "N" , "F", "P"]},
               {name: "Ini", result: ["E", "N" , "F", "P"]},
               {name: "Per", result: ["E", "N" , "F", "J"]},
               {name: "Pitura", result: ["E", "N" , "T", "J"]},
               {name: "Jocke", result: ["I", "N" , "T", "J"]},
               {name: "Ljungqvist", result: ["I", "N" , "T", "J"]},
               {name: "Lisa", result: ["I", "N" , "F", "J"]},
               {name: "Jeppe", result: ["E", "N" , "T", "P"]},
               {name: "Anna", result: ["E", "N" , "F", "J"]},
               {name: "Lars", result: ["I", "N" , "T", "P"]},
               {name: "Kerstin", result: ["E", "N" , "F", "J"]},
               {name: "Alicia", result: ["I", "S" , "F", "P"]},
               {name: "Pat", result: ["E", "N" , "T", "J"] },
               {name: "Monika", result: ["I", "N" , "T", "J"]},
               {name: "Jussi", result: ["E", "S" , "T", "J"]},
               {name: "Amanda 2", result: ["E", "S" , "F", "P"]}
              ];

var vis = mbti_vis("#mbti-vis", people);
