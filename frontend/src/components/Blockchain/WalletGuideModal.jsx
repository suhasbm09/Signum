/**
 * Wallet Guide Modal
 * Beautiful, minimal guide for setting up Phantom wallet and minting NFTs
 */

import React, { useState } from 'react';

const WalletGuideModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      number: 1,
      icon: '👛',
      title: 'Install Phantom',
      description: 'Add Phantom extension to your browser',
      action: {
        text: 'Install Extension',
        link: 'https://phantom.app/download',
        external: true
      }
    },
    {
      number: 2,
      icon: '🔐',
      title: 'Create Wallet',
      description: 'Set up your wallet & save recovery phrase',
      tip: '⚠️ Keep recovery phrase safe - never share it!'
    },
    {
      number: 3,
      icon: '⚙️',
      title: 'Switch to Devnet',
      description: 'Change network to Devnet in Phantom settings',
      tip: '🔧 Click settings icon → Change Network → Select "Devnet"'
    },
    {
      number: 4,
      icon: '📋',
      title: 'Copy Wallet Address',
      description: 'Copy your receive address from Phantom',
      tip: '💡 Click "Receive" in Phantom → Copy your wallet address'
    },
    {
      number: 5,
      icon: '💰',
      title: 'Get Devnet SOL',
      description: 'Paste your address to get free test tokens',
      action: {
        text: 'Open Faucet',
        link: 'https://faucet.solana.com/',
        external: true
      },
      tip: '🎁 You\'ll receive ~2 SOL for minting (FREE!)'
    },
    {
      number: 6,
      icon: '🎨',
      title: 'Connect & Mint',
      description: 'Return here, connect wallet, mint your NFT',
      tip: '✨ Make sure you\'re still on Devnet!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg sm:max-w-2xl bg-gradient-to-br from-black/90 via-black/95 to-emerald-950/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-emerald-400/20 shadow-[0_0_100px_-20px_rgba(16,185,129,0.6)] overflow-hidden">
        
        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-emerald-400/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-quantico-bold text-emerald-300 tracking-wide">
                  NFT Minting Guide
                </h2>
                <p className="text-xs text-emerald-400/70 font-quantico uppercase tracking-wider">
                  6 Simple Steps
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-red-500/20 border border-emerald-400/20 hover:border-red-400/40 text-gray-400 hover:text-red-400 transition-all duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`relative group bg-black/30 border rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                currentStep === step.number
                  ? 'border-emerald-400/40 bg-emerald-500/5 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]'
                  : 'border-emerald-400/10 hover:border-emerald-400/25'
              }`}
              onMouseEnter={() => setCurrentStep(step.number)}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    currentStep === step.number
                      ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/25'
                      : 'bg-black/40 border border-emerald-400/20'
                  }`}>
                    <span className="text-3xl">{step.icon}</span>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-quantico-bold transition-all duration-300 ${
                      currentStep === step.number
                        ? 'bg-emerald-500 text-black'
                        : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-lg font-quantico-bold text-emerald-300 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {step.description}
                  </p>

                  {/* Tip */}
                  {step.tip && (
                    <div className="bg-black/40 border border-yellow-500/20 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-yellow-300/90 font-quantico">
                        {step.tip}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {step.action && (
                    <a
                      href={step.action.link}
                      target={step.action.external ? '_blank' : '_self'}
                      rel={step.action.external ? 'noopener noreferrer' : ''}
                      className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-400/30 text-emerald-300 text-sm font-quantico-bold transition-all duration-300 group"
                    >
                      {step.action.text}
                      {step.action.external && (
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-emerald-400/10 bg-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-400 font-quantico">
              <span className="text-emerald-400">💡</span> Takes ~3-4 minutes total
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 hover:from-emerald-500 hover:to-emerald-600 text-white font-quantico-bold transition-all duration-300 shadow-lg shadow-emerald-500/25"
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletGuideModal;
