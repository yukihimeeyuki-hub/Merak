<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isFocused = ref({ username: false, password: false })
const isLoading = ref(false)

// Canvas 引用与主循环 ID
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

// --- 动画对象定义 ---
interface Star { x: number; y: number; size: number; alpha: number; speed: number }
interface Particle { x: number; y: number; size: number; speed: number; alpha: number }
interface Sakura { x: number; y: number; size: number; rotation: number; rotateSpeed: number; speedY: number; speedX: number; swing: number; swingSpeed: number }

let stars: Star[] = []
let particles: Particle[] = []
let sakuras: Sakura[] = []
let magicCircleRotation = 0

// 处理登录模拟
const handleLogin = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

// 初始化所有动画元素
const initCanvasElements = (width: number, height: number) => {
  const isMobile = width <= 768

  // 1. 星空初始化
  stars = Array.from({ length: isMobile ? 40 : 120 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.5,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.01
  }))

  // 2. 粒子初始化
  particles = Array.from({ length: isMobile ? 15 : 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 0.4 + 0.2,
    alpha: Math.random() * 0.5 + 0.5
  }))

  // 3. 樱花初始化
  sakuras = Array.from({ length: isMobile ? 8 : 25 }, () => ({
    x: Math.random() * width,
    y: Math.random() * -height,
    size: Math.random() * 12 + 8,
    rotation: Math.random() * Math.PI * 2,
    rotateSpeed: Math.random() * 0.02 - 0.01,
    speedY: Math.random() * 1 + 1,
    speedX: Math.random() * 0.5 - 0.25,
    swing: 0,
    swingSpeed: Math.random() * 0.03 + 0.01
  }))
}

// 绘制单片樱花的数学路径
const drawSakuraPetal = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // 樱花渐变色
  const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2)
  gradient.addColorStop(0, '#ffb7d5')
  gradient.addColorStop(0.5, '#ff69b4')
  gradient.addColorStop(1, '#ff1493')
  ctx.fillStyle = gradient

  ctx.beginPath()
  // 利用三次贝塞尔曲线绘制标准对称心型花瓣
  ctx.moveTo(0, -size / 2)
  ctx.bezierCurveTo(size / 3, -size * 0.9, size, -size / 3, size / 2, size / 4)
  ctx.bezierCurveTo(0, size * 0.8, 0, size * 0.8, -size / 2, size / 4)
  ctx.bezierCurveTo(-size, -size / 3, -size / 3, -size * 0.9, 0, -size / 2)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// 绘制魔法阵背景
const drawMagicCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, baseSize: number) => {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(magicCircleRotation)

  // 外层细线圈
  ctx.beginPath()
  ctx.arc(0, 0, baseSize * 1.2, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 107, 157, 0.15)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 中层虚线圈
  ctx.beginPath()
  ctx.arc(0, 0, baseSize, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)'
  ctx.setLineDash([6, 12])
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([]) // 重置虚线

  // 内层主魔法圈
  ctx.beginPath()
  ctx.arc(0, 0, baseSize * 0.8, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 107, 157, 0.2)'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.restore()
  magicCircleRotation += 0.003 // 极慢速旋转，防止晃眼
}

// Canvas 渲染主循环
const renderLoop = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  // 1. 清空画布并绘制深邃星空底色
  ctx.clearRect(0, 0, w, h)
  const bgGrad = ctx.createLinearGradient(0, 0, w, h)
  bgGrad.addColorStop(0, '#0a0a2a')
  bgGrad.addColorStop(0.5, '#1d1540')
  bgGrad.addColorStop(1, '#0a0a2a')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // 2. 渲染星空（呼吸闪烁）
  stars.forEach(star => {
    star.alpha += star.speed
    if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fill()
  })

  // 3. 渲染居中的魔法阵
  const isMobile = w <= 768
  drawMagicCircle(ctx, w / 2, h / 2, isMobile ? 120 : 260)

  // 4. 渲染粒子（线性上升并渐隐）
  particles.forEach(p => {
    p.y -= p.speed
    if (p.y < -10) {
      p.y = h + 10
      p.x = Math.random() * w
    }
    ctx.fillStyle = `rgba(255, 107, 157, ${p.alpha})`
    ctx.shadowBlur = 8
    ctx.shadowColor = '#ff6b9d'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0 // 状态复原，防止污染后续绘制
  })

  // 5. 渲染樱花（物理飘落 + 正弦摇摆）
  sakuras.forEach(s => {
    s.y += s.speedY
    s.swing += s.swingSpeed
    s.x += s.speedX + Math.sin(s.swing) * 0.4
    s.rotation += s.rotateSpeed

    if (s.y > h + 20 || s.x < -20 || s.x > w + 20) {
      s.y = -20
      s.x = Math.random() * w
      s.swing = 0
    }
    drawSakuraPetal(ctx, s.x, s.y, s.size, s.rotation)
  })

  animationFrameId = requestAnimationFrame(renderLoop)
}

// 处理窗口尺寸调整（防抖与自适应）
const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initCanvasElements(canvas.width, canvas.height)
}

onMounted(() => {
  if (canvasRef.value) {
    window.addEventListener('resize', handleResize)
    handleResize() // 触发初次尺寸计算与初始化
    renderLoop()   // 开启超级顺滑的 Canvas 渲染管线
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <div class="login-container">
    <!-- 将星空、魔法阵、粒子、樱花融为一体的全屏高性能 Canvas -->
    <canvas ref="canvasRef" class="global-effects-canvas"></canvas>

    <!-- 登录卡片 (保留原有高大上毛玻璃，精简图层，修复移动端尺寸溢出问题) -->
    <div class="login-card">
      <div class="login-header">
        <div class="anime-avatar">
          <div class="avatar-ring"></div>
          <div class="avatar-inner">
            <span class="avatar-text">✨</span>
          </div>
        </div>
        <h1 class="title">
          <span class="title-char" v-for="(char, index) in '欢迎回来'" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
            {{ char }}
          </span>
        </h1>
        <p class="subtitle">Welcome back, senpai~</p>
      </div>

      <!-- 表单区域 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 用户名输入框 -->
        <div class="input-group" :class="{ focused: isFocused.username, filled: username }">
          <div class="input-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
          </div>
          <label class="input-label">
            <!-- 修复点：新增 Wrapper 规避不同操作系统产生的 Emoji 偏离 Bug -->
            <span class="label-icon-wrapper">👤</span>
            <span class="label-text">用户名</span>
          </label>
          <input
            v-model="username"
            type="text"
            class="input-field"
            placeholder="请输入用户名"
            @focus="isFocused.username = true"
            @blur="isFocused.username = false"
          />
          <div class="input-glow"></div>
        </div>

        <!-- 密码输入框 -->
        <div class="input-group" :class="{ focused: isFocused.password, filled: password }">
          <div class="input-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
          </div>
          <label class="input-label">
            <!-- 修复点：新增 Wrapper 保证 Emoji 垂直绝对居中 -->
            <span class="label-icon-wrapper">🔐</span>
            <span class="label-text">密码</span>
          </label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="请输入密码"
            @focus="isFocused.password = true"
            @blur="isFocused.password = false"
          />
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
          <div class="input-glow"></div>
        </div>

        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" class="checkbox-input" />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">记住我</span>
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="login-button" :class="{ loading: isLoading }">
          <span class="button-text" v-if="!isLoading">登录</span>
          <div class="button-loading" v-else>
            <div class="loading-spinner"></div>
            <span>登录中...</span>
          </div>
          <div class="button-effects">
            <div class="effect-1"></div>
            <div class="effect-2"></div>
            <div class="effect-3"></div>
          </div>
        </button>
      </form>

      <!-- 分隔线 -->
      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-text">或者</span>
        <span class="divider-line"></span>
      </div>

      <!-- 社交登录 (视觉重构：由刺眼的原色改为与二次元契合的融合悬停色) -->
      <div class="social-login">
        <button class="social-button github">
          <span class="label-icon-wrapper">🐙</span>
          <span>GitHub</span>
        </button>
        <button class="social-button qq">
          <span class="label-icon-wrapper">🐧</span>
          <span>QQ</span>
        </button>
        <button class="social-button wechat">
          <span class="label-icon-wrapper">💬</span>
          <span>微信</span>
        </button>
      </div>

      <!-- 注册链接 -->
<!--      <div class="register-link">
        还没有账号? <a href="#" class="register-btn">立即注册</a>
      </div>-->
    </div>

    <!-- 底部装饰波浪 -->
    <div class="bottom-decoration">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/color.scss";

// 全局容器布局
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px;
}

// Canvas 特效层（降维打击老设备的关键）
.global-effects-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

// 核心优化：登录卡片流式适配（彻底干掉小屏幕横向溢出问题）
.login-card {
  position: relative;
  z-index: 10;
  width: calc(100% - 32px); /* 移动端防贴边安全边距 */
  max-width: 420px;          /* 保证 PC 端不会无限拉大 */
  padding: 40px 30px;        /* 优化过的横向 Padding，给输入框预留开阔地 */
  box-sizing: border-box;    /* 强制内边距不扩充卡片总宽 */
  background: rgba(20, 20, 48, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 2px solid rgba(255, 107, 157, 0.25);
  box-shadow: 0 0 40px rgba(255, 107, 157, 0.15), inset 0 0 30px rgba(255, 255, 255, 0.03);
  animation: card-float 6s ease-in-out infinite;
  will-change: transform;
}

// 头部区域
.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.anime-avatar {
  position: relative;
  width: 86px;
  height: 86px;
  margin: 0 auto 16px;

  .avatar-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: $primary;
    border-right-color: $secondary;
    border-radius: 50%;
    animation: rotate-ring 4s linear infinite;
  }

  .avatar-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 68px;
    height: 68px;
    background: linear-gradient(135deg, $primary, $secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.4);
  }

  .avatar-text {
    font-size: 32px;
  }
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, $primary, $secondary, $accent);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-text 4s ease infinite;
  display: flex;
  justify-content: center;
  gap: 2px;
  color:#ffffff;

}

.title-char {
  display: inline-block;
  animation: float-char 3s ease-in-out infinite;
}

.subtitle {
  color: rgba(220, 220, 255, 0.6);
  font-size: 13px;
  margin: 0;
}

// 表单与输入框
.login-form {
  margin-bottom: 16px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
  padding: 20px 16px;
  background: rgba(10, 10, 35, 0.6);
  border-radius: 12px;
  border: 2px solid rgba(255, 107, 157, 0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &.focused {
    border-color: $primary;
    box-shadow: 0 0 15px rgba(255, 107, 157, 0.25);
    transform: translateY(-1px);

    .input-label {
      color: $primary;
      transform: translateY(-22px) scale(0.85);
    }
    .decoration-line { width: 100%; }
  }

  &.filled .input-label {
    transform: translateY(-22px) scale(0.85);
  }
}

// 核心优化：彻底制服不同系统 Emoji 图标高低错位、对不齐的恶魔
.label-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  line-height: 1;
  text-align: center;
  transform: translateY(-0.5px); /* 微调像素偏置，完美对齐右侧文本 */
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  left: 14px;
  top: 14px;
  color: rgba(220, 220, 255, 0.7);
  font-size: 14px;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: left top;
}

.input-field {
  width: 100%;
  padding: 8px 0;
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.04); /* 👈 柔和内背景 */
  border: none;
  outline: none;
  color: $text-light;
  font-size: 15px;
  line-height: 1.4;
  border-radius: 6px;
  transition: background 0.2s ease;

  &::placeholder {
    color: transparent;
  }
}

/* 聚焦时输入框微微变亮 */
.input-group.focused .input-field {
  background: rgba(255, 255, 255, 0.08);
}

.input-decoration {
  position: absolute;
  bottom: -2px;
  left: -2px;
  right: -2px;
  height: 2px;
  overflow: hidden;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.decoration-line {
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, $primary, $secondary);
  transition: width 0.3s ease;
}

.password-toggle {
  position: absolute;
  right: 14px;
  bottom: 25px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: transform 0.2s ease;
  &:hover { opacity: 1; transform: scale(1.15); }
}

// 记住我与选项
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 20px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
  &:checked + .checkbox-custom {
    background: $primary;
    border-color: $primary;
    &::after { opacity: 1; }
  }
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 107, 157, 0.4);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
  &::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    opacity: 0;
  }
}

.checkbox-text, .forgot-password, .register-link {
  font-size: 13px;
  color: rgba(220, 220, 255, 0.65);
}

.forgot-password, .register-btn {
  color: $primary;
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover { color: $secondary; text-shadow: 0 0 8px rgba(255, 107, 157, 0.4); }
}

// 登录按钮
.login-button {
  position: relative;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, $primary, $secondary);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.35);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(255, 107, 157, 0.5);
  }
  &:active { transform: translateY(-0.5px); }
  &.loading { pointer-events: none; opacity: 0.85; }
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: rotate-ring 0.8s linear infinite;
}

// 分隔线
.divider {
  display: flex;
  align-items: center;
  margin: 18px 0;
  gap: 10px;
  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 107, 157, 0.3), transparent);
  }
  .divider-text { color: rgba(220, 220, 255, 0.45); font-size: 13px; }
}

// 社交登录高阶视觉优化（统一暗色半透明质感，移除了突兀的原生色彩，更符合二次元魔法风）
.social-login {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.social-button {
  flex: 1;
  padding: 10px;
  background: rgba(15, 15, 45, 0.5);
  border: 1.5px solid rgba(255, 107, 157, 0.15);
  border-radius: 10px;
  color: rgba(240, 240, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    color: #fff;
    background: rgba(255, 107, 157, 0.1);
  }
  &.github:hover { border-color: #7e57c2; box-shadow: 0 4px 12px rgba(126, 87, 194, 0.3); }
  &.qq:hover { border-color: #26c6da; box-shadow: 0 4px 12px rgba(38, 198, 218, 0.3); }
  &.wechat:hover { border-color: #66bb6a; box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3); }
}

.register-link { text-align: center; }

// 底部装饰性波浪（纯粹作为静态或缓动点缀，移除高消耗多余 DOM 计算）
.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
  opacity: 0.4;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ff6b9d' fill-opacity='0.15' d='M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,165.3C672,160,768,192,864,181.3C960,171,1056,117,1152,112C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
  background-size: 50% 100%;
  animation: wave-move 20s linear infinite;

  &:nth-child(2) {
    animation-duration: 12s;
    opacity: 0.6;
    bottom: -5px;
    transform: scaleY(-1); /* 产生错落感 */
  }
}

// 动画核心定义
@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes rotate-ring {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes gradient-text {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float-char {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes wave-move {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

// 移动端及极端高度适配微调
@media (max-width: 480px) {
  .login-card { padding: 30px 20px; }
  .title { font-size: 24px; }
  .anime-avatar { width: 72px; height: 72px; .avatar-inner { width: 56px; height: 56px; } }
}

@media (max-height: 640px) {
  .login-container { align-items: flex-start; overflow-y: auto; padding: 24px 16px; }
  .login-card { animation: none; margin-top: 10px; } /* 超矮屏幕（如横屏手机）直接关掉浮动动画，防止表单滑出可视区 */
}

// 尊重系统减弱动画
@media (prefers-reduced-motion: reduce) {
  .global-effects-canvas { display: none; }
  .login-card, .title-char, .wave { animation: none !important; }
}
</style>
