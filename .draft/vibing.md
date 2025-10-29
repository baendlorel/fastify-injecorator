根据src下的代码，编写readme.md和readme.zh.md

1. 开头要说明这还不是正式发布的版本，api可能会变化
2. Injecorator 是inject和decorator的合并词
3. 开头要说明这个项目是因为nestjs用旧版装饰器写的，但我希望能有新版stage3的新版装饰器来写
4. 直接开始说明api用法，分类说明，比如httpmethod一类，路由注册、配置一类，provider、service、controller、module的注册一类；
5. 最后给出使用案例
6. 同时写一个中文版，并且在标题下方给出相互的链接

---

确实有需要完成的，分别是

1. cron
2. 文件上传
3. 常用认证

但我们一步一步来,首先，现在请你用nestjs的办法来实现cron

---

现在，我以devdependency的形式安装了`@fastify/multipart`插件，这是为了极简化考虑，不强迫开发者一定要用文件上传功能。你觉得这样合适吗？
如果合适，请你帮我以类似nestjs，但是使用stage3 js装饰器来写完文件上传的支持，此模块写在src/multipart文件夹下
