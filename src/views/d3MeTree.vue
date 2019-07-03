<template>
    <div class="d3-me-tree">
    </div>
</template>
<!--d3MeTree-->
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
        let d3 = this.$d3
        let svgW = 800
        let svgH = 800
        let centralPoint = { pX: svgW / 2, pY: svgH / 2 }
        let origin = {
          x: svgW / 2,
          y: 0,
          w: 145,
          h: 50,
          intervalW: 50,
          intervalH: 50
        }
        d3.select("#app").append("svg").attr("width", svgW).attr("height", svgH).attr('id','treesvg');
        let tree = {
          name: '多彩宝',
          isOpen: false,
          children: [
            {
              name: '一卡通公司'
            },
            {
              name: '一卡通公司2'
            },
            {
              name: '一卡通公司2333'
            },
            {
              name: '一卡通公司2222'
            }
          ],
          parents: [
            {
              name: '多彩贵州文化公司',
              isOpen: false,
              parents: [
                {
                  name: '发改委',
                  parents: [
                    {
                      name: '123'
                    }
                  ]
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司',
              isOpen: false,
              parents: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司2222',
              isOpen: false,
              parents: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司333',
              isOpen: false,
              parents: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司444',
              isOpen: false,
              parents: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司555',
              isOpen: false,
              parents: [
                {
                  name: '发改委'
                }
              ]
            },
            {
              name: '龙像创业投资',
              isOpen: false,
              parents: [
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
        d3.select("#treesvg").append('g').attr('id','g_rects').selectAll('rect').data([tree]).enter().append('rect')
          .attr('name', tree.name)
          .attr('x', () => centralPoint.pX - (origin.w / 2))
          .attr('y', () => centralPoint.pY - (50 / 2))
        d3.select("#treesvg").append('g').attr('id','g_text').selectAll('text').data([tree]).enter().append('text')
        this.addRect({d3, initialize: true, arr: tree.parents, name: tree.name, origin, objType: 'parent'})
        this.addRect({d3, initialize: true, arr: tree.children, name: tree.name, origin, objType: 'child'})

        // d3.select("#treesvg").append('g').attr('id','g_rects').selectAll('rect').data([tree]).enter()
        //   .append('rect')
        //   .attr('style', rectSource => {
        //     return `width:${rectSource.name.length * 20}px`
        //   })
        //   .attr('x',rectSource => {
        //   return origin.x + rectSource.name.length * 20 + origin.interval;}).attr('y',() => origin.y)
        //   .on('click',rectSource => {
        //     if (!rectSource.isOpen) {
        //       _this.addRect({d3, rectSource, origin})
        //     } else {
        //       _this.removeRect(rectSource.name)
        //     }
        //     rectSource.isOpen = !rectSource.isOpen
        //   });


        // let rects = d3.select("#g_rects").selectAll('rect').data(tree); // 矩形
        // rects.transition().duration(500).attr('x',function(d){
        //   console.log(d)
        //   return d.p.x;
        // }).attr('y',function(d){ return d.p.y;});
        // rects.enter().append('rect').attr('x',function(d){
        //   return d.f.p.x;
        // }).attr('y',function(d){ return d.f.p.y;})
        //   .on('click',function(d){return tree.addLeaf(d.v);})
        //   .transition().duration(500).attr('x',function(d){ return d.p.x;}).attr('y',function(d){ return d.p.y;});
      },
      addRect(obj) {
        let { d3, initialize, arr, name, origin, objType} = obj
        // let { d3, rectSource, origin} = obj
        let add = (data,type, index) => { // type left 表示往左边画 用- right 往右 用 +, objType parent 表示父级 向上走, child表示下级 往下走
          let rect = d3.select("#g_rects").append('rect').data([data]);
          let text = d3.select("#g_text").append('text').append('tspan').data([data]);
          let rectPNode = $(`rect[name="${data.pNodeName}"]`)
          rect.attr('pName', data.pNodeName)
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
          rect.on('click',thisRectSource => {
            if (thisRectSource.parents) {
              // this.addRect({d3, rectSource: thisRectSource.parents, origin})
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
        if (initialize) {
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
        }
      },
      reposition(name) {
        let node = $(`rect[pName=${name}]`)
        if (node.length % 2 === 1) { // 基数个
          let miaddleNum = Math.floor(node.length / 2) // 数组中间的元素索引

        }
        $(`rect[pName=${name}]`).each((index, item) => {
          console.log(item)
        })
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
    #treesvg{
        display: block;
        margin: auto;
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

</style>