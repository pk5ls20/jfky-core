<template>
  <div class="user-form-container">
    <el-form :model="localForm" :rules="rules" label-width="120px">
      <div class="form-content">
        <div class="form-inputs">
          <el-form-item label="自定编号" prop="id">
            <el-input v-model.lazy="localForm.id"/>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model.lazy="localForm.name"/>
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model.lazy="localForm.author"/>
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
                  :on-success="() => ElMessage.success(`文件上传成功！`)"
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
            <el-progress v-if="localForm.showPercent" :percentage="localForm.percent"/>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axiosInstance from "@/axios";
import cos from "@/utils/cos";
export default {
  methods: {ElMessage},
  setup() {
    const avatarUploader = ref(null);
    const localForm = reactive({
      id: '',
      name: '',
      author: '',
      prompt: '',
      info: '',
      fileList: [],
      showDialog: false,
      imgUrl: "",
      currentFileUid: null,
      showPercent: false,
      percent: 0,
      fileListLen: 0,
      currentTime: "",
    });
    localForm.currentTime = `${Math.round(new Date().getTime()/1000)}`;
    const showPercent = ref(false);
    const rules = reactive({
      id: [
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
      localForm.currentFileUid = file.uid;
      localForm.showPercent = true;
      return true;
    };
    const upload = (params) => {
      if (params.file) {
        cos.putObject({
          Bucket: process.env.VUE_APP_COS_BUCKET,
          Region: process.env.VUE_APP_COS_REGION,
          Key: `${localForm.currentTime}-${localForm.fileList.findIndex(file => file.name === params.file.name)}-${params.file.name}`,
          Body: params.file,
          StorageClass: "STANDARD",
          onProgress: (params) => {
            localForm.percent = params.percent * 100 / localForm.fileListLen;
          },
        }, (err, data) => {
          if (!err && data.statusCode === 200) localForm.fileListLen--;
        });
      }
    };
    const changeFile = (file, fileList) => {
      localForm.fileList = fileList.map((item) => item);
      localForm.fileListLen = localForm.fileList.length;
    };
    const onSubmit = async () => {
      localForm.showPercent = false;
      localForm.percent = 0;
      await ElMessageBox.confirm(
          '确认提交吗(/≧▽≦)/',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
      );
      if(localForm.id === "" || localForm.author === "" || localForm.prompt === "" || localForm.fileList.length === 0) {
        ElMessage.error("请填写完整信息！");
        return;
      }
      const userInfo = {
        id: localForm.id,
        name: localForm.name,
        time: localForm.currentTime,
        author: localForm.author,
        prompt: localForm.prompt,
        info: localForm.info,
        pic: localForm.fileList.map(file => `${localForm.currentTime}-${localForm.fileList.indexOf(file)}-${file.name}`),
      };
      try{
        const resInfo = await axiosInstance.post('/postform', userInfo);
        // console.log(resInfo)
        if (resInfo.data.success) {
          ElMessage.success("表单提交成功！");
        } else {
          ElMessage.error("表单提交失败！");
        }
      }
      catch (e) {
        ElMessage.error(e.toString());
      }
      await avatarUploader.value.submit();
    };
    return {
      localForm,
      onSubmit,
      avatarUploader,
      rules,
      beforeUpload,
      upload,
      changeFile,
      showPercent,
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