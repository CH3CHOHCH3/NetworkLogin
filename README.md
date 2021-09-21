# HITsz 校园网登录脚本

## 前置依赖

本脚本以 NodeJS 编写, 故请先安装 [`NodeJS`](https://nodejs.org/zh-cn/download/). 

> Ubuntu/Debain 系的小伙伴推荐去官网下载更高版本的 NodeJS 而不是用包管理器里的

## 安装

首先你要先给目标机器连上网络(比如通过手机分享等), 接着 clone 本项目到本地并安装依赖: 

```bash
npm install
```

或是选择 `yarn`

```bash
yarn
```

## 运行 

运行: 

```bash
 node login.js <username> <password>
```

在大部分发行版上, 在命令前加上空格可以防止 Bash 将此命令保存至历史中, 可以防止用户名与密码泄露. 

`<username>` 与 `<password>` 就是你登录校园网的账号与密码. 

## 开机自启

> 下面的内容基于 Systemd

将下面的内容拷贝至 `/lib/systemd/system/network-login.service`

```
[Unit]
Description=School Network Service
After=network.target

[Service]
Type=idle
User=nobody
Restart=on-failure
RestartSec=60s
ExecStart=node 你放本脚本的目录/login.js <用户名> <密码>

[Install]
WantedBy=multi-user.target
```

随后启用并运行: 

```bash
sudo systemctl enable network-login
sudo systemctl start network-login
```