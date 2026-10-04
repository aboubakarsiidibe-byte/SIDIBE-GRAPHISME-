import { ProformaInvoice, PaymentReceipt, Workspace } from '../types';

/**
 * Utilitaires pour le téléchargement et l'impression des Devis, Factures Proforma et Reçus de Paiement.
 * Fonctionne parfaitement même au sein d'un iframe sandboxing grâce à un export de document autonome.
 */

interface DocumentOptions {
  type: 'devis' | 'proforma' | 'recu';
  filename?: string;
  autoPrint?: boolean;
}

/**
 * Génère le code HTML complet et autonome d'une Facture Proforma ou d'un Devis
 */
export function generateProformaHTML(proforma: ProformaInvoice, workspace: Workspace): string {
  const isQuote = proforma.title.toLowerCase().includes('devis') || proforma.number.startsWith('DEV-');
  const docTitle = isQuote ? 'DEVIS ESTIMATIF' : 'FACTURE PROFORMA';
  const logoContent = workspace.logoUrl
    ? `<img src="${workspace.logoUrl}" alt="${workspace.name}" style="max-height: 60px; max-width: 180px; object-fit: contain; border-radius: 6px;" />`
    : `<div style="width: 52px; height: 52px; background: #09090b; color: #f59e0b; font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 20px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1.5px solid #27272a;">${workspace.name.substring(0, 2).toUpperCase()}</div>`;

  const subtotal = proforma.subtotal || proforma.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const discountAmount = Math.round(subtotal * ((proforma.discountPercent || 0) / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(subtotalAfterDiscount * ((proforma.taxPercent || 0) / 100));
  const totalAmount = proforma.totalAmount || (subtotalAfterDiscount + taxAmount);

  const rows = proforma.items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #e4e4e7; ${idx % 2 === 1 ? 'background-color: #fafafa;' : ''}">
      <td style="padding: 12px 14px; font-size: 13px; color: #18181b; font-weight: 500;">${item.description}</td>
      <td style="padding: 12px 14px; font-size: 13px; color: #18181b; text-align: center; font-family: monospace;">${item.quantity}</td>
      <td style="padding: 12px 14px; font-size: 13px; color: #18181b; text-align: right; font-family: monospace;">${item.unitPrice.toLocaleString('fr-FR')} XOF</td>
      <td style="padding: 12px 14px; font-size: 13px; color: #09090b; text-align: right; font-family: monospace; font-weight: 700;">${item.total.toLocaleString('fr-FR')} XOF</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${proforma.number}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f4f4f5;
      color: #09090b;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04);
      border: 1px solid #e4e4e7;
    }
    .action-bar {
      max-width: 820px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #f59e0b; color: #09090b; }
    .btn-primary:hover { background: #d97706; }
    .btn-secondary { background: #27272a; color: #ffffff; }
    .btn-secondary:hover { background: #18181b; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .action-bar { display: none !important; }
      .invoice-card { box-shadow: none; border: none; padding: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-size: 13px; color: #52525b; font-weight: 500;">
      Document officiel généré par <strong>${workspace.name}</strong>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Imprimer ou Enregistrer en PDF
      </button>
      <button onclick="window.close()" class="btn btn-secondary">
        Fermer
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #09090b; padding-bottom: 24px; gap: 20px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        ${logoContent}
        <div>
          <h1 style="font-size: 22px; font-weight: 900; letter-spacing: -0.02em; color: #09090b;">${workspace.billingInfo.companyName || workspace.name}</h1>
          <p style="font-size: 12px; color: #71717a; margin-top: 2px;">${workspace.billingInfo.tagline || workspace.tagline}</p>
          <div style="font-size: 11px; color: #71717a; margin-top: 6px; line-height: 1.5;">
            <div>${workspace.billingInfo.address}, ${workspace.billingInfo.city} - ${workspace.billingInfo.country}</div>
            <div>Tél : ${workspace.billingInfo.phone} | Email : ${workspace.billingInfo.email}</div>
            ${workspace.billingInfo.taxId ? `<div>RCCM/CC : <strong>${workspace.billingInfo.taxId}</strong></div>` : ''}
          </div>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; background: #fef3c7; color: #92400e; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #fde68a;">
          ${docTitle}
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; color: #09090b; margin-top: 8px;">
          ${proforma.number}
        </div>
        <div style="font-size: 12px; color: #52525b; margin-top: 4px;">
          Date d'émission : <strong>${proforma.date}</strong>
        </div>
        <div style="font-size: 12px; color: #71717a;">
          Validité : jusqu'au <strong>${proforma.validUntil}</strong>
        </div>
        <div style="margin-top: 6px;">
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #e4e4e7; color: #27272a;">
            ${proforma.status}
          </span>
        </div>
      </div>
    </div>

    <!-- Client Box -->
    <div style="margin-top: 24px; padding: 18px; background: #fbfbfa; border: 1px solid #e4e4e7; border-radius: 8px; display: flex; justify-content: space-between; gap: 20px;">
      <div>
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">
          Destinataire / Client :
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #09090b; margin-top: 4px;">
          ${proforma.clientName}
        </div>
        ${proforma.clientCompany ? `<div style="font-size: 13px; font-weight: 600; color: #3f3f46;">${proforma.clientCompany}</div>` : ''}
        ${proforma.clientAddress ? `<div style="font-size: 12px; color: #71717a; margin-top: 4px;">${proforma.clientAddress}</div>` : ''}
      </div>

      <div style="text-align: right; font-size: 12px; color: #52525b; line-height: 1.6;">
        ${proforma.clientPhone ? `<div>Tél : <strong>${proforma.clientPhone}</strong></div>` : ''}
        ${proforma.clientEmail ? `<div>Email : <strong>${proforma.clientEmail}</strong></div>` : ''}
        <div style="margin-top: 6px; font-weight: 700; color: #09090b;">Objet : ${proforma.title}</div>
      </div>
    </div>

    <!-- Table -->
    <div style="margin-top: 28px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #09090b; background: #f4f4f5;">
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #27272a;">Description des prestations</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #27272a; text-align: center; width: 60px;">Qté</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #27272a; text-align: right; width: 140px;">Prix Unit. (XOF)</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #27272a; text-align: right; width: 150px;">Total (XOF)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- Totals & Payment Info -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e4e4e7; display: flex; justify-content: space-between; align-items: flex-start; gap: 30px;">
      <div style="font-size: 12px; color: #52525b; max-width: 420px; line-height: 1.5;">
        <div style="margin-bottom: 10px;">
          <strong style="color: #09090b;">Modalités de règlement :</strong>
          <div>${proforma.paymentTerms || "Acompte de 50% à la commande, solde à la livraison."}</div>
        </div>
        <div>
          <strong style="color: #09090b;">Modes de paiement acceptés :</strong>
          <div>${proforma.paymentMethods || workspace.billingInfo.bankOrMobileMoney || "Wave, Orange Money, Virement bancaire"}</div>
        </div>
        ${proforma.notes ? `<div style="margin-top: 10px; font-style: italic; color: #71717a;">Note : ${proforma.notes}</div>` : ''}
      </div>

      <div style="width: 280px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #52525b;">
          <span>Total Brut HT :</span>
          <span style="font-family: monospace; font-weight: 700;">${subtotal.toLocaleString('fr-FR')} XOF</span>
        </div>
        ${
          discountAmount > 0
            ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #059669;">
                <span>Remise (${proforma.discountPercent}%) :</span>
                <span style="font-family: monospace; font-weight: 700;">- ${discountAmount.toLocaleString('fr-FR')} XOF</span>
              </div>`
            : ''
        }
        ${
          taxAmount > 0
            ? `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: #52525b;">
                <span>TVA (${proforma.taxPercent}%) :</span>
                <span style="font-family: monospace; font-weight: 700;">+ ${taxAmount.toLocaleString('fr-FR')} XOF</span>
              </div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; padding: 10px 0 0 0; margin-top: 8px; border-top: 2px solid #09090b; font-size: 16px; font-weight: 900; color: #09090b;">
          <span>NET À PAYER :</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #d97706;">${totalAmount.toLocaleString('fr-FR')} XOF</span>
        </div>
      </div>
    </div>

    <!-- Signatures and Official Stamp -->
    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px dashed #d4d4d8; display: flex; justify-content: space-between; gap: 40px;">
      <div style="width: 50%;">
        <div style="font-size: 12px; font-weight: 700; color: #09090b;">Accord & Signature du Client :</div>
        <div style="font-size: 10px; color: #71717a; margin-top: 2px;">Précédé de la mention manuscrite "Bon pour accord"</div>
        <div style="height: 70px; border: 1px dashed #cbd5e1; border-radius: 8px; margin-top: 8px;"></div>
      </div>

      <div style="width: 50%; text-align: right;">
        <div style="font-size: 12px; font-weight: 700; color: #09090b;">Pour le Studio ${workspace.name} :</div>
        <div style="font-size: 10px; color: #71717a; margin-top: 2px;">Direction Commerciale & Création</div>
        <div style="height: 70px; display: flex; align-items: center; justify-content: flex-end; margin-top: 8px;">
          <div style="border: 2px solid #f59e0b; color: #b45309; padding: 6px 14px; border-radius: 8px; font-size: 10px; font-family: monospace; font-weight: 800; transform: rotate(-3deg); text-transform: uppercase; letter-spacing: 0.05em; background: #fffbeb;">
            CACHET DU STUDIO • ${workspace.name} CI
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Génère le code HTML complet et autonome d'un Reçu de Paiement officiel
 */
export function generateReceiptHTML(receipt: PaymentReceipt, workspace: Workspace): string {
  const logoContent = workspace.logoUrl
    ? `<img src="${workspace.logoUrl}" alt="${workspace.name}" style="max-height: 60px; max-width: 180px; object-fit: contain; border-radius: 6px;" />`
    : `<div style="width: 52px; height: 52px; background: #09090b; color: #10b981; font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 20px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1.5px solid #27272a;">${workspace.name.substring(0, 2).toUpperCase()}</div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>REÇU DE PAIEMENT - ${receipt.receiptNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f4f4f5;
      color: #09090b;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }
    .receipt-card {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04);
      border: 1px solid #e4e4e7;
    }
    .action-bar {
      max-width: 760px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #10b981; color: #09090b; }
    .btn-primary:hover { background: #059669; }
    .btn-secondary { background: #27272a; color: #ffffff; }
    .btn-secondary:hover { background: #18181b; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .action-bar { display: none !important; }
      .receipt-card { box-shadow: none; border: none; padding: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-size: 13px; color: #52525b; font-weight: 500;">
      Reçu de paiement officiel émis par <strong>${workspace.name}</strong>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Imprimer ou Enregistrer en PDF
      </button>
      <button onclick="window.close()" class="btn btn-secondary">
        Fermer
      </button>
    </div>
  </div>

  <div class="receipt-card">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #09090b; padding-bottom: 20px; gap: 20px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        ${logoContent}
        <div>
          <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -0.02em; color: #09090b;">${workspace.billingInfo.companyName || workspace.name}</h1>
          <p style="font-size: 12px; color: #71717a; margin-top: 2px;">${workspace.billingInfo.tagline || workspace.tagline}</p>
          <div style="font-size: 11px; color: #71717a; margin-top: 4px; line-height: 1.4;">
            <div>${workspace.billingInfo.address}, ${workspace.billingInfo.city} - ${workspace.billingInfo.country}</div>
            <div>Tél : ${workspace.billingInfo.phone}</div>
          </div>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; background: #ecfdf5; color: #065f46; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #a7f3d0;">
          REÇU DE PAIEMENT
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; color: #09090b; margin-top: 8px;">
          ${receipt.receiptNumber}
        </div>
        <div style="font-size: 12px; color: #52525b; margin-top: 4px;">
          Date de règlement : <strong>${receipt.date}</strong>
        </div>
      </div>
    </div>

    <!-- Amount Banner -->
    <div style="margin-top: 24px; padding: 22px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; gap: 20px;">
      <div>
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #166534;">
          Montant perçu (${receipt.paymentType})
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 900; color: #14532d; margin-top: 2px;">
          ${receipt.amountPaid.toLocaleString('fr-FR')} <span style="font-size: 20px;">XOF</span>
        </div>
        <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Francs CFA UEMOA (Côte d'Ivoire)</div>
      </div>

      <div style="text-align: right; font-size: 12px; color: #374151; line-height: 1.6;">
        <div>Mode de versement : <strong style="color: #09090b;">${receipt.paymentMethod}</strong></div>
        ${receipt.paymentReference ? `<div>Réf. Transaction : <strong style="font-family: monospace;">${receipt.paymentReference}</strong></div>` : ''}
        ${receipt.proformaNumber ? `<div>Réf. Devis / Proforma : <strong style="font-family: monospace;">${receipt.proformaNumber}</strong></div>` : ''}
      </div>
    </div>

    <!-- Payer & Project Info -->
    <div style="margin-top: 24px; padding: 18px; background: #fbfbfa; border: 1px solid #e4e4e7; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">
            Reçu de l'aimable clientèle :
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #09090b; margin-top: 4px;">
            ${receipt.clientName}
          </div>
          ${receipt.clientCompany ? `<div style="font-size: 13px; font-weight: 600; color: #3f3f46;">${receipt.clientCompany}</div>` : ''}
          ${receipt.clientPhone ? `<div style="font-size: 12px; color: #71717a; margin-top: 2px;">Tél : ${receipt.clientPhone}</div>` : ''}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a;">
            Objet du règlement / Projet :
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #09090b; margin-top: 4px;">
            ${receipt.projectName || 'Prestation graphique & direction artistique'}
          </div>
        </div>
      </div>

      <!-- Financial breakdown -->
      ${
        receipt.totalProjectAmount > 0
          ? `
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e4e4e7; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;">
          <div style="padding: 8px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px;">
            <div style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 700;">Budget Total Projet</div>
            <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #09090b; margin-top: 2px;">
              ${receipt.totalProjectAmount.toLocaleString('fr-FR')} XOF
            </div>
          </div>
          <div style="padding: 8px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px;">
            <div style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 700;">Cumul Encaissé</div>
            <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #059669; margin-top: 2px;">
              ${(receipt.previouslyPaid + receipt.amountPaid).toLocaleString('fr-FR')} XOF
            </div>
          </div>
          <div style="padding: 8px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px;">
            <div style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 700;">Reste à Régler</div>
            <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: #d97706; margin-top: 2px;">
              ${receipt.remainingBalance.toLocaleString('fr-FR')} XOF
            </div>
          </div>
        </div>
      `
          : ''
      }

      ${receipt.notes ? `<div style="margin-top: 14px; font-size: 11px; font-style: italic; color: #71717a;">${receipt.notes}</div>` : ''}
    </div>

    <!-- Legal and Stamp -->
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #d4d4d8; display: flex; justify-content: space-between; align-items: center; gap: 20px;">
      <div style="font-size: 11px; color: #71717a; line-height: 1.5; max-width: 380px;">
        <strong style="color: #09090b;">Attestation de paiement :</strong>
        <div>Le présent reçu certifie l'encaissement effectif des sommes susmentionnées. Valable pour acquit de règlement.</div>
      </div>

      <div style="border: 2px solid #10b981; color: #065f46; padding: 10px 16px; border-radius: 8px; text-align: center; font-family: monospace; transform: rotate(-2deg); background: #ecfdf5;">
        <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #047857;">
          ENCAISSÉ & COMPTABILISÉ
        </div>
        <div style="font-size: 12px; font-weight: 800; color: #064e3b; margin-top: 2px;">
          ${workspace.name} CI
        </div>
        <div style="font-size: 9px; color: #059669; margin-top: 2px;">
          ${receipt.date} • Côte d'Ivoire
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Télécharge un fichier HTML complet du devis ou de la facture proforma
 */
export function downloadProformaFile(proforma: ProformaInvoice, workspace: Workspace): void {
  const htmlContent = generateProformaHTML(proforma, workspace);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const isQuote = proforma.title.toLowerCase().includes('devis') || proforma.number.startsWith('DEV-');
  const prefix = isQuote ? 'Devis' : 'Facture_Proforma';
  const cleanClient = proforma.clientName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${prefix}_${proforma.number}_${cleanClient}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Télécharge un fichier HTML complet du reçu de paiement
 */
export function downloadReceiptFile(receipt: PaymentReceipt, workspace: Workspace): void {
  const htmlContent = generateReceiptHTML(receipt, workspace);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanClient = receipt.clientName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Recu_Paiement_${receipt.receiptNumber}_${cleanClient}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Ouvre une fenêtre d'impression autonome pour imprimer ou enregistrer en PDF
 */
export function printDocumentWindow(htmlContent: string): void {
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Wait for font loading then trigger print
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch {
          // If print was blocked inside window, user can still click the print button on the page
        }
      }, 500);
      return;
    }
  } catch (e) {
    console.warn('window.open print popup blocked, using fallback iframe', e);
  }

  // Fallback: hidden iframe print
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error('Iframe print error', err);
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  } catch (err) {
    console.error('Print fallback failed', err);
    // As final fallback, trigger file download
    window.print();
  }
}
