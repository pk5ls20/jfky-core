<template>
  <el-menu
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      router
  >
    <el-menu-item index="/">茳风矿业</el-menu-item>
    <div class="flex-grow"/>
    <el-menu-item v-if=isLogin>{{ `欢迎, ${userID}` }}</el-menu-item>
    <el-menu-item v-if=isLogin index="/form/show">查看作品</el-menu-item>
    <el-menu-item v-if=isLogin index="/form/fill">提交作品</el-menu-item>
    <el-menu-item v-if=isLogin index="/form/commit-history">更新日志</el-menu-item>
    <el-sub-menu v-if=isLogin index="more">
      <template #title>更多</template>
      <el-menu-item index="/logout">退出登录</el-menu-item>
    </el-sub-menu>
  </el-menu>
  <div v-if="isCheckPassed">
    <router-view></router-view>
  </div>
</template>

<script>
import {computed, ref} from "vue";
import store from "@/store";
import {ElMessage} from "element-plus";
import {ElLoading} from 'element-plus';
import axiosInstance from "@/axios";
import router from "@/router";

export default {
  setup() {
    const userID = computed(() => store.state.form.username);
    const isLogin = computed(() => store.state.isLogin);
    const isCheckPassed = ref(false);
    store.commit('setIsLogin', false)
    const check = async () => {
      const loadingInstance = ElLoading.service({fullscreen: true});
      try {
        const res = await axiosInstance.get('/userinfo', {});
        if (res.data.status.success) {
          isCheckPassed.value = true;
          ElMessage.success("鉴权成功！")
          store.commit('setIsLogin', true)
          store.commit('setUserQQ', res.data.data.userqq)
          store.commit('setUsername', res.data.data.username)
          store.commit('setId', res.data.data.id)
        } else {
          store.state.isLogin = false;
          store.commit('setIsLogin', false)
          store.commit('setUserQQ', "")
          store.commit('setId', "")
          store.commit('setUserName', "")
          setTimeout(() => {
            router.push('/login')
          }, 500);
        }
        // console.log(res.data)
      } catch (e) {
        ElMessage.error(e.toString());
        setTimeout(() => {
          router.push('/login')
        }, 500);
      } finally {
        loadingInstance.close();
      }
    }
    check();
    return {
      userID,
      isCheckPassed,
      isLogin
    }
  }
}
</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
