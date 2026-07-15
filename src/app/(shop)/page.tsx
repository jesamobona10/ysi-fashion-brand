import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { BrandStory } from "@/components/home/brand-story";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BespokeTimeline } from "@/components/home/bespoke-timeline";
import { CustomerGallery } from "@/components/home/customer-gallery";
import { TestimonialSlider } from "@/components/home/testimonial-slider";
import { FashionJournal } from "@/components/home/fashion-journal";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <BrandStory />
      <FeaturedProducts />
      <BespokeTimeline />
      <CustomerGallery />
      <TestimonialSlider />
      <FashionJournal />
    </>
  );
}
