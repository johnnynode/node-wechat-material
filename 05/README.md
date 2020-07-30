### 各个接口的调用

1 ) **对分组群发消息**

- 文档：https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Batch_Sends_and_Originality_Checks.html
- 具体参考: 05/code1

2 ) **微信菜单配置**

- 文档：https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html
- 具体参考：05/code2

3 ) **微信菜单生成**

- 具体参考：05/code3

4 ) **账号管理(二维码)**

- 公众号本身相关功能，如二维码, 长链接，短链接，认证事件推送
- 应用场景：一些推广活动让一些人来兼职，每个人都有独特的二维码(每个二维码带有唯一的参数)，可以知道每个人推广了多少个用户，基于推广量给人发提成
- 这个二维码功能只对认证后的服务号开放
- 二维码分临时(有效期最长30天)和永久，具体看临时业务场景还是永久业务场景
- 用户扫带有场景值二维码，有两种推送事件：关注事件和扫描事件
- 文档：https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
- 具体参考：05/code4

5 ) **微信语义接口**

- 文档：https://developers.weixin.qq.com/doc/offiaccount/Intelligent_Interface/Natural_Language_Processing.html
- 服务号功能
- 具体参考：05/code5

6 ) **微信JS-SDK**

- 步骤：绑定域名，引入JS文件，JS SDK 初始化
- SDK与公众号的区别
    * 公众号：微信这个原生应用中，开放的特殊账号，让很多人可以通过原生的聊天界面与公众号互动，其实就是与我们的服务器互动
    * SDK: 不是在公众号中使用, 是在微信内置浏览器中使用的，sdk搭建桥梁让网页调用微信原生应用来实现拍照，语音，扫一扫等功能
- SDK提供的接口
    * 基础接口
    * 分享接口
    * 图像接口
    * 音频接口
    * 智能接口
    * 设备信息
    * 地理位置
    * 摇一摇周边
    * 界面操作
    * 微信扫一扫
    * 小店
    * 卡券
    * 支付
- SDK注意事项
    * 配置域名：公众号设置/功能设置/js接口安全域名
    * 域名备案，一月修改三次，一级或以上域名
    * 没有域名先使用接口测试号配合内网穿透服务来做
- 具体参考：05/code6

7 ) **微信web开发者工具**

