import{_ as I,d as A,w as U,o as N,e as V,f as l,g as t,u as a,b as p,i,t as M,j as x,k as H,C as F}from"./index-Dgze-oWa.js";import{F as B,a as u,I as D,T as S,C}from"./index-fryCPGT2.js";import{D as E,a as b,T as k,S as L,B as g,c as O,d as q,f as y,M as v,b as _,e as P,m as R}from"./exportUtils-DaBHpZc1.js";const z={class:"panel-title"},j={class:"field-grid"},J={__name:"AgreementForm",emits:["update"],setup(c,{emit:s}){const n=A({appName:"",companyName:"",contactEmail:"",effectiveDate:new Date().toISOString().split("T")[0],serviceScope:"",additionalInfo:""}),d=s;return U(n,()=>{d("update",JSON.parse(JSON.stringify(n)))},{deep:!0,immediate:!0}),($,o)=>(N(),V(a(C),{class:"panel form-panel",bordered:!1},{title:l(()=>[p("div",z,[o[7]||(o[7]=p("span",null,"填写协议信息",-1)),t(a(S),{theme:"success",variant:"light"},{default:l(()=>[...o[6]||(o[6]=[i("实时预览",-1)])]),_:1})])]),default:l(()=>[t(a(B),{layout:"vertical",class:"agreement-form"},{default:l(()=>[p("div",j,[t(a(u),{label:"应用名称","required-mark":""},{default:l(()=>[t(a(D),{modelValue:n.appName,"onUpdate:modelValue":o[0]||(o[0]=e=>n.appName=e),clearable:"",placeholder:"例如：我的应用"},null,8,["modelValue"])]),_:1}),t(a(u),{label:"公司名称","required-mark":""},{default:l(()=>[t(a(D),{modelValue:n.companyName,"onUpdate:modelValue":o[1]||(o[1]=e=>n.companyName=e),clearable:"",placeholder:"例如：某某科技有限公司"},null,8,["modelValue"])]),_:1}),t(a(u),{label:"联系邮箱","required-mark":""},{default:l(()=>[t(a(D),{modelValue:n.contactEmail,"onUpdate:modelValue":o[2]||(o[2]=e=>n.contactEmail=e),clearable:"",placeholder:"例如：support@example.com"},null,8,["modelValue"])]),_:1}),t(a(u),{label:"生效日期"},{default:l(()=>[t(a(E),{modelValue:n.effectiveDate,"onUpdate:modelValue":o[3]||(o[3]=e=>n.effectiveDate=e),class:"full-width",clearable:""},null,8,["modelValue"])]),_:1})]),t(a(b),{align:"left"},{default:l(()=>[...o[8]||(o[8]=[i("服务说明",-1)])]),_:1}),t(a(u),{label:"服务范围"},{default:l(()=>[t(a(k),{modelValue:n.serviceScope,"onUpdate:modelValue":o[4]||(o[4]=e=>n.serviceScope=e),placeholder:"例如：账号注册、内容浏览、在线交易、消息通知等服务",autosize:{minRows:4,maxRows:8}},null,8,["modelValue"])]),_:1}),t(a(b),{align:"left"},{default:l(()=>[...o[9]||(o[9]=[i("补充条款",-1)])]),_:1}),t(a(u),null,{default:l(()=>[t(a(k),{modelValue:n.additionalInfo,"onUpdate:modelValue":o[5]||(o[5]=e=>n.additionalInfo=e),placeholder:"您可以在此添加运营规则、会员服务、付费说明等补充内容...",autosize:{minRows:4,maxRows:8}},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}))}},X=I(J,[["__scopeId","data-v-c31c5dd5"]]);function h(c){const{appName:s,companyName:n,contactEmail:d,effectiveDate:f,serviceScope:$,additionalInfo:o}=c,e=s||"本应用",m=n||"我们公司",r=d||"support@example.com",T=f||new Date().toLocaleDateString("zh-CN");let w=`# 用户协议

**更新日期：${T}**

**生效日期：${T}**

## 导言

欢迎您使用 ${e}。${e} 是由 ${m}（以下简称“我们”）提供和运营的产品或服务。请您在注册、登录、访问或使用 ${e} 前，认真阅读并充分理解本《用户协议》的全部内容。

您点击同意、注册、登录、访问或继续使用 ${e}，即表示您已阅读、理解并同意接受本协议的全部条款。本协议与隐私政策、平台规则、活动规则及我们已经发布或后续发布的其他规则共同构成您与我们之间关于使用 ${e} 的完整协议。

---

## 一、适用范围

1. 本协议适用于您访问、下载、安装、注册、登录、浏览、使用 ${e} 及相关服务的全部行为。

2. ${$||"本应用向用户提供账号注册、内容浏览、信息发布、互动交流、交易支持、消息通知及其他基于产品功能持续提供的服务。"}

3. 如 ${e} 的部分服务存在单独规则、说明、页面提示或专项协议，该等内容构成本协议不可分割的一部分；如专项规则与本协议存在不一致，以专项规则为准。

---

## 二、账号注册与使用

1. 您在注册或使用 ${e} 时，应提供真实、准确、合法、有效的信息，并在信息发生变化时及时更新。

2. 您应妥善保管账号、密码、验证码及其他身份凭证。通过您的账号进行的操作，视为您本人作出；因您保管不善、主动泄露、授权他人使用等原因造成的损失，由您自行承担。

3. 未经我们书面同意，您不得赠与、借用、出租、转让、售卖账号，或以其他方式许可第三方使用您的账号。

4. 如我们发现或有合理理由认为您的账号存在违法违规、异常登录、安全风险或违反本协议的情形，我们有权要求验证身份、限制部分功能、暂停或终止服务。

---

## 三、用户行为规范

您在使用 ${e} 时，应遵守法律法规、公序良俗、社会公德及平台规则，不得实施以下行为：

- 发布、传输、存储违反法律法规或侵犯他人合法权益的内容；
- 冒用他人身份、盗用他人账号、伪造或篡改身份信息；
- 干扰、破坏 ${e} 的正常运行，或绕过、破坏安全措施；
- 使用外挂、脚本、爬虫、批量注册、刷量、作弊等方式影响服务秩序；
- 未经授权收集、使用、披露其他用户信息；
- 从事欺诈、洗钱、非法交易、恶意投诉、恶意评价等行为；
- 其他违反法律法规、本协议或平台规则的行为。

---

## 四、服务变更、中断与终止

1. 我们将根据业务发展、技术升级、合规要求或运营安排，对 ${e} 的功能、页面、规则、收费方式等进行调整。

2. 因系统维护、网络故障、设备故障、第三方服务异常、不可抗力、监管要求或其他合理原因导致服务中断、延迟、暂停或终止的，我们将尽合理努力降低影响。

3. 如您违反本协议、法律法规或平台规则，我们有权根据情节采取提醒、限制功能、删除内容、暂停账号、终止服务、追究法律责任等措施。

---

## 五、知识产权

1. ${e} 中由我们提供的文字、图片、音频、视频、界面设计、版式、图标、代码、数据、商标、标识及其他内容，除依法属于第三方或用户享有权利的内容外，其知识产权及相关权益归我们或合法权利人所有。

2. 未经我们或相关权利人书面许可，您不得复制、传播、改编、汇编、出租、出售、反向工程、反向编译、反向汇编，或以其他方式使用上述内容。

3. 您在 ${e} 中发布、上传或提交的内容，应确保您拥有合法权利或已取得必要授权，并不得侵犯任何第三方的合法权益。

---

## 六、隐私与个人信息保护

我们重视用户个人信息和隐私保护。我们将按照适用法律法规及 ${e} 的《隐私政策》收集、使用、存储、共享和保护您的个人信息。请您在使用服务前仔细阅读并理解隐私政策。

---

## 七、免责与责任限制

1. 您理解并同意，互联网服务可能受到多种因素影响，我们不保证服务始终连续、稳定、安全、无错误或完全满足您的全部需求。

2. 对于因不可抗力、基础运营商故障、第三方服务原因、用户自身原因、恶意攻击、政府行为、法律法规或监管政策变化等非我们可控原因造成的损失，我们将在法律允许范围内不承担责任。

3. 您因违反法律法规、本协议或平台规则，导致我们、其他用户或第三方遭受损失的，您应依法承担相应责任。

---

## 八、协议变更

我们可能根据法律法规、监管要求、业务发展或产品调整适时修改本协议。协议更新后，我们会通过页面提示、公告、站内信、消息通知或其他合理方式告知您。若您在协议变更后继续使用 ${e}，即表示您接受更新后的协议。

---

## 九、法律适用与争议解决

本协议的订立、履行、解释及争议解决均适用中华人民共和国大陆地区法律。因本协议或使用 ${e} 产生的争议，双方应友好协商解决；协商不成的，任何一方可向 ${m} 所在地有管辖权的人民法院提起诉讼。

---

## 十、联系我们

如您对本协议或 ${e} 服务有任何疑问、意见、建议或投诉，请通过以下方式联系我们：

- **公司名称**：${m}
- **联系邮箱**：${r}
`;return o&&(w+=`
---

## 十一、补充条款

${o}
`),w+=`

---

**感谢您使用 ${e}。**`,w}const G={class:"panel-title"},K=["innerHTML"],Q={__name:"AgreementPreview",props:{formData:{type:Object,required:!0}},setup(c){const s=c,n=x(()=>h(s.formData)),d=x(()=>R(n.value)),f=async()=>{try{await navigator.clipboard.writeText(n.value),v.success("已复制到剪贴板")}catch{v.error("复制失败，请重试")}},$=()=>{_(`${s.formData.appName||"用户协议"}.md`,"text/markdown;charset=utf-8",n.value),v.success("Markdown 文件已下载")},o=()=>{_(`${s.formData.appName||"用户协议"}.txt`,"text/plain;charset=utf-8",n.value),v.success("TXT 文件已下载")},e=()=>{const m=`${s.formData.appName||"用户协议"}.html`,r=P(s.formData.appName||"用户协议",d.value);_(m,"text/html;charset=utf-8",r),v.success("HTML 文件已下载")};return(m,r)=>(N(),V(a(C),{class:"panel preview-panel",bordered:!1},{title:l(()=>[p("div",G,[r[0]||(r[0]=p("span",null,"用户协议预览",-1)),t(a(S),{theme:"warning",variant:"light"},{default:l(()=>[i(M(n.value.length)+" 字符",1)]),_:1})])]),footer:l(()=>[t(a(L),{class:"actions","break-line":!0},{default:l(()=>[t(a(g),{theme:"primary",onClick:f},{icon:l(()=>[t(a(O))]),default:l(()=>[r[1]||(r[1]=i(" 复制到剪贴板 ",-1))]),_:1}),t(a(g),{variant:"outline",onClick:$},{icon:l(()=>[t(a(q))]),default:l(()=>[r[2]||(r[2]=i(" 下载 Markdown ",-1))]),_:1}),t(a(g),{variant:"outline",onClick:o},{icon:l(()=>[t(a(y))]),default:l(()=>[r[3]||(r[3]=i(" 下载 TXT ",-1))]),_:1}),t(a(g),{variant:"outline",onClick:e},{icon:l(()=>[t(a(y))]),default:l(()=>[r[4]||(r[4]=i(" 下载 HTML ",-1))]),_:1})]),_:1})]),default:l(()=>[p("div",{class:"policy-content",innerHTML:d.value},null,8,K)]),_:1}))}},ae={__name:"AgreementPage",setup(c){const s=H({appName:"",companyName:"",contactEmail:"",effectiveDate:new Date().toISOString().split("T")[0],serviceScope:"",additionalInfo:""}),n=d=>{s.value={...d}};return(d,f)=>(N(),V(a(F),{class:"content"},{default:l(()=>[t(X,{onUpdate:n}),t(Q,{formData:s.value},null,8,["formData"])]),_:1}))}};export{ae as default};
