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
      console.log(watermark)
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
        let zm
        let i = 0
        let duration = 750
        let layoutTree = d3.layout.tree().nodeSize([145 + origin.intervalW, origin.intervalH]);
        let diagonalUp = d3.svg.diagonal().projection(d => {
          // debugger
          // var r = d.y, a = (d.x - 90) / 180 * Math.PI;
          console.log([d.x + (origin.w / 2), -d.y + (origin.h / 2)])
          // return [r * Math.cos(a), r * Math.sin(a)];
          return [d.x + (origin.w / 2), -d.y + (origin.h / 2)]
        }); // 转换贝塞尔曲线
        let diagonalDown = d3.svg.diagonal().projection(d => [d.x + (origin.w / 2), d.y + (origin.h / 2)]); // 转换贝塞尔曲线
        let svg = d3.select("#app").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg').call(zm = d3.behavior.zoom().scaleExtent([1,5]).on("zoom", () => {
          svg.attr("transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");
        })).append("g").attr('id', 'g').attr("transform", "translate(" + svgW / 2 + "," + svgH / 2 + ")");
        zm.translate([svgW / 2, svgH / 2]);
        let tree = {
          name: '多彩宝',
          children: [
            {
              rank: 'p2',
              name: '一卡通公司'
            },
            {
              rank: 'p2',
              name: '一卡通公司2',
              children: [
                {
                  rank: 'p3',
                  name: '小公司'
                },
                {
                  rank: 'p3',
                  name: '小公司2'
                }
              ]
            },
            {
              rank: 'p2',
              name: '一卡通公司2333',
              children: [
                {
                  rank: 'p3',
                  name: '小公司'
                },
                {
                  rank: 'p3',
                  name: '小公司2'
                }
              ]
            },
            {
              rank: 'p2',
              name: '一卡通公司2222'
            }
          ],
          parents: [
            {
              name: '多彩贵州文化公司',
              isOpen: false,
              rank: 'p1',
              children: [
                {
                  rank: 'p2',
                  name: '发改委',
                  children: [
                    {
                      rank: 'p3',
                      name: '123'
                    }
                  ]
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司',
              rank: 'p1',
              isOpen: false,
              children: [
                {
                  rank: 'p2',
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司2222',
              rank: 'p1',
              isOpen: false,
              children: [
                {
                  rank: 'p2',
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司333',
              rank: 'p1',
              isOpen: false,
              children: [
                {
                  rank: 'p2',
                  name: '发改委333'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司444',
              rank: 'p1',
              isOpen: false,
              children: [
                {
                  rank: 'p2',
                  name: '发改委444'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司555',
              isOpen: false,
              rank: 'p1',
              children: [
                {
                  name: '发改委555'
                }
              ]
            },
            {
              name: '龙像创业投资',
              rank: 'p1',
              isOpen: false,
              children: [
                {
                  rank: 'p2',
                  name: '王林文'
                },
                {
                  rank: 'p2',
                  name: '张一峰'
                },
                {
                  rank: 'p2',
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
        let collapse = (d) => {
          if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
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
        let update = (source, showtype, sourceTree) => {
          let nodes = layoutTree.nodes(sourceTree).reverse()
            , links = layoutTree.links(nodes);
          nodes.forEach(function (d) {
            d.y = d.depth * origin.intervalH;
          });
          let node = svg.selectAll("g.node" + showtype)
            .data(nodes, d => d.id || (d.id = showtype + ++i));
          let nodeEnter = node.enter().append("g")
            .attr("class", "node" + showtype)
            .attr("transform", () => showtype === 'up' ? "translate(" + source.x0 + "," + -(source.y0) + ")" :  "translate(" + source.x0 + "," + source.y0 + ")")
            .on("click", (d) => click(d, showtype, sourceTree))
          nodeEnter.append("rect")
            .attr("width", origin.w)
            .attr("height", origin.h)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
              return d._children ? "lightsteelblue" : "#fff";
            });

          let text = nodeEnter.append("text")
            .attr("x", origin.w / 2)
            .attr("y", origin.h / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text( d => d.name);
          console.log(text)
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
            .attr("orient", 'auto')//绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr("stroke-width", 2)//箭头宽度
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")//箭头的路径
            .attr('fill', '#000000');//箭头颜色
          // 将节点转换到它们的新位置。
          let nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", d => showtype === 'up' ? "translate(" + d.x + "," + -d.y + ")" : "translate(" + d.x + "," + d.y+ ")");

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
            .attr("transform", () => showtype === 'up' ? "translate(" + source.x + "," + -(source.y) + ")" : "translate(" + source.x + "," + source.y + ")")
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
            .attr("y", origin.y / 2)
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
              // let x = d.target.parent.x + (origin.w / 2)
              // let y = d.target.parent.y + (origin.h / 2)
              // let x1 = d.target.x + (origin.w / 2)
              // let y1 = d.target.y - (origin.h / 2)
              // return showtype === 'up' ? `M${x},${y}C${x},${y1}, ${x1},${y} ${x1},${ -y1}` : diagonalDown({
              //     source: o,
              //     target: o
              //   });
            });

          // 过渡更新位置.
          link.transition()
            .duration(duration)
            .attr("d", (d, i) => {
              // console.log(d)
              // let x = d.target.parent.x + (origin.w / 2)
              // let y = d.target.parent.y + (origin.h / 2)
              // let x1 = d.target.x + (origin.w / 2)
              // let y1 = d.target.y - (origin.h / 2)
              // return showtype === 'up' ? `M${x},${y}C${x1},${y}, ${x},${y1} ${x1},${ -y1}` : diagonalDown(d, i)
              // return showtype === 'up' ? `M${x},${y}C${x},${y1}, ${x1},${y} ${x1},${ -y1}` : diagonalDown(d, i)
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
              // let x = d.target.parent.x + (origin.w / 2)
              // let y = d.target.parent.y + (origin.h / 2)
              // let x1 = d.target.x + (origin.w / 2)
              // let y1 = d.target.y - (origin.h / 2)
              // return showtype === 'up' ? `M${x},${y}C${x},${y1}, ${x1},${y} ${x1},${ -y1}` : diagonalDown({
              //   source: o,
              //   target: o
              // });
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
        let click = (d, showType, sourceTree) => {
          if (d.depth) { // 不是起点才能点
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d, showType, sourceTree)
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


        // d3.select("#g").append('g').attr('id','g_rects').selectAll('rect').data([tree]).enter().append('rect')
        //   .attr('name', tree.name)
        //   .attr('x', () => centralPoint.pX - (origin.w / 2))
        //   .attr('y', () => centralPoint.pY - (50 / 2))
        // d3.select("#g").append('g').attr('id','g_text').selectAll('text').data([tree]).enter().append('text')
        // let rank = 0
        // this.addRect({d3, rank: rank, arr: tree.parents, name: tree.name, origin, objType: 'parent'})
        // this.addRect({d3, rank: rank, arr: tree.children, name: tree.name, origin, objType: 'child'})
      },
      addRect(obj) {
        let { d3, rank, arr, name, origin, objType} = obj
        rank += 1
        let add = (data,type, index) => { // type left 表示往左边画 用- right 往右 用 +, objType parent 表示父级 向上走, child表示下级 往下走
          let _this = this
          let rect = d3.select("#g_rects").append('rect').data([data]);
          $(rect).data(data) // 往新增的rect插入data
          let text = d3.select("#g_text").append('text').append('tspan').data([data]);
          let rectPNode = $(`rect[name="${data.pNodeName}"]`)
          rect.attr('pName', data.pNodeName)
            .attr('rank', () => {
              if (objType === 'parent') {
                return 'p' + rank
              } else {
                return 'c' + rank
              }
            })
            .attr('name', thisRectSource => thisRectSource.name)
            .attr('x',() => {
              let value
              if (type === 'left') {
                value = Math.round(rectPNode.attr('x')) - origin.w * (index + 1) - origin.intervalW * (index + 1)
              } else if(type === 'right') {
                value = Math.round(rectPNode.attr('x')) + origin.w * (index + 1) + origin.intervalW * (index + 1)
              } else {
                value = parseInt(rectPNode.attr('x'))
              }
              return value
            })
            .attr('y',() => {
              let value
              if (objType === 'parent') {
                value = parseInt(rectPNode.attr('y')) - origin.intervalH - origin.h
              } else {
                value = parseInt(rectPNode.attr('y')) + origin.intervalH + origin.h
              }
              // if (type === 'left') {
              //   if (objType === 'parent') {
              //     value = parseInt(rectPNode.attr('y')) - origin.intervalH - origin.h
              //   }else {
              //     value = ''
              //   }
              // } else if(type === 'right') {
              //   if (objType === 'parent') {
              //     value = parseInt(rectPNode.attr('y')) - origin.intervalH - origin.h
              //   }else {
              //     value = ''
              //   }
              // } else {
              //   if (objType === 'parent') {
              //     value = parseInt(rectPNode.attr('y')) - origin.intervalH - origin.h
              //   }else {
              //     value = ''
              //   }
              // }
              return value
            })
          text.attr('pName', data.pNodeName)
            .attr('dy', '1em')
            .attr('name', thisRectSource => thisRectSource.name)
            .attr('x',() => {
              let value
              if (type === 'left') {
                value = Math.round(rectPNode.attr('x')) - origin.w * (index + 1) - origin.intervalW * (index + 1)
              } else if(type === 'right') {
                value = Math.round(rectPNode.attr('x')) + origin.w * (index + 1) + origin.intervalW * (index + 1)
              } else {
                value = parseInt(rectPNode.attr('x'))
              }
              return value
            })
            .attr('y',() => {
              let value
              if (objType === 'parent') {
                value = parseInt(rectPNode.attr('y')) - origin.intervalH - origin.h
              } else {
                value = parseInt(rectPNode.attr('y')) + origin.intervalH + origin.h
              }
              return value
            })
            .text(thisRectSource => thisRectSource.name)
          rect.on('click', function () {
            let thisData = $(this).data()
            if (!thisData.isOpen) {
              let _obj = {
                d3,
                rank,
                initialize: false,
                name: thisData.name,
                origin
              }
              if (objType === 'parent' && thisData.parents && thisData.parents.length) {
                thisData.isOpen = true
                console.log('打开')
                _this.addRect(Object.assign({arr: thisData.parents, objType: 'parent'}, _obj))
              } else if (objType === 'child' && thisData.children && thisData.children.length) {
                thisData.isOpen = true
                console.log('打开')
                _this.addRect(Object.assign({arr: thisData.children, objType: 'child'}, _obj))
              }
            } else {
              if ($(`rect[pName=${thisData.name}]`).length) {
                thisData.isOpen = false
                console.log('关闭')
              }
            }
          });
        }
        let addLeft = leftArr => {
          leftArr.map((item, index) => {
            add(Object.assign({pNodeName: name}, item), 'left', index)
          })
        }
        let addRight = rightArr => {
          rightArr.map((item, index) => {
            add(Object.assign({pNodeName: name}, item), 'right', index)
          })
        }
        let middle = item => {
          add(Object.assign({pNodeName: name}, item), 'middle')
        }
        // if (initialize) {
        if (arr.length % 2 === 1) { // 基数个
            let miaddleNum = Math.floor(arr.length / 2) // 数组中间的元素索引
            let leftArr = () => {
              let _arr = []
              for (let i = 0; i < miaddleNum; i++) {
                _arr.push(arr[i])
              }
              return _arr
            }
            addLeft(leftArr())
            let rightArr = () => {
              let _arr = []
              for (let i = miaddleNum + 1; i < arr.length; i++) {
                _arr.push(arr[i])
              }
              return _arr
            }
            middle(arr[miaddleNum])
            addRight(rightArr())
            // this.reposition(name)
          } else { // 偶数个
          let leftArr = () => {
              let _arr = []
              for (let i = 0; i < (arr.length / 2); i++) {
                _arr.push(arr[i])
              }
              return _arr
            }
          addLeft(leftArr())
          let rightArr = () => {
              let _arr = []
              for (let i = (arr.length /2); i < arr.length; i++) {
                _arr.push(arr[i])
              }
              return _arr
            }
          addRight(rightArr())
        }
        // }
      },
      removeRect(name) {
        console.log(name)
       console.log( $(`rect[name=${name}]`))
      }
    },

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
</style>