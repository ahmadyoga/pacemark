'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [connecting, setConnecting] = useState(false)

  function handleConnect() {
    setConnecting(true)
    router.push('/api/auth/strava')
  }

  return (
    <div className="screen screen-landing">
      <div className="landing-bg">
        <div className="landing-bg-grain" />
      </div>
      <div className="landing-content">
        <div className="landing-logo">
          <div className="landing-mark">
            <svg viewBox="0 0 32 32" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22c4-2 6-10 10-10s4 8 8 8 6-2 6-2" />
              <circle cx="4" cy="22" r="1.4" fill="currentColor" />
              <circle cx="28" cy="18" r="1.4" fill="currentColor" />
            </svg>
          </div>
          <div className="landing-wordmark">pacemark</div>
        </div>

        <div className="landing-hero">
          <h1 className="landing-title">Turn your runs into stories.</h1>
          <p className="landing-sub">
            Pull your activities, pick a template, post a sticker that actually looks like you ran on purpose.
          </p>
        </div>

        {error && (
          <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 12 }}>
            {error === 'access_denied' ? 'Access denied — try again.' : 'Something went wrong. Please try again.'}
          </p>
        )}

        <div className="landing-cta-wrap">
          <button
            className={`landing-cta ${connecting ? 'is-connecting' : ''}`}
            onClick={handleConnect}
            disabled={connecting}
          >
            <span className="landing-cta-icon"><BoltIcon /></span>
            <span className="landing-cta-label">
              {connecting ? 'Connecting…' : 'Connect with Strava'}
            </span>
            <span className="landing-cta-spinner" />
          </button>
          <div className="landing-disclaimer">
            We only read your activity data.<br />
            We never post on your behalf.
          </div>
        </div>

        <div className="landing-foot">
          <span>v1.0 · made in Jakarta</span>
          <span className="landing-foot-dot">●</span>
          <span>privacy</span>
          <span className="landing-foot-dot">●</span>
          <span>terms</span>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  )
}
