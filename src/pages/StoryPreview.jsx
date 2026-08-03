// SHELVED: public preview of the About-page "Our Story" variants so a style
// can be picked without logging in. Not currently routed — to revive it, add
// a lazy route in App.jsx (e.g. <Route path="/story-preview" element={<StoryPreview />} />).
import { OriginStory } from './About.jsx'

export default function StoryPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', padding: '48px 20px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: '#565a63', margin: '0 0 16px' }}>
          Temporary preview page — the same section appears at the top of the About page.
        </p>
        <OriginStory />
      </div>
    </div>
  )
}
