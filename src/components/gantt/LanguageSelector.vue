<template>
  <div class="language-selector">
    <button 
      class="lang-btn" 
      @click="toggleDropdown"
      :class="{ active: isOpen }"
      :title="t('configPanel.languageSettings')"
    >
      <div class="btn-content">
        <div class="btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </div>
        <span class="btn-text">{{ currentLocaleLabel }}</span>
        <div class="btn-arrow" :class="{ rotated: isOpen }">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </div>
    </button>

    <transition name="dropdown-fade">
      <div v-if="isOpen" class="lang-dropdown">
        <div
          v-for="locale in locales"
          :key="locale.value"
          class="lang-option"
          :class="{ active: currentLocale === locale.value }"
          @click="selectLocale(locale.value)"
        >
          <span class="lang-label">{{ locale.label }}</span>
          <div v-if="currentLocale === locale.value" class="lang-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n, type Locale } from './i18n';

export default defineComponent({
  name: 'LanguageSelector',
  setup() {
    const { locale, t, setLocale, getLocales } = useI18n();
    const isOpen = ref(false);

    const currentLocale = computed(() => locale.value);
    const locales = computed(() => getLocales());
    
    const currentLocaleLabel = computed(() => {
      const current = locales.value.find((l: { value: Locale; label: string }) => l.value === currentLocale.value);
      return current?.label || 'Language';
    });

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const selectLocale = (localeValue: Locale) => {
      setLocale(localeValue);
      closeDropdown();
    };

    // 点击外部关闭下拉菜单
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        closeDropdown();
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      isOpen,
      currentLocale,
      currentLocaleLabel,
      locales,
      t,
      toggleDropdown,
      closeDropdown,
      selectLocale
    };
  }
});
</script>

<style lang="scss" scoped>
.language-selector {
  position: relative;
}

.lang-btn {
  background: var(--bg-metal-normal, linear-gradient(145deg, #f5f5f5, #e8e8e8));
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: var(--shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.8));
  padding: 8px 12px;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  font-family: var(--font-family);
  display: flex;
  align-items: center;
  min-width: 140px;

  &:hover {
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  }

  &:active,
  &.active {
    background: var(--bg-active, linear-gradient(145deg, #0078d4, #106ebe));

    .btn-icon,
    .btn-text,
    .btn-arrow {
      color: var(--text-white, #ffffff);
    }
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .btn-icon {
    color: var(--text-secondary, #666666);
    display: flex;
    align-items: center;
    transition: color var(--transition-fast, 0.15s ease);
  }

  .btn-text {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary, #333333);
    transition: color var(--transition-fast, 0.15s ease);
    text-align: left;
  }

  .btn-arrow {
    color: var(--text-secondary, #666666);
    display: flex;
    align-items: center;
    transition: transform var(--transition-fast, 0.15s ease), color var(--transition-fast, 0.15s ease);

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-content, #ffffff);
  border: 1px solid var(--border, #d0d0d0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  min-width: 140px;
  color: var(--text-primary, #333333);
}

.lang-option {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast, 0.15s ease);
  border-bottom: 1px solid var(--border, #e8e8e8);
  color: var(--text-primary, #333333);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-metal-light, linear-gradient(145deg, #ffffff, #f5f5f5));
  }

  &.active {
    background: var(--bg-active-hover, linear-gradient(145deg, #e3f2fd, #bbdefb));
    color: var(--primary, #0078d4);
    font-weight: 600;
  }

  .lang-label {
    font-size: 12px;
  }

  .lang-check {
    color: var(--primary, #0078d4);
    display: flex;
    align-items: center;
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
