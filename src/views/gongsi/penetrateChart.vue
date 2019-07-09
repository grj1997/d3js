<template>
    <div class="penetrate-chart">
    </div>
</template>
<!--股权穿透图-->
<script>
  import watermark from '../../common/watermark'
  export default {
    props: {},

    components: {},

    data () {
      return {}
    },

    mounted () {
      this.init()
      watermark.init({
        watermark_alpha: 1,
        zIndex: 1,
        watermark_cols: 3,
        watermark_rows: 2,
        watermark_x_space: 80,
        watermark_y_space: 100,
        watermark_width: 115,
        watermark_height: 75,
        watermark_parent_node: document.getElementById('app'),
        watermark_txt: `<div style="width: 230px;height: 150px;background: url('${require('@/assets/images/watermark.png')}'); background-size: 100%; 100%"></div>`
      });
    },

    methods: {
      init () {
        let d3 = this.$d3
        let svgW = document.body.clientWidth
        let svgH = document.body.clientHeight
        // 方块形状
        let diamonds = {
          x: svgW / 2,
          y: 0,
          w: 145,
          h: 68,
          intervalW: 50,
          intervalH: 150
        }
        // 源头对象
        let originDiamonds = {
          w: 190
        }
        // 加减符号半径
        const SYMBOLA_S_R = 9
        // 公司
        const COMPANY = 0
        // 人
        const PERSON = 1
        let zm
        let i = 0
        let hasChildNodeArr = []
        // 过渡时间
        let duration = 0
        let layoutTree = d3.layout.tree().nodeSize([145 + diamonds.intervalW, diamonds.intervalH]);
        // 转换贝塞尔曲线
        let diagonalUp = d3.svg.diagonal().projection(d => [d.x, -d.y]);
        let diagonalDown = d3.svg.diagonal().projection(d => {
          return [d.x, d.y]
        });
        // 主图
        let svg = d3.select('#app').append('svg').attr('width', svgW).attr('height', svgH).attr('id', 'treesvg').call(zm = d3.behavior.zoom().scaleExtent([1, 5]).on('zoom', () => {
          svg.attr('transform',
            'translate(' + d3.event.translate + ')' +
          ' scale(' + d3.event.scale + ')');
        })).attr('style', 'position: relative;z-index: 2;').append('g').attr('id', 'g').attr('transform', 'translate(' + (svgW / 2 - 80) + ',' + (svgH / 2 - 20) + ')');
        zm.translate([svgW / 2, svgH / 2]);
        let tree = { // 0 公司 1 人
          name: '多彩宝',
          children: [
            {
              name: '一卡通公司',
              type: 0
            },
            {
              name: '一卡通公司2',
              type: 0,
              children: [
                {
                  name: '小公司',
                  type: 0,
                  children: [
                    {
                      name: '小小小',
                      type: 0,
                      children: [
                        {
                          type: 1,
                          name: '笑小下'
                        }
                      ]
                    }
                  ]
                },
                {
                  type: 0,
                  name: '小公司2'
                }
              ]
            },
            {
              name: '一卡通公司2333',
              type: 0,
              children: [
                {
                  type: 0,
                  name: '小公司'
                },
                {
                  type: 0,
                  name: '小公司2'
                }
              ]
            },
            {
              type: 0,
              name: '一卡通公司2222'
            }
          ],
          parents: [
            {
              name: '多彩贵州文化公司',
              type: 0,
              children: [
                {
                  name: '发改委',
                  type: 0,
                  money: '780万元',
                  children: [
                    {
                      type: 0,
                      money: '780万元',
                      name: '123'
                    }
                  ]
                },
                {
                  name: '123发改委',
                  money: '780万元',
                  type: 0,
                  children: [
                    {
                      money: '780万元',
                      type: 0,
                      name: '123'
                    }
                  ]
                }
              ]
            },
            {
              name: '多彩贵州网有限责任公司',
              money: '780万元',
              type: 0,
              children: [
                {
                  type: 0,
                  money: '780万元',
                  name: '发改委'
                }
              ]
            },
            {
              name: '龙像创业投资',
              money: '780万元',
              type: 0,
              children: [
                {
                  type: 1,
                  money: '780万元',
                  name: '王林文'
                },
                {
                  type: 1,
                  money: '780万元',
                  name: '张一峰'
                },
                {
                  type: 1,
                  money: '780万元',
                  name: '侯其明'
                }
              ]
            }
          ]
        }
        let upTree = null
        let downTree = null
        tree.x0 = 0
        tree.y0 = 0
        tree.x = 0
        tree.y = 0
        // 拷贝到_children 隐藏1排以后的树
        let collapse = (source) => {
          if (source.children) {
            source._children = source.children;
            source._children.forEach(collapse);
            source.children = null;
            hasChildNodeArr.push(source);
          }
        }
        // 拷贝树的数据
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
        /*
        *[update 函数描述], [click 函数描述]
        *  @param  {[Object]} source 第一次是初始源对象，后面是点击的对象
        *  @param  {[String]} showtype up表示向上 down表示向下
        *  @param  {[Object]} sourceTree 初始源对象
        */
        let update = (source, showtype, sourceTree) => { // paintingStatus true表示点击 绘画 反之是程序初始绘画
          if (source.parents === null) {
            source.isOpen = !source.isOpen
          }
          let nodes = layoutTree.nodes(sourceTree).reverse()
          let links = layoutTree.links(nodes);

          nodes.forEach(function (d) {
            d.y = d.depth * diamonds.intervalH;
          });

          let node = svg.selectAll('g.node' + showtype)
            .data(nodes, d => d.id || (d.id = showtype + ++i));

          let nodeEnter = node.enter().append('g')
            .attr('class', d => showtype === 'up' && !d.depth ? 'hide-node' : 'node' + showtype)
            .attr('transform', () => showtype === 'up' ? 'translate(' + source.x0 + ',' + -(source.y0) + ')' : 'translate(' + source.x0 + ',' + source.y0 + ')')

          // 创建矩形
          nodeEnter.append('rect')
            .attr('width', d => {
              return d.depth ? diamonds.w : originDiamonds.w
            })
            .attr('height', d => {
              return d.depth ? (d.type === COMPANY ? diamonds.h : diamonds.h - 10) : 30
            })
            .attr('x', d => d.depth ? -diamonds.w / 2 : -originDiamonds.w / 2)
            .attr('y', d => d.depth ? showtype === 'up' ? -diamonds.h / 2 : 0 : -15)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .attr('ry', 5)
            .style('fill', d => {
              if (d.type === COMPANY) {
                return d._children ? '#FFF1D7' : (d.depth ? '#fff' : '#FD7D00')
              } else if (d.type === PERSON) {
                return d._children ? '#fff' : (d.depth ? '#fff' : '#7A9EFF')
              }
            });

          // 创建圆
          nodeEnter.append('circle')
            .attr('r', 1e-6)

          // 持股比例
          nodeEnter.append('g')
            .attr('transform', d => 'translate(0,0)')
            .append('text')
            .attr('class', d => {
              if (!d.depth) {
                return 'proportion-hide'
              } else {
                return 'proportion'
              }
            })
            .attr('x', d => d.x > 0 ? (showtype === 'up' ? -30 : 30) : 30)
            .attr('y', showtype === 'up' ? diamonds.h : -20)
            .attr('text-anchor', 'middle')
            .text(d => 123)
            .style({
              'fill': d => {
                if (d.type === COMPANY) {
                  return '#FFA809'
                } else if (d.type === PERSON) {
                  return '#337ab7'
                }
              },
              'font-size': 14,
              'cursor': 'pointer'
            });

          // 公司名称
          // y轴 否表源头的字体距离
          nodeEnter.append('text')
            .attr('x', 0)
            .attr('y', showtype === 'up' ? -diamonds.h / 2 : 0)
            .attr('dy', d => d.depth ? '2em' : '.5em')
            .attr('text-anchor', 'middle')
            .text(d => (d.name.length > 9) ? d.name.substr(0, 9) : d.name)
            .style({
              'font-size': '12px',
              'font-family': 'PingFangSC-Medium',
              'font-weight': '500',
              'fill': d => d.depth ? '#465166' : '#FFFFFF'
            });

          // 名称过长 第二段
          nodeEnter.append('text')
            .attr('x', 0)
            .attr('y', showtype === 'up' ? -diamonds.h / 2 : 0)
            .attr('dy', d => d.depth ? '3.5em' : '.5em')
            .attr('text-anchor', 'middle')
            .text(d => d.name.substr(9, d.name.length))
            .style({
              'font-size': '12px',
              'font-family': 'PingFangSC-Medium',
              'font-weight': '500',
              'fill': d => d.depth ? '#465166' : '#FFFFFF'
            });

          // 认缴金额
          nodeEnter.append('text')
            .attr('x', 0)
            .attr('y', showtype === 'up' ? -diamonds.h / 2 : 0)
            .attr('dy', d => d.name.substr(9, d.name.length).length ? '5em' : '4em')
            .attr('text-anchor', 'middle')
            .text(d => d.money)
            .style({
              'font-size': '12px',
              'font-family': 'PingFangSC-Medium',
              'font-weight': '500',
              'fill': d => d.depth ? '#465166' : '#FFFFFF'
            })

          // 绘制箭头
          /*
          * @param  {string} markerUnits [设置为strokeWidth箭头会随着线的粗细发生变化]
          * @param {string} viewBox 坐标系的区域
          * @param {number} markerWidth,markerHeight 标识的大小
          * @param {string} orient 绘制方向，可设定为：auto（自动确认方向）和 角度值
          * @param {number} stroke-width 箭头宽度
          * @param {string} d 箭头的路径
          * @param {string} fill 箭头颜色
          *
          */
          nodeEnter.append('marker')
            .attr('id', showtype + 'resolved')
            .attr('markerUnits', 'strokeWidth')
            .attr('markerUnits', 'userSpaceOnUse')
            .attr('viewBox', '0 -5 10 10')
            .attr('markerWidth', 12)
            .attr('markerHeight', 12)
            .attr('orient', '90')
            .attr('stroke-width', 2)
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#FD7D00');

          // 将节点转换到它们的新位置。
          let nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + (d.y) + ')');

          // 加减
          nodeUpdate.select('circle')
            .attr('r', (d) => d.depth ? (hasChildNodeArr.indexOf(d) === -1 ? 0 : SYMBOLA_S_R) : 0)
            .attr('cy', d => d.depth ? showtype === 'up' ? -(SYMBOLA_S_R + diamonds.h / 2) : diamonds.h + SYMBOLA_S_R : 0)
            .attr('cx', 0)
            .attr('fill', d => d._children || d.children ? '#fff' : '')
            .attr('stroke', d => d._children || d.children ? '#FD7D00' : '');

          // 代表是否展开的+-号,function this指向当前dom
          nodeEnter.append('svg:text')
            .attr('class', 'isExpand')
            .on('click', function (d) {
              click(d, showtype, sourceTree)
              setTimeout(() => {
                if (this.innerHTML === '-') {
                  d.isOpen = false
                  this.innerHTML = '+'
                } else {
                  d.isOpen = true
                  this.innerHTML = '-'
                }
              }, duration)
            })
            .attr('x', 0)
            .attr('dy', d => d.depth ? (showtype === 'up' ? -(SYMBOLA_S_R / 2 + diamonds.h / 2) : diamonds.h + SYMBOLA_S_R + 4) : 0)
            .attr('text-anchor', 'middle')
            .style('fill', '#FD7D00')
            .text(d => hasChildNodeArr.indexOf(d) !== -1 ? (source.depth && d.isOpen ? '-' : '+') : '');

          // 矩形
          nodeUpdate.select('rect')
            .attr('width', d => {
              return d.depth ? diamonds.w : originDiamonds.w
            })
            .attr('height', d => {
              return d.depth ? (d.type === COMPANY ? diamonds.h : diamonds.h - 10) : 30
            })
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .style('fill', d => {
              if (d.type === COMPANY || !d.depth) {
                return d._children ? '#FFF1D7' : (d.depth ? '#fff' : '#FD7D00')
              } else if (d.type === PERSON) {
                return d._children ? '#fff' : (d.depth ? '#fff' : '#7A9EFF')
              }
            })
            .style('stroke', d => {
              if (d.type === COMPANY || !source.depth) {
                return '#FD7D00'
              } else {
                return '#7A9EFF'
              }
            });

          // 将退出节点转换到父节点的新位置.
          let nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', () => showtype === 'up' ? 'translate(' + source.x + ',' + -(source.y) + ')' : 'translate(' + source.x + ',' + (parseInt(source.y)) + ')')
            .remove();

          nodeExit.select('rect')
            .attr('width', diamonds.w)
            .attr('height', diamonds.h)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

          // 修改线条
          let link = svg.selectAll('path.link' + showtype)
            .data(links, d => d.target.id);

          // 在父级前的位置画线。
          link.enter().insert('path', 'g')
            .attr('class', 'link' + showtype)
            .attr('marker-end', `url(#${showtype}resolved)`)// 根据箭头标记的id号标记箭头
            .attr('stroke', d => {
              if (d.target.type === COMPANY) {
                return '#FD7D00'
              } else {
                return '#7A9EFF'
              }
            })
            .style('fill-opacity', 1)
            .attr('d', () => {
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
            .attr('d', (d, i) => {
              return showtype === 'up' ? diagonalUp(d, i) : diagonalDown(d, i)
            });

          // 将退出节点转换到父节点的新位置
          link.exit().transition()
            .duration(duration)
            .attr('d', () => {
              let o = {
                x: source.x,
                y: source.y
              };
              return showtype === 'up' ? diagonalUp({
                source: o,
                target: o
              }) : diagonalDown({
                source: o,
                target: o
              });
            }).remove();

          // 隐藏旧位置方面过渡.
          nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y });
        };
        let click = (source, showType, sourceTree) => {
          if (source.depth) { // 不是起点才能点
            if (source.children) {
              source._children = source.children;
              source.children = null;
            } else {
              source.children = source._children;
              source._children = null;
            }
            update(source, showType, sourceTree)
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
    .penetrate-chart {
    }
    #treesvg{
      display: block;
      margin: auto;
      #g{
        .linkup, .linkdown {
          fill: none;
          /*stroke: #FD7D00;*/
          stroke-width: 1px;
        }
        #g_rects{
          rect{
            fill:white;
            stroke:rgba(255,241,215,1);
            stroke-width:2px;
            background:rgba(255,241,215,1);
            border-radius:4px;
            border:1px solid rgba(253,125,0,1);
          }
        }
        #g_text {
          text{
            width: 145px;
          }
        }
      }
      .proportion-hide, .hide-node{
        display: none;
      }
    }
</style>
