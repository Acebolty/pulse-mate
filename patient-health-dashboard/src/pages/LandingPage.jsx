import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  ChartBarIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: '10,000+',
    totalDoctors: '500+',
    uptime: '99.9%',
    support: '24/7'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/public/stats');
        const data = await response.json();

        if (data.success) {
          setStats({
            totalPatients: `${data.data.totalPatients.toLocaleString()}+`,
            totalDoctors: `${data.data.totalDoctors}+`,
            uptime: data.data.uptime,
            support: data.data.support
          });
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Keep default values if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Hero slideshow images
  const heroSlides = [
    {
      title: "Monitor Your Health Remotely",
      subtitle: "Track vital signs, monitor health trends, and stay connected with healthcare providers from the comfort of your home.",
      image: "/images/hero-slide-1.jpg"
    },
    {
      title: "Real-Time Health Insights",
      subtitle: "Get instant alerts and comprehensive health reports to make informed decisions about your wellbeing.",
      image: "/images/hero-slide-2.jpeg"
    },
    {
      title: "Connect with Healthcare Professionals",
      subtitle: "Schedule consultations and communicate directly with qualified doctors through our secure platform.",
      image: "/images/hero-slide-3.jpg"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">PulseMate</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-green-600 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-green-600 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-green-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-green-600 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-green-600 transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-green-600 transition-colors">
                Contact
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block text-gray-700 hover:text-green-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate('/signup');
                  window.scrollTo(0, 0);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-2xl transition-colors font-medium"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-green-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-4">
                <button onClick={() => { scrollToSection('home'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-green-600 transition-colors">
                  Home
                </button>
                <button onClick={() => { scrollToSection('about'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-green-600 transition-colors">
                  About
                </button>
                <button onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-green-600 transition-colors">
                  Features
                </button>
                <button onClick={() => { scrollToSection('services'); setMobileMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-green-600 transition-colors">
                  Services
                </button>
                <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-700 hover:text-green-600 transition-colors">
                  Sign In
                </button>
                <button onClick={() => {
                  navigate('/signup');
                  window.scrollTo(0, 0);
                }} className="block w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl transition-colors text-center">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 bg-gradient-to-br from-green-800 to-emerald-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/50 to-green-900/60 z-10" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover opacity-50"
                style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                onError={(e) => {
                  // Hide image if it fails to load, background gradient will show
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-15" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-3xl">
            <motion.h1
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              {heroSlides[currentSlide].title}
            </motion.h1>
            <motion.p
              key={`subtitle-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-green-100"
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => {
                  navigate('/signup');
                  window.scrollTo(0, 0);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <span>Start Monitoring Today</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Learn More</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center">
          <div className="flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <button
              onClick={() => scrollToSection('about')}
              className="flex flex-col items-center text-white/80 hover:text-white transition-all duration-300 group"
            >
              <span className="text-xs font-medium mb-2 opacity-75 group-hover:opacity-100 transition-opacity">
                Discover More
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-white/60 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Revolutionizing Remote Health Monitoring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              PulseMate empowers patients to take control of their health through advanced remote monitoring technology, 
              connecting you with healthcare professionals for comprehensive care from anywhere.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src="/images/doctor-tablet.jpg"
                alt="Doctor reviewing patient health data on tablet"
                className="rounded-2xl shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-gray-900">
                Your Health, Always Connected
              </h3>
              <p className="text-gray-600 text-lg">
                Our platform bridges the gap between patients and healthcare providers through 
                real-time health monitoring, secure communication, and comprehensive health insights.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">24/7 Health Monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Secure Doctor Communication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Personalized Health Insights</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive Health Monitoring Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets personalized care to provide you with the tools you need for optimal health management.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: HeartIcon,
                title: "Vital Signs Tracking",
                description: "Monitor heart rate, blood pressure, temperature, and glucose levels in real-time with automated alerts for abnormal readings."
              },
              {
                icon: ChartBarIcon,
                title: "Health Analytics",
                description: "Comprehensive dashboards and reports that help you understand your health trends and progress over time."
              },
              {
                icon: BellIcon,
                title: "Smart Alerts",
                description: "Receive instant notifications for critical health changes, health alerts, and appointment schedules."
              },
              {
                icon: DevicePhoneMobileIcon,
                title: "Mobile Access",
                description: "Access your health data anywhere, anytime through our responsive web platform optimized for all devices."
              },
              {
                icon: ShieldCheckIcon,
                title: "Secure & Private",
                description: "Bank-level encryption ensures your health information remains confidential and protected at all times."
              },
              {
                icon: UserGroupIcon,
                title: "Care Team Connection",
                description: "Seamlessly communicate with doctors, nurses, and specialists through our integrated messaging system."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How PulseMate Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with remote health monitoring is simple. Follow these three easy steps to begin your health journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Setup",
                description: "Create your account, complete your health profile, and connect any monitoring devices you have.",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                step: "02",
                title: "Monitor Daily",
                description: "Track your vital signs, log symptoms, and maintain your health records through our intuitive interface.",
                image: "/images/monitor-health.jpg"
              },
              {
                step: "03",
                title: "Connect with Care",
                description: "Share data with your healthcare team, schedule consultations, and receive personalized health insights.",
                image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-64 object-cover rounded-2xl shadow-lg mx-auto"
                  />
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Experience PulseMate in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get a sneak peek of our comprehensive patient dashboard and see how easy it is to monitor your health remotely.
            </p>
          </motion.div>

          {/* Dashboard Overview Preview */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Your Personal Health Dashboard
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Get a comprehensive overview of your health metrics, recent activities, and important alerts all in one place.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Real-time vital signs tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Health score and trends</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Quick access to all features</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <img
                  src="/screenshots/dashboard-overview.PNG"
                  alt="PulseMate Dashboard Overview Screenshot"
                  className="rounded-2xl w-full"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                  }}
                />
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Live Preview
                </div>
              </div>
            </motion.div>
          </div>

          {/* Health Metrics Preview */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <img
                  src="/screenshots/health-metrics.PNG"
                  alt="Health Metrics Dashboard Screenshot"
                  className="rounded-2xl w-full"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                  }}
                />
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Analytics
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Advanced Health Analytics
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Visualize your health data with interactive charts and detailed analytics to understand your health trends over time.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Interactive health charts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Historical data comparison</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Personalized insights</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Appointments & Communication Preview */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Connect with Healthcare Providers
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Schedule appointments, communicate with doctors, and manage your healthcare team all through our secure platform.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Easy appointment scheduling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Secure messaging with doctors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Real-time consultation updates</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <img
                  src="/screenshots/appointments.PNG"
                  alt="Appointments and Messages Dashboard Screenshot"
                  className="rounded-2xl w-full"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                  }}
                />
                <div className="absolute -top-4 -right-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Communication
                </div>
              </div>
            </motion.div>
          </div>

          {/* Secure Messaging Preview */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-1"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Secure Doctor-Patient Communication
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Connect directly with your healthcare providers through our secure messaging platform. Get real-time medical advice and consultation updates.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700">HIPAA-compliant messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700">Real-time chat sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                    <span className="text-gray-700">Medical consultation history</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <img
                  src="/screenshots/messages.PNG"
                  alt="Secure Doctor-Patient Messaging Screenshot"
                  className="rounded-2xl w-full"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                  }}
                />
                <div className="absolute -top-4 -right-4 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Secure Chat
                </div>
              </div>
            </motion.div>
          </div>

          {/* Health Alerts Preview */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <img
                  src="/screenshots/alerts-notifications.PNG"
                  alt="Health Alerts and Notifications Screenshot"
                  className="rounded-2xl w-full"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                  }}
                />
                <div className="absolute -top-4 -left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Alerts
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Smart Health Alerts & Notifications
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Stay informed with intelligent alerts that notify you of important health changes and remind you of important tasks.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Critical health alerts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Health trend monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700">Appointment notifications</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action for Patients */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-white mb-16"
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Experience PulseMate?</h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who are already taking control of their health with our comprehensive monitoring platform.
            </p>
            <button
              onClick={() => {
                navigate('/signup');
                window.scrollTo(0, 0);
              }}
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105"
            >
              Start Your Health Journey Today
            </button>
          </motion.div>

          {/* Healthcare Providers Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Healthcare professional with stethoscope"
                className="rounded-2xl shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  For Healthcare Providers
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Join our network of healthcare professionals and provide enhanced patient care through remote monitoring capabilities.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-700">Real-time patient data access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-700">Secure communication platform</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-700">Comprehensive patient analytics</span>
                  </div>
                </div>
                <button
                  onClick={() => window.open('http://localhost:3001/signup', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
                >
                  Join as Healthcare Provider
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose PulseMate?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by thousands of patients and healthcare providers for reliable, secure, and comprehensive health monitoring.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: stats.totalPatients,
                label: "Active Patients",
                description: "Trust our platform for their daily health monitoring"
              },
              {
                number: stats.totalDoctors,
                label: "Healthcare Providers",
                description: "Certified doctors and specialists in our network"
              },
              {
                number: stats.uptime,
                label: "Uptime Reliability",
                description: "Ensuring your health data is always accessible"
              },
              {
                number: stats.support,
                label: "Support Available",
                description: "Round-the-clock technical and medical support"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                <div className="text-gray-600">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about PulseMate? We're here to help you start your health monitoring journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone Support</h4>
                      <p className="text-gray-600">+234-703-574-PULSE</p>
                      <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <BellIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Support</h4>
                      <p className="text-gray-600">support@pulsemate.com</p>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM</p>
                      <p className="text-gray-600">Weekend: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-2xl text-white"
            >
              <h3 className="text-2xl font-bold mb-6">Ready to Start Your Health Journey?</h3>
              <p className="text-green-100 mb-8">
                Join thousands of patients who are already taking control of their health with PulseMate's
                advanced remote monitoring platform.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigate('/signup');
                    window.scrollTo(0, 0);
                  }}
                  className="w-full bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-2xl text-lg font-semibold transition-all transform hover:scale-105"
                >
                  Register Now!
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="w-full border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
                >
                  Learn More
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-green-500">
                <p className="text-green-100 text-sm text-center">
                  Questions? Call us at <span className="font-semibold">+234-703-574-PULSE</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PulseMate</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering patients and healthcare providers through advanced remote health monitoring technology.
                Your health, always connected.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 PulseMate. All rights reserved.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </button>
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </button>
                <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-white transition-colors">
                  Services
                </button>
                <button onClick={() => navigate('/login')} className="block text-gray-400 hover:text-white transition-colors">
                  Sign In
                </button>
              </div>
            </div>


          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
