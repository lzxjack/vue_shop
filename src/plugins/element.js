import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 弹窗提示要挂载到Vue.prototype
Vue.prototype.$message = Message;