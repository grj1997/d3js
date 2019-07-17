<template>
    <div class="penetrate-chart">
        <div class="bt-group">
            <button class="save" @click="saveImg">保存</button>
            <button class="reset" @click="resetSvg">重置</button>
        </div>
    </div>
</template>
<!--股权穿透图-->
<script>
  // 过渡时间
  const DURATION = 0
  // 加减符号半径
  const SYMBOLA_S_R = 9
  // 公司
  const COMPANY = 0
  // 人
  const PERSON = 1
  export default {
    props: {},

    components: {},

    data () {
      return {
        layoutTree: '',
        diamonds: '',
        d3: this.$d3,
        i: 0,
        hasChildNodeArr: [],
        originDiamonds: '',
        diagonalUp: '',
        diagonalDown: '',
        tree: {"name":"多彩宝","children":[{"name":"一卡通公司","type":0},{"name":"一卡通公司2","type":0,"children":[{"name":"小公司","type":0,"children":[{"name":"小小小","type":0,"children":[{"type":1,"name":"笑小下"}]}]},{"type":0,"name":"小公司2"}]},{"name":"一卡通公司2333","type":0,"children":[{"type":0,"name":"小公司"},{"type":0,"name":"小公司2"}]},{"type":0,"name":"一卡通公司2222"}],"parents":[{"name":"多彩贵州文化公司","type":0,"children":[{"name":"发改委","type":0,"money":"780万元","children":[{"type":0,"money":"780万元","name":"123"}]},{"name":"123发改委","money":"780万元","type":0,"children":[{"money":"780万元","type":0,"name":"123"}]}]},{"name":"多彩贵州网有限责任公司","money":"780万元","type":0,"children":[{"type":0,"money":"780万元","name":"发改委"}]},{"name":"龙像创业投资","money":"780万元","type":0,"children":[{"type":1,"money":"780万元","name":"王林文"},{"type":1,"money":"780万元","name":"张一峰"},{"type":1,"money":"780万元","name":"侯其明"}]}]},
        rootUp: '',
        rootDown: '',
        svg: ''
      }
    },

    mounted () {
      this.init()
    },

    methods: {
      init () {
        let d3 = this.d3
        let svgW = document.body.clientWidth
        let svgH = 300
        // 方块形状
        this.diamonds = {
          w: 145,
          h: 68,
          intervalW: 200,
          intervalH: 150
        }
        // 源头对象
        this.originDiamonds = {
          w: 190
        }
        this.layoutTree = d3.tree().nodeSize([this.diamonds.intervalW, this.diamonds.intervalH]).separation(() => 1);
        // 主图
        this.svg = d3.select('#app').append('svg').attr('width', svgW).attr('height', svgH).attr('id', 'treesvg')
          .call(d3.zoom().scaleExtent([0, 5]).on('zoom', () => {
            // 设置缩放位置以及平移初始位置
            this.svg.attr('transform', d3.event.transform.translate(svgW / 2, svgH / 2));
          }))
          .attr('style', 'position: relative;z-index: 2;')
          .append('g').attr('id', 'g').attr('transform', 'translate(' + (svgW / 2) + ',' + (svgH / 2) + ')');
        let upTree = null
        let downTree = null
        // 拷贝树的数据
        Object.keys(this.tree).map(item => {
          if (item === 'parents') {
            upTree = JSON.parse(JSON.stringify(this.tree))
            upTree.children = this.tree[item]
            upTree.parents = null
          } else if (item === 'children') {
            downTree = JSON.parse(JSON.stringify(this.tree))
            downTree.children = this.tree[item]
            downTree.parents = null
          }
        })
        // hierarchy 返回新的结构 x0,y0初始化起点坐标
        this.rootUp = d3.hierarchy(upTree, d => d.children);
        this.rootUp.x0 = 0
        this.rootUp.y0 = 0

        this.rootDown = d3.hierarchy(downTree, d => d.children);
        this.rootDown.x0 = 0
        this.rootDown.y0 = 0;
        // 上 和 下 结构
        let treeArr = [
          {
            data: this.rootUp,
            type: 'up'
          },
          {
            data: this.rootDown,
            type: 'down'
          }
        ]
        treeArr.map(item => {
          item.data.children.forEach(this.collapse);
          this.update(item.data, item.type, item.data)
        })
      },

      /*
       *[update 函数描述], [click 函数描述]
       *  @param  {[Object]} source 第一次是初始源对象，后面是点击的对象
       *  @param  {[String]} showtype up表示向上 down表示向下
       *  @param  {[Object]} sourceTree 初始源对象
       */
      update (source, showtype, sourceTree) {
        let _this = this
        if (source.parents === null) {
          source.isOpen = !source.isOpen
        }
        let nodes
        if (showtype === 'up') {
          nodes = this.layoutTree(this.rootUp).descendants()
        } else {
          nodes = this.layoutTree(this.rootDown).descendants()
        }
        let links = nodes.slice(1);
        nodes.forEach(d => {
          d.y = d.depth * this.diamonds.intervalH;
        });

        let node = this.svg.selectAll('g.node' + showtype)
          .data(nodes, d => d.id || (d.id = showtype + ++this.i));

        let nodeEnter = node.enter().append('g')
          .attr('class', d => showtype === 'up' && !d.depth ? 'hide-node' : 'node' + showtype)
          .attr('transform', d => {
            return showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + d.y + ')'
          })

        // 创建矩形
        nodeEnter.append('rect')
          .attr('type', d => d.id)
          .attr('width', d => d.depth ? this.diamonds.w : this.originDiamonds.w)
          .attr('height', d => d.depth ? (d.type === COMPANY ? this.diamonds.h : this.diamonds.h - 10) : 30)
          .attr('x', d => d.depth ? -this.diamonds.w / 2 : -this.originDiamonds.w / 2)
          .attr('y', d => d.depth ? showtype === 'up' ? -this.diamonds.h / 2 : 0 : -15)
          .attr('stroke', d => d.data.type === COMPANY || !d.depth ? '#FD7D00' : '#7A9EFF')
          .attr('stroke-width', 1)
          .attr('rx', 5)
          .attr('ry', 5)
          .style('fill', d => {
            if (d.data.type === COMPANY || !d.depth) {
              return d._children ? '#FFF1D7' : (d.depth ? '#fff' : '#FD7D00')
            } else if (d.data.type === PERSON) {
              return d._children ? '#fff' : (d.depth ? '#fff' : '#7A9EFF')
            }
          });

        // 创建圆 加减
        nodeEnter.append('circle')
          .attr('type', d => d.id || (d.id = showtype + 'text' + ++this.i))
          .attr('r', (d) => d.depth ? (this.hasChildNodeArr.indexOf(d) === -1 ? 0 : SYMBOLA_S_R) : 0)
          .attr('cy', d => d.depth ? showtype === 'up' ? -(SYMBOLA_S_R + this.diamonds.h / 2) : this.diamonds.h : 0)
          .attr('cx', 0)
          .attr('fill', d => d.children ? '#fff' : '#FD7D00')
          .attr('stroke', d => d._children || d.children ? '#FD7D00' : '')
          .on('click', function (d) {
            _this.click(d, showtype, sourceTree)
            setTimeout(() => {
              if (document.querySelector(`text[type="${d.id}"]`).innerHTML === '-') {
                d.isOpen = false
                this.innerHTML = '+'
                this.setAttribute('fill', '#FD7D00')
                document.querySelector(`text[type="${d.id}"]`).setAttribute('fill', '#fff')
                document.querySelector(`rect[type="${d.id}"]`).setAttribute('style', 'fill:#FFF1D7')
                document.querySelector(`text[type="${d.id}"]`).innerHTML = '+'
              } else {
                d.isOpen = true
                this.setAttribute('fill', '#fff')
                document.querySelector(`text[type="${d.id}"]`).setAttribute('fill', '#FD7D00')
                document.querySelector(`rect[type="${d.id}"]`).setAttribute('style', 'fill:#fff')
                document.querySelector(`text[type="${d.id}"]`).innerHTML = '-'
              }
            }, DURATION)
          });

        // 持股比例
        nodeEnter.append('g')
          .attr('transform', () => 'translate(0,0)')
          .append('text')
          .attr('class', d => !d.depth ? 'proportion-hide' : 'proportion')
          .attr('x', d => d.x > 0 ? (showtype === 'up' ? -30 : 30) : 30)
          .attr('y', showtype === 'up' ? this.diamonds.h : -20)
          .attr('text-anchor', 'middle')
          .attr('fill', d => d.data.type === COMPANY ? '#FD7D00' : '#7A9EFF')
          .text(d => '30%');

        // 公司名称
        // y轴 否表源头的字体距离
        nodeEnter.append('text')
          .attr('class', 'text-style-name')
          .attr('x', 0)
          .attr('y', showtype === 'up' ? -this.diamonds.h / 2 : 0)
          .attr('dy', d => d.depth ? (d.data.name.length > 9 ? '1.5em' : '2em') : '.3em')
          .attr('text-anchor', 'middle')
          .attr('fill', d => d.depth ? '#465166' : '#fff')
          .text(d => (d.data.name.length > 9) ? d.data.name.substr(0, 9) : d.data.name);

        // 名称过长 第二段
        nodeEnter.append('text')
          .attr('class', 'text-style-name')
          .attr('x', 0)
          .attr('y', showtype === 'up' ? -this.diamonds.h / 2 : 0)
          .attr('dy', d => d.depth ? '3em' : '.3em')
          .attr('text-anchor', 'middle')
          .attr('fill', d => d.depth ? '#465166' : '#fff')
          .text(d => d.data.name.substr(9, d.data.name.length));

        // 认缴金额
        nodeEnter.append('text')
          .attr('class', 'text-style-money')
          .attr('x', 0)
          .attr('y', showtype === 'up' ? -this.diamonds.h / 2 : 0)
          .attr('dy', d => d.data.name.substr(9, d.data.name.length).length ? '5em' : '4em')
          .attr('text-anchor', 'middle')
          .attr('fill', d => d.depth ? '#465166' : '#fff')
          .text(d => d.data.money);
        /*
        * 绘制箭头
        * @param  {string} markerUnits [设置为strokeWidth箭头会随着线的粗细发生变化]
        * @param {string} viewBox 坐标系的区域
        * @param {number} markerWidth,markerHeight 标识的大小
        * @param {string} orient 绘制方向，可设定为：auto（自动确认方向）和 角度值
        * @param {number} stroke-width 箭头宽度
        * @param {string} d 箭头的路径
        * @param {string} fill 箭头颜色
        * @param {string} id resolved0表示公司 resolved1表示个人
        * 直接用一个marker达不到两种颜色都展示的效果
        */
        nodeEnter.append('marker')
          .attr('id', showtype + 'resolved0')
          .attr('markerUnits', 'strokeWidth')
          .attr('markerUnits', 'userSpaceOnUse')
          .attr('viewBox', '0 -5 10 10')
          .attr('markerWidth', 12)
          .attr('markerHeight', 12)
          .attr('orient', '90')
          .attr('refX', () => showtype === 'up' ? '-5' : '15')
          .attr('stroke-width', 2)
          .attr('fill', 'red')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#FD7D00');

        nodeEnter.append('marker')
          .attr('id', showtype + 'resolved1')
          .attr('markerUnits', 'strokeWidth')
          .attr('markerUnits', 'userSpaceOnUse')
          .attr('viewBox', '0 -5 10 10')
          .attr('markerWidth', 12)
          .attr('markerHeight', 12)
          .attr('orient', '90')
          .attr('refX', () => showtype === 'up' ? '-5' : '15')
          .attr('stroke-width', 2)
          .attr('fill', 'red')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#7A9EFF');

        // 将节点转换到它们的新位置。
        let nodeUpdate = node.transition()
          .duration(DURATION)
          .attr('transform', d => showtype === 'up' ? 'translate(' + d.x + ',' + -(d.y) + ')' : 'translate(' + d.x + ',' + (d.y) + ')');

        // 代表是否展开的+-号,function this指向当前dom
        nodeEnter.append('svg:text')
          .attr('type', d => d.id || (d.id = showtype + 'text' + ++this.i))
          .on('click', function (d) {
            _this.click(d, showtype, sourceTree)
            setTimeout(() => {
              if (this.innerHTML === '-') {
                d.isOpen = false
                this.innerHTML = '+'
                this.setAttribute('fill', '#fff')
                document.querySelector(`circle[type="${d.id}"]`).setAttribute('fill', '#FD7D00')
                document.querySelector(`rect[type="${d.id}"]`).setAttribute('style', 'fill:#FFF1D7')
              } else {
                d.isOpen = true
                this.innerHTML = '-'
                this.setAttribute('fill', '#FD7D00')
                document.querySelector(`circle[type="${d.id}"]`).setAttribute('fill', '#fff')
                document.querySelector(`rect[type="${d.id}"]`).setAttribute('style', 'fill:#fff')
              }
            }, DURATION)
          })
          .attr('x', 0)
          .attr('dy', d => d.depth ? (showtype === 'up' ? -(SYMBOLA_S_R / 2 + this.diamonds.h / 2) : this.diamonds.h + 4) : 0)
          .attr('text-anchor', 'middle')
          .attr('fill', d => d._children ? '#fff' : '#FD7D00')
          .text(d => this.hasChildNodeArr.indexOf(d) !== -1 ? (source.depth && d.isOpen ? '-' : '+') : '');

        // 将退出节点转换到父节点的新位置.
        let nodeExit = node.exit().transition()
          .duration(DURATION)
          .attr('transform', () => {
            return showtype === 'up' ? 'translate(' + source.x + ',' + -(source.y) + ')' : 'translate(' + source.x + ',' + (parseInt(source.y)) + ')'
          })
          .remove();

        nodeExit.select('rect')
          .attr('width', this.diamonds.w)
          .attr('height', this.diamonds.h)
          .attr('stroke', 'black')
          .attr('stroke-width', 1);

        // 修改线条
        let link = this.svg.selectAll('path.link' + showtype)
          .data(links, d => d.id);

        // 在父级前的位置画线。
        let linkEnter = link.enter().insert('path', 'g')
          .attr('class', 'link' + showtype)
          .attr('marker-start', d => `url(#${showtype}resolved${d.data.type})`)// 根据箭头标记的id号标记箭头
          .attr('stroke', d => {
            if (d.data.type === COMPANY) {
              return '#FD7D00'
            } else {
              return '#7A9EFF'
            }
          })
          .style('fill-opacity', 1)
          .attr('d', () => {
            let o = {x: source.x0, y: source.y0};
            return _this.diagonal(o, o, showtype)
          });

        let linkUpdate = linkEnter.merge(link);
        // 过渡更新位置.
        linkUpdate.transition()
          .duration(DURATION)
          .attr('d', d => _this.diagonal(d, d.parent, showtype));

        // 将退出节点转换到父节点的新位置
        link.exit().transition()
          .duration(DURATION)
          .attr('d', () => {
            let o = {
              x: source.x,
              y: source.y
            };
            return _this.diagonal(o, o, showtype)
          }).remove();

        // 隐藏旧位置方面过渡.
        nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y });
      },

      // 拷贝到_children 隐藏1排以后的树
      collapse (source) {
        if (source.children) {
          source._children = source.children;
          source._children.forEach(this.collapse);
          source.children = null;
          this.hasChildNodeArr.push(source);
        }
      },

      click  (source, showType, sourceTree) {
        // 不是起点才能点
        if (source.depth) {
          if (source.children) {
            source._children = source.children;
            source.children = null;
          } else {
            source.children = source._children;
            source._children = null;
          }
          this.update(source, showType, sourceTree)
        }
      },

      diagonal (s, d, showtype) {
        let path
        if (showtype === 'up') {
          path = `M ${s.x} ${-s.y + 24}
        C${s.x} -${(s.y + d.y) * 0.45},
         ${s.x} -${(s.y + d.y) * 0.45},
          ${d.x} -${d.y}`;
        } else {
          path = `M ${s.x} ${s.y}
        C${s.x} ${(s.y + d.y) * 0.45},
         ${s.x} ${(s.y + d.y) * 0.45},
          ${d.x} ${d.y}`;
        }
        return path;
      },

      saveImg () {
        alert('保存')
      },

      resetSvg () {
        this.d3.select('#treesvg').remove()
        this.init()
      }
    }

  }
</script>

<style lang="scss">
    .penetrate-chart {
        .bt-group{
            position: fixed;
            z-index: 999;
            right: 15px;
            bottom: 15px;
            button{
                width:88px;
                height:32px;
                display: block;
                border-radius:18px;
                font-size:14px;
                font-family:PingFangSC-Medium;
                font-weight:500;
                line-height:20px;
            }
            .save{
                background:rgba(255,168,9,1);
                color:rgba(255,255,255,1);
            }
            .reset{
                margin-top: 8px;
                color: rgba(255, 168, 9, 1);
                background: white;
                border:1px solid rgba(255,168,9,1);
            }
        }
    }
    #treesvg{
        display: block;
        margin: auto;
        #g{
            .linkup, .linkdown {
                fill: none;
                stroke-width: 1px;
            }
            .text-style-name{
                font-size:12px; /*no*/
                font-family:PingFangSC-Medium;
                font-weight:500;
            }
            .text-style-money{
                font-size:10px; /*no*/
                font-family:PingFangSC-Regular;
                font-weight:400;
                color:rgba(70,81,102,1)
            }
            .proportion{
                font-size:10px;
                font-family:PingFangSC-Regular;
                font-weight:400;
            }
        }
        .proportion-hide, .hide-node{
            display: none;
        }
    }
</style>
