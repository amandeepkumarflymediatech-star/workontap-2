'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import { useState } from 'react';
import AnimatedSearchBar from '@/components/AnimatedSearchBar';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const services = [
    'house cleaning', 'apartment moving', 'furniture assembly',
    'deep cleaning', 'move out cleaning', 'handyman repairs',
    'tv mounting', 'carpet cleaning'
  ];

  const faqs = [
    {
      q: "What services does WorkOnTap provide?",
      a: "WorkOnTap focuses on three main service categories: cleaning, moving and handyman services. Available services include house cleaning, commercial cleaning, carpet cleaning, moving services, furniture assembly, general home repairs and many other property-related services."
    },
    {
      q: "Do you provide cleaning services in Vancouver?",
      a: "Yes. WorkOnTap offers access to residential and commercial cleaning services in Vancouver and surrounding areas, depending on service availability. Services include regular house cleaning, deep cleaning, move-in and move-out cleaning, carpet cleaning, window cleaning and commercial cleaning."
    },
    {
      q: "What handyman services are available?",
      a: "Handyman services include general home repairs, furniture assembly, wall mounting, shelving installation, drywall repair, painting touch-ups, minor carpentry, flooring repairs, minor plumbing, minor electrical work and other general property maintenance jobs."
    },
    {
      q: "Can I find movers for a house or apartment?",
      a: "Yes. Moving services include house moving, apartment moving, commercial moving, student moving and long-distance moving."
    },
    {
      q: "Do you provide services for commercial properties?",
      a: "Yes. WorkOnTap includes commercial cleaning, warehouse cleaning, commercial moving and office or commercial handyman services."
    },
    {
      q: "How do I choose the right service?",
      a: "Start with the main category that matches your job: Cleaning, Moving or Handyman. Then select the specific service that best matches your requirements and provide as much information about the job as possible."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-white">
        <div className="container mx-auto px-6 max-w-7xl relative z-10 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#15803D] text-sm font-medium mb-6 backdrop-blur-sm animate-fadeIn">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Metro Vancouver
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-outfit)] leading-[1.1] mb-8 tracking-tight">
                Cleaning, Moving & Handyman Services in Vancouver <br className="hidden lg:block" />
                <span className="text-[#16A34A]">— All in One Place</span>
              </h1>

              <p className="text-lg md:text-xl mb-10 max-w-xl lg:mx-0 mx-auto leading-relaxed text-slate-600">
                Your home and property to-do list should not take over your day. Whether you need a cleaner, help with your next move, or someone to handle everyday repairs, WorkOnTap brings essential services together in one convenient place.
              </p>

              <AnimatedSearchBar services={services} />

              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Homes & Apartments
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Offices & Commercial
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Rental Properties
                </div>
              </div>
            </div>

            <div className="absolute inset-0 z-0 lg:relative lg:flex-1 lg:z-10 mt-12 lg:mt-0 overflow-hidden lg:overflow-visible opacity-25 lg:opacity-100 flex items-center justify-center">
              <div className="relative z-10 w-full transition-all duration-500 group flex items-center justify-center">
                <img
                  src="/hero-sphere.png"
                  alt="Quality Service Guaranteed"
                  className="object-contain lg:object-cover lg:scale-105 group-hover:scale-100 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Intro */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-outfit)]">One Place for the Services You Need Most</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Finding reliable help for different jobs can take time. WorkOnTap keeps things simple by bringing three essential service categories together. Whether it is a one-time job or ongoing property maintenance, you can find a service that matches your needs without searching across multiple platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/services?category=cleaning" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">🧹</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Cleaning Services</h3>
              <p className="text-slate-600 mb-6 flex-1">Routine house cleaning, deep cleaning, move-out cleaning, and commercial property cleaning.</p>
              <div className="text-[#16A34A] font-medium flex items-center gap-2">Explore Cleaning <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            </Link>
            <Link href="/services?category=movers" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">📦</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Moving Services</h3>
              <p className="text-slate-600 mb-6 flex-1">House movers, apartment moving, student moving, and long-distance relocations.</p>
              <div className="text-blue-600 font-medium flex items-center gap-2">Explore Moving <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            </Link>
            <Link href="/services?category=handyman" className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">🛠️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Handyman Services</h3>
              <p className="text-slate-600 mb-6 flex-1">General home repairs, furniture assembly, TV mounting, plumbing, electrical and more.</p>
              <div className="text-amber-600 font-medium flex items-center gap-2">Explore Handyman <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Deep Dive: Cleaning */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-[#16A34A] text-sm font-bold tracking-wider uppercase mb-4">Cleaning Services in Vancouver</div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-outfit)]">A Cleaner Space Starts With the Right Service</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Keeping your home or workplace clean takes time, consistency and attention to detail. WorkOnTap offers access to a wide range of cleaning services in Vancouver for residential and commercial properties.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you need routine house cleaning, move-out cleaning or professional cleaning for a larger commercial property, you can choose the service that best fits your space.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {['Regular House Cleaning', 'Deep Cleaning', 'Move-In Cleaning', 'Move-Out Cleaning', 'Carpet Cleaning', 'Steam Cleaning', 'Window Cleaning', 'Pressure Cleaning', 'Commercial Cleaning', 'Warehouse Cleaning', 'Educational Institution Cleaning', 'Medical Facility & Hospital Cleaning'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-[#16A34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {item}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 mb-8 italic">From everyday cleaning to more detailed property care, WorkOnTap helps you find the right cleaning service for your requirements.</p>
              <Link href="/services?category=cleaning" className="inline-flex items-center gap-2 px-8 py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition shadow-lg shadow-green-500/20">
                Explore Cleaning Services <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 bg-emerald-100 flex items-center justify-center">
                <img src="/cleaning_services.jpg" alt="Cleaning Services" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive: Moving */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <div className="flex-1 relative">
              <div className="aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 bg-blue-100 flex items-center justify-center">
                <img src="/moving_services.jpg" alt="Moving Services" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wider uppercase mb-4">Moving Services in Vancouver</div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-outfit)]">Moving Should Feel Organized, Not Overwhelming</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A successful move is about more than transporting boxes. Property access, furniture, stairs, elevators, moving distance and scheduling can all affect how your move needs to be planned.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                WorkOnTap offers moving services in Vancouver for homes, apartments, businesses, students and long-distance relocations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {['House Movers', 'Apartment Moving', 'Commercial Movers', 'Long Distance Movers', 'Student Moving'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {item}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 mb-8 italic">Whether you are moving across the city or preparing for a longer relocation, choose a moving service based on your property type and specific requirements. Providing details such as pickup location, destination, property type, larger furniture items and preferred moving date can help make the process smoother from the beginning.</p>
              <Link href="/services?category=movers" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                Explore Moving Services <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive: Handyman */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-bold tracking-wider uppercase mb-4">Handyman Services in Vancouver</div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-[family-name:var(--font-outfit)]">Get Those Small Jobs Off Your To-Do List</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A loose door, damaged drywall, furniture waiting to be assembled or an unfinished installation may seem small, but these tasks can quickly add up.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                WorkOnTap provides access to practical handyman services in Vancouver for homeowners, renters, landlords, offices and commercial properties.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-sm">
                {['General Home Repairs', 'Furniture Assembly', 'TV & Wall Mounting', 'Shelving & Storage Installation', 'Door & Window Repairs', 'Kitchen Repairs & Installation', 'Bathroom Repairs & Installation', 'Drywall & Wall Repair', 'Painting & Touch-Ups', 'Minor Carpentry', 'Flooring & Tile Repairs', 'Minor Plumbing', 'Minor Electrical', 'Smart Home Installation', 'Home Safety & Accessibility', 'Outdoor Repairs', 'Fence & Deck Repairs', 'Move-In & Move-Out Repairs', 'Rental Property Maintenance', 'Office & Commercial Handyman', 'General Odd Jobs'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {item}
                  </div>
                ))}
              </div>
              <p className="text-slate-600 mb-8 italic">Not every job requires a large renovation. Sometimes you simply need practical help to complete repairs, installations and maintenance tasks efficiently.</p>
              <Link href="/services?category=handyman" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-500/20">
                Explore Handyman Services <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 bg-amber-100 flex items-center justify-center">
                <img src="/handyman_services.jpg" alt="Handyman Services" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-[family-name:var(--font-outfit)]">Home Services for Homes, Rentals & Businesses</h2>
            <p className="text-lg text-slate-400">
              WorkOnTap is designed to support different types of customers across Vancouver and Metro Vancouver.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, title: 'For Homeowners', desc: 'Get help with cleaning, repairs, installations, furniture assembly, moving and everyday home maintenance.' },
              { icon: <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" /></svg>, title: 'For Renters & Students', desc: 'Find support for apartment moves, student moving, cleaning, furniture assembly and smaller household jobs.' },
              { icon: <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>, title: 'For Landlords & Property Managers', desc: 'Arrange move-in or move-out cleaning, rental property maintenance, minor repairs and other services required between tenants.' },
              { icon: <svg className="w-10 h-10 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, title: 'For Businesses', desc: 'Access commercial cleaning, warehouse cleaning, commercial moving and handyman services for offices and other business properties.' }
            ].map((card, i) => (
              <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-[#16A34A]/50 transition-colors">
                <div className="mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us & How to Request */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
            <div>
              <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 block">Benefits</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 font-[family-name:var(--font-outfit)]">Why Choose WorkOnTap?</h2>

              <div className="space-y-6">
                {[
                  { title: 'Multiple Services in One Place', desc: 'Find cleaning, moving and handyman services without searching across multiple websites.' },
                  { title: 'Residential & Commercial Services', desc: 'Access practical services for homes, apartments, offices, rental properties, warehouses and commercial spaces.' },
                  { title: 'Services Based on Your Actual Needs', desc: 'Choose the specific type of cleaning, moving or handyman work required instead of using a one-size-fits-all service.' },
                  { title: 'Simple Service Discovery', desc: 'Start with the main service category, choose the service you need and provide details about your job.' },
                  { title: 'Vancouver-Focused Home Services', desc: 'Find service options for customers across Vancouver and surrounding Metro Vancouver areas, subject to service availability.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">✓</div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-xl">
              <h3 className="text-3xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-outfit)]">Make Your Service Request More Accurate</h3>
              {/* <p className="text-slate-600 mb-8">Providing the right information from the beginning can make it easier to understand the scope of your job. Clear job details can reduce confusion and help ensure the right service is selected.</p> */}

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-[#16A34A] mb-2 flex items-center gap-2"><span className="text-xl">🧹</span> For Cleaning Services, Mention:</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>Property type and Approximate size</li>
                    <li>Areas that need cleaning</li>
                    <li>Current condition of the property</li>
                    {/* <li>Type of cleaning required & Preferred date</li> */}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><span className="text-xl">📦</span> For Moving Services, Include:</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>Pickup location and Destination</li>
                    <li>Property type (Stairs or elevators)</li>
                    <li>Larger furniture items</li>
                    {/* <li>Preferred moving date</li> */}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-amber-600 mb-2 flex items-center gap-2"><span className="text-xl">🛠️</span> For Handyman Services, Describe:</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>What needs to be repaired or installed</li>
                    <li>Where the job is located</li>
                    <li>Approximate dimensions where relevant</li>
                    {/* <li>Product or fixture details (Photos of the issue where helpful)</li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-outfit)]">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-lg">Common questions about WorkOnTap services in Vancouver.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                  <span className={`transform transition-transform text-slate-400 ${openFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                <div
                  className={`px-6 transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#16A34A] text-center px-6">
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-outfit)]">One Platform. Multiple Jobs. Less Hassle.</h2>
          <p className="text-xl text-emerald-100 mb-12 leading-relaxed">
            Cleaning the house? Planning a move? Need repairs completed?<br />
            WorkOnTap helps you find the service that matches your job without making the process unnecessarily complicated.
          </p>
          <Link href="/services" className="inline-flex items-center gap-3 bg-white text-[#16A34A] px-10 py-5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl active:scale-95 group text-lg">
            Explore All Services
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
          <p className="mt-8 text-emerald-200">Explore cleaning, moving and handyman services in Vancouver and take the next task off your list.</p>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        :global(html, body) {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}