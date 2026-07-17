import Link from "next/link"
import { notFound } from "next/navigation"

interface PageContent {
  title: string
  subtitle?: string
  sections: { heading: string; body: string }[]
}

const pages: Record<string, PageContent> = {
  about: {
    title: "About YSI",
    subtitle: "YUTY_STYLEDIT",
    sections: [
      { heading: "Our Story", body: "Founded in Lagos, YSI (YUTY_STYLEDIT) was born from a passion for redefining African fashion through precision tailoring and uncompromising quality. What started as a vision to bridge the gap between traditional craftsmanship and contemporary design has grown into a destination for discerning individuals who demand the best.\n\nEvery garment we create tells a story — one of meticulous attention to detail, reverence for heritage, and an unwavering commitment to excellence. We believe that clothing is more than fabric; it is an expression of identity, confidence, and personal style." },
      { heading: "Our Philosophy", body: "At YSI, we champion the philosophy that true style is timeless. We reject fast fashion in favour of pieces that endure — both in quality and in aesthetic appeal. Our collections are thoughtfully curated, blending classic silhouettes with modern accents to create pieces that transcend seasons.\n\nSustainability is woven into our ethos. We source premium materials from trusted suppliers, minimise waste through made-to-order production, and invest in craftsmanship that ensures longevity." },
      { heading: "The YSI Experience", body: "From your first consultation to the final fitting, the YSI experience is defined by personalisation and care. Our master tailors work closely with each client to understand their vision, offering expert guidance on fabric selection, silhouette, and detailing.\n\nWhether you choose from our ready-to-wear collections or commission a bespoke piece, you can expect the same level of dedication to perfection." },
    ],
  },
  contact: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you",
    sections: [
      { heading: "Get in Touch", body: "We are here to assist you with any inquiries, from styling advice to order support. Reach out to us through any of the channels below, and a member of our team will respond promptly." },
      { heading: "Visit Our Atelier", body: "Our flagship atelier is located in Lagos, Nigeria. We welcome appointments for consultations, measurements, and fittings.\n\nAddress: Lagos, Nigeria\nPhone: +234 800 YSI\nEmail: hello@ysi.ng\nHours: Monday – Saturday, 9:00 AM – 6:00 PM (WAT)" },
      { heading: "Customer Support", body: "For order inquiries, shipping questions, or returns, please email support@ysi.ng. We aim to respond to all inquiries within 24 hours during business days." },
    ],
  },
  faqs: {
    title: "Frequently Asked Questions",
    sections: [
      { heading: "Orders & Shipping", body: "How long does delivery take? Domestic orders within Nigeria are typically delivered within 3–7 business days. International orders may take 7–14 business days depending on location.\n\nDo you offer international shipping? Yes, we ship worldwide. Shipping costs and times vary by destination.\n\nCan I track my order? Yes, a tracking link will be sent to your email once your order has been dispatched." },
      { heading: "Returns & Exchanges", body: "What is your return policy? We accept returns within 14 days of delivery for ready-to-wear items in unworn condition with tags attached. Bespoke and made-to-order pieces are final sale.\n\nHow do I initiate a return? Please contact our support team at support@ysi.ng with your order number to begin the return process.\n\nWhen will I receive my refund? Refunds are processed within 5–10 business days after we receive and inspect the returned item." },
      { heading: "Sizing & Fit", body: "How do I find my size? Refer to our Size Guide for detailed measurements. If you are between sizes, we recommend choosing the larger size or contacting us for guidance.\n\nCan I request alterations? Yes, we offer complimentary alterations on all ready-to-wear pieces within 14 days of purchase." },
      { heading: "Bespoke Services", body: "How long does a bespoke piece take? The bespoke process typically takes 4–6 weeks from the initial consultation to final delivery, depending on complexity.\n\nWhat is included in the consultation? Your consultation includes a discussion of your vision, fabric selection, precise measurements, and a design sketch for your approval." },
    ],
  },
  shipping: {
    title: "Shipping & Returns",
    sections: [
      { heading: "Shipping Information", body: "We offer reliable shipping within Nigeria and internationally. All orders are carefully packaged to ensure they arrive in perfect condition.\n\nDomestic Shipping: 3–7 business days via our trusted logistics partners.\nInternational Shipping: 7–14 business days via DHL or FedEx.\n\nShipping costs are calculated at checkout based on your location and order weight. Orders above ₦150,000 qualify for free domestic shipping." },
      { heading: "Return Policy", body: "We want you to love your YSI piece. If you are not completely satisfied, you may return ready-to-wear items within 14 days of delivery.\n\nConditions: Items must be unworn, unwashed, and with all tags attached. Bespoke, made-to-order, and sale items are final sale and not eligible for return.\n\nTo initiate a return, please contact support@ysi.ng with your order number." },
      { heading: "Refunds", body: "Refunds will be processed to the original payment method within 5–10 business days after we receive and inspect your return. You will be notified via email once your refund has been issued." },
    ],
  },
  "size-guide": {
    title: "Size Guide",
    sections: [
      { heading: "How to Measure", body: "For the best fit, we recommend having your measurements taken by a professional tailor. If measuring at home, use a soft measuring tape and follow these guidelines:\n\nChest: Measure around the fullest part of your chest, keeping the tape parallel to the floor.\nWaist: Measure around your natural waistline, typically the narrowest part of your torso.\nHips: Measure around the fullest part of your hips, approximately 20cm below your waistline.\nInseam: Measure from the top of your inner thigh to the bottom of your ankle.\n\nRefer to the product-specific size chart on each product page for detailed measurements." },
      { heading: "Fit Guide", body: "Classic Fit: Our standard fit offers a comfortable silhouette with room to move.\nSlim Fit: A more tailored cut that follows the body's natural lines.\nRelaxed Fit: A looser silhouette for maximum comfort.\n\nIf you are between sizes, we recommend selecting the larger size or contacting our team for personalised advice." },
      { heading: "Made to Measure", body: "For the perfect fit, consider our bespoke tailoring service. Our master tailors will take your precise measurements and create a garment made exclusively for you. Book a consultation to get started." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "Information We Collect", body: "We collect information you provide directly to us, including your name, email address, phone number, shipping address, and payment information when you place an order or create an account.\n\nWe also automatically collect certain information about your device and browsing behaviour, including IP address, browser type, pages visited, and time spent on our site." },
      { heading: "How We Use Your Information", body: "Your information is used to process orders, communicate with you about your purchases, improve our products and services, and send marketing communications (with your consent).\n\nWe do not sell your personal information to third parties." },
      { heading: "Data Security", body: "We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure." },
      { heading: "Your Rights", body: "You have the right to access, correct, or delete your personal data at any time. You may also opt out of marketing communications by contacting us or using the unsubscribe link in our emails." },
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      { heading: "General", body: "By accessing and using the YSI (YUTY_STYLEDIT) website, you agree to comply with these terms and conditions. If you do not agree with any part of these terms, please do not use our services.\n\nWe reserve the right to update these terms at any time. Changes will be effective immediately upon posting to this page." },
      { heading: "Products & Pricing", body: "All prices are listed in Nigerian Naira (₦) and include applicable taxes unless otherwise stated. We strive to ensure accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.\n\nProduct images are for illustration purposes only. Actual products may vary slightly from the images shown." },
      { heading: "Orders & Payment", body: "By placing an order, you agree to provide accurate and complete information. We reserve the right to refuse or cancel any order at our discretion.\n\nPayment must be received in full before an order is processed. We accept the payment methods listed on our website." },
      { heading: "Intellectual Property", body: "All content on this website, including designs, text, images, and logos, is the property of YSI and is protected by applicable intellectual property laws. Unauthorised use of our content is strictly prohibited." },
    ],
  },
  services: {
    title: "Our Services",
    sections: [
      { heading: "Bespoke Tailoring", body: "Experience the pinnacle of custom craftsmanship. Our bespoke tailoring service offers a fully personalised experience, from fabric selection to multiple fittings, resulting in a garment that is uniquely yours." },
      { heading: "Ready-to-Wear", body: "Our curated ready-to-wear collections combine contemporary design with impeccable tailoring. Each piece is crafted with the same attention to detail as our bespoke offerings, available for immediate purchase." },
      { heading: "Styling Consultation", body: "Our expert stylists are available for personal consultations to help you curate a wardrobe that reflects your personal style and meets your lifestyle needs." },
      { heading: "Alterations", body: "We offer professional alteration services to ensure your YSI pieces fit perfectly. Our master tailors can adjust hemlines, take in seams, and make other modifications with precision." },
      { heading: "Corporate Orders", body: "Elevate your corporate image with custom uniforms and professional attire for your team. We offer volume pricing and dedicated support for corporate clients." },
    ],
  },
  "gift-cards": {
    title: "Gift Cards",
    subtitle: "Give the gift of style",
    sections: [
      { heading: "About Gift Cards", body: "YSI gift cards are the perfect present for the fashion lover in your life. Recipients can choose from our full range of ready-to-wear collections or put it toward a bespoke piece.\n\nGift cards are delivered digitally via email and can be redeemed at checkout." },
      { heading: "How It Works", body: "Select your desired amount, enter the recipient's details, and complete your purchase. The gift card will be sent to the recipient's email with a unique code they can use at checkout.\n\nGift cards are valid for 12 months from the date of purchase." },
    ],
  },
  corporate: {
    title: "Corporate Orders",
    subtitle: "Elevate your brand",
    sections: [
      { heading: "Custom Uniforms", body: "Make a lasting impression with custom uniforms designed and tailored for your organisation. From executive wear to staff uniforms, we create cohesive looks that reflect your brand identity." },
      { heading: "Bulk Orders", body: "We offer competitive pricing for bulk orders without compromising on quality. Our dedicated corporate team ensures timely delivery and consistent quality across all pieces." },
      { heading: "Brand Integration", body: "We can incorporate your brand colours, logos, and design elements into our garments, creating a professional look that sets your team apart." },
      { heading: "Get a Quote", body: "Contact our corporate sales team at corporate@ysi.ng with your requirements, and we will provide a tailored quotation within 48 hours." },
    ],
  },
  careers: {
    title: "Careers",
    subtitle: "Join the YSI team",
    sections: [
      { heading: "Work With Us", body: "At YSI, we are always looking for talented individuals who share our passion for craftsmanship, style, and exceptional service. We offer a creative and collaborative work environment where your skills can thrive." },
      { heading: "Current Openings", body: "We do not have any open positions at this time. Please check back later or follow us on social media for updates on future opportunities." },
      { heading: "Get in Touch", body: "Even if there are no current openings, we welcome speculative applications from talented professionals. Send your CV and portfolio to careers@ysi.ng." },
    ],
  },
  sustainability: {
    title: "Sustainability",
    subtitle: "Our commitment to a better future",
    sections: [
      { heading: "Our Approach", body: "Sustainability is at the heart of everything we do at YSI. We believe that true luxury is responsible — created with respect for people, planet, and craftsmanship.\n\nWe are committed to reducing our environmental footprint through thoughtful practices at every stage of our production process." },
      { heading: "Made to Order", body: "Our made-to-order model minimises waste by producing garments only when they are commissioned. This approach reduces overproduction and ensures that every piece we create has a purpose.\n\nFor our ready-to-wear collections, we produce in limited quantities to maintain exclusivity and reduce excess inventory." },
      { heading: "Quality Over Quantity", body: "We design pieces that are built to last. By investing in premium materials and expert craftsmanship, our garments transcend fast fashion trends and remain wardrobe staples for years." },
      { heading: "Sustainable Materials", body: "We carefully select our materials, prioritising natural fibres, responsibly sourced fabrics, and suppliers who share our commitment to ethical production practices." },
    ],
  },
  press: {
    title: "Press",
    subtitle: "YSI in the media",
    sections: [
      { heading: "Media Kit", body: "For press inquiries, media assets, and brand information, please contact our communications team at press@ysi.ng.\n\nWe are happy to provide high-resolution images, brand guidelines, and arrange interviews with our creative team." },
      { heading: "Featured In", body: "YSI has been featured in leading fashion publications and media outlets. For media coverage and partnership inquiries, please reach out to our team." },
      { heading: "Press Inquiries", body: "Members of the press can contact us at press@ysi.ng for all media-related requests, including product loans, interview opportunities, and event coverage." },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug: [slug] }))
}

export default function StaticPage({ params }: { params: Promise<{ slug: string[] }> }) {
  return <StaticPageContent params={params} />
}

async function StaticPageContent({ params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug[0]
  const page = pages[slug]

  if (!page) notFound()

  return (
    <main className="bg-ivory py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="font-serif-lux text-gold text-sm tracking-luxe-sm uppercase">
            {page.subtitle || "YSI"}
          </span>
          <h1 className="font-display text-4xl lg:text-6xl text-jet mt-3">{page.title}</h1>
          <div className="gold-divider mt-6 w-24 mx-auto" />
        </div>

        <div className="space-y-12">
          {page.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-poppins text-lg text-jet font-medium mb-4">{section.heading}</h2>
              {section.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="font-poppins text-sm text-jet/70 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-12 border-t border-jet/10 text-center">
          <Link
            href="/"
            className="font-poppins text-[11px] uppercase tracking-luxe text-gold hover:text-jet transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
