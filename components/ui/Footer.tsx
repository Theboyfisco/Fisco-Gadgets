"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface FooterProps {
  categories?: { id: string; name: string }[];
}

export function Footer({ categories = [] }: FooterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-base border-t border-border-subtle pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 inline-block mb-6">
              Fisco Gadgets
            </Link>
            <p className="text-secondary text-sm mb-6 leading-relaxed">
              Premium authentic gadgets, unbeatable prices, and lightning-fast delivery across Nigeria.
            </p>
            
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-primary font-medium text-sm py-2 px-4 bg-primary/10 border border-primary/20 rounded-md"
              >
                <CheckCircle2 size={18} />
                Awesome! You&apos;re on the list.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Join our newsletter" 
                  className="bg-white/5 border border-border-subtle rounded-md px-4 py-2 w-full text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="bg-primary hover:bg-emerald-400 text-base px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Categories</h3>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`} className="text-secondary hover:text-primary transition-colors text-sm">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/brand/apple" className="text-secondary hover:text-primary transition-colors text-sm">Apple Store</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-secondary hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-secondary hover:text-primary transition-colors text-sm">Contact & Support</Link></li>
              <li><Link href="/shipping" className="text-secondary hover:text-primary transition-colors text-sm">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-secondary hover:text-primary transition-colors text-sm">Returns & Refunds</Link></li>
              <li><Link href="/warranty" className="text-secondary hover:text-primary transition-colors text-sm">Warranty Information</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-secondary text-sm">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>12 Tech Avenue, G.R.A,<br/>Asaba, Delta State 320213</span>
              </li>
              <li className="flex items-center gap-3 text-secondary text-sm">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+234 (0) 800 000 0000</span>
              </li>
              <li className="flex items-center gap-3 text-secondary text-sm">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@fiscogadgets.com.ng</span>
              </li>
            </ul>
            
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary text-sm">
            © {new Date().getFullYear()} Fisco Gadgets. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-secondary hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-secondary hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
