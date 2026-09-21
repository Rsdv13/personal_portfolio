import { useState } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { ChatWidget } from './components/ChatWidget'
import { ChatFab } from './components/ChatFab'

function App() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ink">
      <Nav onOpenChat={() => setChatOpen(true)} />
      <main>
        <Hero onOpenChat={() => setChatOpen(true)} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact onOpenChat={() => setChatOpen(true)} />
      </main>
      <Footer />
      <ChatFab onOpen={() => setChatOpen(true)} hidden={chatOpen} />
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

export default App
