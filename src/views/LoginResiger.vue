<template>
  <div class="login-register">
    <div class="contain">
      <div class="big-box" :class="{active:isLogin}">
        <div class="big-contain" key="bigContainLogin" v-if="isLogin">
          <div class="btitle">茳风矿业</div>
          <div class="bform">
            <input type="text" placeholder="qq号" v-model="userQQ">
            <input type="password" placeholder="密码" v-model="userPwd">
          </div>
          <button class="bbutton" @click="login">登录</button>
          <button class="bbutton" v-if="isMobile" @click="changeType">注册</button> <!-- 移动端展示 -->
        </div>
        <div class="big-contain" key="bigContainRegister" v-else>
          <div class="btitle">创建账户</div>
          <div class="bform">
            <input type="text" placeholder="邀请码" v-model="inviteNum">
            <input type="text" placeholder="用户名" v-model="userName">
            <input type="text" placeholder="qq号" v-model="userQQ">
            <input type="password" placeholder="密码" v-model="userPwd">
          </div>
          <button class="bbutton" @click="register">注册</button>
          <button class="bbutton" v-if="isMobile" @click="changeType">登录</button> <!-- 移动端展示 -->
        </div>
      </div>
      <div class="small-box" :class="{active:isLogin}" v-if="!isMobile"> <!-- 桌面端展示 -->
        <div class="small-contain" key="smallContainRegister" v-if="isLogin">
          <div class="stitle">你好，铜矿工!</div>
          <p class="scontent">开始注册，和我们一起挖矿</p>
          <button class="sbutton" @click="changeType">注册</button>
        </div>
        <div class="small-contain" key="smallContainLogin" v-else>
          <div class="stitle">欢迎回来!</div>
          <p class="scontent">今天你挖矿了吗qwq</p>
          <button class="sbutton" @click="changeType">登录</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import {computed} from 'vue'
import {useStore} from 'vuex';
import {ElMessage} from "element-plus";
import axiosInstance from '@/axios';
import router from "@/router";
import {createHash} from "crypto-browserify";
import {ElLoading} from 'element-plus';
// import 'amfe-flexible';

export default {
  name: 'login-register',
  setup() {
    const store = useStore();
    const existed = computed(() => store.state.existed);
    const isLogin = computed(() => store.state.isLogin);
    const emailError = computed(() => store.state.emailError);
    const userQQ = computed({
      get: () => store.state.form.userqq,
      set: value => store.commit('setUserQQ', value)
    });
    const userPwd = computed({
      get: () => store.state.form.userpwd,
      set: value => store.commit('setUserPwd', value)
    });
    const userName = computed({
      get: () => store.state.form.username,
      set: value => store.commit('setUsername', value)
    });
    const inviteNum = computed({
      get: () => store.state.form.invitenum,
      set: value => store.commit('setInviteNum', value)
    });
    const changeType = () => {
      store.commit('setIsLogin', store.state.isLogin === false);
      store.commit('setForm', {
        username: '',
        userqq: '',
        userpwd: ''
      })
    }
    const login = async () => {
      if (!store.state.form.userqq || !store.state.form.userpwd) {
        alert("填写不能为空！");
        return;
      }
      const loadingInstance = ElLoading.service({fullscreen: true});
      try {
        const hash1 = createHash('sha256');
        hash1.update(store.state.form.userpwd);
        const hashedPassword = hash1.digest('hex');
        const res = await axiosInstance.post('/userlogin', {
          qq: store.state.form.userqq,
          password: hashedPassword
        })
        switch (res.data) {
          case 0:
            ElMessage.success("登录成功！");
            await router.push('/form', () => {
              // console.log("Navigation successful!");
            }, (error) => {
              console.error("Navigation failed:", error);
            });
            break;
          case -1:
            ElMessage.error("用户不存在！");
            store.commit("setEmailError", true);
            break;
          case 1:
            ElMessage.error("密码错误！");
            store.commit("setPasswordError", true);
            break;
        }
      } catch (err) {
        ElMessage.error(err.toString());
        // console.log(err);
      } finally {
        loadingInstance.close();
      }
    }
    const register = async () => {
      if (!store.state.form.username || !store.state.form.userqq || !store.state.form.userpwd || !store.state.form.invitenum) {
        alert("填写不能为空！");
        return;
      }
      const loadingInstance = ElLoading.service({fullscreen: true});
      try {
        const hash1 = createHash('sha256'), hash2 = createHash('sha256');
        hash1.update(store.state.form.userpwd);
        hash2.update(store.state.form.invitenum);
        const hashedPassword = hash1.digest('hex');
        const hashedInviteNum = hash2.digest('hex');
        const res = await axiosInstance.post('/useradd', {
          username: store.state.form.username,
          qq: store.state.form.userqq,
          password: hashedPassword,
          inviteNum: hashedInviteNum
        })
        ElMessage.info("正在注册中，...")
        switch (res.data) {
          case 0:
            ElMessage.success("注册成功！");
            await login();
            break;
          case -1:
            ElMessage.error("用户已存在！");
            store.state.existed = true;
            break;
          case -114514:
            ElMessage.error("邀请码错误！");
            store.state.existed = true;
            break;
        }
      } catch (err) {
        ElMessage.error(err.toString())
        // console.log(err);
      } finally {
        loadingInstance.close();
      }
    }
    return {
      changeType,
      emailError,
      existed,
      login,
      isLogin,
      register,
      userQQ,
      userPwd,
      userName,
      inviteNum
    }
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768
    };
  },
  mounted() {
    window.addEventListener('resize', this.updateIsMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateIsMobile);
  },
  methods: {
    updateIsMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
  }
}
</script>


<style scoped>
.login-register {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}

.contain {
  width: 60%;
  height: 60%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 0 3px #f0f0f0,
  0 0 6px #f0f0f0;
}

.big-box {
  width: 70%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 30%;
  transform: translateX(0%);
  transition: all 1s;
}

.big-contain {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.btitle {
  font-size: 1.5em;
  font-weight: bold;
  color: rgb(57, 167, 176);
}

.bform {
  width: 100%;
  height: 40%;
  padding: 2em 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.bform input {
  width: 50%;
  height: 30px;
  border: none;
  outline: none;
  border-radius: 10px;
  padding-left: 2em;
  background-color: #f0f0f0;
}

.bbutton {
  width: 20%;
  height: 40px;
  border-radius: 24px;
  border: none;
  outline: none;
  background-color: rgb(57, 167, 176);
  color: #fff;
  font-size: 0.9em;
  cursor: pointer;
}

.small-box {
  width: 30%;
  height: 100%;
  background: linear-gradient(135deg, rgb(57, 167, 176), rgb(56, 183, 145));
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(0%);
  transition: all 1s;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
}

.small-contain {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stitle {
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
}

.scontent {
  font-size: 0.8em;
  color: #fff;
  text-align: center;
  padding: 2em 4em;
  line-height: 1.7em;
}

.sbutton {
  width: 60%;
  height: 40px;
  border-radius: 24px;
  border: 1px solid #fff;
  outline: none;
  background-color: transparent;
  color: #fff;
  font-size: 0.9em;
  cursor: pointer;
}

.big-box.active {
  left: 0;
  transition: all 0.5s;
}

.small-box.active {
  left: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  transform: translateX(-100%);
  transition: all 1s;
}

@media (max-width: 768px) {
  .big-box,
  .small-box {
    transition: none !important;
    left: 0 !important;
    transform: translateX(0%) !important;
  }

  .big-box.active,
  .small-box.active {
    left: 0 !important;
    transform: translateX(0%) !important;
  }

  .bform input {
    width: 70%;
    padding: 10px;
    margin-bottom: 10px;
  }

  .contain {
    width: 100%;
    height: auto;
  }

  .small-box,
  .small-contain {
    display: none; /* 隐藏 small-box 和 small-contain */
  }

  .big-box {
    width: 100%;
  }

  .bbutton,
  .sbutton {
    width: 40%; /* 保持原来的宽度 */
    height: 40px; /* 用像素来设置高度 */
    line-height: 40px; /* 使文字垂直居中 */
    font-size: 22px;
    margin-bottom: 20px;
    position: relative;
    top: 60px;
  }

  .btitle,
  .stitle {
    font-size: 32px;
    position: relative;
    top: -70px; /* 向上移动20像素，根据需要进行调整 */
  }

  .scontent {
    padding: 1em;
  }

}
</style>
