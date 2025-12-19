<template>
  <!-- SVG 滤镜定义 - 用于 Liquid Glass 液态玻璃效果 -->
  <svg class="liquid-glass-filter-container" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- 主滤镜：液态玻璃折射效果 -->
      <filter id="liquidGlassDistortion" x="-50%" y="-50%" width="200%" height="200%">
        <!-- 生成噪声纹理用于折射 -->
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.01 0.01" 
          numOctaves="3" 
          seed="2" 
          result="turbulence"
        />
        
        <!-- 位移映射 - 创建边缘折射效果 -->
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="turbulence" 
          scale="8" 
          xChannelSelector="R" 
          yChannelSelector="G"
          result="displacement"
        />
        
        <!-- 高斯模糊 - 柔化边缘 -->
        <feGaussianBlur 
          in="displacement" 
          stdDeviation="0.5"
          result="blur"
        />
        
        <!-- 合成 -->
        <feComposite 
          in="blur" 
          in2="SourceGraphic" 
          operator="atop"
        />
      </filter>

      <!-- 边缘高光滤镜 -->
      <filter id="liquidGlassHighlight" x="-50%" y="-50%" width="200%" height="200%">
        <!-- 形态学操作 - 创建边缘 -->
        <feMorphology 
          operator="dilate" 
          radius="1" 
          in="SourceAlpha" 
          result="dilated"
        />
        
        <!-- 边缘检测 -->
        <feComposite 
          in="dilated" 
          in2="SourceAlpha" 
          operator="out" 
          result="edge"
        />
        
        <!-- 高光颜色 -->
        <feFlood 
          flood-color="rgba(255, 255, 255, 0.9)" 
          result="highlightColor"
        />
        
        <!-- 应用高光到边缘 -->
        <feComposite 
          in="highlightColor" 
          in2="edge" 
          operator="in"
          result="highlight"
        />
        
        <!-- 模糊高光 -->
        <feGaussianBlur 
          in="highlight" 
          stdDeviation="1.5"
          result="blurredHighlight"
        />
        
        <!-- 合并 -->
        <feMerge>
          <feMergeNode in="SourceGraphic"/>
          <feMergeNode in="blurredHighlight"/>
        </feMerge>
      </filter>

      <!-- 边缘折射 + 高光组合滤镜 -->
      <filter id="liquidGlassComplete" x="-50%" y="-50%" width="200%" height="200%">
        <!-- 噪声生成 -->
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.015 0.015" 
          numOctaves="4" 
          seed="5" 
          result="noise"
        />
        
        <!-- 边缘折射 -->
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="noise" 
          scale="6" 
          xChannelSelector="R" 
          yChannelSelector="B"
          result="distorted"
        />
        
        <!-- 高斯模糊背景 -->
        <feGaussianBlur 
          in="distorted" 
          stdDeviation="0.8"
          result="blurred"
        />
        
        <!-- 增强对比度 */
        <feColorMatrix 
          in="blurred"
          type="matrix"
          values="1.1 0 0 0 0
                  0 1.1 0 0 0
                  0 0 1.1 0 0
                  0 0 0 1 0"
          result="enhanced"
        />
        
        <!-- 边缘高光 -->
        <feMorphology 
          operator="dilate" 
          radius="1.5" 
          in="SourceAlpha" 
          result="expanded"
        />
        
        <feComposite 
          in="expanded" 
          in2="SourceAlpha" 
          operator="out" 
          result="edgeMask"
        />
        
        <feFlood 
          flood-color="rgba(255, 255, 255, 0.95)" 
          result="whiteHighlight"
        />
        
        <feComposite 
          in="whiteHighlight" 
          in2="edgeMask" 
          operator="in"
          result="edgeHighlight"
        />
        
        <feGaussianBlur 
          in="edgeHighlight" 
          stdDeviation="2"
          result="softHighlight"
        />
        
        <!-- 投影阴影 -->
        <feDropShadow 
          dx="0" 
          dy="4" 
          stdDeviation="8" 
          flood-color="rgba(0, 122, 255, 0.15)"
          result="shadow"
        />
        
        <!-- 最终合成 -->
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="enhanced"/>
          <feMergeNode in="softHighlight"/>
        </feMerge>
      </filter>

      <!-- 柔和的玻璃效果（性能较好） -->
      <filter id="liquidGlassSoft" x="-20%" y="-20%" width="140%" height="140%">
        <!-- 轻微折射 -->
        <feTurbulence 
          type="turbulence" 
          baseFrequency="0.02" 
          numOctaves="2" 
          seed="1" 
          result="turbulence"
        />
        
        <feDisplacementMap 
          in="SourceGraphic" 
          in2="turbulence" 
          scale="4" 
          xChannelSelector="R" 
          yChannelSelector="G"
          result="displacement"
        />
        
        <!-- 轻微模糊 -->
        <feGaussianBlur 
          in="displacement" 
          stdDeviation="0.3"
          result="blur"
        />
        
        <!-- 边缘发光 -->
        <feDropShadow 
          dx="0" 
          dy="2" 
          stdDeviation="4" 
          flood-color="rgba(255, 255, 255, 0.6)"
        />
      </filter>

      <!-- 镜面反射效果 -->
      <filter id="liquidGlassReflection">
        <!-- 镜面高光 -->
        <feSpecularLighting 
          surfaceScale="5" 
          specularConstant="1" 
          specularExponent="20" 
          lighting-color="rgba(255, 255, 255, 0.9)"
          result="specular"
        >
          <fePointLight x="50" y="50" z="200"/>
        </feSpecularLighting>
        
        <!-- 合成反射 -->
        <feComposite 
          in="specular" 
          in2="SourceGraphic" 
          operator="arithmetic"
          k1="0" 
          k2="1" 
          k3="1" 
          k4="0"
        />
      </filter>
    </defs>
  </svg>
</template>

<script setup lang="ts">
// Liquid Glass SVG 滤镜组件
// 提供多种 SVG 滤镜效果用于实现 iOS 26 液态玻璃视觉效果
</script>

<style scoped>
.liquid-glass-filter-container {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
