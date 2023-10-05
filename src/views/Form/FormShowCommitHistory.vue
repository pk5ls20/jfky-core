<template>
  <div class="timeline-container">
    <div class="timeline-title">
      <h2>更新日志</h2>
    </div>
    <el-timeline class="timeline-main">
      <el-timeline-item
          v-for="commit in commits"
          :key="commit.timestamp"
          :timestamp="commit.timestamp"
          placement="top"
      >
        <el-card>
          <h4>{{ `${commit.title}[${commit.sha}]` }}</h4>
          <p v-html="commit.content.replace(/\n/g, '<br />')"></p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue';
import axios from "@/axios";
import {ElLoading} from "element-plus";

export default {
  setup() {
    const commits = ref([]);
    onMounted(async () => {
      const loadingInstance = ElLoading.service({fullscreen: true});
      try {
        console.log('fetching commits');
        const response = await axios.get('/commitapi');
        commits.value = response.data;
      } catch (error) {
        console.error(error);
      } finally {
        loadingInstance.close();
      }
    });
    return {
      commits,
    };
  },
}
</script>

<style scoped>
.timeline-container {
  position: relative;
  bottom: 0px;
  margin: 0 auto;
  max-width: 800px;
}

.timeline-title h2 {
  color: #1b1f23;
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: .3em;
  border-bottom: 1px solid #eaecef;
}

.timeline-title h2 .octicon-link {
  vertical-align: middle;
  visibility: hidden;
}

.timeline-title h2:hover .anchor {
  text-decoration: none;
}

.timeline-title h2:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'%3E%3Cpath fill-rule='evenodd' d='M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z'%3E%3C/path%3E%3C/svg%3E");
}
</style>