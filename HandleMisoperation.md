

# 对表单误操的一种处理办法

## 场景：
​	在一个复杂的表单场景中，需要阻止用户的误操作(刷新，关闭，后退，跳转)导致未保存的数据丢失，所以我们需要对这些误操作进行特殊处理。以进行中的Vue项目为例，记录一下这种场景的解决一种办法（弹框提醒）。

## 具体操作
  ### 刷新和关闭
​	刷新和关闭可以通过```beforunload```事件来实现，具体实现如下

```javascript
...
export default {
  ...
  mounted() {
    window.addEventListener('beforeunload', this.handleRefresh, false) // 监听beforeunload事件
  },
  methods() {
    handleRefresh(e) {
      e.returnValue = '系统可能不会保存您所做的更改。'
    }
  },
  destroyed() {
    window.removeEventListener('beforeunload', this.handleRefresh, false) // 删除beforeunload事件监听
  },
  ...
}
```
  不过这个办法有个美中不足的地方，就是我们定义的```handleRefresh```函数返回文字并不能实际反馈到警告弹框里，粗略地测试了一下```Chrome``` ```Safari``` ```Firfox```均有自己不同的提示文字。谷歌解决办法被告知无法定制，所以也只能这样了。

  ### 路由跳转
  这里可以用Vue-Router的导航卫视(Navigation Guards)中的组件内钩子[beforeRouteLeave](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)来实现，参考代码如下
```javascript
...
export default {
  ...
  beforeRouteLeave(to, from, next) {
    // 该实现包含了Element UI重的$confirm方法，也可以自己另行实现。
    this.$confirm('此操作将不会保存页面数据，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      next() // 确认跳转通过
    }).catch(() => {
      next(false) // 阻止跳转
    })
  }
  ...
}
```
显而易见，```beforeRouteLeave```的核心就是```next```函数，不予通过则是多了```false```参数
  ### 浏览器后退
  先说说实现吧
```javascript
...
export default {
  ...
  mounted() {
    history.pushState(null, null, document.URL) // 创建当前页面地址
    window.addEventListener('popstate', this.handleBack)
  },
  methods() {
    handleBack() {
      // do some thing, 比如自己实现阻止弹框，实现路由跳转
    }
  },
  destroyed() {
    window.removeEventListener('popstate', this.handleBack)
  },
  ...
}
```
一开始并没有想到后退按钮会这么麻烦，后来去实现的时候才发现这是浏览器行为，而且也涉及到了```history```模式和```hash```模式的不同(这里就不展开聊了)。最初的想法是同处理路由一样走```beforeRouteLeave```，但是发现浏览器后退根本不触发```breforeRouteLeave```钩子。第二个想法是在调用```window.onpopstate```的时候给出一个跟```beforeRouteLeave```一样的```confirm```验证,但是弹框会一闪而过，而且无法阻止后退。然后我去看了一下文档
```window.onpopstate是popstate事件在window对象上的事件处理程序.

每当处于激活状态的历史记录条目发生变化时,popstate事件就会在对应window对象上触发. 如果当前处于激活状态的历史记录条目是由history.pushState()方法创建,或者由history.replaceState()方法修改过的, 则popstate事件对象的state属性包含了这个历史记录条目的state对象的一个拷贝.

调用history.pushState()或者history.replaceState()不会触发popstate事件. popstate事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在JavaScript中调用history.back()、history.forward()、history.go()方法).
```
那么重点就来了，我们可以转变一下思维，调用```pushState```伪造一条历史记录为当前地址，那么在实际体验上，浏览器的后退按钮就完全被禁止掉了，然后在这种状态下，我们可以去做自己想要做的事情，比如一个```confirm```弹框，比如实现后退陆游。
不过这个解决办法也是比较tricky的，对于浏览器后退行为，想要允许用户真正后退，需要保证入口的唯一性，还需要在```beforeRouteLeave```处做一下判断，忽略由后退引起的路由跳转。

## 总结
​  其实对于刷新、关闭、路由跳转的实现都比较简单。只有浏览器后退比较恶心人，解决办法也不是很优雅，最主要的原因还是我脑筋没转过弯子，盯着```beforeRouteLeave```那一套实现办法，想要用同样的思路去解决，想法被后退时弹框给卡住了。但其实换一个思路，禁止掉浏览器后退，然后自己实现后退，问题就迎刃而解了。
