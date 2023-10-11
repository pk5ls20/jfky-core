<template>
  <div class="main">
    <div class="main-formShow" v-if="lastShow">
      <div class="post-title">
        <h2>{{ postTitle }}</h2>
      </div>
      <div class="post-author-time">
        {{ `${postAuthor} | ${postTime} 发布了作品` }}
      </div>
      <div class="post-main">
        <div class="post-prompt" v-if=postPrompt>
          <h2>提示词</h2>
          {{ postPrompt }}
        </div>
        <div class="post-info" v-if=postInfo>
          <h2>说明</h2>
          {{ postInfo }}
        </div>
        <div class="post-pic" v-if=postImg>
          <h2>样图</h2>
          <el-carousel
              arrow="always"
          >
            <el-carousel-item class="post-pic-show" v-for="item in postImg" :key="item" height="auto">
              <img :src="item" alt=""/>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="post-comment">
          <h2></h2>
          <component :is="currentWalineContent"></component>
        </div>
      </div>
    </div>
  </div>
  <div class="after-formShow-blank"></div>
</template>
<script>
import {useStore} from "vuex";
import {computed, onBeforeUnmount} from "vue";
import {ElMessage} from "element-plus";
import dayjs from 'dayjs';
import router from "@/router";
import WalineContent from "@/views/Comment/WalineContent.vue";

export default {
  setup() {
    const store = useStore();
    const lastShow = computed(() => store.state.lastShow);
    const postTitle = computed(() => lastShow.value === null ? "" : `${lastShow.value.self_id} ${lastShow.value.self_name}`);
    const postAuthor = computed(() => lastShow.value === null ? "" : lastShow.value.author);
    const postTime = computed(() => lastShow.value === null ? "" : dayjs.unix(Number(lastShow.value?.time) || 0).format('YYYY-MM-DD HH:mm:ss'));
    const postPrompt = computed(() => lastShow.value === null ? "" : lastShow.value.prompt);
    const postInfo = computed(() => lastShow.value === null ? "" : lastShow.value.info);
    const postImg = computed(() => lastShow.value === null ? "" : lastShow.value.picurl);
    if (!lastShow.value) {
      ElMessage.error("小伙子你是不是走错了qwq")
      setTimeout(() => {
        router.push('/show')
      }, 1500);
    }
    onBeforeUnmount(() => {
      store.commit('setLastShow', null);
      store.commit('setLastShowID', null);
      // console.log("unmounted");
    });
    return {
      lastShow,
      postTitle,
      postAuthor,
      postTime,
      postPrompt,
      postInfo,
      postImg,
      currentWalineContent: WalineContent
    }
  },

}
</script>

<style scoped>

.main-formShow {
  background-color: #fff;
  border-radius: 4px;
  flex-shrink: 0;
  padding: 0 40px 40px;
  margin-bottom: 12px;
}

.main {
  width: 900px;
  height: 100%;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  margin: 0 auto 99px;
  position: relative
}

.post-author-time {
  font-size: 0.9em;
  color: #808080;
}

.post-main h2 {
  color: #1b1f23;
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: .3em;
  border-bottom: 1px solid #eaecef;
}

.post-main h2 .octicon-link {
  vertical-align: middle;
  visibility: hidden;
}

.post-main h2:hover .anchor {
  text-decoration: none;
}

.post-main h2:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'%3E%3Cpath fill-rule='evenodd' d='M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z'%3E%3C/path%3E%3C/svg%3E");
}

.post-pic img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}

.post-pic-show {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 100%;
  overflow: hidden;
}

</style>