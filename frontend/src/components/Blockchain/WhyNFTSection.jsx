/**
 * Why NFT Certificates Matter Section
 * Explains the value of blockchain certification with storytelling + features + FAQ
 * Theme: Dark green and black aesthetic
 */

import React, { useState } from 'react';

const WhyNFTSection = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: '🔐',
      title: 'VERIFIABLE',
      description: 'Anyone can verify on Solana Explorer',
      detail: 'No trust needed - blockchain is the proof'
    },
    {
      icon: '💎',
      title: 'PERMANENT',
      description: 'Stored on decentralized blockchain',
      detail: "Can't be deleted, modified, or faked"
    },
    {
      icon: '🌍',
      title: 'PORTABLE',
      description: 'Your wallet = your credentials',
      detail: 'Share on LinkedIn, job applications, etc.'
    }
  ];

  const useCases = [
    {
      icon: '💼',
      title: 'Job Applications',
      description: 'Employers can verify your skills on-chain instantly'
    },
    {
      icon: '🎓',
      title: 'LinkedIn Profile',
      description: 'Share verified achievement with your network'
    },
    {
      icon: '🏆',
      title: 'Web3 Portfolio',
      description: 'Prove skills with blockchain proof of completion'
    }
  ];

  const faqs = [
    {
      question: 'Is this a real blockchain NFT?',
      answer: 'Yes! Your certificate is minted as an NFT on the Solana blockchain using the Metaplex standard. It\'s a permanent, verifiable record of your achievement.'
    },
    {
      question: 'Will employers recognize it?',
      answer: 'Forward-thinking companies increasingly value Web3 skills and blockchain-verified credentials. Your NFT certificate demonstrates both technical achievement and familiarity with blockchain technology.'
    },
    {
      question: 'What if I lose my wallet?',
      answer: 'Your NFT is safe! Use your 12/24-word recovery phrase to restore your Phantom wallet on any device. This is why it\'s crucial to keep your recovery phrase secure and private.'
    },
    {
      question: 'Does it cost money to mint?',
      answer: 'On Devnet (test network), minting is completely FREE - you only need test SOL from the faucet. On Mainnet, there\'s a small transaction fee (~0.01 SOL, less than $1).'
    },
    {
      question: 'How is this better than a PDF certificate?',
      answer: 'PDFs can be forged or lost. NFT certificates are cryptographically verified, permanently stored on blockchain, cannot be faked, and prove ownership through your wallet.'
    },
    {
      question: 'Can I share my NFT certificate?',
      answer: 'Absolutely! You can share the Solana Explorer link to prove authenticity, display it in your Phantom wallet, or share screenshots on LinkedIn and social media.'
    }
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* Why NFT Hero Section */}
      <div className="bg-gradient-to-br from-green-950/40 via-black/50 to-green-900/30 border border-green-500/20 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-2xl font-quantico-bold text-green-300 tracking-wide">
              Why Blockchain Certification Matters
            </h3>
          </div>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            Your achievement, your proof, forever. Traditional certificates can be forged. Blockchain certificates can't.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-black/30 border border-green-500/20 rounded-xl p-5 hover:border-green-400/40 hover:bg-black/40 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h4 className="text-lg font-quantico-bold text-green-300 mb-2 uppercase tracking-wider">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-300 mb-1">
                  {feature.description}
                </p>
                <p className="text-xs text-gray-400">
                  {feature.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Use Cases - Storytelling Cards */}
        <div className="border-t border-green-500/10 pt-6">
          <h4 className="text-lg font-quantico-bold text-green-300 mb-4 text-center">
            🎯 Your NFT Certificate Opens Doors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-black/20 border border-green-500/15 rounded-lg p-4 hover:bg-green-900/10 hover:border-green-400/30 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{useCase.icon}</span>
                  <div>
                    <h5 className="font-quantico-bold text-green-300 text-sm mb-1">
                      {useCase.title}
                    </h5>
                    <p className="text-xs text-gray-400">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-6 bg-black/30 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-2">
            <span className="text-green-400 font-quantico-bold">💡 Traditional PDFs vs NFT Certificates:</span>
          </p>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• PDFs can be forged → NFTs are cryptographically secured</li>
            <li>• PDFs get lost → NFTs live permanently on blockchain</li>
            <li>• PDFs need trust → NFTs are self-verifying</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-black/60 via-green-950/20 to-black/60 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-quantico-bold text-green-300 mb-4 flex items-center gap-2">
          <span>❓</span>
          <span>Frequently Asked Questions</span>
        </h3>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-black/30 border border-green-500/20 rounded-lg overflow-hidden hover:border-green-400/30 transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-green-900/10 transition-colors duration-200"
              >
                <span className="font-quantico-bold text-green-300 text-sm">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-green-400 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openFaq === index && (
                <div className="px-4 pb-3 pt-1 bg-black/20 border-t border-green-500/10 animate-fade-in">
                  <p className="text-sm text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyNFTSection;
