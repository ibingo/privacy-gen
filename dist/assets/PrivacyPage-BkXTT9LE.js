import{_ as h,d as I,w as F,o as g,e as T,f as o,g as t,u as l,b as y,i as m,c as M,F as z,r as E,t as C,j as x,k as L,C as H}from"./index-Dgze-oWa.js";import{F as B,a as w,I as f,C as b,T as k}from"./index-fryCPGT2.js";import{D as R,a as N,S as P,T as U,B as V,c as K,d as O,f as S,M as _,b as $,e as q,m as A}from"./exportUtils-DaBHpZc1.js";const j={class:"panel-title"},J={class:"field-grid"},X={class:"sdk-fields"},G={__name:"PolicyForm",emits:["update"],setup(D,{emit:s}){const n=I({appName:"",companyName:"",contactEmail:"",effectiveDate:new Date().toISOString().split("T")[0],sdkList:[],additionalInfo:""}),i=s,u=()=>{i("update",JSON.parse(JSON.stringify(n)))},p=()=>{n.sdkList.push({name:"",company:"",purpose:"",dataTypes:"",processing:"",privacyUrl:""})},v=c=>{n.sdkList.splice(c,1)};return F(n,u,{deep:!0,immediate:!0}),(c,a)=>(g(),T(l(b),{class:"panel form-panel",bordered:!1},{title:o(()=>[y("div",j,[a[6]||(a[6]=y("span",null,"填写应用信息",-1)),t(l(k),{theme:"success",variant:"light"},{default:o(()=>[...a[5]||(a[5]=[m("实时预览",-1)])]),_:1})])]),default:o(()=>[t(l(B),{layout:"vertical",class:"policy-form"},{default:o(()=>[y("div",J,[t(l(w),{label:"应用名称","required-mark":""},{default:o(()=>[t(l(f),{modelValue:n.appName,"onUpdate:modelValue":a[0]||(a[0]=e=>n.appName=e),clearable:"",placeholder:"例如：我的应用"},null,8,["modelValue"])]),_:1}),t(l(w),{label:"公司名称","required-mark":""},{default:o(()=>[t(l(f),{modelValue:n.companyName,"onUpdate:modelValue":a[1]||(a[1]=e=>n.companyName=e),clearable:"",placeholder:"例如：某某科技有限公司"},null,8,["modelValue"])]),_:1}),t(l(w),{label:"联系邮箱","required-mark":""},{default:o(()=>[t(l(f),{modelValue:n.contactEmail,"onUpdate:modelValue":a[2]||(a[2]=e=>n.contactEmail=e),clearable:"",placeholder:"例如：privacy@example.com"},null,8,["modelValue"])]),_:1}),t(l(w),{label:"生效日期"},{default:o(()=>[t(l(R),{modelValue:n.effectiveDate,"onUpdate:modelValue":a[3]||(a[3]=e=>n.effectiveDate=e),class:"full-width",clearable:""},null,8,["modelValue"])]),_:1})]),t(l(N),{align:"left"},{default:o(()=>[...a[7]||(a[7]=[m("第三方 SDK 列表",-1)])]),_:1}),t(l(P),{direction:"vertical",size:"medium",class:"full-width"},{default:o(()=>[(g(!0),M(z,null,E(n.sdkList,(e,r)=>(g(),T(l(b),{key:r,size:"small",class:"sdk-card",bordered:!0},{title:o(()=>[m("SDK #"+C(r+1),1)]),actions:o(()=>[t(l(V),{theme:"danger",variant:"text",size:"small",onClick:d=>v(r)},{default:o(()=>[...a[8]||(a[8]=[m("删除",-1)])]),_:1},8,["onClick"])]),default:o(()=>[y("div",X,[t(l(f),{modelValue:e.name,"onUpdate:modelValue":d=>e.name=d,clearable:"",placeholder:"SDK 名称（如：阿里云推送）"},null,8,["modelValue","onUpdate:modelValue"]),t(l(f),{modelValue:e.company,"onUpdate:modelValue":d=>e.company=d,clearable:"",placeholder:"第三方公司名称"},null,8,["modelValue","onUpdate:modelValue"]),t(l(U),{modelValue:e.purpose,"onUpdate:modelValue":d=>e.purpose=d,placeholder:"使用目的",autosize:{minRows:2,maxRows:4}},null,8,["modelValue","onUpdate:modelValue"]),t(l(U),{modelValue:e.dataTypes,"onUpdate:modelValue":d=>e.dataTypes=d,placeholder:"收集的个人信息类型",autosize:{minRows:2,maxRows:4}},null,8,["modelValue","onUpdate:modelValue"]),t(l(f),{modelValue:e.processing,"onUpdate:modelValue":d=>e.processing=d,clearable:"",placeholder:"处理方式（如：匿名化处理）"},null,8,["modelValue","onUpdate:modelValue"]),t(l(f),{modelValue:e.privacyUrl,"onUpdate:modelValue":d=>e.privacyUrl=d,clearable:"",placeholder:"隐私政策链接"},null,8,["modelValue","onUpdate:modelValue"])])]),_:2},1024))),128)),t(l(V),{block:"",variant:"dashed",theme:"primary",onClick:p},{default:o(()=>[...a[9]||(a[9]=[m("添加 SDK",-1)])]),_:1})]),_:1}),t(l(N),{align:"left"},{default:o(()=>[...a[10]||(a[10]=[m("其他说明",-1)])]),_:1}),t(l(w),null,{default:o(()=>[t(l(U),{modelValue:n.additionalInfo,"onUpdate:modelValue":a[4]||(a[4]=e=>n.additionalInfo=e),placeholder:"您可以在此添加其他需要说明的内容...",autosize:{minRows:4,maxRows:8}},null,8,["modelValue"])]),_:1})]),_:1})]),_:1}))}},Q=h(G,[["__scopeId","data-v-e73ca8fc"]]);function W(D){const{appName:s,companyName:n,contactEmail:i,effectiveDate:u,sdkList:p,additionalInfo:v}=D,c=u||new Date().toLocaleDateString("zh-CN");let a=`# 隐私政策

**更新日期：${c}**

**生效日期：${c}**

## 导言

${s||"本应用"} 是一款由 ${n||"我们公司"} （以下简称"我们"）提供的产品。您在使用我们的服务时，我们可能会收集和使用您的相关信息。我们希望通过本《隐私政策》向您说明，在使用我们的服务时，我们如何收集、使用、储存和分享这些信息，以及我们为您提供的访问、更新、控制和保护这些信息的方式。

本《隐私政策》与您所使用的 ${s||"本应用"} 服务息息相关，希望您仔细阅读，在需要时，按照本《隐私政策》的指引，作出您认为适当的选择。本《隐私政策》中涉及的相关技术词汇，我们尽量以简明扼要的表述，并提供进一步说明的链接，以便您的理解。

**您使用或继续使用我们的服务，即意味着同意我们按照本《隐私政策》收集、使用、储存和分享您的相关信息。**

如对本《隐私政策》或相关事宜有任何问题，请通过 **${i||"contact@example.com"}** 与我们联系。

---

## 1. 我们收集的信息

我们或我们的第三方合作伙伴提供服务时，可能会收集、储存和使用下列与您有关的信息。如果您不提供相关信息，可能无法注册成为我们的用户或无法享受我们提供的某些服务，或者无法达到相关服务拟达到的效果。

`;return p&&p.length>0&&(a+=`
我们接入的第三方SDK：

`,p.forEach(e=>{e.name&&(a+=`### ${e.name}

`,e.company&&(a+=`- **第三方名称**：${e.company}
`),e.purpose&&(a+=`- **使用目的**：${e.purpose}
`),e.dataTypes&&(a+=`- **收集个人信息类型**：${e.dataTypes}
`),e.processing&&(a+=`- **处理方式**：${e.processing}
`),e.privacyUrl&&(a+=`- **隐私政策链接**：${e.privacyUrl}
`),a+=`
`)})),a+=`---

## 2. 信息的存储

### 2.1 信息存储的方式和期限

- 我们会通过安全的方式存储您的信息，包括本地存储（例如利用APP进行数据缓存）、数据库和服务器日志。
- 一般情况下，我们只会在为实现服务目的所必需的时间内或法律法规规定的条件下存储您的个人信息。

### 2.2 信息存储的地域

- 我们会按照法律法规规定，将境内收集的用户个人信息存储于中国境内。
- 目前我们不会跨境传输或存储您的个人信息。将来如需跨境传输或存储的，我们会向您告知信息出境的目的、接收方、安全保证措施和安全风险，并征得您的同意。

### 2.3 产品或服务停止运营时的通知

- 当我们的产品或服务发生停止运营的情况时，我们将以推送通知、公告等形式通知您，并在合理期限内删除您的个人信息或进行匿名化处理，法律法规另有规定的除外。

---

## 3. 信息安全

我们使用各种安全技术和程序，以防信息的丢失、不当使用、未经授权阅览或披露。例如，在某些服务中，我们将利用加密技术（例如SSL）来保护您提供的个人信息。但请您理解，由于技术的限制以及可能存在的各种恶意手段，在互联网行业，即便竭尽所能加强安全措施，也不可能始终保证信息百分之百的安全。您需要了解，您接入我们的服务所用的系统和通讯网络，有可能因我们可控范围外的因素而出现问题。

---

## 4. 我们如何使用信息

我们可能将在向您提供服务的过程之中所收集的信息用作下列用途：

- 向您提供服务；
- 在我们提供服务时，用于身份验证、客户服务、安全防范、诈骗监测、存档和备份用途，确保我们向您提供的产品和服务的安全性；
- 帮助我们设计新服务，改善我们现有服务；
- 使我们更加了解您如何接入和使用我们的服务，从而针对性地回应您的个性化需求，例如语言设定、位置设定、个性化的帮助服务和指示，或对您和其他用户作出其他方面的回应；
- 向您提供与您更加相关的广告以替代普遍投放的广告；
- 评估我们服务中的广告和其他促销及推广活动的效果，并加以改善；
- 软件认证或管理软件升级；
- 让您参与有关我们产品和服务的调查。

---

## 5. 信息共享

目前，我们不会主动共享或转让您的个人信息至第三方，如存在其他共享或转让您的个人信息或您需要我们将您的个人信息共享或转让至第三方情形时，我们会直接或确认第三方征得您对上述行为的明示同意。

为了投放广告，评估、优化广告投放效果等目的，我们需要向广告主及其代理商等第三方合作伙伴共享您的部分数据，要求其严格遵守我们关于数据隐私保护的措施与要求，包括但不限于根据数据保护协议、承诺书及相关数据处理政策进行处理，避免识别出个人身份，保障隐私安全。

我们不会向合作伙伴分享可用于识别您个人身份的信息（例如您的姓名或电子邮件地址），除非您明确授权。

我们不会对外公开披露所收集的个人信息，如必须公开披露时，我们会向您告知此次公开披露的目的、披露信息的类型及可能涉及的敏感信息，并征得您的明示同意。

随着我们业务的持续发展，我们有可能进行合并、收购、资产转让等交易，我们将告知您相关情形，按照法律法规及不低于本《隐私政策》所要求的标准继续保护或要求新的控制者继续保护您的个人信息。

另外，根据相关法律法规及国家标准，以下情形中，我们可能会共享、转让、公开披露个人信息无需事先征得您的授权同意：

- 与国家安全、国防安全直接相关的；
- 与公共安全、公共卫生、重大公共利益直接相关的；
- 与犯罪侦查、起诉、审判和判决执行等直接相关的；
- 出于维护个人信息主体或其他个人的生命、财产等重大合法权益但又很难得到本人同意的；
- 个人信息主体自行向社会公众公开个人信息的；
- 从合法公开披露的信息中收集个人信息的，如合法的新闻报道、政府信息公开等渠道。

---

## 6. 您的权利

在您使用我们的服务期间，我们可能会视产品具体情况为您提供相应的操作设置，以便您可以查询、删除、更正或撤回您的相关个人信息，您可参考相应的具体指引进行操作。此外，我们还设置了投诉举报渠道，您的意见将会得到及时的处理。如果您无法通过上述途径和方式行使您的个人信息主体权利，您可以通过本《隐私政策》中提供的联系方式提出您的请求，我们会按照法律法规的规定予以反馈。

当您决定不再使用我们的产品或服务时，可以申请注销账户。注销账户后，除法律法规另有规定外，我们将删除或匿名化处理您的个人信息。

---

## 7. 变更

我们可能适时修订本《隐私政策》的条款。当变更发生时，我们会在版本更新时向您提示新的《隐私政策》，并向您说明生效日期。请您仔细阅读变更后的《隐私政策》内容，**若您继续使用我们的服务，即表示您同意我们按照更新后的《隐私政策》处理您的个人信息。**

---

## 8. 未成年人保护

我们鼓励父母或监护人指导未满十八岁的未成年人使用我们的服务。我们建议未成年人鼓励他们的父母或监护人阅读本《隐私政策》，并建议未成年人在提交的个人信息之前寻求父母或监护人的同意和指导。

---

## 9. 联系我们

如果您对本《隐私政策》有任何疑问、意见或建议，或需要行使您的权利，请通过以下方式与我们联系：

- **公司名称**：${n||"我们公司"}
- **联系邮箱**：${i||"contact@example.com"}
`,v&&(a+=`
---

## 10. 其他说明

${v}
`),a+=`

---

**再次感谢您对 ${s||"本应用"} 的信任与支持！**`,a}const Y={class:"panel-title"},Z=["innerHTML"],ee={__name:"PolicyPreview",props:{formData:{type:Object,required:!0}},setup(D){const s=D,n=L(null),i=x(()=>W(s.formData)),u=x(()=>A(i.value)),p=async()=>{try{await navigator.clipboard.writeText(i.value),_.success("已复制到剪贴板")}catch{_.error("复制失败，请重试")}},v=()=>{$(`${s.formData.appName||"隐私政策"}.md`,"text/markdown;charset=utf-8",i.value),_.success("Markdown 文件已下载")},c=()=>{$(`${s.formData.appName||"隐私政策"}.txt`,"text/plain;charset=utf-8",i.value),_.success("TXT 文件已下载")},a=()=>{const e=`${s.formData.appName||"隐私政策"}.html`,r=q(s.formData.appName||"隐私政策",u.value);$(e,"text/html;charset=utf-8",r),_.success("HTML 文件已下载")};return(e,r)=>(g(),T(l(b),{class:"panel preview-panel",bordered:!1},{title:o(()=>[y("div",Y,[r[0]||(r[0]=y("span",null,"隐私政策预览",-1)),t(l(k),{theme:"warning",variant:"light"},{default:o(()=>[m(C(i.value.length)+" 字符",1)]),_:1})])]),footer:o(()=>[t(l(P),{class:"actions","break-line":!0},{default:o(()=>[t(l(V),{theme:"primary",onClick:p},{icon:o(()=>[t(l(K))]),default:o(()=>[r[1]||(r[1]=m(" 复制到剪贴板 ",-1))]),_:1}),t(l(V),{variant:"outline",onClick:v},{icon:o(()=>[t(l(O))]),default:o(()=>[r[2]||(r[2]=m(" 下载 Markdown ",-1))]),_:1}),t(l(V),{variant:"outline",onClick:c},{icon:o(()=>[t(l(S))]),default:o(()=>[r[3]||(r[3]=m(" 下载 TXT ",-1))]),_:1}),t(l(V),{variant:"outline",onClick:a},{icon:o(()=>[t(l(S))]),default:o(()=>[r[4]||(r[4]=m(" 下载 HTML ",-1))]),_:1})]),_:1})]),default:o(()=>[y("div",{class:"policy-content",ref_key:"policyContent",ref:n,innerHTML:u.value},null,8,Z)]),_:1}))}},oe={__name:"PrivacyPage",setup(D){const s=L({appName:"",companyName:"",contactEmail:"",effectiveDate:new Date().toISOString().split("T")[0],sdkList:[],additionalInfo:""}),n=i=>{s.value={...i}};return(i,u)=>(g(),T(l(H),{class:"content"},{default:o(()=>[t(Q,{onUpdate:n}),t(ee,{formData:s.value},null,8,["formData"])]),_:1}))}};export{oe as default};
