<template>
  <div></div>
</template>

<script>
import {useStore} from "vuex";
import Cookies from "js-cookie";
import {ElMessage} from "element-plus";
import router from "@/router";

export default {
  setup(){
    const store = useStore();
    Cookies.remove("authToken")
    store.commit('setIsLogin', false)
    store.commit('setUserQQ', "")
    store.commit('setId', "")
    store.commit('setUserName', "")
    ElMessage.success('退出成功！')
    setTimeout(() => {
      router.push('/login')
    }, 1500);
  }
}
</script>