# Jmter 实现跨线程组共享cookie

## 场景：
  一个test plan下有多个线程组(Thread Group)，要求获取登陆接口`response head`返回的`cookie`并且共享个其他的线程组
