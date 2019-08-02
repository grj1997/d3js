<template>
    <div class="demo">
        <div class="filter-deals">
            <a @click="showArea">{{areaName + cityName}}<i class="icon-font">{{isShowArea ? '&#xe673;' : '&#xe672;'}}</i></a>
        </div>

        <div @click="closeArea" :style="!isShowFilter ? 'transition: .5s;' : 'transition: none'" :class="isShowArea ? 'a area active ' : 'area'">
            <div class="area-avial" @click.prevent.stop>
                <ul class="left">
                    <li :key="index" v-for="(item, index) in areaList" :class="activeAreaIndex === index ? 'active' : ''" @click="selectArea(item, index)">{{item.name}}</li>
                </ul>
                <ul class="right">
                    <li :key="index" v-for="(item, index) in cityList" :class="activeCityIndex === index ? 'active' : ''" @click="selectCity(item, index)">{{item.name}}<i v-if="activeCityIndex === index" class="icon-font">&#xe606;</i></li>
                </ul>
            </div>

        </div>
    </div>
</template>
<!--demo-->
<script>
  export default {
    name: 'demo',
    props: {},

    components: {},

    data () {
      return {
        isShowArea: false,
        isShowFilter: false,
        areaList: [],
        cityList: [],
        activeAreaIndex: 0,
        activeCityIndex: '',
        areaCode: '',
        areaName: '贵州省',
        cityName: ''
      }
    },

    mounted() {
      this.areaList = [{"childList":[{"code":520000,"name":"全省","parentCode":0,"type":1}],"code":520000,"name":"贵州省","parentCode":0,"type":0},{"childList":[{"code":520101,"name":"市辖区","parentCode":520100,"type":2},{"code":520102,"name":"南明区","parentCode":520100,"type":2},{"code":520103,"name":"云岩区","parentCode":520100,"type":2},{"code":520111,"name":"花溪区","parentCode":520100,"type":2},{"code":520112,"name":"乌当区","parentCode":520100,"type":2},{"code":520113,"name":"白云区","parentCode":520100,"type":2},{"code":520115,"name":"观山湖区","parentCode":520100,"type":2},{"code":520121,"name":"开阳县","parentCode":520100,"type":2},{"code":520122,"name":"息烽县","parentCode":520100,"type":2},{"code":520123,"name":"修文县","parentCode":520100,"type":2},{"code":520181,"name":"清镇市","parentCode":520100,"type":2}],"code":520100,"name":"贵阳市","parentCode":520000,"type":1},{"childList":[{"code":520201,"name":"钟山区","parentCode":520200,"type":2},{"code":520203,"name":"六枝特区","parentCode":520200,"type":2},{"code":520221,"name":"水城县","parentCode":520200,"type":2},{"code":520281,"name":"盘县","parentCode":520200,"type":2}],"code":520200,"name":"六盘水市","parentCode":520000,"type":1},{"childList":[{"code":520301,"name":"市辖区","parentCode":520300,"type":2},{"code":520302,"name":"红花岗区","parentCode":520300,"type":2},{"code":520303,"name":"汇川区","parentCode":520300,"type":2},{"code":520321,"name":"播州区","parentCode":520300,"type":2},{"code":520322,"name":"桐梓县","parentCode":520300,"type":2},{"code":520323,"name":"绥阳县","parentCode":520300,"type":2},{"code":520324,"name":"正安县","parentCode":520300,"type":2},{"code":520325,"name":"道真县","parentCode":520300,"type":2},{"code":520326,"name":"务川县","parentCode":520300,"type":2},{"code":520327,"name":"凤冈县","parentCode":520300,"type":2},{"code":520328,"name":"湄潭县","parentCode":520300,"type":2},{"code":520329,"name":"余庆县","parentCode":520300,"type":2},{"code":520330,"name":"习水县","parentCode":520300,"type":2},{"code":520381,"name":"赤水市","parentCode":520300,"type":2},{"code":520382,"name":"仁怀市","parentCode":520300,"type":2}],"code":520300,"name":"遵义市","parentCode":520000,"type":1},{"childList":[{"code":520401,"name":"市辖区","parentCode":520400,"type":2},{"code":520402,"name":"西秀区","parentCode":520400,"type":2},{"code":520421,"name":"平坝县","parentCode":520400,"type":2},{"code":520422,"name":"普定县","parentCode":520400,"type":2},{"code":520423,"name":"镇宁县","parentCode":520400,"type":2},{"code":520424,"name":"关岭县","parentCode":520400,"type":2},{"code":520425,"name":"紫云县","parentCode":520400,"type":2}],"code":520400,"name":"安顺市","parentCode":520000,"type":1},{"childList":[{"code":520501,"name":"市辖区","parentCode":520500,"type":2},{"code":520502,"name":"七星关区","parentCode":520500,"type":2},{"code":520521,"name":"大方县","parentCode":520500,"type":2},{"code":520522,"name":"黔西县","parentCode":520500,"type":2},{"code":520523,"name":"金沙县","parentCode":520500,"type":2},{"code":520524,"name":"织金县","parentCode":520500,"type":2},{"code":520525,"name":"纳雍县","parentCode":520500,"type":2},{"code":520526,"name":"威宁县","parentCode":520500,"type":2},{"code":520527,"name":"赫章县","parentCode":520500,"type":2}],"code":520500,"name":"毕节市","parentCode":520000,"type":1},{"childList":[{"code":520601,"name":"市辖区","parentCode":520600,"type":2},{"code":520602,"name":"碧江区","parentCode":520600,"type":2},{"code":520603,"name":"万山区","parentCode":520600,"type":2},{"code":520621,"name":"江口县","parentCode":520600,"type":2},{"code":520622,"name":"玉屏县","parentCode":520600,"type":2},{"code":520623,"name":"石阡县","parentCode":520600,"type":2},{"code":520624,"name":"思南县","parentCode":520600,"type":2},{"code":520625,"name":"印江县","parentCode":520600,"type":2},{"code":520626,"name":"德江县","parentCode":520600,"type":2},{"code":520627,"name":"沿河县","parentCode":520600,"type":2},{"code":520628,"name":"松桃县","parentCode":520600,"type":2}],"code":520600,"name":"铜仁市","parentCode":520000,"type":1},{"childList":[{"code":522301,"name":"兴义市","parentCode":522300,"type":2},{"code":522322,"name":"兴仁县","parentCode":522300,"type":2},{"code":522323,"name":"普安县","parentCode":522300,"type":2},{"code":522324,"name":"晴隆县","parentCode":522300,"type":2},{"code":522325,"name":"贞丰县","parentCode":522300,"type":2},{"code":522326,"name":"望谟县","parentCode":522300,"type":2},{"code":522327,"name":"册亨县","parentCode":522300,"type":2},{"code":522328,"name":"安龙县","parentCode":522300,"type":2}],"code":522300,"name":"黔西南州","parentCode":520000,"type":1},{"childList":[{"code":522601,"name":"凯里市","parentCode":522600,"type":2},{"code":522622,"name":"黄平县","parentCode":522600,"type":2},{"code":522623,"name":"施秉县","parentCode":522600,"type":2},{"code":522624,"name":"三穗县","parentCode":522600,"type":2},{"code":522625,"name":"镇远县","parentCode":522600,"type":2},{"code":522626,"name":"岑巩县","parentCode":522600,"type":2},{"code":522627,"name":"天柱县","parentCode":522600,"type":2},{"code":522628,"name":"锦屏县","parentCode":522600,"type":2},{"code":522629,"name":"剑河县","parentCode":522600,"type":2},{"code":522630,"name":"台江县","parentCode":522600,"type":2},{"code":522631,"name":"黎平县","parentCode":522600,"type":2},{"code":522632,"name":"榕江县","parentCode":522600,"type":2},{"code":522633,"name":"从江县","parentCode":522600,"type":2},{"code":522634,"name":"雷山县","parentCode":522600,"type":2},{"code":522635,"name":"麻江县","parentCode":522600,"type":2},{"code":522636,"name":"丹寨县","parentCode":522600,"type":2}],"code":522600,"name":"黔东南州","parentCode":520000,"type":1},{"childList":[{"code":522701,"name":"都匀市","parentCode":522700,"type":2},{"code":522702,"name":"福泉市","parentCode":522700,"type":2},{"code":522722,"name":"荔波县","parentCode":522700,"type":2},{"code":522723,"name":"贵定县","parentCode":522700,"type":2},{"code":522725,"name":"瓮安县","parentCode":522700,"type":2},{"code":522726,"name":"独山县","parentCode":522700,"type":2},{"code":522727,"name":"平塘县","parentCode":522700,"type":2},{"code":522728,"name":"罗甸县","parentCode":522700,"type":2},{"code":522729,"name":"长顺县","parentCode":522700,"type":2},{"code":522730,"name":"龙里县","parentCode":522700,"type":2},{"code":522731,"name":"惠水县","parentCode":522700,"type":2},{"code":522732,"name":"三都县","parentCode":522700,"type":2}],"code":522700,"name":"黔南州","parentCode":520000,"type":1}]
      this.cityList = this.areaList[0].childList;
    },

    methods: {
      showArea () {
        this.isShowArea = !this.isShowArea;
        this.isShowFilter = false;
      },
      selectArea (item, index) {
        this.areaName = '';
        this.cityName = '';
        this.areaName += item.name;
        this.activeAreaIndex = index;
        this.cityList = this.areaList[index].childList;
        this.activeCityIndex = '';
      },
      selectCity (item, index) {
        this.cityName = item.code === 520000 ? '' : item.name;
        this.areaCode = item.code;
        this.activeCityIndex = index;
        this.isShowArea = false;
        let data = {
          cityName: item.code === 520000 ? '' : item.name,
          areaCode: item.code,
          index
        }
        this.$emit('selectCity', data)
      },
      closeArea () {
        this.isShowArea = false;
        this.isShowFilter = false;
      }
    }

  }
</script>

<style scoped lang="scss">
    .demo {
        .area {
            position: fixed;
            width: 100%;
            height: 0;
            transition: .5s;
            transform: translateZ(0);
            left: 0;
            z-index: 11;
            background: rgba(0, 0, 0, 0.5);

            overflow: hidden;

            &.active {
                height: 100%;
            }

            &-avial {
                display: flex;
                justify-content: space-between;
                align-items: stretch;
            }
            ul{
                list-style: none;
                padding: 0;
                margin-top: 0;
            }
            .left {
                font-family: PingFangSC-Regular;
                width: 102px;
                background: white;
                text-align: center;
                font-weight:400;

                li {
                    padding: 10px 0;
                    font-size:14px;
                    color:rgba(70,81,102,1);

                    &.active {
                        background: rgba(245, 246, 247, 1);
                        color: rgba(255, 168, 9, 1);
                    }
                }
            }

            .right {
                font-family: PingFangSC-Regular;
                max-height: 400px;
                overflow: scroll;
                flex: 1;
                background: rgba(245, 246, 247, 1);

                li {
                    position: relative;
                    font-size: 14px;
                    padding: 10px 0;
                    text-align: center;

                    i {
                        position: absolute;
                        top: 7px;
                        right: 16px;
                        font-size: 20px;
                    }
                }

                .active {
                    background: rgba(238, 239, 240, 1);
                    color: rgba(255, 168, 9, 1);
                }
            }
        }
    }
</style>