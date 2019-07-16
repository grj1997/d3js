<template>
    <div class="d3-me-tree">
    </div>
</template>
<!--d3MeTree-->
<script>
  import watermark from '../watermark'
  export default {
    props: {},

    components: {},

    data() {
      return {}
    },

    mounted() {
      this.init()
      watermark.init({
        watermark_alpha: .1,
        watermark_txt: "<img src='https://tpc.googlesyndication.com/simgad/2195620858670942281?sqp=4sqPyQQ7QjkqNxABHQAAtEIgASgBMAk4A0DwkwlYAWBfcAKAAQGIAQGdAQAAgD-oAQGwAYCt4gS4AV_FAS2ynT4&rs=AOga4qlZzv6sl1xcQutM8U8-4wPxCKKGHg'>" });
    },

    methods: {
      init() {
        let d3 = this.$d3
        let svgW = 800
        let svgH = 800
        // let centralPoint = { pX: svgW / 2, pY: svgH / 2 }
        let origin = {
          x: svgW / 2,
          y: 0,
          w: 145,
          h: 50,
          intervalW: 50,
          intervalH: 100
        }
        const SYMBOLA_S_R = 6 // 加减符号半径
        let zm
        let i = 0
        let hasChildNodeArr = []
        let duration = 750
        let tree = {
          name: '多彩宝',
          children: [
            {
              name: '一卡通公司'
            },
            {
              name: '一卡通公司2',
              children: [
                {
                  name: '小公司'
                },
                {
                  name: '小公司2'
                }
              ]
            },
            {
              name: '一卡通公司2333',
              children: [
                {
                  name: '小公司'
                },
                {
                  name: '小公司2'
                }
              ]
            },
            {
              name: '一卡通公司2222'
            }
          ],
          parents: [
            {
              name: '多彩贵州文化公司',
              children: [
                {
                  name: '发改委',
                  children: [
                    {
                      name: '123'
                    }
                  ]
                },
                {
                  name: '123发改委',
                  children: [
                    {
                      name: '123'
                    }
                  ]
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司',
              children: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '龙像创业投资',
              children: [
                {
                  name: '王林文'
                },
                {
                  name: '张一峰'
                },
                {
                  name: '侯其明'
                }
              ]
            }
          ]
        }
        tree.x0 = 0
        tree.y0 = 0
        tree.x = 0
        tree.y = 0
        let layoutTree = d3.layout.tree(tree).nodeSize([145 + origin.intervalW, origin.intervalH]);
        console.log(layoutTree)
        let diagonalUp = d3.svg.diagonal().projection(d => [d.x + (origin.w / 2), -d.y + (origin.h / 2)]); // 转换贝塞尔曲线
        let diagonalDown = d3.svg.diagonal().projection(d => [d.x + (origin.w / 2), d.y + (origin.h / 2)]); // 转换贝塞尔曲线
        let svg = d3.select("#app").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg').call(zm = d3.behavior.zoom().scaleExtent([1,5]).on("zoom", () => {
          svg.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
        })).append("g").attr('id', 'g').attr("transform", "translate(" + svgW / 2 + "," + svgH / 2 + ")");
        zm.translate([svgW / 2, svgH / 2]);
        let collapse = (d) => {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
            hasChildNodeArr.push(d);
          }
        }
        let upTree = null
        let downTree = null
        Object.keys(tree).map(item => {
          if (item === 'parents') {
            upTree = JSON.parse(JSON.stringify(tree))
            upTree.children = tree[item]
            upTree.parents = null
          } else if (item === 'children') {
            downTree = JSON.parse(JSON.stringify(tree))
            downTree.children = tree[item]
            downTree.parents = null
          }
        })
        let update = (source, showtype, sourceTree, paintingStatus) => { // paintingStatus true表示点击 绘画 反之是程序初始绘画
          let nodes = layoutTree.nodes(sourceTree).reverse()
            , links = layoutTree.links(nodes);
          console.log(nodes)
          nodes.forEach(function (d) {
            d.y = d.depth * origin.intervalH;
          });
          let node = svg.selectAll("g.node" + showtype)
            .data(nodes, d => d.id || (d.id = showtype + ++i));
          let nodeEnter = node.enter().append("g")
            .attr("class", "node" + showtype)
            .attr("transform", d => {
              console.log(d.parents === null)
              if (d.parents === null) {
                return showtype === 'up' ? "translate(" + source.x0 + "," + -(source.y0) + ")" : "translate(" + source.x0 + "," + source.y0 + ")"
              } else {
                return showtype === 'up' ? "translate(" + source.x0 + "," + -(source.y0 + origin.h / 2) + ")" : "translate(" + source.x0 + "," + source.y0 + ")"
              }
            })
            // .on("click", (d) => click(d, showtype, sourceTree, true))
          nodeEnter.append("rect")
            .attr("width", origin.w)
            .attr("height", origin.h)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
              return d._children ? "lightsteelblue" : "#fff";
            });
          nodeEnter.append('circle')
            .attr('r', 1e-6)
          nodeEnter.append("text")
            .attr("class", d => {
              if (!d.depth) {
                return 'proportion-hide'
              } else {
                return 'proportion'
              }
            })
            .attr("x", () => origin.w / 2 + origin.intervalW)
            .attr("y", () => showtype === 'up' ? (origin.w / 2) : - origin.w / 2)
            .attr("dy", () => showtype === 'up' ? 0 : origin.w / 2 - 10)
            .attr("text-anchor", function () {
              return 'middle';
            })
            .text(function (d) {
              return 123;
            })
            .style({
              'fill': "#337ab7",
              'font-size': 14,
              'cursor': "pointer"
            })
            .on('click', function () {
              alert(1);
              // window.open('http://www.baidu.com')
            });

          let text = nodeEnter.append("text")
            .attr("x", origin.w / 2)
            .attr("y", origin.h / 2)
            .attr("dy", d => (d.name.length > 9) ? '.05em' : '.35em')
            .attr("text-anchor", "middle")
            .text( d => (d.name.length > 9) ? d.name.substr(0, 9) : d.name);
          nodeEnter.append("text")
            .attr("x", origin.w / 2)
            .attr("y", origin.h / 2)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text( d => d.name.substr(9, d.name.length));

          // 绘制箭头
          nodeEnter.append("marker")
            .attr("id", showtype + "resolved")
            .attr("markerUnits", "strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
            .attr("markerUnits", "userSpaceOnUse")
            .attr("viewBox", "0 -5 10 10")//坐标系的区域
            // .attr("refX", () => showtype === 'up' ? origin.w / 6 - 50 : -origin.w / 6 + 20)//箭头坐标
            // .attr("refY", () => showtype === 'up' ? origin.h / 4 - 12 : -origin.h / 4 + 12)
            .attr("markerWidth", 12)//标识的大小
            .attr("markerHeight", 12)
            .attr("orient", '90')//绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr("stroke-width", 2)//箭头宽度
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")//箭头的路径
            .attr('fill', '#000000');//箭头颜色
          // 将节点转换到它们的新位置。
          let nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", d => {
              if (d.parents === null) {
                return showtype === 'up' ? "translate(" + d.x + "," + -(d.y) + ")" : "translate(" + d.x + "," + (d.y)+ ")"
              } else {
                return showtype === 'up' ? "translate(" + d.x + "," + -(d.y + origin.h / 2) + ")" : "translate(" + d.x + "," + (d.y + origin.h / 2 + 10)+ ")"
              }
            });

          // 加减
          nodeUpdate.select('circle')
            .attr('r', function (d) {
            if (d.depth) {
            if (hasChildNodeArr.indexOf(d) === -1) {
            return 0
            } else {
            return SYMBOLA_S_R
            }
            } else {
            return 0
            }
            // return d.depth ? d.parent.name === source.name ? 0 : SYMBOLA_S_R : 0; // 是1后的数据 并且拥有子集
            })
            .attr('cy', function (d) {
            return d.depth ? showtype === 'up' ? -SYMBOLA_S_R : origin.h + SYMBOLA_S_R : 0;
            })
            .attr('cx', function (d) {
            return d.depth ? origin.w / 2 : 0;
            })
            .attr('fill', function (d) {
            return d._children || d.children ? "#fff" : "";
            // if (d._children || d.children) { return "#fff"; } else { return "rgba(0,0,0,0)"; }
            })
            .attr('stroke', function (d) {
            return d._children || d.children ? "#8b4513" : "";
            // if (d._children || d.children) { return "#8b4513"; } else { return "rgba(0,0,0,0)"; }
            })
            .attr('fill-opacity', function (d) {
            if (d._children) { return 0.35; }
            })
            // Setting summary node style as class as mass style setting is
            // not compatible to circles.
            .attr('stroke-width', function (d) {
            if (d.repeated) { return 5; }
            });
          //代表是否展开的+-号
          nodeEnter.append("svg:text")
            .attr("class", "isExpand")
            .on('click', function (d) {
              console.log(this)
              click(d, showtype, sourceTree, true)
              setTimeout(() => {
                if ($(this).html() === '-') {
                  $(this).html('+')
                } else {
                  $(this).html('-')
                }
              }, duration)
            })
            .attr("x", d => d.depth ? origin.w / 2 : 0)
            .attr("dy", function (d) {
              return d.depth ? showtype === 'up' ? -SYMBOLA_S_R / 2  : origin.h + SYMBOLA_S_R * 2 : 0;
            })
            .attr("text-anchor", "middle")
            .style("fill", "#000")
            .text(function (d) {
              if (d.name == 'origin') {
                return '';
              }
              return hasChildNodeArr.indexOf(d) != -1 ? "+" : "";
              /* if (d._children || d.children) {
                  return "+";
              } */
            });

          nodeUpdate.select("rect")
            .attr("width", origin.w)
            .attr("height", origin.h)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", (d) => d._children ? "lightsteelblue" : "#fff");

          nodeUpdate.select("text")
            .style("fill-opacity", 1);

          // 将退出节点转换到父节点的新位置.
          let nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", () => showtype === 'up' ? "translate(" + source.x + "," + -(source.y + origin.h / 2) + ")" : "translate(" + source.x + "," + (parseInt(source.y) + origin.h / 2 + 10) + ")")
            .remove();

          nodeExit.select("rect")
            .attr("width", origin.w)
            .attr("height", origin.h)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

          nodeExit.select("text");

          // 修改线条
          let link = svg.selectAll("path.link" + showtype)
            .data(links, d => d.target.id);

          // 在父级前的位置画线。
          link.enter().insert("path", "g")
            .attr("class", "link" + showtype)
            .attr("x", origin.w / 2)
            .attr("y", origin.y - origin.h)
            .attr("marker-end", `url(#${showtype}resolved)`)//根据箭头标记的id号标记箭头
            .attr("stroke", "white")
            .style("fill-opacity", 1)
            .attr("d", d => {
              let o = {
                x: source.x0,
                y: source.y0
              };
              return showtype === 'up' ? diagonalUp({
                source: o,
                target: o
              }) : diagonalDown({
                source: o,
                target: o
              });
            });

          // 过渡更新位置.
          link.transition()
            .duration(duration)
            .attr("d", (d, i) => {
              return showtype === 'up' ? diagonalUp(d, i): diagonalDown(d, i)
            });

          // 将退出节点转换到父节点的新位置
          link.exit().transition()
            .duration(duration)
            .attr("d", d => {
              let o = {
                x: source.x,
                y: source.y
              };
              return showtype === 'up' ? diagonalUp({
                source: o,
                target: o
              }): diagonalDown({
                source: o,
                target: o
              });
            })
            .remove();

          // 隐藏旧位置方面过渡.
          nodes.forEach(d => { d.x0 = d.x;d.y0 = d.y});
        }
        let click = (d, showType, sourceTree, paintingStatus) => {
          if (d.depth) { // 不是起点才能点
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d, showType, sourceTree, paintingStatus)
          }
        }
        if (upTree) {
          upTree.children.forEach(collapse);
          update(upTree, 'up', upTree) // 上
        }
        if (downTree) {
          downTree.children.forEach(collapse);
          update(downTree, 'down', downTree) // 下
        }
      }
    }

  }
</script>

<style lang="scss">
    .d3-me-tree {
    }
    #g{
        .linkup, .linkdown {
            fill: none;
            stroke: #ccc;
            stroke-width: 1.5px;
        }
        #g_rects{
            rect{
                fill:white;
                stroke:steelblue;
                stroke-width:2px;
                width: 145px;
                height: 50px;
            }
        }
        #g_text {
            text{
                width: 145px;
            }
        }
    }
    #treesvg{
        display: block;
        margin: auto;
    }
    .proportion-hide{
        display: none;
    }
</style>
