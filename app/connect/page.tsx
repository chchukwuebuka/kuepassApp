import React from 'react'
import ConnectSection from '@/components/ConnectSection'
import Footer from '@/components/Footer'
import Navbar from '@/components/navbar'
import ContactFormSection from '@/components/ContactFormSection'

function page() {
  return (
    <div >
      <Navbar alwaysDark />
        <ConnectSection />
        <ContactFormSection />
      <Footer />
    </div>
  )
}

export default page