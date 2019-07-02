<template>
    <div class="d3">
        1231
    </div>
</template>
<!--d3-->
<script>
  let margin = {top: 30, right: 20, bottom: 30, left: 20}
  let width = 960
  let barHeight = 20
  let barWidth = (width - margin.left - margin.right) * 0.8;
  let i = 0
  let duration = 400
  let root;
  let diagonal
  let svg
  let d3
  export default {
    props: {},

    components: {},

    data() {
      return {}
    },
    created() {
      d3 = this.$d3
      diagonal = d3.linkHorizontal()
        .x(function(d) { return d.y; })
        .y(function(d) { return d.x; });
      svg = d3.select("#app").append("svg")
        .attr("width", width) // + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    },
    mounted() {

      this.init()
    },

    methods: {
      init() {
        let json = require('../assets/flare.json')
        console.log(json)
        root = d3.hierarchy(json);
        root.x0 = 0;
        root.y0 = 0;
        this.update(d3);
      },
      update(source) {
        console.log(source)
        // Compute the flattened node list.
        let nodes = root.descendants();

        let height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

        d3.select("svg").transition()
          .duration(duration)
          .attr("height", height);

        d3.select(self.frameElement).transition()
          .duration(duration)
          .style("height", height + "px");

        // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
        let index = -1;
        root.eachBefore(function(n) {
          n.x = ++index * barHeight;
          n.y = n.depth * 20;
        });

        // Update the nodes…
        let node = svg.selectAll(".node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });
        let nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function() { return "translate(" + 100 + "," + 500 + ")"; })
          .style("opacity", 0);

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect")
          .attr("y", -barHeight / 2)
          .attr("height", barHeight)
          .attr("width", barWidth)
          .style("fill", this.color)
          .on("click", this.click);

        nodeEnter.append("text")
          .attr("dy", 3.5)
          .attr("dx", 5.5)
          .text(function(d) { return d.data.name; });

        // Transition nodes to their new position.
        nodeEnter.transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .style("opacity", 1);

        node.transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
          .style("opacity", 1)
          .select("rect")
          .style("fill", this.color);

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
          .duration(duration)
          .attr("transform", function() { return "translate(" + source.y + "," + source.x + ")"; })
          .style("opacity", 0)
          .remove();

        // Update the links…
        let link = svg.selectAll(".link")
          .data(root.links(), function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", function() {
            let o = {x: 0, y: 0};
            return diagonal({source: o, target: o});
          })
          .transition()
          .duration(duration)
          .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
          .duration(duration)
          .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(duration)
          .attr("d", function() {
            let o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          })
          .remove();

        // Stash the old positions for transition.
        root.each(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      },
      color(d) {
        return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
      },
      click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        this.update(d);
      }
    }

  }
</script>

<style lang="scss">
    .node rect {
        cursor: pointer;
        fill: #fff;
        fill-opacity: 0.5;
        stroke: #3182bd;
        stroke-width: 1.5px;
    }

    .node text {
        font: 10px sans-serif;
        pointer-events: none;
    }

    .link {
        fill: none;
        stroke: #9ecae1;
        stroke-width: 1.5px;
    }
    .d3 {

    }
</style>