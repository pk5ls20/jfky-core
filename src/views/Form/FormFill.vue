<template>
  <div class="user-form-container">
    <el-form :model="localForm" :rules="rules" label-width="120px">
      <div class="form-content">
        <div class="form-inputs">
          <el-form-item label="自定编号" prop="id">
            <el-input v-model.lazy="localForm.self_id"/>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model.lazy="localForm.self_name"/>
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model.lazy="localForm.author" :disabled="userLevel<1"/>
          </el-form-item>
          <el-form-item label="提示词" prop="prompt">
            <el-input v-model.lazy="localForm.prompt" autosize type="textarea"/>
          </el-form-item>
          <el-form-item label="补充说明" prop="info">
            <el-input v-model.lazy="localForm.info" autosize type="textarea"/>
          </el-form-item>
          <el-form-item label="上传样图">
            <div class="upload-container">
              <el-upload
                  ref="avatarUploader"
                  class="avatar-uploader"
                  action="#"
                  :before-upload="beforeUpload"
                  :http-request="upload"
                  :on-change="changeFile"
                  :auto-upload="false"
                  :on-success="uploadPicSuccess"
                  :file-list="fileList"
                  :on-remove="onRemove"
              >
                <template v-slot:trigger>
                  <el-button type="primary">上传</el-button>
                </template>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
          <div class="upload-progress">
            <el-progress v-if="false" :percentage="localForm.percent"/>
            <!--            <el-progress v-if="localForm.showPercent" :percentage="localForm.percent"/>-->
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import {computed, onBeforeUnmount, reactive, ref} from 'vue';
import {useStore} from "vuex";
import {ElMessage, ElMessageBox} from 'element-plus';
import axiosInstance from "@/axios";

export default {
  methods: {ElMessage},
  setup() {
    const store = useStore();
    const lastShow = computed(() => store.state.lastShow);
    // console.log(lastShow.value);
    const avatarUploader = ref(null);
    const userLevel = computed(() => store.state.form.userlevel);
    const localForm = reactive({
      id: lastShow.value === null ? "" : lastShow.value.id,
      self_id: lastShow.value === null ? "" : lastShow.value.self_id,
      self_name: lastShow.value === null ? "" : lastShow.value.self_name,
      author: lastShow.value === null ? (store.state.form.username ? store.state.form.username : '') : lastShow.value.author,
      prompt: lastShow.value === null ? "" : lastShow.value.prompt,
      info: lastShow.value === null ? "" : lastShow.value.info,
      fileList: null,
      showDialog: false,
      imgUrl: "",
      currentFileUid: null,
      showPercent: false,
      percent: 0,
      fileListLen: lastShow.value === null ? 0 : lastShow.value.picurl.length,
      currentTime: "",
      fillWay: store.state.formFillWay === null ? "insert" : "update"
    });
    localForm.fileList = (lastShow.value && lastShow.value.picurl) ?
        lastShow.value.picurl.map((url, index) => ({
          name: lastShow.value.pic[index],
          url: url,
        })) : [];
    const fileList = computed(() => {
      if (lastShow.value === null) {
        return [];
      }
      return lastShow.value.picurl.map((url, index) => {
        return {
          name: lastShow.value.pic[index],
          url: url,
        };
      });
    });
    // console.log(localForm.fileList)
    localForm.currentTime = `${Math.round(new Date().getTime() / 1000)}`;
    const showPercent = ref(false);
    const rules = reactive({
      self_id: [
        {required: true, message: '自定编号不能为空qaq', trigger: 'blur'}
      ],
      author: [
        {required: true, message: '作者不能为空qaq', trigger: 'blur'},
      ],
      prompt: [
        {required: true, message: '提示词不能为空qaq', trigger: 'blur'},
      ],
    });
    const beforeUpload = (file) => {
      const types = ["image/jpeg", "image/bmp", "image/png"];
      if (!types.some((item) => item === file.type)) {
        ElMessage.warning("上传图片只能是 JPG、BMP、PNG 格式!");
        return false;
      }
      const fieldsToCheck = ['id', 'name', 'author', 'prompt', 'info'];
      const allNumeric = fieldsToCheck.every(field => /^\d*$/.test(localForm[field]));
      if (allNumeric) {
        ElMessage.warning("内容不可全部为数字！");
        return false;
      }
      localForm.currentFileUid = file.uid;
      localForm.showPercent = true;
      return true;
    };
    const upload = async (params) => {
      if (params.file) {
        try {
          const arrayBuffer = await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(params.file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
          });
          const headers_ = {
            'Content-Type': 'application/octet-stream',
            'x-content-type': params.file.type.toString(),
            'x-file-name': `${localForm.currentTime}-${localForm.fileList.findIndex(file => file.name === params.file.name)}-${params.file.name}`
          }
          // console.log(headers_);
          await axiosInstance.post('/putobjectr2', arrayBuffer, {
            headers: headers_
          });
        } catch (error) {
          localForm.percent += Math.round(1 / localForm.fileListLen * 100);
          ElMessage.error('Error uploading file:', error);
        }
      }
    };
    const uploadPicSuccess = () => {
      localForm.percent += Math.round(1 / localForm.fileList.length * 100);
      localForm.percent === 99 ? localForm.percent = 100 : localForm.percent;
      localForm.percent === 100 ? ElMessage.success('全部文件上传成功！') : localForm.percent;
    };
    const changeFile = (file, fileList) => {
      // localForm.fileList = fileList.map((item) => item);
      // fileList.value = fileList.map((item) => item);
      localForm.fileList = fileList;
      localForm.fileListLen = localForm.fileList.length;
    };
    const onRemove = (file, fileList) => {
      localForm.fileList = fileList;
      localForm.fileListLen = localForm.fileList.length;
    };
    const onSubmit = async () => {
      localForm.showPercent = false;
      localForm.percent = localForm.fileList.length === 0 ? 0 : localForm.fileList.length / (localForm.fileList.length + localForm.fileList.length) * 100;
      await ElMessageBox.confirm(
          '确认提交吗(/≧▽≦)/',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
      );
      if (localForm.self_id === "" || localForm.author === "" || localForm.prompt === "") {
        ElMessage.error("请填写完整信息！");
        return;
      }
      const userInfo = {
        id: localForm.id,
        user_id: store.state.form.id,
        self_id: localForm.self_id.toString(),
        self_name: localForm.self_name.toString(),
        time: localForm.currentTime.toString(),
        author: localForm.author.toString(),
        prompt: localForm.prompt.toString(),
        info: localForm.info.toString(),
        pic: localForm.fileList.map(file => {
          // console.log(file)
          if (file.status === 'ready') {
            return `${localForm.currentTime}-${localForm.fileList.indexOf(file)}-${file.name}`;
          }
          return file.name;
        }),
        way: localForm.fillWay.toString(),
      };
      try {
        const resInfo = await axiosInstance.post('/postform', userInfo);
        // console.log(resInfo)
        if (resInfo.data.success) {
          ElMessage.success("表单提交成功！");
        } else {
          ElMessage.error("表单提交失败！");
          return;
        }
      } catch (e) {
        ElMessage.error(e.toString());
        return;
      }
      ElMessage({
        duration: 5000,
        message: "正在上传图片中，请耐心等待直到文件旁全部打勾...",
        type: 'info',
      })
      avatarUploader.value.submit();
    };
    onBeforeUnmount(() => {
      store.commit('setLastShow', null);
      store.commit('setLastShowID', null);
      store.commit('setFormFillWay', null);
      // console.log("unmounted");
    });
    return {
      localForm,
      onSubmit,
      avatarUploader,
      rules,
      beforeUpload,
      upload,
      changeFile,
      showPercent,
      uploadPicSuccess,
      userLevel,
      fileList,
      onRemove
    };
  }
};
</script>

<style scoped>
.user-form-container {
  position: relative;
  bottom: -100px;
  left: 400px;
  width: 600px;
  height: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.upload-container {
  display: flex;
  align-items: center;
}

.upload-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}

</style>