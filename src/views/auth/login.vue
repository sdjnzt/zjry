<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-overlay"></div>
    </div>
    
    <div class="login-content">
      <div class="login-card">
        <!-- 系统标题 -->
        <div class="system-title">
          <div class="logo">
            <ShopOutlined class="logo-icon" />
          </div>
          <h1 class="title">中交润杨智慧船舶动态监控系统</h1>
          <p class="subtitle">Smart Ship Dynamic Monitoring System</p>
        </div>

        <!-- 登录表单 -->
        <a-form
          :model="loginForm"
          :rules="loginRules"
          @finish="handleLogin"
          class="login-form"
          layout="vertical"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="loginForm.username"
              size="large"
              placeholder="请输入用户名"
              :prefix="h(UserOutlined)"
              class="login-input"
            />
          </a-form-item>

          <a-form-item name="password" label="密码">
            <a-input-password
              v-model:value="loginForm.password"
              size="large"
              placeholder="请输入密码"
              :prefix="h(LockOutlined)"
              class="login-input"
            />
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model:checked="loginForm.remember">
              记住密码
            </a-checkbox>
            <a class="forgot-password">忘记密码？</a>
          </div>

          <a-form-item>
            <a-button
              type="primary"
              size="large"
              html-type="submit"
              class="login-button"
              :loading="loading"
              block
            >
              {{ loading ? '登录中...' : '登录' }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 底部信息 -->
        <div class="login-footer">
          <p class="copyright">© 2024 中交润杨科技有限公司</p>
          <p class="version">版本 v2.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

/**
 * 登录表单数据
 */
interface LoginForm {
  username: string
  password: string
  remember: boolean
}

/**
 * 登录表单验证规则
 */
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

const router = useRouter()
const loading = ref(false)

/**
 * 登录表单数据
 */
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})

/**
 * 处理登录提交
 * @param values 表单数据
 */
const handleLogin = async (values: LoginForm) => {
  try {
    loading.value = true
    
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 验证用户名和密码（这里使用模拟数据）
    if (values.username === 'admin' && values.password === '123456') {
      message.success('登录成功！')
      
      // 保存登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('currentUser', values.username)
      if (values.remember) {
        localStorage.setItem('rememberedUser', values.username)
      }
      
      // 跳转到主页面
      router.push('/')
    } else {
      message.error('用户名或密码错误！')
    }
  } catch (error) {
    message.error('登录失败，请重试！')
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 组件挂载时检查是否有记住的用户名
 */
const checkRememberedUser = () => {
  const rememberedUser = localStorage.getItem('rememberedUser')
  if (rememberedUser) {
    loginForm.username = rememberedUser
    loginForm.remember = true
  }
}

// 页面加载时检查记住的用户
checkRememberedUser()
</script>

<style lang="less" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.login-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.system-title {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    margin-bottom: 20px;
    
    .logo-icon {
      font-size: 48px;
      color: #667eea;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
    font-weight: 400;
  }
}

.login-form {
  margin-bottom: 30px;

  .login-input {
    border-radius: 12px;
    border: 2px solid #f0f0f0;
    transition: all 0.3s;
    height: 48px;

    &:hover,
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    :deep(.ant-input-prefix) {
      color: #999;
      margin-right: 8px;
    }
  }

  :deep(.ant-form-item-label > label) {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #5a6fd8;
    }
  }
}

.login-button {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;

  .copyright {
    color: #999;
    font-size: 12px;
    margin: 0 0 4px 0;
  }

  .version {
    color: #ccc;
    font-size: 11px;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-content {
    padding: 10px;
  }

  .login-card {
    padding: 30px 20px;
  }

  .system-title .title {
    font-size: 20px;
  }
}
</style>
