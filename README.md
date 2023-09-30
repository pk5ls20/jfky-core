# 茳风矿业展厅喵

一个**完全白嫖**的stable-diffusion图片+提示词展示**小型网站**解决方案

## 前端

### 【主页面】[jfky-core](https://vercel.com/pk5ls20/jfky-core-lrr5)

本项目的主要部分，部署在Vercel上，小站用不完Vercel每月的限额

### 【评论系统前端】[jfky-comment](https://vercel.com/pk5ls20/jfky-comment)

使用[Waline](https://waline.js.org/)，同样部署在Vercel上

## 后端

### 【API】[Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

本项目由于API简单，后端API同样也部署在Vercel上

### 【存储】[Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)

Cloudflare的良心存储桶，小网站额度用不完，现阶段存图刚刚好

### 【数据库】 [Vercel Postgres Database](https://vercel.com/docs/storage/vercel-postgres)

Vercel的Postgres数据库，同样白嫖，小网站额度用不完

### 【评论系统后端】 [LeanCloud](https://console.leancloud.app/)

[Waline](https://waline.js.org/)的后端使用LeanCloud的免费项目进行部署

----------

更多内容，请参见`docs`文件夹