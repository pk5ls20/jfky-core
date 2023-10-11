<template>
  <div class="home">
    <el-table :data="tableData()" style="width: 100%">
      <el-table-column type="index" width="50"/>
      <el-table-column prop="self_id" label="自定编号" width="150"/>
      <el-table-column prop="self_name" label="名称" width="150"/>
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
          <el-button link type="primary" v-if="userLevel === 1" @click="clickEdit(scope.$index)">编辑</el-button>
          <el-button link type="primary" v-if="userLevel === 1" @click="clickDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block">
      <el-pagination
          background
          layout="prev, pager, next ,total,sizes"
          :total=total
          @current-change=handleCurrentChange
          @size-change=handleSizeChange
      />
    </div>
  </div>
</template>

<script>
import {computed, defineComponent, reactive, ref, toRefs} from "vue";
import {useStore} from "vuex";
import router from "@/router";
import axios from "@/axios";
import {ElLoading, ElMessage, ElMessageBox} from "element-plus";

export default defineComponent({
  name: "HomeView",
  components: {},
  setup() {
    const store = useStore();
    const allTableData = ref([]);
    const state = reactive({
      page: 1,
      limit: 10,
      total: allTableData.value.length,
    });
    const userLevel = computed(() => store.state.form.userlevel);
    // console.log(allTableData.value);
    async function getAllUrls(keysList) {
      const baseUrl = 'https://r2.whitefea5.top/';
      return keysList.map(keys => keys.map(key => `${baseUrl}${key}`));
    }

    const loadingInstance = ElLoading.service({fullscreen: true});
    ElMessage.info("正在获取数据中...");
    try {
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
        state.total = allTableData.value.length;
        loadingInstance.close();
      })();
    } catch (e) {
      ElMessage.error(e.toString());
      loadingInstance.close();
    }
    const clickDetail = (index) => {
      store.commit('setLastShow', allTableData.value[index + (state.page - 1) * 10]);
      router.push(`show/${index + (state.page - 1) * 10}`);
      // console.log(index)
    }
    const clickEdit = (index) => {
      store.commit('setLastShow', allTableData.value[index + (state.page - 1) * 10]);
      store.commit('setFormFillWay', 'update');
      router.push(`fill`);
      // console.log(index + (state.page - 1) * 10)
    }
    const clickDelete = (index) => {
      ElMessageBox.confirm('此操作将永久删除该作品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const loadingInstance = ElLoading.service({fullscreen: true});
        try {
          const response = await axios.post('/deleteform', {
            id: allTableData.value[index + (state.page - 1) * 10].id,
            user_id: store.state.form.id
          });
          if (response.data.success) {
            ElMessage.success("删除成功！");
            allTableData.value.splice(index + (state.page - 1) * 10, 1);
            state.total = allTableData.value.length;
          } else {
            ElMessage.error("删除失败！");
          }
        } catch (e) {
          ElMessage.error(e.toString());
        } finally {
          loadingInstance.close();
        }
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    }
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
      userLevel,
      clickEdit,
      clickDelete,
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
