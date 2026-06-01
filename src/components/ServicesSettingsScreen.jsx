import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { SERVICES, DEFAULT_SERVICES, DEFAULT_REGIONS } from '../data/services.js'
import { Toggle } from './ui/Toggle.jsx'
import { Chip } from './ui/Chip.jsx'

const REGIONS = [
  { code: 'PL', flag: '🇵🇱' },
  { code: 'US', flag: '🇺🇸' },
  { code: 'GB', flag: '🇬🇧' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'ES', flag: '🇪🇸' },
  { code: 'JP', flag: '🇯🇵' },
  { code: 'KR', flag: '🇰🇷' },
]

export function ServicesSettingsScreen({ user, onBack }) {
  const meta = user?.user_metadata ?? {}

  const [scopeMyServices, setScopeMyServices] = useState(
    meta.scope_my_services !== undefined ? meta.scope_my_services : true
  )
  const [subscribedIds, setSubscribedIds] = useState(
    meta.services ?? DEFAULT_SERVICES
  )
  const [includeTVAiring, setIncludeTVAiring] = useState(
    meta.include_tv_airing !== undefined ? meta.include_tv_airing : true
  )
  const [regions, setRegions] = useState(
    meta.regions ?? DEFAULT_REGIONS
  )

  const save = useCallback(async (patch) => {
    await supabase.auth.updateUser({ data: patch })
  }, [])

  function handleScopeToggle(val) {
    setScopeMyServices(val)
    save({ scope_my_services: val })
  }

  function handleServiceToggle(id) {
    setSubscribedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      save({ services: next })
      return next
    })
  }

  function handleTVToggle(val) {
    setIncludeTVAiring(val)
    save({ include_tv_airing: val })
  }

  function handleRegionToggle(code) {
    setRegions((prev) => {
      if (code === 'ALL') {
        const next = ['ALL']
        save({ regions: next })
        return next
      }
      // deselect ALL if present
      const without = prev.filter((r) => r !== 'ALL')
      const next = without.includes(code)
        ? without.filter((r) => r !== code)
        : [...without, code]
      // must always have at least one
      if (next.length === 0) return prev
      save({ regions: next })
      return next
    })
  }

  return (
    <div className="settings-screen">
      {/* Header */}
      <div className="settings-header">
        <button type="button" className="settings-header__back" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="settings-header__title">Services &amp; Scope</h1>
      </div>

      {/* Body */}
      <div className="settings-body">

        {/* Search scope default */}
        <div className="card">
          <p className="section-label">SEARCH SCOPE DEFAULT</p>
          <Toggle
            label="Search my services only"
            checked={scopeMyServices}
            onChange={handleScopeToggle}
          />
          <p className="helper-text">
            {scopeMyServices
              ? 'Only shows movies available on your subscriptions.'
              : 'Shows movies from all platforms.'}
          </p>
        </div>

        {/* Subscriptions */}
        <div className="card">
          <p className="section-label">YOUR SUBSCRIPTIONS</p>
          {SERVICES.map((svc) => (
            <div key={svc.id} className="service-row">
              <div className="service-logo" style={{ backgroundColor: svc.color }}>
                <span className="service-logo__abbr">{svc.abbreviation}</span>
              </div>
              <span className="service-name">{svc.name}</span>
              <Toggle
                label=""
                checked={subscribedIds.includes(svc.id)}
                onChange={() => handleServiceToggle(svc.id)}
              />
            </div>
          ))}
        </div>

        {/* TV Listings */}
        <div className="card">
          <p className="section-label">TV LISTINGS</p>
          <Toggle
            label="Include TV shows airing now"
            checked={includeTVAiring}
            onChange={handleTVToggle}
          />
        </div>

        {/* Region */}
        <div className="card">
          <p className="section-label">REGION</p>
          <div className="chip-group">
            {REGIONS.map(({ code, flag }) => (
              <Chip
                key={code}
                label={`${flag} ${code}`}
                selected={regions.includes(code)}
                onClick={() => handleRegionToggle(code)}
              />
            ))}
            <Chip
              label="🌍 All regions"
              selected={regions.includes('ALL')}
              onClick={() => handleRegionToggle('ALL')}
            />
          </div>
          <p className="helper-text">Affects availability data from TMDB.</p>
        </div>

      </div>
    </div>
  )
}
