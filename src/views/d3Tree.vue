<template>
    <div class="d3-tree">
        12
    </div>
</template>
<!--d3Tree-->
<script>
  export default {
    props: {},

    components: {},

    data() {
      return {}
    },

    mounted() {
      this.init()
    },

    methods: {
      init() {
        let svgW=958, svgH =460, vRad=12, tree={cx:300, cy:30, w:400, h:70};
        let d3 = this.$d3
        tree.vis={v:0, l:'我', p:{x:tree.cx, y:tree.cy},c:[]}; // c 子集
        tree.size=1;
        tree.glabels =[];
        // tree.incMatx =[];
        tree.incX=500, tree.incY=30, tree.incS=20;
        tree.getVertices =  function(){
          let v =[];
          function getVertices(t,f){
            v.push({v:t.v, l:t.l, p:t.p, f:f});
            t.c.forEach(function(d){ return getVertices(d,{v:t.v, p:t.p}); });
          }
          getVertices(tree.vis,{});
          return v.sort(function(a,b){ return a.v - b.v;});
        }

        tree.getEdges =  function(){
          let e =[];
          function getEdges(_){
            _.c.forEach(function(d){
              e.push({v1:_.v, l1:_.l, p1:_.p, v2:d.v, l2:d.l, p2:d.p});
            });
            _.c.forEach(getEdges);
          }
          getEdges(tree.vis);
          return e.sort(function(a,b){ return a.v2 - b.v2;});
        }

        tree.addLeaf = function(_){
          function addLeaf(t){
            if(t.v==_){ t.c.push({v:tree.size++, l:'?', p:{},c:[]}); return; }
            t.c.forEach(addLeaf);
          }
          addLeaf(tree.vis);
          reposition(tree.vis);
          if(tree.glabels.length != 0){
            tree.glabels =[]
            relabel(
              {
                lbl:d3.range(0, tree.size).map(function(){ return '?';})
              });
            d3.select("#labelnav").style('visibility','hidden');
          }
          redraw();
        }

        tree.gracefulLabels = function(){
          tree.glabels =[];
          let v = tree.getVertices();
          let vlbls =[], elbls=[];
          let gracefulLbl = function(c){
            if(c == tree.size) {
              let lbl = {lbl:vlbls.map(function(_){return _;}) };
              relabel(lbl);
              return;
            }
            d3.range(0, tree.size)
              .filter(function(d){ return (vlbls.indexOf(d) ==-1) &&(elbls.indexOf(Math.abs(vlbls[v[c].f.v] - d)) == -1);})
              .forEach(function(d){
                vlbls[c]=d;
                elbls[c]=Math.abs(vlbls[v[c].f.v] - d);
                gracefulLbl(c+1);
                delete vlbls[c];
                delete elbls[c];
              });
          }
          d3.range(0, tree.size).forEach(function(d){ vlbls =[d]; elbls=[]; gracefulLbl(1); });
          tree.showLabel(1);
          d3.select("#labelpos").text(tree.currLbl+'/'+tree.glabels.length);
          d3.select("#labelnav").style('visibility','visible');
        }

        tree.showLabel = function(i){
          if(i >tree.glabels.length || i < 1){ alert('invalid label position'); return; }

          relabel(tree.glabels[i-1]);
          redraw();
          tree.currLbl = i;
          d3.select("#labelpos").text(tree.currLbl+'/'+tree.glabels.length);
        }

        let relabel = function(lbl){
          function relbl(t){	t.l=lbl.lbl[t.v];	t.c.forEach(relbl);		}
          relbl(tree.vis);
          // tree.incMatx = lbl.incMatx;
        }
        let rectNum = 0
        let diagonal = d3.linkHorizontal().x(function(d) { return d.y; })
          .y(function(d) { return d.x; });
        let redraw = function(){

          // let edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges()); // 线条
          // edges.transition().duration(500)
          //   .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
          //   .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;})
          // edges.enter().append('line')
          //   .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
          //   .attr('x2',function(d){ return d.p1.x;}).attr('y2',function(d){ return d.p1.y;})
          //   .transition().duration(500)
          //   .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});
          let edges = d3.select("#g_lines").selectAll('path').data(tree.getEdges()); // 线条
          edges.transition().duration(500)
            .attr('d', function (d) {
              return `M${d.p1.x},${d.p1.y}Q${d.p2.x + 100},${d.p2.y},${d.p1.x - 100 },${d.p1.y + 100}`
            })
          edges.enter().append('path')
            .attr('d', function (d) {
              return `M${d.p1.x},${d.p1.y}Q${d.p2.x + 100},${d.p2.y},${d.p1.x - 100 },${d.p1.y + 100}`
            })
            .transition().duration(500)
            .attr('d', function (d) {
              return `M${d.p1.x},${d.p1.y}Q${d.p2.x + 100},${d.p2.y},${d.p1.x - 100 },${d.p1.y + 100}`
            })
          let rects = d3.select("#g_rects").selectAll('rect').data(tree.getVertices()); // 矩形
          rects.transition().duration(500).attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y;});
          rectNum += 1
          console.log('--------------', JSON.stringify(tree.getVertices()))
          rects.enter().append('rect').attr('x',function(d){
            return d.f.p.x;
          }).attr('y',function(d){ return d.f.p.y;}).attr('r',vRad).attr('id', 'rect' + rectNum)
            .on('click',function(d){ console.log(d);return tree.addLeaf(d.v);})
            .transition().duration(500).attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y;});

          let labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices()); // 文本域
          labels.text(function(d){return d.l;}).transition().duration(500)
            .attr('x',function(d){ return d.p.x + 25;}).attr('y',function(d){ return d.p.y+30;}).attr('id',  'text' + rectNum);

          labels.enter().append('text').attr('x',function(d){ return d.f.p.x + 25;}).attr('y',function(d){ return d.f.p.y+30;})
            .text(function(d){return d.l;}).on('click',function(d){return tree.addLeaf(d.v);})
            .transition().duration(500)
            .attr('x',function(d){ return d.p.x + 25;}).attr('y',function(d){ return d.p.y+ 30;});

          let elabels = d3.select("#g_elabels").selectAll('text').data(tree.getEdges());

          elabels
            .attr('x',function(d){
              return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);
            }).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
            .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});

          elabels.enter().append('text')
            .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
            .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});
        }

        let getLeafCount = function(_){
          if(_.c.length ==0) return 1;
          else return _.c.map(getLeafCount).reduce(function(a,b){ return a+b;});
        }

        let reposition = function(v){
          let lC = getLeafCount(v), left=v.p.x - tree.w*(lC-1)/2;
          v.c.forEach(function(d){
            let w =tree.w*getLeafCount(d);
            left+=w;
            d.p = {x:left-(w+tree.w)/2, y:v.p.y+tree.h};
            reposition(d);
          });
        }

        let initialize = function(){
          d3.select("#labelnav").append("text").text('').attr('id','labelpos');

          d3.select("#labelnav").append("button").attr('type','button').text('>').attr('id','nextlabel')
            .on('click',function(){return tree.showLabel(tree.currLbl == tree.glabels.length? 1: tree.currLbl+1);});

          d3.select("#app").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg');

          d3.select("#treesvg").append('g').attr('id','g_lines').selectAll('line').data(tree.getEdges()).enter().append('line')
            .attr('x1',function(d){ return d.p1.x;}).attr('y1',function(d){ return d.p1.y;})
            .attr('x2',function(d){ return d.p2.x;}).attr('y2',function(d){ return d.p2.y;});
          console.log(tree.getVertices())
          d3.select("#treesvg").append('g').attr('id','g_rects').selectAll('rect').data(tree.getVertices()).enter()
            .append('rect').attr('cx',function(d){
            return d.p.x;}).attr('cy',function(d){ return d.p.y;})
            // .on('click',function(d){return tree.addLeaf(d.v);});

          d3.select("#treesvg").append('g').attr('id','g_labels').selectAll('text').data(tree.getVertices()).enter().append('text')
            .attr('x',function(d){ return d.p.x + 25;}).attr('y',function(d){ return d.p.y+ 30;}).text(function(d){return d.l;})
            .on('click',function(d){return tree.addLeaf(d.v);});

          d3.select("#treesvg").append('g').attr('id','g_elabels').selectAll('text').data(tree.getEdges()).enter().append('text')
            .attr('x',function(d){ return (d.p1.x+d.p2.x)/2+(d.p1.x < d.p2.x? 8: -8);}).attr('y',function(d){ return (d.p1.y+d.p2.y)/2;})
            .text(function(d){return tree.glabels.length==0? '': Math.abs(d.l1 -d.l2);});
          tree.addLeaf(0);
          tree.addLeaf(0);
        }
        initialize();

        return tree;
      }
    }

  }
</script>

<style lang="scss">
    .d3-tree {
    }
    body{
        width:960px;
        margin:10px auto;
    }
    rect{
        fill:white;
        stroke:steelblue;
        stroke-width:2px;
        width: 50px;
        height: 50px;
    }
    line{
        stroke:grey;
        stroke-width:3px;
    }
    path{
        fill: none;
        stroke: #9ecae1;
        stroke-width: 1.5px;
    }
    .incRect{
        stroke:grey;
        shape-rendering:crispEdges;
    }
    #incMatx text{
        text-anchor:middle;
        cursor:default;
    }
    #treesvg g text:hover, #treesvg g rect:hover{
        cursor:pointer;
    }
    #treesvg{
        border:1px solid grey;
    }
    #labelpos{
        color:white;
    }
    #g_labels text{
        text-anchor:middle;
    }
    #g_elabels text{
        text-anchor:middle;
        fill:red;
        font-weight:bold;
    }
</style>