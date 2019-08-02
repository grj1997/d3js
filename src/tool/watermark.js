let init = () => {
  /* Just return a value to define the module export. */
  let watermark = {}
  let defaultSettings = {
    watermarkId: 'wm_div_id',          // 水印总体的id
    watermarkPrefix: 'mask_div_id',    // 小水印的id前缀
    watermarkTxt: '测试水印',             // 水印的内容
    watermarkX: 20,                     // 水印起始位置x轴坐标
    watermarkY: 20,                     // 水印起始位置Y轴坐标
    watermarkRows: 1,                   // 水印行数
    watermarkCols: 1,                   // 水印列数
    watermarkXSpace: 5,              // 水印x轴间隔
    watermarkYSpace: 50,               // 水印y轴间隔
    watermarkFont: '微软雅黑',           // 水印字体
    watermarkColor: 'black',            // 水印字体颜色
    watermarkFontSize: '18px',          // 水印字体大小
    watermarkAlpha: 0.15,               // 水印透明度，要求设置在大于等于0.005
    watermarkWidth: 100,                // 水印宽度
    watermarkHeight: 100,               // 水印长度
    watermarkAngle: 15,                 // 水印倾斜度数
    watermarkParentWidth: 0,      // 水印的总体宽度（默认值：body的scrollWidth和clientWidth的较大值）
    watermarkParentHeight: 0,     // 水印的总体高度（默认值：body的scrollHeight和clientHeight的较大值）
    watermarkParentNode: null,     // 水印插件挂载的父元素element,不输入则默认挂在body上
    zIndex: 99 // 层级
  };

  /* 加载水印 */
  let loadMark = function (settings) {
    /* 采用配置项替换默认值，作用类似jquery.extend */
    if (arguments.length === 1 && typeof arguments[0] === 'object') {
      let src = arguments[0] || {};
      for (let key in src) {
        if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue;
        /* veronic: resolution of watermarkAngle=0 not in force */
        else if (src[key] || src[key] === 0) defaultSettings[key] = src[key];
      }
    }

    /* 如果元素存在则移除 */
    let watermarkElement = document.getElementById(defaultSettings.watermarkId);
    if (watermarkElement) {
      let _parentElement = watermark_element.parentNode;
      if (_parentElement) {
        _parentElement.removeChild(watermark_element);
      }
    }

    /* 获取页面最大宽度 */
    let pageWidth = Math.max(document.body.scrollWidth, document.body.clientWidth) - defaultSettings.watermarkWidth / 2;
    /* 获取页面最大长度 */
    let pageHeight = Math.max(document.body.scrollHeight, document.body.clientHeight, document.documentElement.clientHeight) - defaultSettings.watermarkHeight / 2;
    let setting = arguments[0] || {};
    let parentEle = defaultSettings.watermarkParentNode;

    let pageOffsetTop = 0;
    let pageOffsetLeft = 0;

    if (setting.watermarkParentWidth || setting.watermarkParentHeight) {
      setting.watermarkParentWidth ? (pageWidth = setting.watermarkParentWidth - defaultSettings.watermarkWidth / 2) : (defaultSettings.watermarkParentNode) ? (pageWidth = parentEle.offsetWidth - defaultSettings.watermarkWidth / 2) : void 0;
      setting.watermarkParentHeight ? (pageHeight = setting.watermarkParentHeight - defaultSettings.watermarkHeight / 2) : (defaultSettings.watermarkParentNode) ? (pageHeight = Math.max(parentEle.offsetHeight, parentEle.scrollHeight) - defaultSettings.watermarkHeight / 2) : void 0;

      /* 指定父元素同时指定了宽或高 */
      if (parentEle) {
        pageOffsetTop = parentEle.offsetTop || 0;
        pageOffsetLeft = parentEle.offsetLeft || 0;
        defaultSettings.watermarkX = defaultSettings.watermarkX + pageOffsetLeft;
        defaultSettings.watermarkY = defaultSettings.watermarkY + pageOffsetTop;
      }
    } else {
      if (parentEle) {
        pageOffsetTop = parentEle.offsetTop || 0;
        pageOffsetLeft = parentEle.offsetLeft || 0;
        pageWidth = parentEle.offsetWidth - defaultSettings.watermarkWidth / 2 || 0;
        pageHeight = (Math.max(parentEle.offsetHeight, parentEle.scrollHeight) - defaultSettings.watermarkHeight / 2) || 0;

        defaultSettings.watermarkX = defaultSettings.watermarkX + pageOffsetLeft;
        defaultSettings.watermarkY = defaultSettings.watermarkY + pageOffsetTop;
      }
    }

    /* 创建水印外壳div */
    let otdiv = document.getElementById(defaultSettings.watermarkId);
    // let shadowRoot = null;
    if (!otdiv) {
      otdiv = document.createElement('div');

      /* 创建shadow dom */
      otdiv.id = defaultSettings.watermarkId;
      otdiv.style.pointerEvents = 'none';

      /* 判断浏览器是否支持attachShadow方法 */
      /* if (typeof otdiv.attachShadow === 'function') {
        /!* createShadowRoot Deprecated. Not for use in new websites. Use attachShadow *!/
        shadowRoot = otdiv.attachShadow({mode: 'open'});
      } else {
        shadowRoot = otdiv;
      } */

      /* 将shadow dom随机插入body内的任意位置 */
      let nodeList = document.body.children;
      let index = Math.floor(Math.random() * (nodeList.length - 1));
      if (nodeList[index]) {
        if (parentEle) {
          parentEle.appendChild(otdiv);
        } else {
          document.body.insertBefore(otdiv, nodeList[index]);
        }
      } else {
        if (parentEle) {
          parentEle.appendChild(otdiv);
        } else {
          document.body.appendChild(otdiv);
        }
      }
    }
    /* else if (otdiv.shadowRoot) {
      // shadowRoot = otdiv.shadowRoot;
    } */

    /* 如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔 */
    if (defaultSettings.watermarkCols === 0 || (parseInt(defaultSettings.watermarkX + defaultSettings.watermarkWidth * defaultSettings.watermarkCols + defaultSettings.watermarkXSpace * (defaultSettings.watermarkCols - 1)) > pageWidth)) {
      defaultSettings.watermarkCols = parseInt((pageWidth - defaultSettings.watermarkX + pageOffsetLeft) / (defaultSettings.watermarkWidth + defaultSettings.watermarkXSpace));
      defaultSettings.watermarkXSpace = parseInt((pageWidth - defaultSettings.watermarkX + pageOffsetLeft - defaultSettings.watermarkWidth * defaultSettings.watermarkCols) / (defaultSettings.watermarkCols - 1));
    }
    /* 如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔 */
    /* if (defaultSettings.watermarkRows === 0 || (parseInt(defaultSettings.watermarkY + defaultSettings.watermarkHeight * defaultSettings.watermarkRows + defaultSettings.watermarkYSpace * (defaultSettings.watermarkRows - 1)) > pageHeight)) {
      defaultSettings.watermarkRows = parseInt((pageHeight - defaultSettings.watermarkY + pageOffsetTop) / (defaultSettings.watermarkHeight + defaultSettings.watermarkYSpace));
      defaultSettings.watermarkYSpace = parseInt(((pageHeight - defaultSettings.watermarkY + pageOffsetTop) - defaultSettings.watermarkHeight * defaultSettings.watermarkRows) / (defaultSettings.watermarkRows - 1));
    } */

    let x;
    let y;
    for (let i = 0; i < defaultSettings.watermarkRows; i++) {
      y = defaultSettings.watermarkY + (defaultSettings.watermarkYSpace + defaultSettings.watermarkHeight) * i;
      for (let j = 0; j < defaultSettings.watermarkCols; j++) {
        x = defaultSettings.watermarkX + (defaultSettings.watermarkWidth + defaultSettings.watermarkXSpace) * j;

        let maskDiv = document.createElement('div');
        /* let oText=document.createTextNode(defaultSettings.watermarkTxt);
        let oText=document.createElement(defaultSettings.watermarkTxt); */
        maskDiv.appendChild(new DOMParser().parseFromString(defaultSettings.watermarkTxt, 'text/html').body.childNodes[0]);
        /* 设置水印相关属性start */
        maskDiv.id = defaultSettings.watermarkPrefix + i + j;
        /* 设置水印div倾斜显示 */
        maskDiv.style.webkitTransform = 'rotate(-' + defaultSettings.watermarkAngle + 'deg)';
        maskDiv.style.MozTransform = 'rotate(-' + defaultSettings.watermarkAngle + 'deg)';
        maskDiv.style.msTransform = 'rotate(-' + defaultSettings.watermarkAngle + 'deg)';
        maskDiv.style.OTransform = 'rotate(-' + defaultSettings.watermarkAngle + 'deg)';
        maskDiv.style.transform = 'rotate(-' + defaultSettings.watermarkAngle + 'deg)';
        maskDiv.style.visibility = '';
        maskDiv.style.position = 'absolute';
        /* 选不中 */
        maskDiv.style.left = x + 'px';
        maskDiv.style.top = y + 'px';
        maskDiv.style.overflow = 'hidden';
        maskDiv.style.zIndex = defaultSettings.zIndex;
        maskDiv.style.opacity = defaultSettings.watermarkAlpha;
        maskDiv.style.fontSize = defaultSettings.watermarkFontSize;
        maskDiv.style.fontFamily = defaultSettings.watermarkFont;
        maskDiv.style.color = defaultSettings.watermarkColor;
        maskDiv.style.textAlign = 'center';
        /* maskDiv.style.width = defaultSettings.watermarkWidth + 'px';
        maskDiv.style.height = defaultSettings.watermarkHeight + 'px'; */
        maskDiv.style.display = 'block';
        maskDiv.style['-ms-user-select'] = 'none';
        /* 设置水印相关属性end */
        otdiv.appendChild(maskDiv);
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
        /* veronic: resolution of watermarkAngle=0 not in force */
        else if (src[key] || src[key] === 0) defaultSettings[key] = src[key];
      }
    }

    /* 移除水印 */
    let watermarkElement = document.getElementById(defaultSettings.watermarkId);
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
