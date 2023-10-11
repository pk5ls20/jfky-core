# 用到的环境变量

## postgres

该部分在部署到Vercel并连接到Storage时可以被Vercel自动添加

```
set POSTGRES_URL=""
set POSTGRES_PRISMA_URL=""
set POSTGRES_URL_NON_POOLING=""
set POSTGRES_USER=""
set POSTGRES_HOST=""
set POSTGRES_PASSWORD=""
set POSTGRES_DATABASE=""
```

## R2

CloudFlare R2部分的相关环境变量，需要手动添加

```
set R2_ACCOUNT_ID=""
set R2_ACCESS_KEY_ID=""
set R2_SECRET_ACCESS_KEY=""
set R2_ACCESS_KEY=""
set R2_BUCKET_NAME=""
```

## Other

其余项目变量，需要手动添加

```
set INVITE_KEY=""  #经过sha256编码后的邀请码
set SECERT_KEY=""  #用于加密JWT
set VUE_APP_METHOD=""  #测试标记, 值为test时axio端点为127.0.0.1
set GITHUB_REPO_TOKEN=""  #项目关联github token, 需要有仓库全部权限
```

## 腾讯云（弃用）

需要手动添加

```
set VUE_APP_COS_BUCKET=""
set VUE_APP_COS_REGION=""
set VUE_APP_COS_SECRET_ID=""
set VUE_APP_COS_SECRET_KEY=""
```

## 数据库结构

```bash
verceldb=> \d users
                                     Table "public.users"
  Column   |          Type          | Collation | Nullable |              Default
-----------+------------------------+-----------+----------+-----------------------------------
 id        | integer                |           | not null | nextval('users_id_seq'::regclass)
 qq        | character varying(255) |           | not null |
 username  | character varying(255) |           | not null |
 password  | character varying(255) |           | not null |
 userlevel | integer                |           |          | 0
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)

verceldb=> \d items
                                         Table "public.items"
      Column      |       Type        | Collation | Nullable |                Default
------------------+-------------------+-----------+----------+----------------------------------------
 id               | integer           |           | not null | nextval('items_temp_id_seq'::regclass)
 self_name        | character varying |           |          |
 self_id          | character varying |           | not null |
 author           | character varying |           | not null |
 time             | integer           |           | not null |
 prompt           | text              |           | not null |
 info             | text              |           | not null |
 pic              | text[]            |           | not null |
 last_modify_user | integer           |           |          |
Indexes:
    "items_temp_pkey" PRIMARY KEY, btree (id)
Triggers:
    items_audit_trigger AFTER DELETE OR UPDATE ON items FOR EACH ROW EXECUTE FUNCTION items_audit_func()

verceldb=> \d items_audit
                                            Table "public.items_audit"
   Column    |            Type             | Collation | Nullable |                    Default
-------------+-----------------------------+-----------+----------+-----------------------------------------------
 audit_id    | integer                     |           | not null | nextval('items_audit_audit_id_seq'::regclass)
 operation   | character(1)                |           | not null |
 executed_by | character varying(255)      |           | not null |
 timestamp   | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
 old_data    | text                        |           |          |
 new_data    | text                        |           |          |
Indexes:
    "items_audit_pkey" PRIMARY KEY, btree (audit_id)
```