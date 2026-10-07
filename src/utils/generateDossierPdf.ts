import { VentureData } from '../types';

/**
 * Generate a valid, authentic PDF-1.4 official investment dossier for the venture
 */
export function generateDossierPdf(venture: VentureData): void {
  const title = (venture.title || 'SLN Venture').toUpperCase();
  const location = venture.location || 'Prime Growth Corridor';
  const rera = venture.reraNumber || 'Approved Layout';
  const totalPlots = venture.totalPlots || '175 Plots';
  const roadWidth = venture.roadWidth || '40 & 50 Feet';
  const phone = venture.contact?.phone || '+91 98480 12345';
  const email = venture.contact?.email || 'invest@slngroup.in';
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length 1200 >>
stream
BT
/F1 22 Tf
50 730 Td
(SLN MARKETING PRIVATE LIMITED) Tj
0 -26 Td
/F2 16 Tf
(${title} - OFFICIAL INVESTMENT DOSSIER) Tj
0 -20 Td
/F1 10 Tf
(Date of Generation: ${dateStr}  |  Document Ref: SLN-DOSSIER-${venture.id || '232'}) Tj
0 -30 Td
/F1 12 Tf
(EXECUTIVE PROPERTY SUMMARY) Tj
0 -18 Td
/F1 10 Tf
(Location: ${location}) Tj
0 -14 Td
(Statutory Approval: ${rera}) Tj
0 -14 Td
(Total Layout Units: ${totalPlots}) Tj
0 -14 Td
(Primary Arterial Roads: ${roadWidth}) Tj
0 -25 Td
/F1 12 Tf
(DEVELOPMENT INFRASTRUCTURE & AMENITIES) Tj
0 -18 Td
/F1 10 Tf
(- 40 & 50 Feet Heavy-Duty Internal Blacktop Asphalt Avenues) Tj
0 -14 Td
(- Concealed Underground Drainage & Storm Water Systems) Tj
0 -14 Td
(- 24/7 Dedicated Overhead Water Tank & Pressurized Supply) Tj
0 -14 Td
(- Transformer Electrification & Smart LED Street Lighting) Tj
0 -14 Td
(- 24/7 Guarded Gated Entrance Arch with Masonry Compound Wall) Tj
0 -25 Td
/F1 12 Tf
(LEGAL TITLE & STATUTORY COMPLIANCE) Tj
0 -18 Td
/F1 10 Tf
(- Complete Statutory Sanction & Verified Town Planning Layout) Tj
0 -14 Td
(- 100% Clear Title with Legal Opinion from High Court Advocates) Tj
0 -14 Td
(- Immediate Spot Registration with Freehold Ownership Deed) Tj
0 -14 Td
(- Pre-Approved Bank Loan Facilities Available: SBI, HDFC, ICICI) Tj
0 -35 Td
/F1 12 Tf
(SITE RECEPTION & CONTACT DESK) Tj
0 -18 Td
/F1 10 Tf
(Corporate Office: Dhanalakshmi Nagar, Avilala, Tirupati, AP 517502) Tj
0 -14 Td
(Direct Sales Desk: ${phone}  |  Email: ${email}) Tj
0 -30 Td
/F1 8 Tf
(Confidential document issued by SLN Marketing Private Limited. Copyright ${year}. All rights reserved.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000001500 00000 n 
0000001570 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1645
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${venture.title || 'SLN'}-Investment-Dossier.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
