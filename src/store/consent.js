import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConsentStore = defineStore('consent', () => {
  const hasConsented = ref(false)
  const showBanner = ref(false)

  // Initialize consent state from localStorage
  const initConsent = () => {
    const storedConsent = localStorage.getItem('user_consent')
    
    if (storedConsent === 'granted') {
      hasConsented.value = true
      showBanner.value = false
      updateGtagConsent('granted')
    } else if (storedConsent === 'denied') {
      hasConsented.value = false
      showBanner.value = false
      // No need to update gtag as default is denied, but good to be explicit if needed
    } else {
      // No choice made yet
      hasConsented.value = false
      showBanner.value = true
    }
  }

  const acceptConsent = () => {
    hasConsented.value = true
    showBanner.value = false
    localStorage.setItem('user_consent', 'granted')
    updateGtagConsent('granted')
  }

  const declineConsent = () => {
    hasConsented.value = false
    showBanner.value = false
    localStorage.setItem('user_consent', 'denied')
    updateGtagConsent('denied')
  }

  const updateGtagConsent = (status) => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': status,
        'ad_user_data': status,
        'ad_personalization': status,
        'analytics_storage': status
      })
      
      // Push event to dataLayer for GTM triggers
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'consent_update',
        consent_status: status
      })
      
      console.log(`GA4 Consent updated to: ${status}`)
    } else {
      console.warn('gtag function not found')
    }
  }

  return {
    hasConsented,
    showBanner,
    initConsent,
    acceptConsent,
    declineConsent
  }
})
