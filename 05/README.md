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

