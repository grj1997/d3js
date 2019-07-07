<template>
    <div class="tianyancha">
        <div id="product_tree"></div>
        <!-- <div id='download' @click="downloadfun()"></div> -->
        <div id="rtbtn" onclick="javascript:history.go(-1);">
<!--            <img src="../../assets/rtbtn1.png" alt="">-->
        </div>
    </div>
</template>
<!--tianyancha-->
<script>
  export default {
    props: {},
    components: {},
    data() {
      return {
        proCorpid: this.$route.query.corpid,
        Slide: 0,
        self: '',
        screenWidth: document.body.clientWidth,
        arr: [],
        tree: document.getElementById('product_tree')
      }
    },
    watch: {
      screenWidth(val) { //监听屏幕高宽度 重新绘制图片
        if (!this.timer) {
          this.screenWidth = val
          this.timer = true
          let that = this
          setTimeout(function() {
            console.log(that.screenWidth)
            let tree = document.getElementById('product_tree')
            tree.style.width = that.screenWidth + "px";
            tree.innerHTML = ''
            that.drawing()
            that.timer = false
          }, 500) //延时
        }
      }
    },
    mounted() {
      console.log(this.screenWidth)
      var _this = this;
      _this.self = _this;
      var tree = document.getElementById('product_tree')

      function resize() { //设置tree的宽度为屏幕的高度 高度为屏幕的宽度
        var html = document.getElementsByTagName('html')[0];
        var width = html.clientWidth;
        var height = html.clientHeight;
        var max = width > height ? width : height;
        var min = width > height ? height : width;
        tree.style.width = max + "px";
        tree.style.height = min + "px";
        tree.style.backgroundColor = "#FFF"
      }
      resize();
      //禁止浏览器body多的部分滚动 若页面内容过长 将不能滑动
      tree.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, {
        passive: false
      })
      window.addEventListener("resize", resize)
      this.drawing()


      window.onresize = () => { //监听屏幕宽度
        return (() => {
          window.screenWidth = document.body.clientWidth
          _this.screenWidth = window.screenWidth
        })()
      };
    },
    methods: {
      downloadfun() { //canvas图片转img下载功能
        // 				//获取svg内容
        var html = document.getElementsByTagName('html')[0]; //获取可视区域宽
        var canvas = document.createElement("canvas");
        var g = document.getElementsByTagName('g')[0].getBBox()
        var svgbox = $('#product_tree svg')
        var gbox = document.getElementsByClassName('gbox')[0];
        var x = (g.width / 2 - html.clientWidth / 2) //计算偏移位置
        // 				var asa =	$('.gbox').eq(0).attr('transform').split(' ')
        // 				var xy = asa[0].replace('translate(','').replace(')','').split(',')
        // 				var scale = asa[1].replace(')','').replace('scale(','')
        // 				console.log('g',g.width)
        // 				console.log('html',html.clientWidth)
        // 				console.log('x',x)
        var y = 0;
        g.y < 0 ? y = Math.abs(g.y) : y = 0
        gbox.style.transform = "translate(" + x + 'px' + "," + y + "px" + ")  scale(1)"; //偏移位置
        svgbox.attr('width', g.width)
        svgbox.attr('height', g.height + 20)

        var svg = document.getElementById('product_tree').innerHTML;
        var c = canvas.getContext('2d');
        //新建Image对象
        var img = new Image();
        //svg内容
        img.src = 'data:image/svg+xml,' + unescape(encodeURIComponent(svg)); //svg内容中可以有中文字符
        img.src = 'data:image/svg+xml,' + svg; //svg内容中不能有中文字符
        //图片初始化完成后调用

        var cwidth = g.width;
        img.onload = function() {
          //将canvas的宽高设置为图像的宽高
          canvas.width = cwidth;
          canvas.height = g.height + 60;
          //canvcas画图片
          c.fillStyle = "#fff";
          c.fillRect(0, 0, canvas.width, canvas.height);
          c.drawImage(img, 0, 30);
          var a = document.createElement("a");
          a.download = "fallback";
          a.href = canvas.toDataURL("image/png");
          a.click();
        }
        gbox.style.transform = ''
        svgbox.attr('width', html.clientWidth)
        svgbox.attr('height', html.clientHeight)
      },
      drawing() {
        var rootName = ''; //根节点的名字
        var selfthis = this.self;
        var ajaxurl = this.BASEURL //请求地址
        var corpid = this.proCorpid;
        var rootRectWidth = 0; //根节点rect的宽度
        var downwardLength = 0,
          upwardLength = 0;
        var tree = document.getElementById('product_tree')
        var Slidenum = this.Slide
        var treeChart = function(d3Object) {
          this.d3 = d3Object;
          this.directions = ['upward', 'downward'];
        };
        treeChart.prototype.drawChart = function() {
          this.treeData = {};
          var self = this;

          selfthis.$http.post(ajaxurl + 'profund/familysearch', JSON.stringify({
            "companyType": 0,
            "corpid": corpid
          })).then(response => {
            var res = response.data;
            if (res.status === 'success') {
              self.directions.forEach(function(direction) {
                self.treeData[direction] = res.data[direction];
              });
              rootName = res.data.downward.name; //获取根节点名称
              rootRectWidth = rootName.length * 16; //设置第一个节点的宽度
              //获得upward第一级节点的个数
              upwardLength = res.data.upward.children.length;
              //获得downward第一级节点的个数
              downwardLength = res.data.downward.children.length;
              self.graphTree(self.getTreeConfig());

            } else if (res.status === 'error' && res.error === 10328) {
              alert('暂无数据')
              history.go(-1)

            }
          });
        };

        treeChart.prototype.getTreeConfig = function() {
          var treeConfig = {
            'margin': {
              'top': 10,
              'right': 5,
              'bottom': 0,
              'left': 30
            }
          }

          treeConfig.chartWidth = tree.clientWidth;
          treeConfig.chartHeight = tree.clientHeight;
          treeConfig.centralHeight = treeConfig.chartHeight / 2;
          treeConfig.centralWidth = treeConfig.chartWidth / 2;
          treeConfig.linkLength = 130;
          treeConfig.duration = 0; //动画时间
          return treeConfig;
        };

        treeChart.prototype.graphTree = function(config) {
          var self = this;
          var d3 = this.d3;
          var linkLength = config.linkLength;
          var duration = config.duration;
          var hasChildNodeArr = [];
          var id = 0;

          var diagonal = function(obj) { //折线
            // console.log(obj)
            var s = obj.source;
            var t = obj.target;
            return "M" + (s.x) + "," + s.y + "L" + s.x + "," + (s.y + (t.y - s.y) / 2) + "L" + t.x + "," +
              (s.y + (t.y - s.y) / 2) + "L" + (t.x) + "," + t.y;
          }

          var zoom = d3.behavior.zoom().scaleExtent([0.2, 1.8]).on('zoom', redraw) //缩放

          var svg = d3.select('#product_tree') //定义svg大小
            .append('svg')
            .attr("class", "linkG")

            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', config.chartWidth + config.margin.right + config.margin.left)
            // .attr('width',3200)
            .attr('height', config.chartHeight + config.margin.top + config.margin.bottom)
            .on('mousedown', disableRightClick)
            .call(zoom)
            .on('dblclick.zoom', null)
            .on('doubleTap.zoom', null);

          // 					var treeG = svg.append('g') //添加g元素
          // 						.attr('transform', 'translate(' + config.margin.left + ',' + config.margin.top + ')');
          var treeG = svg.append('g') //添加g元素
            .attr('class', 'gbox')
            .attr('transform', 'translate(' + 0 + ',' + 0 + ') scale(1)');
          //初始化树节点并更新图表。
          for (var d = 0; d < this.directions.length; d++) {
            var direction = this.directions[d];
            var data = self.treeData[direction];
            // console.log(data)
            data.x0 = config.centralWidth;
            data.y0 = config.centralHeight;
            data.children.forEach(collapse);
            update(data, data, treeG);
          }

          function update(source, originalData, g) {
            var direction = originalData['direction'];
            var forUpward = direction == 'upward';
            var node_class = direction + 'Node';
            var link_class = direction + 'Link';
            var downwardSign = (forUpward) ? -1 : 1; //上下树
            var nodeColor = (forUpward) ? '#37592b' : '#8b4513';

            var statusUp = true;
            var statusDown = true;
            var nodeSpace = 140;
            var tree = d3.layout.tree().sort(sortByDate).nodeSize([nodeSpace, 10]);
            var nodes = tree.nodes(originalData);
            var links = tree.links(nodes);
            var offsetX = -config.centralWidth;

            nodes.forEach(function(d) {
              d.y = downwardSign * (d.depth * linkLength) + config.centralHeight;
              d.x = d.x - offsetX;
              if (d.grade == 'origin') {
                d.x = config.centralWidth;
                d.y += downwardSign * 0; // 上下两树图根节点之间的距离
              }
            });

            // Update the node.
            var node = g.selectAll('g.' + node_class)
              .data(nodes, function(d) {
                return d.id || (d.id = ++id);
              });
            var nodeEnter = node.enter().append('g')
              .attr('class', node_class)
              .attr('transform', function(d) {
                return 'translate(' + source.x0 + ',' + source.y0 + ')';
              })
              .style('cursor', function(d) {
                return (d.grade == 'origin') ? '' : (d.children || d._children) ? 'pointer' : '';
              })

            ///开始设置节点

            nodeEnter.append("svg:rect")
              .attr("x", function(d) {
                return (d.grade == 'origin') ? (-rootRectWidth / 2) : -60;
              })
              .attr("y", (d) => {
                return (d.grade == 'origin') ? -20 : forUpward ? -20 : -20;

              })
              .attr("width", (d) => {
                return (d.grade == 'origin') ? rootRectWidth : 120;
              })
              .attr("height", (d) => {
                return (d.grade == 'origin') ? "40" : (d.type == '2') ? "40" : "50" //设置节点高度
              })
              .attr("rx", 5) //圆角
              .style("stroke", (d) => {
                return (d.grade == 'origin') ? "rgb(233,233,233)" : "rgb(230,230,230)";
              })
              .style('stroke-width', "1.2")

              .style('fill', (d) => {

                return (d.grade == 'origin') ? "rgb(83,99,187)" : (d.type == '2') ? "rgb(230,234,248)" : "#FFF";
              })


            nodeEnter.append('circle')
              .attr('r', 1e-6)
            // .on('click',click)


            nodeEnter.append("text") //上面一层文字
              .attr("class", "linkname")
              .attr("x", function(d) {
                return (d.grade == 'origin') ? '0' : "-55";
              })
              .attr('dy', function(d) {
                return (d.grade == 'origin') ? '.35em' : forUpward ? -5 : -5;
              })
              .attr("text-anchor", function(d) {
                return (d.grade == 'origin') ? 'middle' : "start";
              })
              .text(function(d) {
                if (d.grade == 'origin') {
                  // return ((forUpward) ? '根节点TOP' : '根节点Bottom');
                  return rootName;
                }
                if (d.repeated) {
                  console.log(d.repeated)
                  return '[Recurring] ' + d.name;
                }
                return (d.name.length > 10) ? d.name.substr(0, 10) : d.name;
              })
              .style('cursor', "pointer")
              .style({
                'fill-opacity': 1e-6,

                'fill': function(d) {
                  return (d.grade == 'origin') ? '#fff' : '#000';
                },
                'font-size': function(d) {
                  return (d.grade == 'origin') ? 14 : 11;
                }
              })
              .style("letter-spacing", (d) => {
                return (d.grade == 'origin') ? "1px" : '0'
              })

            nodeEnter.append("text") //中间一层 上一层的折行
              .attr("class", "linkname")
              .attr("x", "-55")
              .attr("dy", function(d) {
                return (d.grade == 'origin') ? '.35em' : forUpward ? (d.type != 2) ? "8" : "0" : '8';
              })
              .attr("text-anchor", function() {
                return (d.grade == 'origin') ? 'middle' : "start";
              })
              .text(function(d) {
                return (d.grade == 'origin') ? '' : d.name.length > 17 ? d.name.substr(10, 7) + '...' : d.name.substr(10,
                  7);
              })
              .style({
                // 'fill': "#337ab7",
                'font-size': function(d) {
                  return (d.grade == 'origin') ? 14 : 11;
                },
                'cursor': "pointer"
              })

            nodeEnter.append("text") //认缴金额一层
              .attr("x", "-55")
              .attr("dy", function(d) {
                return (d.grade == 'origin') ? '.35em' : forUpward ? ((d.type == 2) ? "10" : "24") : '23';
              })
              .attr("text-anchor", "start")
              .attr("class", "linkname")
              .style("fill", "#000")
              .style('font-size', 10)
              .text(function(d) {
                var str = (d.grade == 'origin') ? '' : (d.amount != 0 && d.amount != null) ? "认缴金额:" + d.amount + "万元" :
                  "认缴金额:未公开"; //金额
                return (str.length > 14) ? str.substr(0, 14) + ".." : str;
              });
            nodeEnter.append("text") //股比
              .attr("x", "10")
              .attr("dy", function(d) {
                return (d.grade == 'origin') ? '.35em' : forUpward ? ((d.type == 2) ? "32" : "42") : '-23';
              })
              .attr("text-anchor", "start")
              .attr("class", "linkname")
              .style("fill", "rgb(0,132,255)")
              .style('font-size', 10)
              .text(function(d) {
                return (d.grade == 'origin') ? "" : (d.proportion) ? d.proportion + '%' : ''; //股比
              });

            // 原有节点更新到新位置
            var nodeUpdate = node.transition()
              .duration(duration)
              .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
              });
            nodeUpdate.select('circle')

              .attr('r', function(d) {
                return (d.grade == 'origin') ? 0 : (d.number > 0) ? 6 : 0;
              })
              .attr('cy', function(d) {
                return (d.grade == 'origin') ? -20 : (forUpward) ? -28 : 38;
              })
              .style('fill', function(d) {
                return d.number > 0 ? "rgb(83,99,187)" : "";
              })

            //代表是否展开的+-号

            nodeEnter.append("svg:text")
              .attr("class", "isExpand")
              .attr("x", "0")
              .attr("dy", function(d) {
                return forUpward ? -22 : 44;
              })
              .attr("text-anchor", "middle")
              .style("fill", "#fff")

              .style('font-size', '18px')
              .text(function(d) {
                if (d.grade == 'origin') {
                  return '';
                }
                return d.number > 0 ? "+" : "";
              })
              .on('click', click)

            nodeUpdate.select('text').style('fill-opacity', 1)
            var nodeExit = node.exit().transition()
              .duration(duration)
              .attr('transform', function(d) {
                return 'translate(' + source.x + ',' + source.y + ')';
              })
              .remove();
            nodeExit.select('circle')
              .attr('r', 1e-6)
            nodeExit.select('text')
              .style('fill-opacity', 1e-6);

            var link = g.selectAll('path.' + link_class)
              .data(links, function(d) {
                return d.target.id;
              })
              .attr('fill', 'none')


            //******************************************私募管理人标签 start******************************************//
            //提示框
            var tsk = nodeEnter.append("svg:rect")
              .attr("x", -64)
              .attr("y", function(d) {
                return forUpward ? -42 : 0;
              })
              .attr('rx', 2)
              .attr('ry', 2)
              .attr("width", function(d) {
                if (d.name == 'origin') {
                  return 0
                } else {
                  return (d.shareholdertype == 'GP') ? "55" : 0; //私募管理人标签
                }
              })
              .attr("height", 15)

              .style("fill", function(d) {
                return "rgb(249,190,65)";
              })
            //三角形
            nodeEnter.append("svg:path")
              .attr("fill", "rgb(249,190,65)")
              .attr("d", function(d) {
                if (d.name == 'origin') {
                  return ""
                } else {
                  return (d.shareholdertype == 'GP') ? "M-53 -20 L-60 -30 L-46 -30 Z" : ""; //私募管理人标签
                }
              })
            nodeEnter.append("svg:text")
              .attr("x", -60)
              .attr("dy", function(d) {
                return forUpward ? "-32" : "";
              })
              .attr("text-anchor", "start")
              .style("fill", "#fff")
              .style("font-size", 8)
              .style('letter-spacing', 1)
              .text(function(d) {
                return (d.shareholdertype == 'GP') ? "私募管理人" : "";
              });
            //******************************************私募管理人标签 end******************************************//

            link.enter().insert('path', 'g')
              .attr('class', link_class)
              .attr('d', function(d) {
                var o = {
                  x: source.x0,
                  y: source.y0,
                };
                return diagonal({
                  source: o,
                  target: o,
                });

              })
              .attr("id", function(d, i) {
                return "mypath" + i;
              })
              .attr('fill', 'none')
              .attr('stroke', 'rgb(51, 51, 51)')


            link.transition()
              .duration(duration)
              .attr('d', diagonal)


            link.exit().transition()
              .duration(duration)
              .attr('d', function(d) {
                var o = {
                  x: source.x0,
                  y: source.y0,
                };
                return diagonal({
                  source: o,
                  target: o,
                });
              })
              .remove();
            nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });

            function getNode(type, id) {

              selfthis.$http.post(ajaxurl + 'profund/familysearch', JSON.stringify(comment)).then(response => {
                var res = response.data;
                if (res.status === 'success') {
                  if (type == 1) {
                    mynodes = res.data.upward
                  } else if (type == -1) {
                    mynodes = res.data.downward
                  }
                }
              })
              return mynodes;
            }

            function click(d) {
              var companyType //请求参数
              if (forUpward) { //定义请求参数的值 1 = 股东      -1 = 对外投资
                companyType = 1; //参数类型
              } else {
                companyType = -1; //参数类型
              }
              if (d.children) {
                d._children = d.children;
                d.children = null;
                update(d, originalData, g); //重新渲染数据
                d3.select(this).text("+").style({
                  'font-weight': '400',
                  'font-size': '18px'
                })
              } else {
                d.children = d._children;
                d._children = null;
                selfthis.$http.post(ajaxurl + 'profund/familysearch', JSON.stringify({
                  'companyType': companyType,
                  'corpid': d.corpid
                })).then(response => {
                  var res = response.data;
                  if (res.status === 'success') {
                    if (companyType == 1) {
                      d.children = res.data.upward.children;
                    } else if (companyType == -1) {
                      d.children = res.data.downward.children;
                    }
                    update(d, originalData, g); //重新渲染数据
                    d3.select(this).text("-").style({
                      'font-weight': '600',
                      'font-size': '23px'
                    })
                    // expand all if it's the first node
                    if (d.name == 'origin') {
                      d.children.forEach(expand);
                    }
                  }
                })



              }

            }
          }

          function expand(d) {
            if (d._children) {
              d.children = d._children;
              d.children.forEach(expand);
              d._children = null;
            }
          }


          function collapse(d) {
            if (d.children && d.children.length != 0) {
              d._children = d.children;
              d._children.forEach(collapse);
              d.children = null;
              hasChildNodeArr.push(d);
            }
          }

          function redraw() {
            //强制横屏后 手机端出现touch事件方向
            //错误问题 以及ios 安卓兼容性问题
            //根据浏览器内核判断手机和pc 重新计算方向 顺时针九十度x,y规则 a[0] = b[1]a[1] = -b[0]
            var html = document.getElementsByTagName('html')[0];
            var width = html.clientWidth;
            var height = html.clientHeight;
            var a = []
            var u = navigator.userAgent;
            var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
            var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            if (isAndroid) {
              a = d3.event.translate; //是安卓
            } else if (isiOS) {
              if (window.orientation == 90 || window.orientation == -90) { //判断屏幕方向
                // console.log("横屏")
                a = d3.event.translate;
              } else {
                var b = d3.event.translate;
                a[0] = b[1]
                a[1] = -b[0]
              }
            } else { //pc端
              if (width < height) {
                var b = d3.event.translate;
                a[0] = b[1]
                a[1] = -b[0]
              } else {
                a = d3.event.translate;
              }

            }

            treeG.attr('transform', 'translate(' + a + ')' +
              ' scale(' + d3.event.scale + ')');
          }


          function disableRightClick() {
            // stop zoom
            if (d3.event.button == 2) {
              console.log('No right click allowed');
              d3.event.stopImmediatePropagation();
            }
          }


          function sortByDate(a, b) {
            var aNum = a.name.substr(a.name.lastIndexOf('(') + 1, 4);
            var bNum = b.name.substr(b.name.lastIndexOf('(') + 1, 4);
            return d3.ascending(aNum, bNum) ||
              d3.ascending(a.name, b.name) ||
              d3.ascending(a.id, b.id);
          }


        };

        var d3GenerationChart = new treeChart(d3);
        d3GenerationChart.drawChart();
      }
    }
  }
</script>

<style lang="scss">
    .tianyancha {
    }
    #product_tree {
        touch-action: none;
        z-index: 999;

    }

    #rtbtn {
        position: fixed;
        width: 25px;
        height: 25px;
        top: 20px;
        border-radius: 4px;
        box-sizing: content-box;
        background: #fff;
        border: 1px solid rgb(83, 99, 187);
        z-index: 9999;
        text-align: center;
        right: 30px;
    }

    #rtbtn img {
        width: 26px;
    }

    #download {
        position: fixed;
        width: 25px;
        height: 25px;
        top: 20px;
        border-radius: 4px;
        background: #fff;
        border: 1px solid rgb(83, 99, 187);
        z-index: 9999;
        text-align: center;
        right: 80px;
    }

    @media screen and (orientation:portrait) {

        /*屏幕旋转90*/
        #product_tree {
            transform-origin: 0 0;
            transform: rotateZ(90deg) translateY(-100%);
        }
    }

    #product_tree>.centralText {
        font: 23spx sans-serif;
        fill: #222;
    }

    #product_tree>.downwardNode text,
    #product_tree>.upwardNode text {
        font: 15px sans-serif;
    }
</style>
