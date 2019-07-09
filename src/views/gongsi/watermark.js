let init = () => {
  /* Just return a value to define the module export. */
  let watermark = {}
  let defaultSettings = {
    watermark_id: 'wm_div_id',          // 水印总体的id
    watermark_prefix: 'mask_div_id',    // 小水印的id前缀
    watermark_txt: '测试水印',             // 水印的内容
    watermark_x: 20,                     // 水印起始位置x轴坐标
    watermark_y: 20,                     // 水印起始位置Y轴坐标
    watermark_rows: 0,                   // 水印行数
    watermark_cols: 0,                   // 水印列数
    watermark_x_space: 5,              // 水印x轴间隔
    watermark_y_space: 50,               // 水印y轴间隔
    watermark_font: '微软雅黑',           // 水印字体
    watermark_color: 'black',            // 水印字体颜色
    watermark_fontsize: '18px',          // 水印字体大小
    watermark_alpha: 0.15,               // 水印透明度，要求设置在大于等于0.005
    watermark_width: 100,                // 水印宽度
    watermark_height: 100,               // 水印长度
    watermark_angle: 15,                 // 水印倾斜度数
    watermark_parent_width: 0,      // 水印的总体宽度（默认值：body的scrollWidth和clientWidth的较大值）
    watermark_parent_height: 0,     // 水印的总体高度（默认值：body的scrollHeight和clientHeight的较大值）
    watermark_parent_node: null,     // 水印插件挂载的父元素element,不输入则默认挂在body上
    zIndex: 99 // 层级
  };

  /* 加载水印 */
  let loadMark = function (settings) {
    /* 采用配置项替换默认值，作用类似jquery.extend */
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      let src = arguments[0] || {};
      for (let key in src) {
        if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue;
        /* veronic: resolution of watermark_angle=0 not in force */
        else if (src[key] || src[key] === 0) defaultSettings[key] = src[key];
      }
    }

    /* 如果元素存在则移除 */
    let watermarkElement = document.getElementById(defaultSettings.watermark_id);
    if (watermarkElement) {
      let _parentElement = watermark_element.parentNode;
      if (_parentElement) {
        _parentElement.removeChild(watermark_element);
      }
    }

    /* 获取页面最大宽度 */
    let pageWidth = Math.max(document.body.scrollWidth, document.body.clientWidth) - defaultSettings.watermark_width / 2;
    /* 获取页面最大长度 */
    let pageHeight = Math.max(document.body.scrollHeight, document.body.clientHeight, document.documentElement.clientHeight) - defaultSettings.watermark_height / 2;
    let setting = arguments[0] || {};
    let parentEle = defaultSettings.watermark_parent_node;

    let pageOffsetTop = 0;
    let pageOffsetLeft = 0;

    if (setting.watermark_parent_width || setting.watermark_parent_height) {
      setting.watermark_parent_width ? (pageWidth = setting.watermark_parent_width - defaultSettings.watermark_width / 2) : (defaultSettings.watermark_parent_node) ? (pageWidth = parentEle.offsetWidth - defaultSettings.watermark_width / 2) : void 0;
      setting.watermark_parent_height ? (pageHeight = setting.watermark_parent_height - defaultSettings.watermark_height / 2) : (defaultSettings.watermark_parent_node) ? (pageHeight = Math.max(parentEle.offsetHeight, parentEle.scrollHeight) - defaultSettings.watermark_height / 2) : void 0;

      /* 指定父元素同时指定了宽或高 */
      if (parentEle) {
        pageOffsetTop = parentEle.offsetTop || 0;
        pageOffsetLeft = parentEle.offsetLeft || 0;
        defaultSettings.watermark_x = defaultSettings.watermark_x + pageOffsetLeft;
        defaultSettings.watermark_y = defaultSettings.watermark_y + pageOffsetTop;
      }
    } else {
      if (parentEle) {
        pageOffsetTop = parentEle.offsetTop || 0;
        pageOffsetLeft = parentEle.offsetLeft || 0;
        pageWidth = parentEle.offsetWidth - defaultSettings.watermark_width / 2 || 0;
        pageHeight = (Math.max(parentEle.offsetHeight, parentEle.scrollHeight) - defaultSettings.watermark_height / 2) || 0;

        defaultSettings.watermark_x = defaultSettings.watermark_x + pageOffsetLeft;
        defaultSettings.watermark_y = defaultSettings.watermark_y + pageOffsetTop;
      }
    }

    /* 创建水印外壳div */
    let otdiv = document.getElementById(defaultSettings.watermark_id);
    let shadowRoot = null;

    if (!otdiv) {
      otdiv = document.createElement('div');

      /* 创建shadow dom */
      otdiv.id = defaultSettings.watermark_id;
      otdiv.style.pointerEvents = 'none';

      /* 判断浏览器是否支持attachShadow方法 */
      if (typeof otdiv.attachShadow === 'function') {
        /* createShadowRoot Deprecated. Not for use in new websites. Use attachShadow */
        shadowRoot = otdiv.attachShadow({mode: 'open'});
      } else {
        shadowRoot = otdiv;
      }

      /* 将shadow dom随机插入body内的任意位置 */
      let nodeList = document.body.children;
      let index = Math.floor(Math.random() * (nodeList.length - 1));
      if (nodeList[index]) {
        document.body.insertBefore(otdiv, nodeList[index]);
      } else {
        document.body.appendChild(otdiv);
      }
    } else if (otdiv.shadowRoot) {
      shadowRoot = otdiv.shadowRoot;
    }

    /* 如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔 */
    if (defaultSettings.watermark_cols === 0 || (parseInt(defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1)) > pageWidth)) {
      defaultSettings.watermark_cols = parseInt((pageWidth - defaultSettings.watermark_x + pageOffsetLeft) / (defaultSettings.watermark_width + defaultSettings.watermark_x_space));
      defaultSettings.watermark_x_space = parseInt((pageWidth - defaultSettings.watermark_x + pageOffsetLeft - defaultSettings.watermark_width * defaultSettings.watermark_cols) / (defaultSettings.watermark_cols - 1));
    }
    /* 如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔 */
    if (defaultSettings.watermark_rows === 0 || (parseInt(defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1)) > pageHeight)) {
      defaultSettings.watermark_rows = parseInt((pageHeight - defaultSettings.watermark_y + pageOffsetTop) / (defaultSettings.watermark_height + defaultSettings.watermark_y_space));
      defaultSettings.watermark_y_space = parseInt(((pageHeight - defaultSettings.watermark_y + pageOffsetTop) - defaultSettings.watermark_height * defaultSettings.watermark_rows) / (defaultSettings.watermark_rows - 1));
    }

    let x;
    let y;
    for (let i = 0; i < defaultSettings.watermark_rows; i++) {
      y = defaultSettings.watermark_y + (defaultSettings.watermark_y_space + defaultSettings.watermark_height) * i;
      for (let j = 0; j < defaultSettings.watermark_cols; j++) {
        x = defaultSettings.watermark_x + (defaultSettings.watermark_width + defaultSettings.watermark_x_space) * j;

        let maskDiv = document.createElement('div');
        // let oText=document.createTextNode(defaultSettings.watermark_txt);
        // let oText=document.createElement(defaultSettings.watermark_txt);
        // console.log(oText)
        maskDiv.appendChild(new DOMParser().parseFromString(defaultSettings.watermark_txt, 'text/html').body.childNodes[0]);
        /* 设置水印相关属性start */
        maskDiv.id = defaultSettings.watermark_prefix + i + j;
        /* 设置水印div倾斜显示 */
        maskDiv.style.webkitTransform = 'rotate(-' + defaultSettings.watermark_angle + 'deg)';
        maskDiv.style.MozTransform = 'rotate(-' + defaultSettings.watermark_angle + 'deg)';
        maskDiv.style.msTransform = 'rotate(-' + defaultSettings.watermark_angle + 'deg)';
        maskDiv.style.OTransform = 'rotate(-' + defaultSettings.watermark_angle + 'deg)';
        maskDiv.style.transform = 'rotate(-' + defaultSettings.watermark_angle + 'deg)';
        maskDiv.style.visibility = '';
        maskDiv.style.position = 'absolute';
        /* 选不中 */
        maskDiv.style.left = x + 'px';
        maskDiv.style.top = y + 'px';
        maskDiv.style.overflow = 'hidden';
        maskDiv.style.zIndex = defaultSettings.zIndex;
        maskDiv.style.opacity = defaultSettings.watermark_alpha;
        maskDiv.style.fontSize = defaultSettings.watermark_fontsize;
        maskDiv.style.fontFamily = defaultSettings.watermark_font;
        maskDiv.style.color = defaultSettings.watermark_color;
        maskDiv.style.textAlign = 'center';
        // maskDiv.style.width = defaultSettings.watermark_width + 'px';
        // maskDiv.style.height = defaultSettings.watermark_height + 'px';
        maskDiv.style.display = 'block';
        maskDiv.style['-ms-user-select'] = 'none';
        /* 设置水印相关属性end */
        shadowRoot.appendChild(maskDiv);
      }
    }
  };

  /* 移除水印 */
  let removeMark = function () {
    /* 采用配置项替换默认值，作用类似jquery.extend */
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      let src = arguments[0] || {};
      for (let key in src) {
        if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue;
        /* veronic: resolution of watermark_angle=0 not in force */
        else if (src[key] || src[key] === 0) defaultSettings[key] = src[key];
      }
    }

    /* 移除水印 */
    let watermarkElement = document.getElementById(defaultSettings.watermark_id);
    let _parentElement = watermarkElement.parentNode;
    _parentElement.removeChild(watermarkElement);
  };

  /* 初始化水印，添加load和resize事件 */
  watermark.init = function (settings) {
    window.addEventListener('load', function () {
      loadMark(settings);
    });
    window.addEventListener('resize', function () {
      loadMark(settings);
    });
    window.addEventListener('DOMContentLoaded', function () {
      loadMark(settings);
    });
  };

  /* 手动加载水印 */
  watermark.load = function (settings) {
    loadMark(settings);
  };

  /* 手动移除水印 */
  watermark.remove = function () {
    removeMark();
  };

  return watermark;
}
let watermark = init()
export default watermark
