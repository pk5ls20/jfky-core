<template>
  <div class="home">
    <el-table :data="allTableData" style="width: 100%">
      <el-table-column type="index" width="50"/>
      <el-table-column prop="id" label="自定编号" width="150"/>
      <el-table-column prop="name" label="名称" width="150"/>
      <el-table-column prop="author" label="作者" width="150"/>
      <el-table-column prop="prompt" label="提示词"/>
      <el-table-column prop="info" label="补充信息"/>
      <el-table-column label="预览图">
        <template v-slot="{ row }">
          <div class="image-container">
            <img :src="row.picurl?.[0]" alt="预览图"/>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更多操作">
        <template #default="scope">
          <el-button link type="primary" @click="clickDetail(scope.$index)">详细查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block">
      <el-pagination
          background
          layout="prev, pager, next ,total,sizes"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>
import {defineComponent, reactive, ref, toRefs} from "vue";
import {useStore} from "vuex";
import cos from "@/utils/cos";
import router from "@/router";
import axios from "@/axios";
import {ElMessage} from "element-plus";

export default defineComponent({
  name: "HomeView",
  components: {},
  setup() {
    const store = useStore();
    const allTableData = ref([]);

    async function getAllUrls(keysList) {
      const allPromises = keysList.map(keys =>
          Promise.all(keys.map(key =>
              new Promise((resolve) => {
                const timeout = setTimeout(() => {
                  resolve('');
                }, 5000);
                cos.getObjectUrl({
                  Bucket: process.env.VUE_APP_COS_BUCKET,
                  Region: process.env.VUE_APP_COS_REGION,
                  Key: key,
                  Sign: true,
                }, (err, data) => {
                  clearTimeout(timeout);
                  if (err) {
                    resolve('');
                    return;
                  }
                  const url = data.Url;
                  resolve(url);
                });
              })
          ))
      );
      return await Promise.all(allPromises);
    }
    ElMessage.info("正在获取数据中...");
    (async () => {
      const response = await axios.get('/fetchform');
      allTableData.value = response.data;
      // console.log(allTableData.value);
      const keysShow = allTableData.value.map(item => {
        if (item.pic && item.pic.length > 0) return item.pic;
        return [''];
      });
      const allUrls = await getAllUrls(keysShow);
      allTableData.value.forEach((item, index) => {
        item.picurl = allUrls[index] || [''];
      });
      ElMessage.success(`成功获取${allTableData.value.length}条数据！`);
    })();
    const clickDetail = (index) => {
      store.commit('setLastShow', allTableData.value[index]);
      router.push('/show/detail');
      // console.log(index)
    }

    const state = reactive({
      page: 1,
      limit: 10,
      total: allTableData.value.length,
    });
    const tableData = () => {
      return allTableData.value.filter(
          (item, index) =>
              index < state.page * state.limit &&
              index >= state.limit * (state.page - 1)
      );
    };
    const handleCurrentChange = (e) => {
      state.page = e;
    };
    const handleSizeChange = (e) => {
      state.limit = e;
    };
    return {
      clickDetail,
      allTableData,
      tableData,
      handleCurrentChange,
      handleSizeChange,
      ...toRefs(state),
    };
  },
});
</script>


<style scoped>
h1 {
  color: #42b983;
}

.image-container img {
  width: 300px;
  height: 200px;
  object-fit: cover;
  object-position: top;
}
</style>
