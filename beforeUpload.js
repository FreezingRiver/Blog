export function handleBeforeUpload(file, limits) {
  // litmits 是附带的限定条件，举个例子
  // limits = {
  //   type: '',
  //   width: '',
  //   height: '',
  //   errorMessage: ''
  // }
  const isPNG = file.type === 'image/png'
  if (!isPNG) {
    this.$message.error('上传启动页图片只能是 PNG 格式!')
    return false
  }
  return new Promise(function (resolve, reject) {
    let _URL = window.URL || window.webkitURL
    let img = new Image()
    img.onload = function () {
      limits.type === 'splash'
        ? img.height / img.width === limits.multiple ? resolve(file) : reject('sizeError')  // 长宽比成一定比例
        : img.height === limits.height && img.width === limits.width ? resolve(file) : reject('sizeError')  // 长款必须等于限制长宽, 如果有其他对于长宽的限制可以自行发挥
    }
    img.onerror = function () {
      reject('loadError')
    }
    img.src = _URL.createObjectURL(file)
  }).then(file => file, err => {
    err === 'sizeError' ? this.$message.error(limits.errorMessage) : this.$message.error('加载图片失败，请重试')
    throw err // 必须throw 或者 return Promise.reject()
  })
}
