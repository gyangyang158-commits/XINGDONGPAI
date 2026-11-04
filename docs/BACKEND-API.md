# 后端接口与部署

**当前演示站已按用户要求取消访问码。** 生产环境使用 XDP_ACCESS_MODE=public，首页、AI 接口均无需登录；保留 HTTPS 源限制、服务端密钥、输入校验与限流。code 模式仅作为可选部署配置。

这版将本机网关扩展为**同源、受保护演示后端**。不改变前端现有 fetch 路径，不在 HTML 中写入任何密钥。新增会话、健康检查、Vercel 部署适配和独立参考检索；聊天、看图、语音和本机抠图沿用原接口。

## 本机启动

需要 Node.js 24 或更高版本，核心服务没有 npm 第三方依赖。

~~~powershell
npm test
npm run build
npm start
~~~

默认监听 127.0.0.1:8772。已有 .env 会被读取；进程环境优先。使用其他端口可设置 PORT。首页为原始模块化页面；dist/xingdongpai-room-mobile-fixed.html 为构建后的单文件入口，两者使用同一后端。

服务端配置项：

| 变量 | 用途 |
| --- | --- |
| XDP_AI_KEY / XDP_AI_KEY_FILE | AI 服务商密钥或私有凭据文件，绝不能发给浏览器 |
| XDP_AI_BASE / XDP_AI_MODEL | 已有服务商地址与实际开放的文字模型 |
| XDP_SCENE_VISION_MODEL / XDP_SCENE_VISION_FORMAT | 看图模型与 openai / gemini 协议 |
| XDP_VOICE_MODEL | 接收 WAV 的语音转写模型 |
| XDP_REFERENCE_SEARCH | on 开启参考检索；off 关闭 |
| XDP_CUTOUT_MODEL / XDP_PYTHON | 可选本机抠图模型和 Python；未安装时返回 503 |
| PORT / HOST | 监听端口、地址；默认 8772 / 127.0.0.1 |
| XDP_PUBLIC_ORIGIN | 公网完整 HTTPS 源，如 https://design.example.com，不带末尾斜杠或路径 |
| XDP_ACCESS_CODE | 公网演示访问码，至少 24 字符随机值，与 AI 密钥分开 |
| XDP_SESSION_SECRET | 云端必须：至少 32 字符独立随机会话签名密钥，所有实例使用相同值 |

## 公网部署方式

采用**一个 HTTPS 域名同时提供前端和 /api**。HTMLPreview、GitHub 静态预览不能运行本后端；本版不开放跨站 CORS，也不把组织者访问码写进静态 HTML。

公网模式必须设置 XDP_PUBLIC_ORIGIN。当前演示设置 XDP_ACCESS_MODE=public，无需访问码；仅在 XDP_ACCESS_MODE=code（默认的可选受限模式）时，才要求 XDP_ACCESS_CODE。HOST=0.0.0.0 却没有公网保护配置时，启动直接失败。生成访问码：

~~~powershell
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
~~~

在部署平台的私有环境变量中填写上述值和 AI 密钥。仅在可选 code 模式下，经 HTTPS 域名打开首页后先进入 /access 输入访问码；通过后原有前端自动携带会话 Cookie 调用同源 API。Cookie 为 Secure、HttpOnly、SameSite=Strict，有效期 12 小时。未设置 XDP_SESSION_SECRET 时，会话签名密钥只在本进程内存，重启服务会要求重新登录。云端 code 模式必须配置至少 32 字符的独立随机 XDP_SESSION_SECRET，以便不同实例验证同一会话；轮换该值会使既有会话失效。

TLS 由可信反向代理终止，必须保留原始 Host；应用不信任 X-Forwarded-Host 或 X-Forwarded-Proto 来放行请求。代理到 Node 的 HTTP 端口只允许代理本身访问，不能直接对公网暴露。长请求代理超时至少 180 秒，请求体上限至少 12 MiB。代理健康检查也需携带 XDP_PUBLIC_ORIGIN 对应的 Host。

可选 Docker 构建：

~~~powershell
docker build -t design-assistant .
# .env.deploy 是本机私有文件，需设置 XDP_PUBLIC_ORIGIN、XDP_ACCESS_CODE、XDP_AI_KEY 等。
# 仅映射回本机，由 HTTPS 反向代理转发；不要把此端口直接暴露公网。
docker run --rm --env-file .env.deploy -p 127.0.0.1:8772:8772 design-assistant
~~~

容器使用非 root 用户，不复制 .env、Git、测试和缓存。基础镜像未安装 Python、rembg 或 ONNX 模型，抠图默认不可用；需要时另行安装和挂载，不能把这个状态当作抠图成功。

## 接口清单

当前 public 模式的页面与 /api 不要求 Cookie 或 Authorization；/access 会重定向回首页。仅在可选 code 模式中，除健康检查、登录和会话状态外的 /api 路由要求已登录 Cookie，或请求头 Authorization: Bearer <XDP_ACCESS_CODE>。这里的 Bearer 值是**演示访问码**，不是服务商密钥。浏览器默认使用 Cookie，不必在 JS 中保存访问码。本机模式保持原来的本机同源访问，不要求登录。

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| GET | /api/health | 进程存活：ok、service、apiVersion；不调用模型，不代表上游可用 |
| GET | /api/session | authenticated、required；不返回凭据 |
| POST | /api/session | JSON {"accessCode":"访问码"}；成功写入会话 Cookie |
| DELETE | /api/session | 清除当前浏览器 Cookie；已复制的 Cookie 不在服务端单独撤销，最晚到期失效 |
| GET | /api/agent/status | configured、model、voiceConfigured、cutoutConfigured、referenceSearchConfigured、accessRequired |
| POST | /api/agent/run | 依据文字和勾选素材生成结构化方案；保留原有接口 |
| POST | /api/scenes/reply | tea / summary / look / decision 共创响应；保留原有接口 |
| POST | /api/references/search | 独立联网找参考，不要求客户端先提供链接 |
| POST | /api/voice/transcribe | 真实 WAV 转写；保留原有接口 |
| POST | /api/images/cutout | 本机模型抠图；保留原有接口 |

### 独立参考检索

~~~json
{"goal":"温柔紫色生日海报，想看看花朵和留白的参考","topic":"birthday","consent":true}
~~~

topic 支持 birthday / drama / commerce。JSON 请求体最多 16000 字节，goal 最多取 1000 字符。返回 references 数组，以及 search.status、provider、query、checkedAt、message；缓存命中时包含 cached:true。每条候选保留 url、title、domain、creator、license、licenseVersion、licenseURL、thumbnail 等字段；原生网页引文未必有缩略图或许可。

首选实际 completed 原生联网工具的 url_citation，失败时回退 Openverse。图片库仅收到提炼后的风格关键词，不接收整段聊天、成员身份或服务商密钥。返回最多三张候选卡，须打开原始来源核对适用性与版权。相同请求缓存约四分钟。

有服务商密钥时，先检查余额再执行可能付费的原生检索；未配置密钥时，该接口仍可使用 Openverse。检索关闭或不可用返回 503；不可用时仍附 references:[] 与 search.status=unavailable，不编造候选。无结果但服务正常返回 200、search.status=empty。

### 共创回复

~~~json
{"mode":"tea","topic":"birthday","goal":"想做温柔一点的生日海报","messages":[{"id":"m1","role":"user","text":"喜欢紫色"}],"consent":true}
~~~

tea 首条需求或明确找参考时可自动搜索。返回 reply、highlight、suggestion、layout、templateKey、points、questions、references、search、engine、model。summary 的 points 仅保留输入中真实用户消息的 sourceIds；look / decision 还须提交 imageConsent:true 和当前预览 image（PNG/JPEG/WebP data URL，解码后最多 3 MiB）。上传图片本身不调用模型。

### 其他已有接口

- /api/agent/run：goal、materials、consent:true；仅白名单素材文字参与模型请求。请求体最多 20000 字节；返回 plan、engine、model。
- /api/voice/transcribe：audio 为 16 kHz、单声道、16-bit PCM WAV data URL，时长不超过 60 秒；consent:true。返回 text、engine、model，不用模拟文字替代识别。
- /api/images/cutout：image 为 PNG/JPEG/WebP data URL，图片最多约 8 MiB。返回处理后的 image；在本机 Python 子进程处理，不发给远程模型。媒体接口 JSON 请求体最多 12 MiB。

## 错误、限流与安全边界

错误格式为 {"error":"可展示的中文说明"}，前端不应将其当作成功结果。

| 状态码 | 含义 |
| --- | --- |
| 400 | JSON / 输入格式 / 授权字段不正确 |
| 401 | 访问码错误或没有有效会话 |
| 402 | 服务商余额不足，未发送本次模型任务 |
| 403 | Host、Origin 或跨站来源不允许 |
| 404 / 405 | 不存在的路由或不支持的方法 |
| 413 / 415 | 超过请求大小上限 / 非 JSON |
| 429 | 请求进行中或达到限流；不会自动重试 |
| 500 / 502 / 503 | 内部错误 / 上游失败 / 未配置、关闭或暂不可用 |

公网入口对所有 POST /api 任务设每进程 30 次/分钟总预算；登录单独限制每进程 10 次/分钟。原有更严格的场景、方案、媒体限流仍有效。独立参考检索和共创回复共用每分钟 5 次预算与单并发锁。登录/总预算的 429 带 Retry-After:60；具体任务的 429 应稍后手动重试。

静态文件不允许读取 .env、.git、脚本、测试或内部 work/outputs；真实路径检查防止通过符号链接绕出项目或进入受限目录。页面禁止被 iframe 嵌入，不支持将已启用的服务再嵌回 HTMLPreview。

**范围限制：**这不是多人账户/权限系统。配置固定私有签名密钥后会话可以跨实例验证；限流与参考缓存仍为实例内存，不是全站分布式预算。不要向不受信任的大量访客分发演示访问码；房间、作品与聊天仍沿用前端当前页面内存，本轮没有加入数据库或跨设备持久化。公网端到端演示验收见下方新增记录。

## 验证记录

- npm test：125 项通过，包括 17 项新增后端测试。
- npm run build：单文件构建成功。
- 新测试通过真实本机 HTTP 连接覆盖登录、Cookie、鉴权、来源校验、请求上限、限流、参考结果/错误，以及原生检索成功后的响应结束；上游模型与检索响应在自动测试中使用桩数据。
- 修复已有原生检索成功分支返回响应后未标记路由已处理的问题，避免随后再写入 404 或触发连接重置。
- 本机 8775 启动验证：首页、单文件入口、访问码页、健康检查和能力状态均返回 HTTP 200；另用不含用户资料的合成问题真实调用已配置文字模型，返回 HTTP 200、engine=online 和 53 字符回复。没有把新参考接口的模拟上游结果当作本轮真实联网搜索验收。
- 访问码页已在浏览器检查布局；公网 HTTPS 下的 Cookie 行为仍需部署后验收。
- 第一轮仅在本机验证；后续公网验收见下方记录。Docker 仍需在具备可用 Docker daemon 的环境中另行构建验证。

## 公网演示部署与复查（2026-11-03）

- 公网正式别名：https://design-assistant-demo.vercel.app 。这是独立 Vercel 项目，未覆盖已有网站；CLI 手动部署成功，GitHub 自动关联没有成功，后续改源码不会自动上线。
- 最初受限部署使用过演示访问码，现按用户要求切换为 public 模式，不再要求或分发访问码。AI 密钥未进入源码或 HTML。
- 登录、浏览器 Secure Cookie、首页、静态资源、健康检查均已从公网验证。最初 code 模式下验证过未登录跳转与接口鉴权；现 public 模式已验证无 Cookie 首页 HTTP 200、accessRequired=false，.env 和服务端源码路径仍不可访问。
- 从公网真实调用：文字响应 HTTP 200（约 12.6 秒），看图响应 HTTP 200（约 9.9 秒），原生联网参考 HTTP 200（约 9.5 秒、3 条原始引文候选）。这是单轮观测，不是延迟或所有网络可达性承诺。
- 增加 Vercel 请求体适配，兼容平台已解析 JSON；增加固定私有签名密钥，避免多实例导致登录失效。
- 恢复明确的「本地引导 · 不联网」模式；直接打开单文件 HTML 默认本地引导，不用假 AI 替代失败的在线响应。
- 当前云端没有安装 Python 抠图模型，模型抠图按钮会禁用并说明未启用；纯色背景处理、手动擦除与本地排版仍可使用。
- 最后回归：137 项测试通过，单文件构建通过。

- 追加语音实测：当前转写模型调用失败（HTTP 502），已设 XDP_VOICE_MODEL=off，公网 status 的 voiceConfigured=false；不将它展示成可用识别功能。此项尚未修复上游能力，演示改用文字输入。
- 公网 390px 布局无横向溢出；手机布局实际下载 SVG，验证包含嵌入式照片。

## 免访问码发布

- 用户明确要求无需访问码，生产已设置 XDP_ACCESS_MODE=public。
- 无 Cookie 可直接打开首页、调用 AI；旧 /access 入口会回到首页，不会再显示访问码表单。
- 不把访问码写进 HTML，也不以匿名自动登录伪装免访问码；此模式确实不要求认证。Host/Origin 校验、付费前余额检查和现有限流仍有效。
- 自动回归 137 项通过，包含匿名 AI 正常路径、旧入口重定向与公开模式下的同源/限流测试。

- 发布后无 Cookie、无 Authorization 实测：首页 HTTP 200；/access 返回 303 到 /；状态 accessRequired=false；真实文字 AI 请求 HTTP 200。
- 本轮内置浏览器导航遇到连接超时，未将此次浏览器复验记为通过；未绕过浏览器安全策略。

## 当前茶话流程覆盖说明

首条消息不再自动找参考。`channel` 和 `guidance` 的状态、确认后主动检索、群聊/私聊本页隔离及尚未接入真实多人权限的边界，以 [逐步引导说明](STEPWISE-INSPIRATION.md) 为准。
