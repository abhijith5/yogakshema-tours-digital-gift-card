import React from 'react';

export const VoucherCard = React.forwardRef(({ voucherData }, ref) => {
  const {
    voucherNo = 'YTT-D-0001',
    voucherValue = '10000',
    issueDate = '06/10/2026',
    validUntil = '05/10/2027',
    overlayConfig = {
      fontSize: 18,
      fontColor: '#0a2c66',
      fontWeight: '800',
      fontFamily: 'Montserrat, sans-serif',
      // Separate per-field offsets
      f1X: 0, f1Y: 0,
      f2X: 0, f2Y: 0,
      f3X: 0, f3Y: 0,
      f4X: 0, f4Y: 0
    }
  } = voucherData;

  const fontSize = overlayConfig.fontSize || 18;
  const fontColor = overlayConfig.fontColor || '#0a2c66';
  const fontWeight = overlayConfig.fontWeight || '800';
  const fontFamily = overlayConfig.fontFamily || 'Montserrat, sans-serif';

  // Per-field offsets with fallbacks
  const f1X = overlayConfig.f1X || 0;
  const f1Y = overlayConfig.f1Y || 0;

  const f2X = overlayConfig.f2X || 0;
  const f2Y = overlayConfig.f2Y || 0;

  const f3X = overlayConfig.f3X || 0;
  const f3Y = overlayConfig.f3Y || 0;

  const f4X = overlayConfig.f4X || 0;
  const f4Y = overlayConfig.f4Y || 0;

  // Format currency with Indian comma format
  const formattedValue = Number(voucherValue) ? Number(voucherValue).toLocaleString('en-IN') : voucherValue;

  return (
    <div 
      ref={ref}
      id="voucher-print-area"
      className="w-[1050px] min-w-[1050px] h-[680px] min-h-[680px] relative overflow-hidden shadow-2xl rounded-lg bg-white select-none"
      style={{ fontFamily }}
    >
      {/* 1. EXACT TEMPLATE IMAGE BACKGROUND */}
      <img 
        src="/voucher-template.jpg" 
        alt="Travel Gift Voucher Template"
        className="w-full h-full object-fill pointer-events-none absolute inset-0 z-0"
      />

      {/* 2. DYNAMIC OVERLAY FIELDS WITH INDIVIDUAL FIELD POSITIONING */}
      
      {/* FIELD 1: Voucher No. (Line 1 underline is at Y = 270px) */}
      <div 
        className="absolute z-10 flex items-center justify-start tracking-wider font-extrabold"
        style={{
          left: `${208 + f1X}px`,
          top: `${235 + f1Y}px`,
          width: '190px',
          height: '24px',
          fontSize: `${fontSize}px`,
          color: fontColor,
          fontWeight: fontWeight,
          lineHeight: '1'
        }}
      >
        <span className="truncate">{voucherNo}</span>
      </div>

      {/* FIELD 2: Voucher Value (Line 2 underline is at Y = 331px; sits right after ₹) */}
      <div 
        className="absolute z-10 flex items-center justify-start tracking-wide font-black"
        style={{
          left: `${260 + f2X}px`,
          top: `${294 + f2Y}px`,
          width: '120px',
          height: '26px',
          fontSize: `${fontSize + 3}px`,
          color: fontColor,
          fontWeight: '900',
          lineHeight: '1'
        }}
      >
        <span className="truncate">{formattedValue}</span>
      </div>

      {/* FIELD 3: Date of Issue (Line 3 underline is at Y = 370px) */}
      <div 
        className="absolute z-10 flex items-center justify-start tracking-wide font-bold"
        style={{
          left: `${208 + f3X}px`,
          top: `${341 + f3Y}px`,
          width: '190px',
          height: '24px',
          fontSize: `${fontSize}px`,
          color: fontColor,
          fontWeight: fontWeight,
          lineHeight: '1'
        }}
      >
        <span className="truncate">{issueDate}</span>
      </div>

      {/* FIELD 4: Valid Until (Line 4 underline is at Y = 414px) */}
      <div 
        className="absolute z-10 flex items-center justify-start tracking-wide font-bold"
        style={{
          left: `${208 + f4X}px`,
          top: `${386 + f4Y}px`,
          width: '190px',
          height: '24px',
          fontSize: `${fontSize}px`,
          color: fontColor,
          fontWeight: fontWeight,
          lineHeight: '1'
        }}
      >
        <span className="truncate">{validUntil}</span>
      </div>

    </div>
  );
});

VoucherCard.displayName = 'VoucherCard';
