import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowRight, Activity, ArrowDownRight, Quote, Shield, Users, TrendingUp, Award } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Mock images - replace with actual paths
const FlipKartAssured = "/flipkartassured.png"
const AmazonRenewed = "/amazonrenewed.png"
const SangeethaMobiles = "/sangeethamobiles.png"
const RelianceJio = "/relaincejio.png"
const Timex = "/timex.png"
const Amazon = "/amazon.png"
const Flipkart = "/flipkart.png"

gsap.registerPlugin(ScrollTrigger)

// Add global styles for the landing page
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
  
  :root {
    --font-heading: 'Inter', sans-serif;
    --font-body: 'Roboto', sans-serif;
    --color-primary: #2563eb;
    --color-primary-light: #3b82f6;
    --color-success: #22c55e;
    --color-error: #ef4444;
    --color-warning: #f59e0b;
  }

  body {
    font-family: var(--font-body);
    font-size: 16px;
    color: #374151;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 600;
  }

  button {
    font-family: var(--font-body);
  }

  .font-heading {
    font-family: var(--font-heading);
  }

  .font-body {
    font-family: var(--font-body);
  }
`;

const LandingPage = () => {
  const partners = [
    { src: FlipKartAssured, alt: "Flipkart Assured" },
    { src: AmazonRenewed, alt: "Amazon Renewed" },
    { src: SangeethaMobiles, alt: "Sangeetha Mobiles" },
    { src: RelianceJio, alt: "Reliance Jio" },
    { src: Timex, alt: "Timex" },
    { src: Amazon, alt: "Amazon" },
    { src: Flipkart, alt: "Flipkart" },
  ]

  const features = [
    "Cost-Effective Plans",
    "Complete Coverage",
    "Quick Claims",
    "Rapid Activation",
    "Peaceful Assurance",
    "High Quality Service",
  ]

  const [currentFeature, setCurrentFeature] = useState("")
  const [featureIndex, setFeatureIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const typingSpeed = 100
    const deletingSpeed = 50
    const pauseBetween = 2000

    const handleTyping = () => {
      const feature = features[featureIndex]

      if (!isDeleting && currentFeature.length < feature.length) {
        setCurrentFeature(feature.substring(0, currentFeature.length + 1))
      } else if (isDeleting && currentFeature.length > 0) {
        setCurrentFeature(feature.substring(0, currentFeature.length - 1))
      } else if (!isDeleting && currentFeature.length === feature.length) {
        setTimeout(() => setIsDeleting(true), pauseBetween)
      } else if (isDeleting && currentFeature.length === 0) {
        setIsDeleting(false)
        setFeatureIndex((prevIndex) => (prevIndex + 1) % features.length)
      }
    }

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(timeout)
  }, [currentFeature, featureIndex, isDeleting])

  const footerLinks = {
    company: [
      { name: "Terms & Conditions", url: "/TandC.pdf" },
      { name: "Privacy Policy", url: "/PrivacyPolicy.pdf" },
      { name: "Contact Us", url: "#contact" },
      { name: "Refund Policy", url: "/RefundPolicy.pdf" },
      { name: "Shipping", url: "#shipping" },
    ],
  }

  const cardARef = useRef(null)
  const cardBRef = useRef(null)
  const cardCRef = useRef(null)
  const cardDRef = useRef(null)
  const cardERef = useRef(null)
  const featuresSectionRef = useRef(null)
  const seamlessSectionRef = useRef(null)
  const firstRowRef = useRef(null)
  const secondRowRef = useRef(null)
  
  const [imeiNumber, setImeiNumber] = useState("")
  const [searchError, setSearchError] = useState("")
  const navigate = useNavigate()

    const handleGetStartedClick = () => {
    navigate('/login');
  }

  const handleImeiChange = (event) => {
    setImeiNumber(event.target.value)
    setSearchError("")
  }

  const handleSearch = async () => {
    if (!imeiNumber) {
      setSearchError("Please enter an IMEI number.")
      return
    }

    try {
      const response = await axios.get(`${API_URL}/api/warranty/find-by-imei/${imeiNumber}`)
      if (response.data.success) {
        const warranty = response.data.data
        if (warranty) {
          setShowImeiPopup(false)
          navigate("/warranty-details", { state: { warranty } })
        } else {
          setSearchError("No warranty found for this IMEI number.")
        }
      } else {
        setSearchError(response.data.message)
      }
    } catch (error) {
      console.error("Error searching for warranty:", error)
      setSearchError("An error occurred while searching. Please try again later.")
    }
  }

  const stats = [
    { value: "80K+", label: "TRUSTED CUSTOMERS", icon: Users },
    { value: "72+", label: "SHOP PARTNERS", icon: Award },
    { value: "70K+", label: "ACTIVE CLAIMS", icon: Shield },
    { value: "3+", label: "BRANCHES", icon: TrendingUp },
  ]

  const reviews = [
    {
      name: "Ravi Sharma",
      image: "/pfp1.jpg",
      text: "Mobikoo saved my day when I accidentally dropped my phone. The claims process was so quick and easy. Highly recommend!",
    },
    {
      name: "Priya Mehta",
      image: "/pfp3.jpg",
      text: "Excellent service! Mobikoo's affordable plans and comprehensive coverage give me peace of mind knowing my phone is always protected.",
    },
    {
      name: "Anil Kapoor",
      image: "/pfp2.jpg",
      text: "Partnering with Mobikoo has been great for my business. My customers love the added security, and I've seen an increase in sales.",
    },
    {
      name: "Sneha Patil",
      image: "/pfp4.jpg",
      text: "I was skeptical at first, but Mobikoo's customer support is fantastic. They guided me through every step when I needed to file a claim.",
    },
  ]

  useEffect(() => {
    const cards = [cardARef.current, cardBRef.current, cardCRef.current, cardDRef.current, cardERef.current]
    const featuresSection = featuresSectionRef.current

    if (cards.every(card => card) && featuresSection) {
      gsap.set([cardDRef.current, cardERef.current], { yPercent: 100, opacity: 0 })

      ScrollTrigger.batch([cardDRef.current, cardERef.current], {
        start: "top bottom-=100",
        onEnter: (batch) => {
          gsap.to(batch, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.2,
          })
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            yPercent: 100,
            opacity: 0,
            duration: 0.8,
            ease: "power2.in",
            stagger: 0.2,
          })
        },
      })
    }
  }, [])

  useEffect(() => {
    const seamlessSection = seamlessSectionRef.current
    const firstRow = firstRowRef.current
    const secondRow = secondRowRef.current

    if (seamlessSection && firstRow && secondRow) {
      gsap.to(firstRow, {
        xPercent: 10,
        scrollTrigger: {
          trigger: seamlessSection,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
        },
      })

      gsap.to(secondRow, {
        xPercent: -10,
        scrollTrigger: {
          trigger: seamlessSection,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
        },
      })
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-['Inter']">
      {/* Navigation Bar */}
      <header className="w-full py-4 px-6 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between max-w-9xl mx-auto px-[5vw]">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600 font-['Inter']">MOBIKOO</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-roboto"
          >
            GET STARTED
          </button>

          
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col space-y-4 px-4">
              <a href="#features" className="text-gray-600 hover:text-blue-600 py-2 font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 py-2 font-medium">
                Pricing
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 py-2 font-medium">
                Contact Us
              </a>
              <a href="/login" className="text-gray-600 hover:text-blue-600 py-2 font-medium">
                Log In
              </a>
              <button
                onClick={() => {
                  setShowImeiPopup(true)
                  setMobileMenuOpen(false)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left"
              >
                IMEI Search
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/mobikoo-bg.jpg"
          >
            <source src="/mobikoo-bg.mp4" type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#0000006e] bg-opacity-50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-[6.5vw] py-20 md:py-32 max-w-7xl">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white">MOBIKOO</h1>
            <h2 className="text-2xl md:text-4xl font-light mb-8 text-gray-100">
              Your Phone's Best Friend in Times of Trouble
            </h2>
            <h2 className="text-2xl md:text-5xl font-bold mb-8 text-white">
              {currentFeature}
              <span className="animate-pulse text-blue-200">|</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* </main> */}

      {/* Features Section */}
      <section id="features" ref={featuresSectionRef} className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">Why Choose Mobikoo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive mobile protection solutions designed for modern needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Feature Card A */}
            <div ref={cardARef} className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 h-80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-light text-gray-400">A</div>
                <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 font-['Poppins']">Affordable Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Budget-friendly insurance options to ensure that everyone can afford comprehensive mobile protection.
              </p>
            </div>

            {/* Feature Card B */}
            <div ref={cardBRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 h-80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-light text-gray-400">B</div>
                <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 font-['Poppins']">Easy Claims Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Straightforward and efficient claims process to get your issues resolved quickly.
              </p>
            </div>

            {/* Feature Card C */}
            <div ref={cardCRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 h-80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-light text-gray-400">C</div>
                <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 font-['Poppins']">Fast Activation</h3>
              <p className="text-gray-600 leading-relaxed">
                Insurance coverage activates within 48 hours of purchase, ensuring quick protection.
              </p>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div ref={cardDRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 h-80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-light text-gray-400">D</div>
                <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 font-['Poppins']">Transparent Terms</h3>
              <p className="text-gray-600 leading-relaxed">
                Clear and easy to understand insurance terms and conditions, with no hidden clauses.
              </p>
            </div>

            <div ref={cardERef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 h-80 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="text-3xl font-light text-gray-400">E</div>
                <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 font-['Poppins']">High-Quality Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional repair and replacement services to maintain your device's performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless User Experience Section */}
      <section ref={seamlessSectionRef} className="overflow-hidden px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">Seamless User Experience</h2>
            <p className="text-xl text-gray-600">Designed for simplicity and effectiveness</p>
          </div>

          {/* Feature Grid - First Row */}
          <div ref={firstRowRef} className="flex justify-start w-full">
            <div className="w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-6">
              {[
                { title: "Cost-Effective Plans", number: "1" },
                { title: "Complete Coverage", number: "2" },
                { title: "Quick Claims", number: "3" }
              ].map((feature, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="bg-gray-50 py-3 px-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">FEATURE {feature.number}</h4>
                  </div>
                  <div className={`py-6 px-6 ${index % 2 === 0 ? 'bg-blue-600' : 'bg-gray-100'}`}>
                    <h3 className={`text-2xl font-semibold font-['Poppins'] ${index % 2 === 0 ? 'text-white' : 'text-gray-800'}`}>
                      {feature.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Grid - Second Row */}
          <div ref={secondRowRef} className="flex justify-end w-full">
            <div className="w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Rapid Activation", number: "4" },
                { title: "Peaceful Assurance", number: "5" },
                { title: "High-Quality Service", number: "6" }
              ].map((feature, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="bg-gray-50 py-3 px-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">FEATURE {feature.number}</h4>
                  </div>
                  <div className={`py-6 px-6 ${index === 1 ? 'bg-blue-600' : 'bg-gray-100'}`}>
                    <h3 className={`text-2xl font-semibold font-['Poppins'] ${index === 1 ? 'text-white' : 'text-gray-800'}`}>
                      {feature.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">About Us</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Mobikoo, we empower mobile retailers with smart extended warranty solutions that boost revenue & cut costs.
              </p>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-6 font-['Poppins']">How Mobikoo Saves You Lakhs?</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-blue-600">Zero Repair Bills:</span>
                    <span className="text-gray-600"> We cover 100% repair costs (saves ₹3-5 lakhs/year).</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-blue-600">Extra Income:</span>
                    <span className="text-gray-600"> Earn ₹500-1,000/warranty (20+ sales = ₹10,000-20,000/month).</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <span className="font-semibold text-blue-600">Customer Lock-in:</span>
                    <span className="text-gray-600"> Reduce churn by 40% with warranty loyalty.</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-gray-800 font-semibold mb-2">Trusted by 5,000+ shops across India.</p>
                <p className="text-gray-600">
                  Join today & start saving! <span className="font-semibold">+91 9699539240</span> | 
                  <a href="mailto:support@mobikoo.com" className="text-blue-600 hover:text-blue-700 ml-1">
                    support@mobikoo.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 font-['Poppins']">Why Mobikoo?</h3>
              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Zero Risk", desc: "No upfront costs." },
                  { icon: Users, title: "Pan-India Network", desc: "Fast claim settlements." },
                  { icon: TrendingUp, title: "Easy Onboarding", desc: "Start earning in 24hrs." }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">Our Trusted Partners</h2>
            <p className="text-xl text-gray-600">Working with industry leaders</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center hover:shadow-md transition-shadow">
                <img
                  src={partner.src}
                  alt={partner.alt}
                  className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Trusted by thousands of satisfied customers</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-100">
                    <img
                      src={review.image}
                      alt={`${review.name} avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.name}</h3>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-start text-blue-400 mb-3">
                  <Quote size={20} className="opacity-60" />
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-['Poppins']">Our Growing Impact</h2>
            <p className="text-xl text-gray-600">Numbers that speak for themselves</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200">
                <div className="bg-gray-50 p-8 flex items-center justify-center rounded-t-2xl">
                  <div className="text-center">
                    <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-4xl md:text-5xl font-bold text-blue-600 font-['Poppins']">
                      {stat.value}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium text-center tracking-wider">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white font-['Poppins']">MOBIKOO</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                Your trusted partner for comprehensive mobile device protection. Serving customers across India with reliable warranty solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div></div>

            {/* Company Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4 font-['Poppins']">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Mobikoo. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )

}

export default LandingPage;