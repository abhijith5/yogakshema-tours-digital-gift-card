import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Share2, 
  Send, 
  MessageSquare, 
  QrCode, 
  Download, 
  Check, 
  Copy, 
  Loader2,
  Sparkles,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateVoucherCanvasDataUrl, exportVoucherPNG } from '../utils/voucherExporter';

export const AddToMobileModal = ({ isOpen, onClose, voucherData }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('share'); // 'share' | 'whatsapp' | 'qrcode'

  useEffect(() => {
    if (voucherData && voucherData.recipientPhone) {
      setPhoneNumber(voucherData.recipientPhone);
    } else {
      setPhoneNumber('');
    }
  }, [voucherData]);

  if (!isOpen || !voucherData) return null;

  const formattedValue = Number(voucherData.voucherValue) 
    ? Number(voucherData.voucherValue).toLocaleString('en-IN') 
    : (voucherData.voucherValue || '10,000');

  const formattedMessage = `🎁 *YOGAKSHEMA TOURS DIGITAL GIFT CARD* 🎁
----------------------------------------
🎟️ *Voucher No:* ${voucherData.voucherNo || ''}
💰 *Value:* ₹${formattedValue}
📅 *Valid Until:* ${voucherData.validUntil || ''}
👤 *Recipient:* ${voucherData.recipientName || 'Valued Guest'}
----------------------------------------
✨ Redeemable for Tours, Travels & Holiday Packages!
Thank you for choosing Yogakshema Tours & Travels!`;

  // WhatsApp link generator
  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(formattedMessage);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      return `https://wa.me/${fullPhone}?text=${text}`;
    }
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // SMS link generator
  const getSMSUrl = () => {
    const text = encodeURIComponent(formattedMessage);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `sms:${cleanPhone}?body=${text}`;
  };

  // Web Share API handler (Native Share on Mobile devices)
  const handleNativeShare = async () => {
    setIsSharing(true);
    setShareSuccessMessage('');

    try {
      const dataUrl = await generateVoucherCanvasDataUrl(voucherData, 2.5);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `Yogakshema_Voucher_${voucherData.voucherNo}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Digital Gift Card - ${voucherData.voucherNo}`,
          text: `Yogakshema Tours Gift Card ₹${formattedValue} (${voucherData.voucherNo})`
        });
        setShareSuccessMessage('Voucher shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: `Digital Gift Card - ${voucherData.voucherNo}`,
          text: formattedMessage
        });
        setShareSuccessMessage('Voucher details shared successfully!');
      } else {
        await navigator.clipboard.writeText(formattedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        window.open(getWhatsAppUrl(), '_blank');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        window.open(getWhatsAppUrl(), '_blank');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Copy details to clipboard
  const handleCopyDetails = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download image for phone gallery
  const handleDownloadPNG = async () => {
    setIsSharing(true);
    try {
      await exportVoucherPNG(voucherData);
      setShareSuccessMessage('PNG saved to device gallery!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight font-montserrat">
                  Add to Mobile Phone
                </h3>
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Mobile Feature
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Share or save voucher directly to mobile device & WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50 flex-1">
          
          {/* SUCCESS BANNER */}
          {shareSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareSuccessMessage}</span>
            </div>
          )}

          {/* VOUCHER QUICK SUMMARY CARD */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-3.5 space-y-2 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                {voucherData.voucherNo}
              </span>
              <span className="text-sm font-black text-slate-900 font-mono">
                ₹{formattedValue}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-amber-200/60">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Recipient:</span>
                <span className="font-bold text-slate-800 truncate block">
                  {voucherData.recipientName || 'Valued Guest'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Valid Until:</span>
                <span className="font-bold text-slate-800 font-mono block">
                  {voucherData.validUntil || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* RECIPIENT PHONE NUMBER INPUT */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              Recipient Mobile Number (Optional for Direct WhatsApp / SMS)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210 or +91 9876543210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* TAB OPTIONS: QUICK SHARE, WHATSAPP & QR CODE */}
          <div className="flex bg-slate-200 p-1 rounded-2xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'share' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" /> Mobile Share
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'whatsapp' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'qrcode' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" /> QR Code
            </button>
          </div>

          {/* TAB 1: MOBILE NATIVE SHARE & ACTIONS */}
          {activeTab === 'share' && (
            <div className="space-y-3 animate-fadeIn">
              
              {/* PRIMARY NATIVE SHARE BUTTON */}
              <button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Preparing Mobile Share...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Share Card Image via Phone Apps</span>
                  </>
                )}
              </button>

              {/* SECONDARY ACTION GRID */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition text-center"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={getSMSUrl()}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Send className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Send via SMS</span>
                </a>
              </div>

              {/* SAVE TO PHONE GALLERY */}
              <button
                onClick={handleDownloadPNG}
                disabled={isSharing}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>Save High-Res PNG to Phone Gallery</span>
              </button>
            </div>
          )}

          {/* TAB 2: WHATSAPP FORMATTED MESSAGE */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-emerald-950 text-emerald-100 p-3.5 rounded-2xl text-xs font-mono whitespace-pre-line border border-emerald-800 shadow-inner relative">
                {formattedMessage}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open WhatsApp & Send</span>
                </a>

                <button
                  onClick={handleCopyDetails}
                  className="py-3 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCAN QR CODE TO ADD ON PHONE */}
          {activeTab === 'qrcode' && (
            <div className="space-y-3 flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl text-center animate-fadeIn">
              <p className="text-xs font-bold text-slate-700 max-w-xs">
                Scan this QR code with your mobile camera to view voucher details or send via phone:
              </p>

              <div className="p-4 bg-white rounded-2xl border-2 border-amber-400 shadow-md inline-block">
                <QRCodeSVG
                  value={getWhatsAppUrl()}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-bold">
                {voucherData.voucherNo} • ₹{formattedValue}
              </span>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Yogakshema Tours Mobile Feature
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
